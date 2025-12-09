/**
 * AutoAlertas - Núcleo 11
 * Sistema de alertas automáticos para Agenda Jurídica
 */

import { getDb } from "./db";
import { agenda, pipelineItems, insights } from "../drizzle/schema";
import { sql } from "drizzle-orm";

export interface AlertResult {
  type: "prazo_2_dias" | "prazo_hoje" | "compromisso_hoje" | "documento_prazo" | "caso_parado";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  agendaItemId?: number;
  pipelineItemId?: number;
  clientId?: number;
  caseId?: number;
}

/**
 * 1. Prazo em 2 dias → alerta "Urgente"
 */
export async function checkPrazosUrgentes(userId: number): Promise<AlertResult[]> {
  const database = await getDb();
  if (!database) return [];

  const now = new Date();
  const twoDaysFromNow = new Date(now);
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

  const urgentPrazos = await database.select().from(agenda)
    .where(sql`${agenda.userId} = ${userId} AND ${agenda.type} = 'prazo' AND ${agenda.status} = 'pendente' AND ${agenda.date} >= ${now} AND ${agenda.date} <= ${twoDaysFromNow}`);

  return urgentPrazos.map((prazo) => ({
    type: "prazo_2_dias",
    severity: "high",
    title: "Prazo Urgente",
    description: `Prazo "${prazo.title}" vence em ${Math.ceil((new Date(prazo.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} dia(s)`,
    agendaItemId: prazo.id,
    clientId: prazo.clientId || undefined,
    caseId: prazo.caseId || undefined,
  }));
}

/**
 * 2. Prazo no mesmo dia → destaque vermelho (critical)
 */
export async function checkPrazosHoje(userId: number): Promise<AlertResult[]> {
  const database = await getDb();
  if (!database) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayPrazos = await database.select().from(agenda)
    .where(sql`${agenda.userId} = ${userId} AND ${agenda.type} = 'prazo' AND ${agenda.status} = 'pendente' AND ${agenda.date} >= ${today} AND ${agenda.date} < ${tomorrow}`);

  return todayPrazos.map((prazo) => ({
    type: "prazo_hoje",
    severity: "critical",
    title: "Prazo HOJE",
    description: `Prazo "${prazo.title}" vence hoje!`,
    agendaItemId: prazo.id,
    clientId: prazo.clientId || undefined,
    caseId: prazo.caseId || undefined,
  }));
}

/**
 * 3. Compromisso no mesmo dia → notificação interna
 */
export async function checkCompromissosHoje(userId: number): Promise<AlertResult[]> {
  const database = await getDb();
  if (!database) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayCompromissos = await database.select().from(agenda)
    .where(sql`${agenda.userId} = ${userId} AND ${agenda.type} = 'compromisso' AND ${agenda.status} = 'pendente' AND ${agenda.date} >= ${today} AND ${agenda.date} < ${tomorrow}`);

  return todayCompromissos.map((compromisso) => ({
    type: "compromisso_hoje",
    severity: "medium",
    title: "Compromisso Hoje",
    description: `Compromisso "${compromisso.title}" agendado para hoje${compromisso.time ? ` às ${compromisso.time}` : ""}`,
    agendaItemId: compromisso.id,
    clientId: compromisso.clientId || undefined,
    caseId: compromisso.caseId || undefined,
  }));
}

/**
 * 4. Documento novo com prazo → alerta "Analisar documento"
 * (Chamado quando createFromDeadline é executado)
 */
export async function createDocumentoPrazoAlert(
  userId: number,
  agendaItemId: number,
  title: string,
  clientId?: number,
  caseId?: number
): Promise<AlertResult> {
  return {
    type: "documento_prazo",
    severity: "high",
    title: "Analisar Documento",
    description: `Novo prazo detectado em documento: "${title}"`,
    agendaItemId,
    clientId,
    caseId,
  };
}

/**
 * 5. Caso parado há 15 dias → lembrete interno automático
 */
export async function checkCasosParados(userId: number): Promise<AlertResult[]> {
  const database = await getDb();
  if (!database) return [];

  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  // Buscar casos no pipeline sem atualização há 15 dias
  const casosParados = await database.select().from(pipelineItems)
    .where(sql`${pipelineItems.userId} = ${userId} AND ${pipelineItems.updatedAt} < ${fifteenDaysAgo}`);

  return casosParados.map((caso) => ({
    type: "caso_parado",
    severity: "medium",
    title: "Caso Inativo",
    description: `Caso "${caso.title}" sem movimentação há mais de 15 dias`,
    pipelineItemId: caso.id,
    clientId: caso.clientId || undefined,
  }));
}

/**
 * Executar todos os alertas e salvar como insights
 */
export async function runAllAutoAlertas(userId: number): Promise<AlertResult[]> {
  const alerts: AlertResult[] = [];

  // Executar todos os checks
  const prazosUrgentes = await checkPrazosUrgentes(userId);
  const prazosHoje = await checkPrazosHoje(userId);
  const compromissosHoje = await checkCompromissosHoje(userId);
  const casosParados = await checkCasosParados(userId);

  alerts.push(...prazosUrgentes, ...prazosHoje, ...compromissosHoje, ...casosParados);

  // Salvar alertas como insights
  const database = await getDb();
  if (database) {
    for (const alert of alerts) {
      // Verificar se já existe um insight similar recente (últimas 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const existing = await database.select().from(insights)
        .where(sql`${insights.userId} = ${userId} AND ${insights.type} = ${alert.type} AND ${insights.createdAt} >= ${yesterday} AND ${insights.dismissed} = 0`);

      if (existing.length === 0) {
        // Criar novo insight
        await database.insert(insights).values({
          userId,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          clientId: alert.clientId,
          processId: alert.caseId,
          pipelineItemId: alert.pipelineItemId,
        });
      }
    }
  }

  return alerts;
}
