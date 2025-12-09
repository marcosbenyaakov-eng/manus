import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { templates, templateCategories } from "../drizzle/schema";
import { eq, like, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const templatesRouter = router({
  // List all templates with optional category filter
  list: protectedProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      let query = db.select().from(templates).orderBy(desc(templates.createdAt));

      if (input.categoryId) {
        query = query.where(eq(templates.categoryId, input.categoryId)) as any;
      }

      if (input.search) {
        query = query.where(like(templates.name, `%${input.search}%`)) as any;
      }

      const results = await query.limit(input.limit);
      return results;
    }),

  // Get template by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [template] = await db.select().from(templates).where(eq(templates.id, input.id));
      
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      return template;
    }),

  // Create new template
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        categoryId: z.number(),
        content: z.string(),
        fieldsSchema: z.any().optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [result] = await db.insert(templates).values({
        name: input.name,
        slug: input.slug,
        categoryId: input.categoryId,
        content: input.content,
        fieldsSchema: input.fieldsSchema ? JSON.stringify(input.fieldsSchema) : null,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        createdBy: ctx.user.id,
        published: input.published,
      });

      return { id: Number(result.insertId) };
    }),

  // Update template
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        content: z.string().optional(),
        fieldsSchema: z.any().optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.content !== undefined) updateData.content = input.content;
      if (input.fieldsSchema !== undefined) updateData.fieldsSchema = JSON.stringify(input.fieldsSchema);
      if (input.tags !== undefined) updateData.tags = JSON.stringify(input.tags);
      if (input.published !== undefined) updateData.published = input.published;

      await db.update(templates).set(updateData).where(eq(templates.id, input.id));

      return { success: true };
    }),

  // Delete template
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.delete(templates).where(eq(templates.id, input.id));

      return { success: true };
    }),

  // Apply template to case (fill template with dynamic data)
  applyToCase: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        caseId: z.number().optional(),
        variables: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get template
      const [template] = await db.select().from(templates).where(eq(templates.id, input.templateId));
      
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      // Replace variables in content
      let filledContent = template.content;
      for (const [key, value] of Object.entries(input.variables)) {
        const placeholder = `{{${key}}}`;
        filledContent = filledContent.replace(new RegExp(placeholder, "g"), String(value));
      }

      return {
        name: template.name,
        content: filledContent,
        originalTemplateId: template.id,
      };
    }),

  // List categories
  listCategories: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const categories = await db.select().from(templateCategories).execute();
    return categories;
  }),
});
