import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import {
  signatureWorkflows,
  documentSignatures,
  signatureAuditLog,
  repositoryDocuments,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

export const signaturesRouter = router({
  /**
   * Request signature workflow for a document
   */
  requestSignature: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        signers: z.array(
          z.object({
            signerId: z.number(),
            signerEmail: z.string().email(),
            signerName: z.string(),
            order: z.number().default(1),
          })
        ),
        dueDate: z.string().optional(), // ISO date
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create workflow
      const [workflowResult] = await db.insert(signatureWorkflows).values({
        documentId: input.documentId,
        createdBy: ctx.user.id,
        status: "pending",
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      });

      const workflowId = Number(workflowResult.insertId);

      // Create signature requests for each signer
      for (const signer of input.signers) {
        await db.insert(documentSignatures).values({
          workflowId,
          signerId: signer.signerId,
          signerEmail: signer.signerEmail,
          signerName: signer.signerName,
          order: signer.order,
          status: "pending",
        });
      }

      // Log audit
      await db.insert(signatureAuditLog).values({
        workflowId,
        userId: ctx.user.id,
        action: "created",
        details: { signers: input.signers },
      });

      // Notify signers
      await notifyOwner({
        title: "Nova solicitação de assinatura",
        content: `Documento #${input.documentId} aguarda ${input.signers.length} assinatura(s)`,
      });

      return { workflowId, signersCount: input.signers.length };
    }),

  /**
   * Sign a document
   */
  sign: protectedProcedure
    .input(
      z.object({
        signatureId: z.number(),
        ipAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get signature request
      const [signature] = await db
        .select()
        .from(documentSignatures)
        .where(eq(documentSignatures.id, input.signatureId))
        .limit(1);

      if (!signature) {
        throw new Error("Signature request not found");
      }

      if (signature.signerId !== ctx.user.id) {
        throw new Error("Unauthorized: You are not the designated signer");
      }

      if (signature.status !== "pending") {
        throw new Error("Signature already processed");
      }

      // Update signature
      const signatureHash = `sig_${Date.now()}_${ctx.user.id}`;
      await db
        .update(documentSignatures)
        .set({
          status: "signed",
          signedAt: new Date(),
          ipAddress: input.ipAddress,
          signatureHash,
        })
        .where(eq(documentSignatures.id, input.signatureId));

      // Log audit
      await db.insert(signatureAuditLog).values({
        workflowId: signature.workflowId,
        userId: ctx.user.id,
        action: "signed",
        details: { signatureId: input.signatureId },
        ipAddress: input.ipAddress,
      });

      // Check if all signatures are complete
      const allSignatures = await db
        .select()
        .from(documentSignatures)
        .where(eq(documentSignatures.workflowId, signature.workflowId));

      const allSigned = allSignatures.every((s) => s.status === "signed");

      if (allSigned) {
        // Update workflow status
        await db
          .update(signatureWorkflows)
          .set({
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(signatureWorkflows.id, signature.workflowId));

        // Notify owner
        await notifyOwner({
          title: "Documento totalmente assinado",
          content: `Workflow #${signature.workflowId} concluído com sucesso`,
        });
      } else {
        // Update to in_progress
        await db
          .update(signatureWorkflows)
          .set({ status: "in_progress" })
          .where(eq(signatureWorkflows.id, signature.workflowId));
      }

      return { success: true, allSigned };
    }),

  /**
   * Reject signature
   */
  reject: protectedProcedure
    .input(
      z.object({
        signatureId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get signature request
      const [signature] = await db
        .select()
        .from(documentSignatures)
        .where(eq(documentSignatures.id, input.signatureId))
        .limit(1);

      if (!signature) {
        throw new Error("Signature request not found");
      }

      if (signature.signerId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Update signature
      await db
        .update(documentSignatures)
        .set({
          status: "rejected",
          rejectionReason: input.reason,
        })
        .where(eq(documentSignatures.id, input.signatureId));

      // Cancel workflow
      await db
        .update(signatureWorkflows)
        .set({ status: "cancelled" })
        .where(eq(signatureWorkflows.id, signature.workflowId));

      // Log audit
      await db.insert(signatureAuditLog).values({
        workflowId: signature.workflowId,
        userId: ctx.user.id,
        action: "rejected",
        details: { signatureId: input.signatureId, reason: input.reason },
      });

      return { success: true };
    }),

  /**
   * Get workflow status
   */
  getStatus: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [workflow] = await db
        .select()
        .from(signatureWorkflows)
        .where(eq(signatureWorkflows.id, input.workflowId))
        .limit(1);

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      const signatures = await db
        .select()
        .from(documentSignatures)
        .where(eq(documentSignatures.workflowId, input.workflowId));

      return {
        workflow,
        signatures,
      };
    }),

  /**
   * Cancel workflow
   */
  cancel: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(signatureWorkflows)
        .set({ status: "cancelled" })
        .where(eq(signatureWorkflows.id, input.workflowId));

      // Log audit
      await db.insert(signatureAuditLog).values({
        workflowId: input.workflowId,
        userId: ctx.user.id,
        action: "cancelled",
        details: {},
      });

      return { success: true };
    }),

  /**
   * List pending signatures for current user
   */
  listPending: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const pending = await db
      .select()
      .from(documentSignatures)
      .where(
        and(
          eq(documentSignatures.signerId, ctx.user.id),
          eq(documentSignatures.status, "pending")
        )
      );

    return pending;
  }),

  /**
   * Get audit log for workflow
   */
  getAuditLog: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const logs = await db
        .select()
        .from(signatureAuditLog)
        .where(eq(signatureAuditLog.workflowId, input.workflowId));

      return logs;
    }),
});
