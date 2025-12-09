import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { notifications, notificationPreferences } from "../drizzle/schema";
import { createNotification } from "./NotificationEngine";

/**
 * Notifications Router (Núcleo 14)
 * 7 tRPC procedures para gerenciamento de notificações
 */

export const notificationsRouter = router({
  // 14.1 - List all notifications
  list: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
      filter: z.enum(["all", "urgentes", "prazos", "documentos", "financeiro"]).default("all"),
    }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let whereClause = sql`${notifications.userId} = ${ctx.user.id}`;

      // Aplicar filtros
      if (input.filter === "urgentes") {
        whereClause = sql`${notifications.userId} = ${ctx.user.id} AND ${notifications.severity} = 'critical'`;
      } else if (input.filter === "prazos") {
        whereClause = sql`${notifications.userId} = ${ctx.user.id} AND (${notifications.type} = 'prazo_proximo' OR ${notifications.type} = 'prazo_hoje' OR ${notifications.type} = 'prazo_atrasado')`;
      } else if (input.filter === "documentos") {
        whereClause = sql`${notifications.userId} = ${ctx.user.id} AND ${notifications.type} = 'documento_anexado'`;
      } else if (input.filter === "financeiro") {
        whereClause = sql`${notifications.userId} = ${ctx.user.id} AND ${notifications.type} = 'pagamento_recebido'`;
      }

      const results = await database.select()
        .from(notifications)
        .where(whereClause)
        .orderBy(sql`${notifications.createdAt} DESC`)
        .limit(input.limit)
        .offset(input.offset);

      return results;
    }),

  // 14.2 - List unread notifications
  listUnread: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const results = await database.select()
        .from(notifications)
        .where(sql`${notifications.userId} = ${ctx.user.id} AND ${notifications.readAt} IS NULL`)
        .orderBy(sql`${notifications.createdAt} DESC`)
        .limit(10);

      return results;
    }),

  // 14.3 - Create notification (manual)
  create: protectedProcedure
    .input(z.object({
      type: z.enum([
        "prazo_proximo",
        "prazo_hoje",
        "prazo_atrasado",
        "nova_movimentacao_processo",
        "documento_anexado",
        "insight_critico",
        "caso_inativo",
        "pagamento_recebido",
        "lead_convertido",
        "checklist_incompleto",
      ]),
      severity: z.enum(["info", "warning", "critical"]).default("info"),
      title: z.string().min(1).max(500),
      message: z.string().min(1),
      origin: z.string().min(1).max(100),
      entityId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const success = await createNotification({
        userId: ctx.user.id,
        type: input.type,
        severity: input.severity,
        title: input.title,
        message: input.message,
        origin: input.origin,
        entityId: input.entityId,
      });

      if (!success) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create notification' });
      }

      return { success: true };
    }),

  // 14.4 - Mark as read
  markAsRead: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await database.update(notifications)
        .set({ readAt: new Date() })
        .where(sql`${notifications.id} = ${input.id} AND ${notifications.userId} = ${ctx.user.id}`);

      return { success: true };
    }),

  // 14.5 - Mark all as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await database.update(notifications)
        .set({ readAt: new Date() })
        .where(sql`${notifications.userId} = ${ctx.user.id} AND ${notifications.readAt} IS NULL`);

      return { success: true };
    }),

  // 14.6 - Delete notification
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await database.delete(notifications)
        .where(sql`${notifications.id} = ${input.id} AND ${notifications.userId} = ${ctx.user.id}`);

      return { success: true };
    }),

  // 14.7 - Get preferences
  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const prefs = await database.select().from(notificationPreferences)
        .where(sql`${notificationPreferences.userId} = ${ctx.user.id}`)
        .limit(1);
      
      // Se não existe, criar com valores padrão
      if (prefs.length === 0) {
        await database.insert(notificationPreferences).values({
          userId: ctx.user.id,
        });
        
        const newPrefs = await database.select().from(notificationPreferences)
          .where(sql`${notificationPreferences.userId} = ${ctx.user.id}`)
          .limit(1);
        
        return newPrefs[0];
      }
      
      return prefs[0];
    }),
  
  // 14.8 - Update preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      prazo_proximo: z.boolean().optional(),
      prazo_hoje: z.boolean().optional(),
      prazo_atrasado: z.boolean().optional(),
      nova_movimentacao_processo: z.boolean().optional(),
      documento_anexado: z.boolean().optional(),
      insight_critico: z.boolean().optional(),
      caso_inativo: z.boolean().optional(),
      pagamento_recebido: z.boolean().optional(),
      lead_convertido: z.boolean().optional(),
      checklist_incompleto: z.boolean().optional(),
      emailEnabled: z.boolean().optional(),
      emailAddress: z.string().optional(),
      quietHoursStart: z.string().optional(),
      quietHoursEnd: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Verificar se já existe
      const existing = await database.select().from(notificationPreferences)
        .where(sql`${notificationPreferences.userId} = ${ctx.user.id}`)
        .limit(1);
      
      if (existing.length === 0) {
        // Criar
        await database.insert(notificationPreferences).values({
          userId: ctx.user.id,
          ...input,
        });
      } else {
        // Atualizar
        await database.update(notificationPreferences)
          .set(input)
          .where(sql`${notificationPreferences.userId} = ${ctx.user.id}`);
      }
      
      return { success: true };
    }),
  
  // 14.9 - Get stats (contador global de não lidas)
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const unreadCount = await database.select({ count: sql<number>`COUNT(*)` })
        .from(notifications)
        .where(sql`${notifications.userId} = ${ctx.user.id} AND ${notifications.readAt} IS NULL`);

      const criticalCount = await database.select({ count: sql<number>`COUNT(*)` })
        .from(notifications)
        .where(sql`${notifications.userId} = ${ctx.user.id} AND ${notifications.readAt} IS NULL AND ${notifications.severity} = 'critical'`);

      return {
        unreadCount: unreadCount[0]?.count || 0,
        criticalCount: criticalCount[0]?.count || 0,
      };
    }),
});
