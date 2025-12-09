/**
 * SmartPipeline Automation Engine (Núcleo 9)
 * 
 * Executa regras de automação no pipeline jurídico:
 * 1. Documento novo → mover para "Em Análise"
 * 2. +1 documento em sequência → alerta "Aguardando triagem"
 * 3. Caso sem ação há 10 dias → tag "Atenção"
 * 4. Prazo detectado → marcar "Urgente"
 */

import { getDb } from "./db";
import { pipelineItems, pipelineStages, documents, automationLogs, insights } from "../drizzle/schema";
import { sql } from "drizzle-orm";

export type AutomationTrigger = "document_uploaded" | "multiple_documents" | "no_action_10_days" | "deadline_detected";

/**
 * Regra 1: Documento novo enviado → mover caso para "Em Análise"
 */
export async function onDocumentUploaded(userId: number, clientId: number | null, processId: number | null) {
  const database = await getDb();
  if (!database) return { success: false, message: "Database not available" };

  try {
    // Find pipeline item related to this client or process
    let pipelineItem = null;
    
    if (clientId) {
      const items = await database.select().from(pipelineItems)
        .where(sql`${pipelineItems.clientId} = ${clientId} AND ${pipelineItems.userId} = ${userId}`)
        .limit(1);
      pipelineItem = items[0] || null;
    } else if (processId) {
      const items = await database.select().from(pipelineItems)
        .where(sql`${pipelineItems.processId} = ${processId} AND ${pipelineItems.userId} = ${userId}`)
        .limit(1);
      pipelineItem = items[0] || null;
    }

    if (!pipelineItem) {
      return { success: false, message: "No pipeline item found for this client/process" };
    }

    // Find "Em Análise" stage
    const stages = await database.select().from(pipelineStages)
      .where(sql`${pipelineStages.userId} = ${userId} AND ${pipelineStages.name} LIKE '%An%lise%'`)
      .limit(1);
    
    const targetStage = stages[0] || null;
    if (!targetStage) {
      return { success: false, message: "Stage 'Em Análise' not found" };
    }

    // Move to "Em Análise"
    await database.update(pipelineItems)
      .set({ stageId: targetStage.id })
      .where(sql`${pipelineItems.id} = ${pipelineItem.id}`);

    // Log automation
    await database.insert(automationLogs).values({
      ruleId: 1, // document_uploaded
      pipelineItemId: pipelineItem.id,
      clientId: clientId || undefined,
      action: `Movido para "${targetStage.name}"`,
      result: "success",
    });

    return { success: true, message: `Item movido para "${targetStage.name}"` };
  } catch (error) {
    console.error("[SmartPipeline] onDocumentUploaded error:", error);
    return { success: false, message: "Automation failed" };
  }
}

/**
 * Regra 2: Cliente adiciona mais de 1 documento em sequência → alerta "Aguardando triagem"
 */
export async function checkMultipleDocuments(userId: number, clientId: number) {
  const database = await getDb();
  if (!database) return { success: false, message: "Database not available" };

  try {
    // Count documents uploaded in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentDocs = await database.select().from(documents)
      .where(sql`${documents.clientId} = ${clientId} AND ${documents.userId} = ${userId} AND ${documents.createdAt} >= ${oneDayAgo}`);

    if (recentDocs.length > 1) {
      // Create insight alert
      await database.insert(insights).values({
        type: "missing_document",
        title: "Aguardando triagem",
        description: `Cliente enviou ${recentDocs.length} documentos nas últimas 24h. Requer análise prioritária.`,
        severity: "medium",
        clientId,
        dismissed: false,
        userId,
      });

      // Log automation
      await database.insert(automationLogs).values({
        ruleId: 2, // multiple_documents
        clientId,
        action: "Alerta 'Aguardando triagem' criado",
        result: `${recentDocs.length} documentos detectados`,
      });

      return { success: true, message: "Alerta criado", count: recentDocs.length };
    }

    return { success: false, message: "Less than 2 documents" };
  } catch (error) {
    console.error("[SmartPipeline] checkMultipleDocuments error:", error);
    return { success: false, message: "Automation failed" };
  }
}

/**
 * Regra 3: Caso sem ação há 10 dias → tag "Atenção"
 */
export async function checkInactiveCases(userId: number) {
  const database = await getDb();
  if (!database) return { success: false, message: "Database not available" };

  try {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    
    // Find pipeline items not updated in 10 days
    const inactiveItems = await database.select().from(pipelineItems)
      .where(sql`${pipelineItems.userId} = ${userId} AND ${pipelineItems.updatedAt} < ${tenDaysAgo}`);

    let updatedCount = 0;
    for (const item of inactiveItems) {
      // Create insight
      await database.insert(insights).values({
        type: "next_step",
        title: "Atenção: Caso inativo",
        description: `Caso "${item.title}" sem atualizações há mais de 10 dias. Requer ação.`,
        severity: "high",
        pipelineItemId: item.id,
        clientId: item.clientId || undefined,
        processId: item.processId || undefined,
        dismissed: false,
        userId,
      });

      // Log automation
      await database.insert(automationLogs).values({
        ruleId: 3, // no_action_10_days
        pipelineItemId: item.id,
        clientId: item.clientId || undefined,
        action: "Tag 'Atenção' adicionada",
        result: "Caso inativo detectado",
      });

      updatedCount++;
    }

    return { success: true, message: `${updatedCount} casos marcados com "Atenção"`, count: updatedCount };
  } catch (error) {
    console.error("[SmartPipeline] checkInactiveCases error:", error);
    return { success: false, message: "Automation failed" };
  }
}

/**
 * Regra 4: Prazo detectado (via Núcleo 5) → marcar "Urgente"
 */
export async function onDeadlineDetected(userId: number, pipelineItemId: number, deadline: string) {
  const database = await getDb();
  if (!database) return { success: false, message: "Database not available" };

  try {
    // Get pipeline item
    const items = await database.select().from(pipelineItems)
      .where(sql`${pipelineItems.id} = ${pipelineItemId}`)
      .limit(1);
    
    const item = items[0] || null;
    if (!item) {
      return { success: false, message: "Pipeline item not found" };
    }

    // Update priority to urgent
    await database.update(pipelineItems)
      .set({ priority: "urgent" })
      .where(sql`${pipelineItems.id} = ${pipelineItemId}`);

    // Create insight
    await database.insert(insights).values({
      type: "deadline_mentioned",
      title: "Prazo detectado - Urgente",
      description: `Prazo detectado: ${deadline}. Caso marcado como urgente.`,
      severity: "critical",
      pipelineItemId,
      clientId: item.clientId || undefined,
      processId: item.processId || undefined,
      dismissed: false,
      userId,
    });

    // Log automation
    await database.insert(automationLogs).values({
      ruleId: 4, // deadline_detected
      pipelineItemId,
      clientId: item.clientId || undefined,
      action: "Marcado como 'Urgente'",
      result: `Prazo: ${deadline}`,
    });

    return { success: true, message: "Caso marcado como urgente" };
  } catch (error) {
    console.error("[SmartPipeline] onDeadlineDetected error:", error);
    return { success: false, message: "Automation failed" };
  }
}

/**
 * Execute all automation rules for a user
 */
export async function runAllAutomations(userId: number) {
  console.log(`[SmartPipeline] Running all automations for user ${userId}`);
  
  const results = {
    inactiveCases: await checkInactiveCases(userId),
  };

  return results;
}
