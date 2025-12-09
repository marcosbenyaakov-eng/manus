import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { clauseLibrary, clauseCategories, clauseTags } from "../drizzle/schema";
import { eq, like, or } from "drizzle-orm";

export const clausesRouter = router({
  /**
   * List clauses with optional filters
   */
  list: protectedProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        published: z.boolean().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Build query with filters
      const conditions: any[] = [];
      
      if (input.categoryId) {
        conditions.push(eq(clauseLibrary.categoryId, input.categoryId));
      }
      
      if (input.published !== undefined) {
        conditions.push(eq(clauseLibrary.published, input.published));
      }
      
      if (input.search) {
        conditions.push(
          or(
            like(clauseLibrary.title, `%${input.search}%`),
            like(clauseLibrary.content, `%${input.search}%`)
          )
        );
      }

      let clauses;
      if (conditions.length > 0) {
        const whereCondition = conditions.length === 1 ? conditions[0] : conditions.reduce((a, b) => or(a, b));
        clauses = await db
          .select()
          .from(clauseLibrary)
          .where(whereCondition)
          .limit(input.limit)
          .offset(input.offset);
      } else {
        clauses = await db
          .select()
          .from(clauseLibrary)
          .limit(input.limit)
          .offset(input.offset);
      }

      return clauses;
    }),

  /**
   * Create a new clause
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        slug: z.string(),
        categoryId: z.number().optional(),
        content: z.string(),
        description: z.string().optional(),
        tags: z.array(z.number()).optional(),
        variables: z.any().optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(clauseLibrary).values({
        title: input.title,
        slug: input.slug,
        categoryId: input.categoryId,
        content: input.content,
        description: input.description,
        tags: input.tags,
        variables: input.variables,
        published: input.published,
        createdBy: ctx.user.id,
      });

      return { id: Number(result.insertId) };
    }),

  /**
   * Update a clause
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        description: z.string().optional(),
        categoryId: z.number().optional(),
        tags: z.array(z.number()).optional(),
        variables: z.any().optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;

      await db
        .update(clauseLibrary)
        .set(updates)
        .where(eq(clauseLibrary.id, id));

      return { success: true };
    }),

  /**
   * Delete a clause
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(clauseLibrary).where(eq(clauseLibrary.id, input.id));

      return { success: true };
    }),

  /**
   * Get clause by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [clause] = await db
        .select()
        .from(clauseLibrary)
        .where(eq(clauseLibrary.id, input.id))
        .limit(1);

      if (!clause) {
        throw new Error("Clause not found");
      }

      return clause;
    }),

  /**
   * Search clauses (fulltext)
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const clauses = await db
        .select()
        .from(clauseLibrary)
        .where(
          or(
            like(clauseLibrary.title, `%${input.query}%`),
            like(clauseLibrary.content, `%${input.query}%`),
            like(clauseLibrary.description, `%${input.query}%`)
          )
        )
        .limit(input.limit);

      return clauses;
    }),

  /**
   * List all categories
   */
  listCategories: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const categories = await db.select().from(clauseCategories);

    return categories;
  }),

  /**
   * Create a new category
   */
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        parentId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(clauseCategories).values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        parentId: input.parentId,
      });

      return { id: Number(result.insertId) };
    }),

  /**
   * Apply clause to template/document (increment usage count)
   */
  applyClause: protectedProcedure
    .input(
      z.object({
        clauseId: z.number(),
        variables: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get clause
      const [clause] = await db
        .select()
        .from(clauseLibrary)
        .where(eq(clauseLibrary.id, input.clauseId))
        .limit(1);

      if (!clause) {
        throw new Error("Clause not found");
      }

      // Increment usage count
      await db
        .update(clauseLibrary)
        .set({ usageCount: clause.usageCount + 1 })
        .where(eq(clauseLibrary.id, input.clauseId));

      // Apply variables if provided
      let content = clause.content;
      if (input.variables) {
        for (const [key, value] of Object.entries(input.variables)) {
          content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
        }
      }

      return {
        title: clause.title,
        content,
        originalContent: clause.content,
      };
    }),
});
