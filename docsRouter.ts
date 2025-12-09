import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { repositoryDocuments, repositoryVersions, repositoryLogs, repositorySearchIndex, repositoryAccess } from "../drizzle/schema";
import { eq, like, and, desc, or } from "drizzle-orm";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const docsRouter = router({
  // Upload document with metadata extraction and version v1
  uploadDocument: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        fileData: z.string(), // base64
        fileName: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
        visibility: z.enum(["public", "internal", "private"]).default("internal"),
        tags: z.array(z.string()).optional(),
        extractedMeta: z.any().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const slug = generateSlug(input.title);
      
      // Upload to S3
      const fileBuffer = Buffer.from(input.fileData, "base64");
      const fileKey = `repository/${ctx.user.id}/${Date.now()}-${input.fileName}`;
      const { url: fileUrl } = await storagePut(fileKey, fileBuffer, input.mimeType);

      // Insert document
      const [doc] = await db.insert(repositoryDocuments).values({
        title: input.title,
        slug,
        description: input.description || null,
        fileUrl,
        fileType: input.fileName.split(".").pop() || "unknown",
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        uploadedBy: ctx.user.id,
        visibility: input.visibility,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        extractedMeta: input.extractedMeta ? JSON.stringify(input.extractedMeta) : null,
        versionGroupId: null,
        currentVersionId: null,
      });

      const docId = Number(doc.insertId);

      // Create version v1
      const [version] = await db.insert(repositoryVersions).values({
        documentId: docId,
        versionNumber: 1,
        fileUrl,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        changelog: "Initial version",
        createdBy: ctx.user.id,
      });

      const versionId = Number(version.insertId);

      // Update currentVersionId
      await db.update(repositoryDocuments).set({ currentVersionId: versionId }).where(eq(repositoryDocuments.id, docId));

      // Log upload action
      await db.insert(repositoryLogs).values({
        documentId: docId,
        userId: ctx.user.id,
        action: "upload",
        meta: JSON.stringify({ fileName: input.fileName, fileSize: input.fileSize }),
      });

      // Create search index
      const contentSnippet = `${input.title} ${input.description || ""}`.substring(0, 500);
      await db.insert(repositorySearchIndex).values({
        documentId: docId,
        contentSnippet,
      });

      return { id: docId, slug, fileUrl };
    }),

  // Get document by ID
  getDocumentById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [doc] = await db.select().from(repositoryDocuments).where(eq(repositoryDocuments.id, input.id)).limit(1);
      if (!doc) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });

      // Log view action
      await db.insert(repositoryLogs).values({
        documentId: input.id,
        userId: ctx.user.id,
        action: "view",
        meta: null,
      });

      return doc;
    }),

  // List documents with filters
  listDocuments: protectedProcedure
    .input(
      z.object({
        visibility: z.enum(["public", "internal", "private"]).optional(),
        uploadedBy: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const conditions = [];
      if (input.visibility) conditions.push(eq(repositoryDocuments.visibility, input.visibility));
      if (input.uploadedBy) conditions.push(eq(repositoryDocuments.uploadedBy, input.uploadedBy));
      if (input.search) {
        conditions.push(
          or(
            like(repositoryDocuments.title, `%${input.search}%`),
            like(repositoryDocuments.description, `%${input.search}%`)
          )
        );
      }

      const docs = await db
        .select()
        .from(repositoryDocuments)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(repositoryDocuments.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return docs;
    }),

  // Update document metadata
  updateDocumentMetadata: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        visibility: z.enum(["public", "internal", "private"]).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const updates: any = {};
      if (input.title) {
        updates.title = input.title;
        updates.slug = generateSlug(input.title);
      }
      if (input.description !== undefined) updates.description = input.description;
      if (input.visibility) updates.visibility = input.visibility;
      if (input.tags) updates.tags = JSON.stringify(input.tags);

      await db.update(repositoryDocuments).set(updates).where(eq(repositoryDocuments.id, input.id));

      // Log update action
      await db.insert(repositoryLogs).values({
        documentId: input.id,
        userId: ctx.user.id,
        action: "update",
        meta: JSON.stringify(updates),
      });

      return { success: true };
    }),

  // Create new version
  createVersion: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        fileData: z.string(), // base64
        fileName: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
        changelog: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get current version number
      const versions = await db.select().from(repositoryVersions).where(eq(repositoryVersions.documentId, input.documentId));
      const nextVersionNumber = versions.length + 1;

      // Upload new file
      const fileBuffer = Buffer.from(input.fileData, "base64");
      const fileKey = `repository/${ctx.user.id}/${Date.now()}-v${nextVersionNumber}-${input.fileName}`;
      const { url: fileUrl } = await storagePut(fileKey, fileBuffer, input.mimeType);

      // Insert new version
      const [version] = await db.insert(repositoryVersions).values({
        documentId: input.documentId,
        versionNumber: nextVersionNumber,
        fileUrl,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        changelog: input.changelog,
        createdBy: ctx.user.id,
      });

      const versionId = Number(version.insertId);

      // Update document's currentVersionId and fileUrl
      await db
        .update(repositoryDocuments)
        .set({ currentVersionId: versionId, fileUrl })
        .where(eq(repositoryDocuments.id, input.documentId));

      // Log version creation
      await db.insert(repositoryLogs).values({
        documentId: input.documentId,
        userId: ctx.user.id,
        action: "version_created",
        meta: JSON.stringify({ versionNumber: nextVersionNumber, changelog: input.changelog }),
      });

      return { versionId, versionNumber: nextVersionNumber };
    }),

  // List versions
  listVersions: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const versions = await db
        .select()
        .from(repositoryVersions)
        .where(eq(repositoryVersions.documentId, input.documentId))
        .orderBy(desc(repositoryVersions.versionNumber));

      return versions;
    }),

  // Revert to version
  revertToVersion: protectedProcedure
    .input(z.object({ documentId: z.number(), versionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [version] = await db.select().from(repositoryVersions).where(eq(repositoryVersions.id, input.versionId)).limit(1);
      if (!version) throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });

      // Update document to point to this version
      await db
        .update(repositoryDocuments)
        .set({ currentVersionId: input.versionId, fileUrl: version.fileUrl })
        .where(eq(repositoryDocuments.id, input.documentId));

      // Log revert action
      await db.insert(repositoryLogs).values({
        documentId: input.documentId,
        userId: ctx.user.id,
        action: "reverted",
        meta: JSON.stringify({ versionId: input.versionId, versionNumber: version.versionNumber }),
      });

      return { success: true };
    }),

  // Delete document
  deleteDocument: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Delete related data
      await db.delete(repositoryVersions).where(eq(repositoryVersions.documentId, input.id));
      await db.delete(repositoryLogs).where(eq(repositoryLogs.documentId, input.id));
      await db.delete(repositorySearchIndex).where(eq(repositorySearchIndex.documentId, input.id));
      await db.delete(repositoryAccess).where(eq(repositoryAccess.documentId, input.id));

      // Delete document
      await db.delete(repositoryDocuments).where(eq(repositoryDocuments.id, input.id));

      return { success: true };
    }),

  // Search fulltext
  searchFulltext: protectedProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Simple LIKE search on contentSnippet
      const results = await db
        .select({
          documentId: repositorySearchIndex.documentId,
          contentSnippet: repositorySearchIndex.contentSnippet,
        })
        .from(repositorySearchIndex)
        .where(like(repositorySearchIndex.contentSnippet, `%${input.query}%`))
        .limit(input.limit);

      // Fetch full documents
      if (results.length === 0) return [];

      const docIds = results.map((r) => r.documentId);
      const docs = await db.select().from(repositoryDocuments).where(
        or(...docIds.map((id) => eq(repositoryDocuments.id, id)))
      );

      return docs;
    }),

  // Link document to process (Cross-Module Integration)
  linkToProcess: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        processId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Update document metadata
      await db.update(repositoryDocuments).set({
        extractedMeta: JSON.stringify({ processId: input.processId }),
      }).where(eq(repositoryDocuments.id, input.documentId));

      // Log action
      await db.insert(repositoryLogs).values({
        documentId: input.documentId,
        userId: ctx.user.id,
        action: "link_to_process",
        meta: JSON.stringify({ processId: input.processId }),
      });

      return { success: true };
    }),

  // Extract deadlines and create agenda events (Cross-Module Integration)
  extractAndCreateDeadlines: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get document
      const [doc] = await db.select().from(repositoryDocuments).where(eq(repositoryDocuments.id, input.documentId));
      if (!doc) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });

      // Simulate deadline extraction (in real app, use LLM or regex)
      // For now, just create a placeholder deadline
      const { agenda } = await import("../drizzle/schema");
      
      await db.insert(agenda).values({
        title: `Prazo detectado em ${doc.title}`,
        description: `Prazo extraído automaticamente do documento ${doc.title}`,
        type: "prazo",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: "alta",
        status: "pendente",
        userId: ctx.user.id,
      });

      return { success: true, message: "Prazo criado automaticamente" };
    }),

  // Link to pipeline item (Cross-Module Integration)
  linkToPipeline: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        pipelineItemId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Update document metadata
      const [doc] = await db.select().from(repositoryDocuments).where(eq(repositoryDocuments.id, input.documentId));
      if (!doc) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });

      const currentMeta = doc.extractedMeta ? JSON.parse(doc.extractedMeta as string) : {};
      currentMeta.pipelineItemId = input.pipelineItemId;

      await db.update(repositoryDocuments).set({
        extractedMeta: JSON.stringify(currentMeta),
      }).where(eq(repositoryDocuments.id, input.documentId));

      // Log action
      await db.insert(repositoryLogs).values({
        documentId: input.documentId,
        userId: ctx.user.id,
        action: "link_to_pipeline",
        meta: JSON.stringify({ pipelineItemId: input.pipelineItemId }),
      });

      return { success: true };
    }),
});
