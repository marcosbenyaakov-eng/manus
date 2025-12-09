import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { processManager, documents, financialRecords, agenda, clients, leads, pipelineItems, insights, toolHistory, analyticsCache, analyticsLogs, aiInsightsGlobal } from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";
import { generateAnalyticsReport } from "./pdfGenerator";

export const analyticsRouter = router({
  // 13.1 - KPIs Globais
  getKpis: protectedProcedure
    .input(z.object({
      period: z.enum(["7d", "30d", "90d", "6m", "1y"]).default("30d"),
    }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const now = new Date();
      const periodDays = input.period === "7d" ? 7 : input.period === "30d" ? 30 : input.period === "90d" ? 90 : input.period === "6m" ? 180 : 365;
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      const previousStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

      // Processos Ativos
      const activeProcesses = await database.select().from(processManager)
        .where(sql`${processManager.userId} = ${ctx.user.id} AND ${processManager.status} != 'arquivado' AND ${processManager.status} != 'suspenso'`);
      
      const previousActiveProcesses = await database.select().from(processManager)
        .where(sql`${processManager.userId} = ${ctx.user.id} AND ${processManager.createdAt} < ${startDate} AND ${processManager.status} != 'arquivado'`);

      // Prazos próximos (7 dias)
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = await database.select().from(agenda)
        .where(sql`${agenda.userId} = ${ctx.user.id} AND ${agenda.type} = 'prazo' AND ${agenda.status} = 'pendente' AND ${agenda.date} BETWEEN ${now} AND ${sevenDaysFromNow}`);

      // Documentos anexados (período)
      const recentDocs = await database.select().from(documents)
        .where(sql`${documents.userId} = ${ctx.user.id} AND ${documents.createdAt} >= ${startDate}`);
      
      const previousDocs = await database.select().from(documents)
        .where(sql`${documents.userId} = ${ctx.user.id} AND ${documents.createdAt} >= ${previousStartDate} AND ${documents.createdAt} < ${startDate}`);

      // Movimento Financeiro (entradas - saídas)
      const financialMovement = await database.select().from(financialRecords)
        .where(sql`${financialRecords.userId} = ${ctx.user.id} AND ${financialRecords.date} >= ${startDate}`);
      
      const entradas = financialMovement.filter(r => r.type === 'entrada' || r.type === 'honorario').reduce((sum, r) => sum + Number(r.value), 0);
      const saidas = financialMovement.filter(r => r.type === 'saida' || r.type === 'despesa').reduce((sum, r) => sum + Number(r.value), 0);
      const saldo = entradas - saidas;

      return {
        processosAtivos: {
          value: activeProcesses.length,
          change: activeProcesses.length - previousActiveProcesses.length,
        },
        prazosProximos: {
          value: upcomingDeadlines.length,
          change: 0, // Não aplicável para prazos futuros
        },
        documentosAnexados: {
          value: recentDocs.length,
          change: recentDocs.length - previousDocs.length,
        },
        movimentoFinanceiro: {
          value: saldo,
          change: 0, // Simplificado
        },
      };
    }),

  // 13.2 - Produtividade Jurídica
  getProductivityRanking: protectedProcedure
    .input(z.object({
      period: z.enum(["7d", "30d", "90d", "6m", "1y"]).default("30d"),
    }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const now = new Date();
      const periodDays = input.period === "7d" ? 7 : input.period === "30d" ? 30 : input.period === "90d" ? 90 : input.period === "6m" ? 180 : 365;
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

      // Simplificado: apenas o usuário atual (sem múltiplos advogados)
      const pecas = await database.select().from(documents)
        .where(sql`${documents.userId} = ${ctx.user.id} AND ${documents.createdAt} >= ${startDate} AND ${documents.documentType} LIKE '%peça%'`);
      
      const prazos = await database.select().from(agenda)
        .where(sql`${agenda.userId} = ${ctx.user.id} AND ${agenda.createdAt} >= ${startDate} AND ${agenda.type} = 'prazo' AND ${agenda.status} = 'concluido'`);
      
      const docs = await database.select().from(documents)
        .where(sql`${documents.userId} = ${ctx.user.id} AND ${documents.createdAt} >= ${startDate}`);
      
      const insightsCount = await database.select().from(insights)
        .where(sql`${insights.userId} = ${ctx.user.id} AND ${insights.createdAt} >= ${startDate}`);
      
      const chats = await database.select().from(toolHistory)
        .where(sql`${toolHistory.userId} = ${ctx.user.id} AND ${toolHistory.executedAt} >= ${startDate}`);

      const score = (pecas.length * 2) + (prazos.length * 3) + (docs.length * 1.5) + (insightsCount.length * 2) + (chats.length * 0.5);

      return {
        ranking: [{
          name: ctx.user.name || "Advogado",
          pecas: pecas.length,
          prazos: prazos.length,
          documentos: docs.length,
          insights: insightsCount.length,
          chats: chats.length,
          score: Math.round(score),
        }],
      };
    }),

  // 13.3 - Financeiro (6 meses)
  getFinancialHistory: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

      const records = await database.select().from(financialRecords)
        .where(sql`${financialRecords.userId} = ${ctx.user.id} AND ${financialRecords.date} >= ${sixMonthsAgo}`);

      // Agrupar por mês
      const monthlyData: Record<string, { entradas: number; saidas: number; saldo: number }> = {};
      
      records.forEach(record => {
        const monthKey = `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { entradas: 0, saidas: 0, saldo: 0 };
        }
        
        const value = Number(record.value);
        if (record.type === 'entrada' || record.type === 'honorario') {
          monthlyData[monthKey].entradas += value;
        } else {
          monthlyData[monthKey].saidas += value;
        }
        monthlyData[monthKey].saldo = monthlyData[monthKey].entradas - monthlyData[monthKey].saidas;
      });

      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        ...data,
      }));
    }),

  // 13.4 - Processos (donut + top 5)
  getProcessStates: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const processes = await database.select().from(processManager)
        .where(sql`${processManager.userId} = ${ctx.user.id}`);

      // Contar por stage
      const stageCount: Record<string, number> = {};
      processes.forEach(p => {
        const stage = p.stage || "Sem fase";
        stageCount[stage] = (stageCount[stage] || 0) + 1;
      });

      const donutData = Object.entries(stageCount).map(([name, value]) => ({ name, value }));

      // Top 5 mais ativos (ordenar por lastMoveDate)
      const mostActive = processes
        .filter(p => p.lastMoveDate)
        .sort((a, b) => (b.lastMoveDate?.getTime() || 0) - (a.lastMoveDate?.getTime() || 0))
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          caseId: p.caseId,
          stage: p.stage,
          lastMove: p.lastMove,
          lastMoveDate: p.lastMoveDate,
        }));

      return { donutData, mostActive };
    }),

  // 13.5 - Agenda e Prazos
  getAgendaOverview: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const prazosProximos = await database.select().from(agenda)
        .where(sql`${agenda.userId} = ${ctx.user.id} AND ${agenda.type} = 'prazo' AND ${agenda.status} = 'pendente' AND ${agenda.date} BETWEEN ${now} AND ${sevenDaysFromNow}`);

      const prazosAtrasados = await database.select().from(agenda)
        .where(sql`${agenda.userId} = ${ctx.user.id} AND ${agenda.type} = 'prazo' AND ${agenda.status} = 'pendente' AND ${agenda.date} < ${now}`);

      const compromissosHoje = await database.select().from(agenda)
        .where(sql`${agenda.userId} = ${ctx.user.id} AND ${agenda.type} = 'compromisso' AND DATE(${agenda.date}) = DATE(${now})`);

      const lembretesPendentes = await database.select().from(agenda)
        .where(sql`${agenda.userId} = ${ctx.user.id} AND ${agenda.type} = 'lembrete' AND ${agenda.status} = 'pendente'`);

      return {
        prazosProximos: prazosProximos.length,
        prazosAtrasados: prazosAtrasados.length,
        compromissosHoje: compromissosHoje.length,
        lembretesPendentes: lembretesPendentes.length,
      };
    }),

  // 13.6 - Clientes e Leads
  getClientLeadMetrics: protectedProcedure
    .input(z.object({
      period: z.enum(["7d", "30d", "90d", "6m", "1y"]).default("30d"),
    }))
    .query(async ({ ctx, input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const now = new Date();
      const periodDays = input.period === "7d" ? 7 : input.period === "30d" ? 30 : input.period === "90d" ? 90 : input.period === "6m" ? 180 : 365;
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

      const novosLeads = await database.select().from(leads)
        .where(sql`${leads.userId} = ${ctx.user.id} AND ${leads.createdAt} >= ${startDate}`);

      const leadsConvertidos = await database.select().from(leads)
        .where(sql`${leads.userId} = ${ctx.user.id} AND ${leads.status} = 'converted' AND ${leads.updatedAt} >= ${startDate}`);

      const novosClientes = await database.select().from(clients)
        .where(sql`${clients.userId} = ${ctx.user.id} AND ${clients.createdAt} >= ${startDate}`);

      const taxaConversao = novosLeads.length > 0 ? (leadsConvertidos.length / novosLeads.length) * 100 : 0;

      return {
        novosLeads: novosLeads.length,
        leadsConvertidos: leadsConvertidos.length,
        taxaConversao: Math.round(taxaConversao),
        novosClientes: novosClientes.length,
        clientesReativados: 0, // Simplificado
      };
    }),

  // 13.7 - Insights Inteligentes (IA)
  getAiInsights: protectedProcedure
    .input(z.object({
      period: z.enum(["7d", "30d", "90d", "6m", "1y"]).default("30d"),
    }))
    .query(async ({ ctx, input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const now = new Date();
      const periodDays = input.period === "7d" ? 7 : input.period === "30d" ? 30 : input.period === "90d" ? 90 : input.period === "6m" ? 180 : 365;
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      const previousStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

      // Buscar insights existentes
      const existingInsights = await database.select().from(aiInsightsGlobal)
        .where(sql`${aiInsightsGlobal.userId} = ${ctx.user.id} AND ${aiInsightsGlobal.dismissed} = false`)
        .limit(5);

      if (existingInsights.length > 0) {
        return existingInsights.map(i => ({
          id: i.id,
          type: i.insightType,
          title: i.title,
          description: i.description,
          severity: i.severity,
        }));
      }

      // Gerar novos insights com IA
      const docs = await database.select().from(documents)
        .where(sql`${documents.userId} = ${ctx.user.id} AND ${documents.createdAt} >= ${startDate}`);
      
      const previousDocs = await database.select().from(documents)
        .where(sql`${documents.userId} = ${ctx.user.id} AND ${documents.createdAt} >= ${previousStartDate} AND ${documents.createdAt} < ${startDate}`);

      const processes = await database.select().from(processManager)
        .where(sql`${processManager.userId} = ${ctx.user.id}`);

      const inactiveProcesses = processes.filter(p => {
        if (!p.lastMoveDate) return false;
        const daysSinceMove = (now.getTime() - p.lastMoveDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceMove > 15;
      });

      const prazos = await database.select().from(agenda)
        .where(sql`${agenda.userId} = ${ctx.user.id} AND ${agenda.type} = 'prazo' AND ${agenda.status} = 'pendente'`);

      const criticos = prazos.filter(p => {
        const daysUntil = (p.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntil <= 2 && daysUntil >= 0;
      });

      const generatedInsights = [];

      // Insight 1: Crescimento de documentos
      if (docs.length > previousDocs.length) {
        const percentChange = previousDocs.length > 0 ? Math.round(((docs.length - previousDocs.length) / previousDocs.length) * 100) : 100;
        generatedInsights.push({
          type: "growth",
          title: "Crescimento de Documentos",
          description: `Documentos cresceram ${percentChange}% no período`,
          severity: "low" as const,
        });
      }

      // Insight 2: Processos inativos
      if (inactiveProcesses.length > 0) {
        generatedInsights.push({
          type: "warning",
          title: "Processos Sem Movimentação",
          description: `${inactiveProcesses.length} processo(s) sem movimentação há mais de 15 dias`,
          severity: "medium" as const,
        });
      }

      // Insight 3: Prazos críticos
      if (criticos.length > 0) {
        generatedInsights.push({
          type: "warning",
          title: "Prazos Críticos Detectados",
          description: `${criticos.length} prazo(s) vencendo nos próximos 2 dias`,
          severity: "high" as const,
        });
      }

      // Salvar insights gerados
      for (const insight of generatedInsights) {
        await database.insert(aiInsightsGlobal).values({
          userId: ctx.user.id,
          insightType: insight.type,
          title: insight.title,
          description: insight.description,
          severity: insight.severity,
          dismissed: false,
        });
      }

      return generatedInsights.map((i, idx) => ({
        id: idx + 1,
        ...i,
      }));
    }),

  // 13.8 - Timeline (últimos eventos)
  getTimeline: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Simplificado: buscar últimos documentos e prazos
      const recentDocs = await database.select().from(documents)
        .where(sql`${documents.userId} = ${ctx.user.id}`)
        .orderBy(sql`${documents.createdAt} DESC`)
        .limit(input.limit);

      const recentPrazos = await database.select().from(agenda)
        .where(sql`${agenda.userId} = ${ctx.user.id}`)
        .orderBy(sql`${agenda.createdAt} DESC`)
        .limit(input.limit);

      const timeline = [
        ...recentDocs.map(d => ({
          type: "document",
          title: d.title,
          date: d.createdAt,
        })),
        ...recentPrazos.map(p => ({
          type: "prazo",
          title: p.title,
          date: p.createdAt,
        })),
      ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, input.limit);

      return timeline;
    }),

  // 13.9 - Export Report (PDF real)
  exportReport: protectedProcedure
    .input(z.object({
      period: z.enum(["7d", "30d", "90d", "6m", "1y"]).default("30d"),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const now = new Date();
      const periodDays = input.period === "7d" ? 7 : input.period === "30d" ? 30 : input.period === "90d" ? 90 : input.period === "6m" ? 180 : 365;
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

      // Buscar dados para o relatório
      const activeProcesses = await database.select().from(processManager)
        .where(sql`${processManager.userId} = ${ctx.user.id} AND ${processManager.status} != 'arquivado'`);
      
      const upcomingDeadlines = await database.select().from(agenda)
        .where(sql`${agenda.userId} = ${ctx.user.id} AND ${agenda.type} = 'prazo' AND ${agenda.status} = 'pendente'`);
      
      const recentDocs = await database.select().from(documents)
        .where(sql`${documents.userId} = ${ctx.user.id} AND ${documents.createdAt} >= ${startDate}`);
      
      const financialMovement = await database.select().from(financialRecords)
        .where(sql`${financialRecords.userId} = ${ctx.user.id} AND ${financialRecords.date} >= ${startDate}`);
      
      const entradas = financialMovement.filter(r => r.type === 'entrada' || r.type === 'honorario').reduce((sum, r) => sum + Number(r.value), 0);
      const saidas = financialMovement.filter(r => r.type === 'saida' || r.type === 'despesa').reduce((sum, r) => sum + Number(r.value), 0);

      // Histórico financeiro (6 meses)
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const records = await database.select().from(financialRecords)
        .where(sql`${financialRecords.userId} = ${ctx.user.id} AND ${financialRecords.date} >= ${sixMonthsAgo}`);

      const monthlyData: Record<string, { entradas: number; saidas: number; saldo: number }> = {};
      records.forEach(record => {
        const monthKey = `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { entradas: 0, saidas: 0, saldo: 0 };
        }
        const value = Number(record.value);
        if (record.type === 'entrada' || record.type === 'honorario') {
          monthlyData[monthKey].entradas += value;
        } else {
          monthlyData[monthKey].saidas += value;
        }
        monthlyData[monthKey].saldo = monthlyData[monthKey].entradas - monthlyData[monthKey].saidas;
      });

      // Processos por fase
      const processes = await database.select().from(processManager)
        .where(sql`${processManager.userId} = ${ctx.user.id}`);
      
      const stageCount: Record<string, number> = {};
      processes.forEach(p => {
        const stage = p.stage || "Sem fase";
        stageCount[stage] = (stageCount[stage] || 0) + 1;
      });

      // Produtividade
      const pecas = await database.select().from(documents)
        .where(sql`${documents.userId} = ${ctx.user.id} AND ${documents.createdAt} >= ${startDate} AND ${documents.documentType} LIKE '%peça%'`);
      
      const prazos = await database.select().from(agenda)
        .where(sql`${agenda.userId} = ${ctx.user.id} AND ${agenda.createdAt} >= ${startDate} AND ${agenda.type} = 'prazo' AND ${agenda.status} = 'concluido'`);
      
      const score = (pecas.length * 2) + (prazos.length * 3) + (recentDocs.length * 1.5);

      // Clientes e leads
      const novosLeads = await database.select().from(leads)
        .where(sql`${leads.userId} = ${ctx.user.id} AND ${leads.createdAt} >= ${startDate}`);
      
      const leadsConvertidos = await database.select().from(leads)
        .where(sql`${leads.userId} = ${ctx.user.id} AND ${leads.status} = 'converted' AND ${leads.updatedAt} >= ${startDate}`);
      
      const novosClientes = await database.select().from(clients)
        .where(sql`${clients.userId} = ${ctx.user.id} AND ${clients.createdAt} >= ${startDate}`);

      // Gerar PDF
      const downloadUrl = await generateAnalyticsReport({
        period: input.period,
        generatedAt: now,
        kpis: {
          processosAtivos: activeProcesses.length,
          prazosProximos: upcomingDeadlines.length,
          documentosAnexados: recentDocs.length,
          movimentoFinanceiro: entradas - saidas,
        },
        financialHistory: Object.entries(monthlyData).map(([month, data]) => ({
          month,
          ...data,
        })),
        processStates: Object.entries(stageCount).map(([name, value]) => ({ name, value })),
        productivity: [{
          name: ctx.user.name || "Advogado",
          pecas: pecas.length,
          prazos: prazos.length,
          documentos: recentDocs.length,
          score: Math.round(score),
        }],
        clientLeadMetrics: {
          novosLeads: novosLeads.length,
          leadsConvertidos: leadsConvertidos.length,
          taxaConversao: novosLeads.length > 0 ? Math.round((leadsConvertidos.length / novosLeads.length) * 100) : 0,
          novosClientes: novosClientes.length,
        },
      });

      return {
        success: true,
        message: "Relatório gerado com sucesso",
        downloadUrl,
      };
    }),

  // 13.10 - Get Most Active Cases
  getMostActiveCases: protectedProcedure
    .input(z.object({
      limit: z.number().default(5),
    }))
    .query(async ({ ctx, input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const processes = await database.select().from(processManager)
        .where(sql`${processManager.userId} = ${ctx.user.id}`)
        .orderBy(sql`${processManager.lastMoveDate} DESC`)
        .limit(input.limit);

      return processes.map(p => ({
        id: p.id,
        caseId: p.caseId,
        stage: p.stage,
        lastMove: p.lastMove,
        lastMoveDate: p.lastMoveDate,
        status: p.status,
      }));
    }),
});
