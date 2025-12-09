import { z } from "zod";
import { getDb } from "./db";
import { blogPosts, blogCategories, blogViews } from "../drizzle/schema";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { eq, desc, and, like, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Helper: gerar slug a partir do título
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-"); // Remove hífens duplicados
}

export const blogRouter = router({
  // 1. Criar post (admin)
  createPost: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        coverImage: z.string().optional(),
        categoryId: z.number().optional(),
        tags: z.array(z.string()).optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = generateSlug(input.title);

      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      const [post] = await db.insert(blogPosts).values({
        title: input.title,
        slug,
        content: input.content,
        coverImage: input.coverImage,
        categoryId: input.categoryId,
        tags: input.tags || [],
        seoTitle: input.seoTitle || input.title,
        seoDescription: input.seoDescription,
        seoKeywords: input.seoKeywords,
        published: input.published,
        authorId: ctx.user.id,
      });

      return { success: true, postId: post.insertId, slug };
    }),

  // 2. Atualizar post (admin)
  updatePost: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        coverImage: z.string().optional(),
        categoryId: z.number().optional(),
        tags: z.array(z.string()).optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updateData: any = { ...input };
      delete updateData.id;

      if (input.title) {
        updateData.slug = generateSlug(input.title);
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, input.id));

      return { success: true };
    }),

  // 3. Deletar post (admin)
  deletePost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  // 4. Buscar post por slug (público)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      const [post] = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, input.slug), eq(blogPosts.published, true)))
        .limit(1);

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post não encontrado" });
      }

      return post;
    }),

  // 5. Listar todos os posts (admin)
  getAllPosts: protectedProcedure
    .input(
      z.object({
        published: z.boolean().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const conditions = input.published !== undefined ? [eq(blogPosts.published, input.published)] : [];

      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      const posts = await db
        .select()
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.createdAt))
        .limit(input.limit);

      return posts;
    }),

  // 6. Listar posts publicados (público)
  getPublishedPosts: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        categoryId: z.number().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      const conditions = [eq(blogPosts.published, true)];

      if (input.categoryId) {
        conditions.push(eq(blogPosts.categoryId, input.categoryId));
      }

      if (input.search) {
        conditions.push(
          sql`(${blogPosts.title} LIKE ${`%${input.search}%`} OR ${blogPosts.content} LIKE ${`%${input.search}%`})`
        );
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      const posts = await db
        .select()
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(blogPosts)
        .where(and(...conditions));

      return {
        posts,
        total: countResult.count,
        page: input.page,
        totalPages: Math.ceil(countResult.count / input.limit),
      };
    }),

  // 7. Adicionar view (tracking)
  addView: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        ip: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      await db.insert(blogViews).values({
        postId: input.postId,
        viewDate: new Date(),
        ip: input.ip || null,
        userAgent: input.userAgent || null,
      });

      return { success: true };
    }),

  // 8. Listar categorias
  listCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
    const categories = await db.select().from(blogCategories).orderBy(blogCategories.name);
    return categories;
  }),

  // Criar categoria (admin)
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const slug = generateSlug(input.name);

      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      const [category] = await db.insert(blogCategories).values({
        name: input.name,
        slug,
      });

      return { success: true, categoryId: category.insertId, slug };
    }),
});
