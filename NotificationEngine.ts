import { getDb } from "./db";
import { notifications } from "../drizzle/schema";
import { nanoid } from "nanoid";

/**
 * Notification Engine 2.0 (Núcleo 14)
 * Sistema central de notificações integrado a todos os módulos
 */

interface NotificationPayload {
  userId: number;
  type: "prazo_proximo" | "prazo_hoje" | "prazo_atrasado" | "nova_movimentacao_processo" | "documento_anexado" | "insight_critico" | "caso_inativo" | "pagamento_recebido" | "lead_convertido" | "checklist_incompleto";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  origin: string;
  entityId?: number;
}

/**
 * Função central para criar notificação
 */
export async function createNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    const database = await getDb();
    if (!database) {
      console.error("[NotificationEngine] Database not available");
      return false;
    }

    // Validar payload
    if (!payload.userId || !payload.type || !payload.title || !payload.message || !payload.origin) {
      console.error("[NotificationEngine] Invalid payload", payload);
      return false;
    }

    // Criar notificação
    await database.insert(notifications).values({
      userId: payload.userId,
      type: payload.type,
      severity: payload.severity,
      title: payload.title,
      message: payload.message,
      origin: payload.origin,
      entityId: payload.entityId,
      readAt: null,
    });

    console.log(`[NotificationEngine] Notification created: ${payload.type} for user ${payload.userId}`);
    return true;
  } catch (error) {
    console.error("[NotificationEngine] Error creating notification:", error);
    return false;
  }
}

/**
 * 1. Prazo Próximo (2 dias)
 */
export async function sendDeadlineSoon(userId: number, agendaId: number, title: string, daysUntil: number): Promise<boolean> {
  return createNotification({
    userId,
    type: "prazo_proximo",
    severity: "warning",
    title: "Prazo Próximo",
    message: `O prazo "${title}" vence em ${daysUntil} dia(s).`,
    origin: "agenda",
    entityId: agendaId,
  });
}

/**
 * 2. Prazo Hoje
 */
export async function sendDeadlineToday(userId: number, agendaId: number, title: string): Promise<boolean> {
  return createNotification({
    userId,
    type: "prazo_hoje",
    severity: "critical",
    title: "Prazo Vence Hoje",
    message: `URGENTE: O prazo "${title}" vence hoje!`,
    origin: "agenda",
    entityId: agendaId,
  });
}

/**
 * 3. Prazo Atrasado
 */
export async function sendDeadlineLate(userId: number, agendaId: number, title: string, daysLate: number): Promise<boolean> {
  return createNotification({
    userId,
    type: "prazo_atrasado",
    severity: "critical",
    title: "Prazo Atrasado",
    message: `ATENÇÃO: O prazo "${title}" está atrasado há ${daysLate} dia(s)!`,
    origin: "agenda",
    entityId: agendaId,
  });
}

/**
 * 4. Nova Movimentação de Processo
 */
export async function sendNewProcessUpdate(userId: number, processId: number, caseId: number | null, updateDescription: string): Promise<boolean> {
  return createNotification({
    userId,
    type: "nova_movimentacao_processo",
    severity: "info",
    title: "Nova Movimentação",
    message: `Processo ${caseId || processId}: ${updateDescription}`,
    origin: "processos",
    entityId: processId,
  });
}

/**
 * 5. Documento Anexado
 */
export async function sendNewDocument(userId: number, documentId: number, documentTitle: string, processId?: number): Promise<boolean> {
  return createNotification({
    userId,
    type: "documento_anexado",
    severity: "info",
    title: "Novo Documento",
    message: `Documento "${documentTitle}" foi anexado${processId ? ' ao processo' : ''}.`,
    origin: "documentos",
    entityId: documentId,
  });
}

/**
 * 6. Insight Crítico
 */
export async function sendCriticalInsight(userId: number, insightId: number, insightTitle: string, insightDescription: string): Promise<boolean> {
  return createNotification({
    userId,
    type: "insight_critico",
    severity: "critical",
    title: "Insight Crítico Detectado",
    message: `${insightTitle}: ${insightDescription}`,
    origin: "insights",
    entityId: insightId,
  });
}

/**
 * 7. Caso Inativo (15 dias)
 */
export async function sendInactiveCase(userId: number, processId: number, caseId: number | null, daysInactive: number): Promise<boolean> {
  return createNotification({
    userId,
    type: "caso_inativo",
    severity: "warning",
    title: "Caso Sem Movimentação",
    message: `O processo ${caseId || processId} está sem movimentação há ${daysInactive} dias.`,
    origin: "processos",
    entityId: processId,
  });
}

/**
 * 8. Atualização Financeira
 */
export async function sendFinanceUpdate(userId: number, recordId: number, type: "entrada" | "saida" | "honorario" | "despesa", value: number, description: string): Promise<boolean> {
  const typeLabels = {
    entrada: "Entrada Registrada",
    saida: "Saída Registrada",
    honorario: "Honorário Recebido",
    despesa: "Despesa Registrada",
  };

  return createNotification({
    userId,
    type: "pagamento_recebido",
    severity: type === "entrada" || type === "honorario" ? "info" : "warning",
    title: typeLabels[type],
    message: `${description}: R$ ${value.toFixed(2)}`,
    origin: "financeiro",
    entityId: recordId,
  });
}

/**
 * Função auxiliar: Verificar prazos automáticos (chamada por cron/scheduler)
 */
export async function checkDeadlinesAndNotify(): Promise<void> {
  try {
    const database = await getDb();
    if (!database) return;

    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    // Buscar prazos pendentes
    const { agenda } = await import("../drizzle/schema");
    const { sql } = await import("drizzle-orm");

    const prazos = await database.select().from(agenda)
      .where(sql`${agenda.type} = 'prazo' AND ${agenda.status} = 'pendente'`);

    for (const prazo of prazos) {
      const daysUntil = Math.ceil((prazo.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil === 0) {
        // Prazo hoje
        await sendDeadlineToday(prazo.userId, prazo.id, prazo.title);
      } else if (daysUntil > 0 && daysUntil <= 2) {
        // Prazo próximo (1-2 dias)
        await sendDeadlineSoon(prazo.userId, prazo.id, prazo.title, daysUntil);
      } else if (daysUntil < 0) {
        // Prazo atrasado
        await sendDeadlineLate(prazo.userId, prazo.id, prazo.title, Math.abs(daysUntil));
      }
    }

    console.log(`[NotificationEngine] Checked ${prazos.length} deadlines`);
  } catch (error) {
    console.error("[NotificationEngine] Error checking deadlines:", error);
  }
}

/**
 * Função auxiliar: Verificar casos inativos (chamada por cron/scheduler)
 */
export async function checkInactiveCasesAndNotify(): Promise<void> {
  try {
    const database = await getDb();
    if (!database) return;

    const now = new Date();
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    const { processManager } = await import("../drizzle/schema");
    const { sql } = await import("drizzle-orm");

    const inactiveProcesses = await database.select().from(processManager)
      .where(sql`${processManager.status} = 'ativo' AND ${processManager.lastMoveDate} < ${fifteenDaysAgo}`);

    for (const process of inactiveProcesses) {
      const daysInactive = Math.ceil((now.getTime() - (process.lastMoveDate?.getTime() || now.getTime())) / (1000 * 60 * 60 * 24));
      await sendInactiveCase(process.userId, process.id, process.caseId, daysInactive);
    }

    console.log(`[NotificationEngine] Checked ${inactiveProcesses.length} inactive cases`);
  } catch (error) {
    console.error("[NotificationEngine] Error checking inactive cases:", error);
  }
}
