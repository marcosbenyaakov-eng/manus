import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  transitionState,
  forceTransition,
  getCurrentState,
  getStateHistory,
  isValidTransition,
  EntityType,
} from "./engines/StateEngine";
import { getDb } from "./db";
import { stateLogs, stateTransitions } from "../drizzle/schema";
import { sql } from "drizzle-orm";

/**
 * State Router (Núcleo 15 - StateEngine 2.0)
 * 6 tRPC procedures para gerenciamento de estados
 */

const entityTypeEnum = z.enum(["processo", "documento", "agenda", "pipeline", "financeiro", "cliente", "insight"]);

export const stateRouter = router({
  // 15.1 - Get entity state
  getEntityState: protectedProcedure
    .input(z.object({
      entityType: entityTypeEnum,
      entityId: z.number(),
    }))
    .query(async ({ input }) => {
      const state = await getCurrentState(input.entityType, input.entityId);
      
      if (!state) {
        return {
          currentState: null,
          allowedNextStates: [],
        };
      }
      
      return state;
    }),

  // 15.2 - List transitions (recent)
  listTransitions: protectedProcedure
    .input(z.object({
      entityType: entityTypeEnum.optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let whereClause = sql`1=1`;
      
      if (input.entityType) {
        whereClause = sql`${stateLogs.entityType} = ${input.entityType}`;
      }

      const results = await database.select()
        .from(stateLogs)
        .where(whereClause)
        .orderBy(sql`${stateLogs.createdAt} DESC`)
        .limit(input.limit);

      return results;
    }),

  // 15.3 - Update state
  updateState: protectedProcedure
    .input(z.object({
      entityType: entityTypeEnum,
      entityId: z.number(),
      toState: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await transitionState(
        input.entityType,
        input.entityId,
        input.toState,
        input.reason,
        ctx.user.id
      );

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error || 'Failed to transition state',
        });
      }

      return { success: true };
    }),

  // 15.4 - Force transition (admin only)
  forceTransition: protectedProcedure
    .input(z.object({
      entityType: entityTypeEnum,
      entityId: z.number(),
      toState: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can force state transitions',
        });
      }

      const result = await forceTransition(
        input.entityType,
        input.entityId,
        input.toState,
        input.reason,
        ctx.user.id
      );

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error || 'Failed to force transition',
        });
      }

      return { success: true };
    }),

  // 15.5 - Get history
  getHistory: protectedProcedure
    .input(z.object({
      entityType: entityTypeEnum,
      entityId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const history = await getStateHistory(
        input.entityType,
        input.entityId,
        input.limit
      );

      return history;
    }),

  // 15.6 - Validate transition
  validate: protectedProcedure
    .input(z.object({
      entityType: entityTypeEnum,
      fromState: z.string(),
      toState: z.string(),
    }))
    .query(async ({ input }) => {
      const isValid = isValidTransition(
        input.entityType,
        input.fromState,
        input.toState
      );

      return {
        valid: isValid,
        fromState: input.fromState,
        toState: input.toState,
      };
    }),

  // 15.7 - Get all states (debug)
  getAllStates: protectedProcedure
    .query(async () => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const results = await database.select()
        .from(stateTransitions)
        .orderBy(sql`${stateTransitions.updatedAt} DESC`)
        .limit(200);

      return results;
    }),
});
