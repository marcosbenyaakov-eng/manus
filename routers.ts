import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { getDb } from "./db";
import { notes, clients, toolHistory, pipelineStages, pipelineItems, leads, appointments, insights, checklists, checklistItems, automationRules, automationLogs, processes, documents, financialRecords, financialSettings, agenda, processManager, analyticsCache, analyticsLogs, aiInsightsGlobal } from "../drizzle/schema";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { invokeLLM } from "./_core/llm";
import { generateProcessReport, generateMonthlyStatsReport } from "./pdfGenerator";
import { analyticsRouter } from "./analyticsRouter";
import { notificationsRouter } from "./notificationsRouter";
import { stateRouter } from "./stateRouter";
import { blogRouter } from "./blogRouter";
import { docsRouter } from "./docsRouter";
import { templatesRouter } from "./templatesRouter";
import { metadataRouter } from "./metadataRouter";
import { signaturesRouter } from "./signaturesRouter";
import { clausesRouter } from "./clausesRouter";
import { runAllAutoAlertas, createDocumentoPrazoAlert } from "./AutoAlertas";
import { sendNewDocument, sendDeadlineSoon, sendDeadlineToday, sendFinanceUpdate } from "./NotificationEngine";

// Admin-only procedure
const adminOnlyProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Dashboard & Analytics
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      const stats = await db.getDashboardStats(ctx.user.id);
      return stats;
    }),
  }),

  // User Management (Admin only)
  users: router({
    list: adminOnlyProcedure.query(async () => {
      return await db.getAllUsers();
    }),
    updateRole: adminOnlyProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
  }),

  // Process Management
  processes: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        processType: z.string().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const filters = {
          ...input,
          responsibleUserId: ctx.user.role === 'admin' ? undefined : ctx.user.id,
        };
        return await db.getAllProcesses(filters);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProcessById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        processNumber: z.string(),
        title: z.string(),
        description: z.string().optional(),
        processType: z.string(),
        court: z.string().optional(),
        judge: z.string().optional(),
        plaintiff: z.string().optional(),
        defendant: z.string().optional(),
        responsibleUserId: z.number(),
        deadline: z.date().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createProcess({
          ...input,
          createdById: ctx.user.id,
          status: "active",
        });
        
        // Create notification for responsible user
        if (input.responsibleUserId !== ctx.user.id) {
          // Notificação removida temporariamente (incompatibilidade de schema)
        }
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["active", "pending", "archived", "closed"]).optional(),
        processType: z.string().optional(),
        court: z.string().optional(),
        judge: z.string().optional(),
        plaintiff: z.string().optional(),
        defendant: z.string().optional(),
        responsibleUserId: z.number().optional(),
        deadline: z.date().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProcess(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProcess(input.id);
        return { success: true };
      }),
  }),

  // Document Management
  documents: router({
    listByProcess: protectedProcedure
      .input(z.object({ processId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDocumentsByProcessId(input.processId);
      }),
    
    upload: protectedProcedure
      .input(z.object({
        processId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        documentType: z.string(),
        fileName: z.string(),
        fileContent: z.string(), // base64
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.fileContent, 'base64');
        const fileKey = `process-${input.processId}/documents/${nanoid()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Save document metadata to database
        await db.createDocument({
          processId: input.processId,
          title: input.title,
          description: input.description,
          documentType: input.documentType,
          fileKey,
          fileUrl: url,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: buffer.length,
          uploadedById: ctx.user.id,
        });
        
        // Enviar notificação automática (documentId será obtido após inserção)
        // await sendNewDocument(ctx.user.id, documentId, input.title, input.processId);
        
        return { success: true, url };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteDocument(input.id);
        return { success: true };
      }),
  }),

  // Activities & Timeline
  activities: router({
    listByProcess: protectedProcedure
      .input(z.object({ processId: z.number() }))
      .query(async ({ input }) => {
        return await db.getActivitiesByProcessId(input.processId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        processId: z.number(),
        activityType: z.string(),
        title: z.string(),
        description: z.string().optional(),
        scheduledAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createActivity({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),
    
    complete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateActivity(input.id, {
          status: "completed",
          completedAt: new Date(),
        });
        return { success: true };
      }),
  }),

  // AI Chat Assistant
  chat: router({
    // Conversation management
    getConversations: protectedProcedure.query(async ({ ctx }) => {
      return await db.getConversationsByUserId(ctx.user.id);
    }),
    
    getConversationById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getConversationById(input.id);
      }),
    
    deleteConversation: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteConversation(input.id);
        return { success: true };
      }),
    
    getMessages: protectedProcedure
      .input(z.object({ 
        conversationId: z.number().optional(),
        processId: z.number().optional() 
      }))
      .query(async ({ ctx, input }) => {
        if (input.conversationId) {
          return await db.getChatMessagesByConversationId(input.conversationId);
        }
        return await db.getChatMessagesByUserId(ctx.user.id, input.processId);
      }),
    
    sendMessage: protectedProcedure
      .input(z.object({
        message: z.string(),
        processId: z.number().optional(),
        conversationId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get or create conversation
        let conversationId = input.conversationId;
        if (!conversationId) {
          // Create new conversation
          const title = input.message.slice(0, 50) + (input.message.length > 50 ? "..." : "");
          conversationId = await db.createConversation({
            userId: ctx.user.id,
            processId: input.processId,
            title,
            messageCount: 0,
            lastMessageAt: new Date(),
          });
        }
        
        // Save user message
        await db.createChatMessage({
          conversationId,
          userId: ctx.user.id,
          processId: input.processId,
          role: "user",
          content: input.message,
        });
        
        // Get context if processId is provided
        let context = "";
        if (input.processId) {
          const process = await db.getProcessById(input.processId);
          if (process) {
            context = `Contexto do Processo:
Número: ${process.processNumber}
Título: ${process.title}
Tipo: ${process.processType}
Status: ${process.status}
Descrição: ${process.description || "N/A"}
`;
          }
        }
        
        // Get chat history
        const history = await db.getChatMessagesByUserId(ctx.user.id, input.processId);
        const messages = history.slice(-10).map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));
        
        // Call LLM
        const systemPrompt = `Você é um assistente jurídico especializado em direito brasileiro. Você ajuda advogados e profissionais do direito com orientações, análises de casos e sugestões de estratégias jurídicas.

${context}

Forneça respostas precisas, profissionais e baseadas na legislação brasileira. Seja conciso mas completo.`;
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            { role: "user", content: input.message },
          ],
        });
        
        const assistantMessage = typeof response.choices[0]?.message?.content === 'string' 
          ? response.choices[0].message.content 
          : "Desculpe, não consegui processar sua mensagem.";
        
        // Save assistant response
        await db.createChatMessage({
          conversationId,
          userId: ctx.user.id,
          processId: input.processId,
          role: "assistant",
          content: assistantMessage,
        });
        
        return { message: assistantMessage, conversationId };
      }),

    // Submit feedback on assistant message
    submitFeedback: protectedProcedure
      .input(z.object({
        messageId: z.number(),
        feedback: z.enum(["positive", "negative"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Update feedback field in chatMessages
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        await database.execute(
          sql`UPDATE chatMessages SET feedback = ${input.feedback} WHERE id = ${input.messageId} AND userId = ${ctx.user.id}`
        );
        
        return { success: true };
      }),
  }),

  // Contact Form
  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        message: z.string().min(10),
      }))
      .mutation(async ({ input }) => {
        // TODO: Save to database or send email
        // For now, just log and return success
        console.log('[Contact Form Submission]', input);
        
        // In production, you would:
        // 1. Save to database: await db.createContactLead(input);
        // 2. Send notification email to owner
        // 3. Send confirmation email to user
        
        return { success: true };
      }),
  }),

  // Automation Templates
  automation: router({
    listTemplates: protectedProcedure.query(async () => {
      return await db.getAllAutomationTemplates();
    }),
    
    createTemplate: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        templateType: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createAutomationTemplate({
          ...input,
          createdById: ctx.user.id,
        });
        return { success: true };
      }),
    
    generateDocument: protectedProcedure
      .input(z.object({
        templateId: z.number(),
        processId: z.number(),
        variables: z.record(z.string(), z.string()),
      }))
      .mutation(async ({ input }) => {
        const template = await db.getAutomationTemplateById(input.templateId);
        if (!template) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' });
        }
        
        const process = await db.getProcessById(input.processId);
        if (!process) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Process not found' });
        }
        
        // Use LLM to generate document based on template and variables
        const prompt = `Gere um documento jurídico baseado no seguinte template e informações:

Template: ${template.name}
Tipo: ${template.templateType}
Conteúdo do Template:
${template.content}

Informações do Processo:
Número: ${process.processNumber}
Título: ${process.title}
Tipo: ${process.processType}
Autor: ${process.plaintiff || 'N/A'}
Réu: ${process.defendant || 'N/A'}

Variáveis Adicionais:
${Object.entries(input.variables).map(([k, v]) => `${k}: ${v}`).join('\n')}

Gere o documento completo, formatado e pronto para uso, substituindo todos os placeholders com as informações fornecidas.`;
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um assistente especializado em geração de documentos jurídicos brasileiros." },
            { role: "user", content: prompt },
          ],
        });
        
        const generatedContent = typeof response.choices[0]?.message?.content === 'string'
          ? response.choices[0].message.content
          : "";
        
        return { content: generatedContent };
      }),
    
    calculateDeadline: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        daysToAdd: z.number(),
        excludeWeekends: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        let currentDate = new Date(input.startDate);
        let daysAdded = 0;
        
        while (daysAdded < input.daysToAdd) {
          currentDate.setDate(currentDate.getDate() + 1);
          
          if (input.excludeWeekends) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              daysAdded++;
            }
          } else {
            daysAdded++;
          }
        }
        
        return { deadline: currentDate };
      }),
  }),

  // Notes (Núcleo 6 - Fase 1)
  notes: router({ list: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const result = await database.select().from(notes).where(sql`${notes.userId} = ${ctx.user.id}`).orderBy(sql`${notes.createdAt} DESC`);
      return result;
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        tags: z.string().optional(),
        processId: z.number().optional(),
        clientId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const result: any = await database.insert(notes).values({
          ...input,
          userId: ctx.user.id,
        });
        return { id: Number(result.insertId || 0) };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
        tags: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await database.update(notes).set({
          title: input.title,
          content: input.content,
          tags: input.tags,
        }).where(sql`${notes.id} = ${input.id} AND ${notes.userId} = ${ctx.user.id}`);
        return { success: true };
      }),
  }),

  // Legal Tools (Núcleo 5)
  legalTools: router({
    generateDraft: protectedProcedure
      .input(z.object({
        type: z.enum(["notificacao", "requerimento", "email", "solicitacao"]),
        context: z.string(),
        recipient: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { generateDraft } = await import("./legalToolsEngine");
        const result = await generateDraft(input);
        return { content: result };
      }),

    summarizeDocument: protectedProcedure
      .input(z.object({ document: z.string() }))
      .mutation(async ({ input }) => {
        const { summarizeDocument } = await import("./legalToolsEngine");
        const result = await summarizeDocument(input);
        return result;
      }),

    extractDeadlines: protectedProcedure
      .input(z.object({ text: z.string() }))
      .mutation(async ({ input }) => {
        const { extractDeadlines } = await import("./legalToolsEngine");
        const result = await extractDeadlines(input);
        return result;
      }),

    identifyRisks: protectedProcedure
      .input(z.object({ caseDescription: z.string() }))
      .mutation(async ({ input }) => {
        const { identifyRisks } = await import("./legalToolsEngine");
        const result = await identifyRisks(input);
        return result;
      }),

    classifyCase: protectedProcedure
      .input(z.object({ caseDescription: z.string() }))
      .mutation(async ({ input }) => {
        const { classifyCase } = await import("./legalToolsEngine");
        const result = await classifyCase(input);
        return result;
      }),

    extractKeyPoints: protectedProcedure
      .input(z.object({ text: z.string() }))
      .mutation(async ({ input }) => {
        const { extractKeyPoints } = await import("./legalToolsEngine");
        const result = await extractKeyPoints(input);
        return result;
      }),

    roleplayLegal: protectedProcedure
      .input(z.object({
        caseDescription: z.string(),
        yourPosition: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { roleplayLegal } = await import("./legalToolsEngine");
        const result = await roleplayLegal(input);
        return result;
      }),

    // Salvar histórico de uso de ferramentas (Núcleo 7 - Melhorias)
    saveToolHistory: protectedProcedure
      .input(z.object({
        toolType: z.string(),
        input: z.string(),
        output: z.string(),
        legalMode: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const result: any = await database.insert(toolHistory).values({
          userId: ctx.user.id,
          toolType: input.toolType,
          input: input.input,
          output: input.output,
          legalMode: input.legalMode,
        });
        return { id: Number(result.insertId || 0) };
      }),
  }),

  // Clients (Núcleo 7 - Melhorias)
  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const result = await database.select().from(clients).where(sql`${clients.userId} = ${ctx.user.id}`).orderBy(sql`${clients.createdAt} DESC`);
      return result;
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        cpfCnpj: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const result: any = await database.insert(clients).values({
          ...input,
          userId: ctx.user.id,
        });
        return { id: Number(result.insertId || 0) };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        cpfCnpj: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await database.update(clients).set({
          name: input.name,
          email: input.email,
          phone: input.phone,
          cpfCnpj: input.cpfCnpj,
          address: input.address,
          notes: input.notes,
        }).where(sql`${clients.id} = ${input.id} AND ${clients.userId} = ${ctx.user.id}`);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await database.delete(clients).where(sql`${clients.id} = ${input.id} AND ${clients.userId} = ${ctx.user.id}`);
        return { success: true };
      }),
  }),

  // Pipeline (Núcleo 8)
  pipeline: router({
    // Stages
    listStages: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const result = await database.select().from(pipelineStages).where(sql`${pipelineStages.userId} = ${ctx.user.id}`).orderBy(sql`${pipelineStages.order} ASC`);
      return result;
    }),

    createStage: protectedProcedure
      .input(z.object({
        name: z.string(),
        order: z.number(),
        color: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const result: any = await database.insert(pipelineStages).values({
          ...input,
          userId: ctx.user.id,
        });
        return { id: Number(result.insertId || 0) };
      }),

    // Items
    listItems: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const result = await database.select().from(pipelineItems).where(sql`${pipelineItems.userId} = ${ctx.user.id}`).orderBy(sql`${pipelineItems.order} ASC`);
      return result;
    }),

    createItem: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        stageId: z.number(),
        clientId: z.number().optional(),
        processId: z.number().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        value: z.string().optional(),
        order: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const result: any = await database.insert(pipelineItems).values({
          ...input,
          userId: ctx.user.id,
        });
        return { id: Number(result.insertId || 0) };
      }),

    updateItem: protectedProcedure
      .input(z.object({
        id: z.number(),
        stageId: z.number().optional(),
        order: z.number().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { id, ...updateData } = input;
        await database.update(pipelineItems).set(updateData).where(sql`${pipelineItems.id} = ${id} AND ${pipelineItems.userId} = ${ctx.user.id}`);
        return { success: true };
      }),

    deleteItem: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await database.delete(pipelineItems).where(sql`${pipelineItems.id} = ${input.id} AND ${pipelineItems.userId} = ${ctx.user.id}`);
        return { success: true };
      }),
  }),

  // Leads (Núcleo 8)
  leads: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const result = await database.select().from(leads).where(sql`${leads.userId} = ${ctx.user.id}`).orderBy(sql`${leads.createdAt} DESC`);
      return result;
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        source: z.string().optional(),
        status: z.enum(["new", "contacted", "qualified", "converted", "lost"]).default("new"),
        caseType: z.string().optional(),
        description: z.string().optional(),
        estimatedValue: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const result: any = await database.insert(leads).values({
          ...input,
          userId: ctx.user.id,
        });
        return { id: Number(result.insertId || 0) };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        source: z.string().optional(),
        status: z.enum(["new", "contacted", "qualified", "converted", "lost"]).optional(),
        caseType: z.string().optional(),
        description: z.string().optional(),
        estimatedValue: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { id, ...updateData } = input;
        await database.update(leads).set(updateData).where(sql`${leads.id} = ${id} AND ${leads.userId} = ${ctx.user.id}`);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await database.delete(leads).where(sql`${leads.id} = ${input.id} AND ${leads.userId} = ${ctx.user.id}`);
        return { success: true };
      }),
  }),

  // Appointments (Núcleo 8)
  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const result = await database.select().from(appointments).where(sql`${appointments.userId} = ${ctx.user.id}`).orderBy(sql`${appointments.startTime} ASC`);
      return result;
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        startTime: z.date(),
        endTime: z.date(),
        location: z.string().optional(),
        type: z.enum(["meeting", "hearing", "deadline", "consultation", "other"]).default("meeting"),
        clientId: z.number().optional(),
        processId: z.number().optional(),
        status: z.enum(["scheduled", "completed", "cancelled", "rescheduled"]).default("scheduled"),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const result: any = await database.insert(appointments).values({
          ...input,
          userId: ctx.user.id,
        });
        return { id: Number(result.insertId || 0) };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        startTime: z.date().optional(),
        endTime: z.date().optional(),
        location: z.string().optional(),
        type: z.enum(["meeting", "hearing", "deadline", "consultation", "other"]).optional(),
        status: z.enum(["scheduled", "completed", "cancelled", "rescheduled"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { id, ...updateData } = input;
        await database.update(appointments).set(updateData).where(sql`${appointments.id} = ${id} AND ${appointments.userId} = ${ctx.user.id}`);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await database.delete(appointments).where(sql`${appointments.id} = ${input.id} AND ${appointments.userId} = ${ctx.user.id}`);
        return { success: true };
      }),
  }),

  // Reports
  reports: router({
    generateProcessReport: protectedProcedure
      .input(z.object({ processId: z.number() }))
      .mutation(async ({ input }) => {
        const process = await db.getProcessById(input.processId);
        if (!process) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Process not found" });
        }
        
        const documents = await db.getDocumentsByProcessId(input.processId);
        const activities = await db.getActivitiesByProcessId(input.processId);
        
        const url = await generateProcessReport({
          processNumber: process.processNumber,
          title: process.title,
          type: process.processType,
          status: process.status,
          createdAt: process.createdAt,
          documents: documents.map((doc: any) => ({
            title: doc.title,
            type: doc.documentType,
            uploadedAt: doc.uploadedAt,
          })),
          activities: activities.map((act: any) => ({
            type: act.activityType,
            description: act.description,
            createdAt: act.createdAt,
          })),
        });
        
        return { url };
      }),
    
    generateMonthlyReport: protectedProcedure
      .input(z.object({ month: z.number(), year: z.number() }))
      .mutation(async ({ input }) => {
        const stats = await db.getMonthlyStats(input.month, input.year);
        
        const url = await generateMonthlyStatsReport({
          month: input.month.toString().padStart(2, "0"),
          year: input.year,
          totalProcesses: stats.totalProcesses,
          activeProcesses: stats.activeProcesses,
          closedProcesses: stats.closedProcesses,
          totalDocuments: stats.totalDocuments,
          processesByType: stats.processesByType,
          processesByStatus: stats.processesByStatus,
        });
        
        return { url };
      }),
  }),

  // AutoContext Link (Núcleo 9)
  autoContext: router({
    getClientContext: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Get client info
        const client = await database.select().from(clients).where(sql`${clients.id} = ${input.clientId} AND ${clients.userId} = ${ctx.user.id}`).limit(1);
        if (!client.length) throw new TRPCError({ code: 'NOT_FOUND', message: 'Cliente não encontrado' });
        
        // Get related documents
        const relatedDocuments = await database.select().from(documents).where(sql`${documents.clientId} = ${input.clientId}`).limit(10);
        
        // Get related pipeline items
        const relatedPipelineItems = await database.select().from(pipelineItems).where(sql`${pipelineItems.clientId} = ${input.clientId}`).limit(10);
        
        // Get related notes
        const relatedNotes = await database.select().from(notes).where(sql`${notes.clientId} = ${input.clientId}`).limit(10);
        
        // Get recent insights
        const relatedInsights = await database.select().from(insights).where(sql`${insights.clientId} = ${input.clientId} AND ${insights.dismissed} = false`).limit(5);
        
        return {
          client: client[0],
          documents: relatedDocuments,
          pipelineItems: relatedPipelineItems,
          notes: relatedNotes,
          insights: relatedInsights,
        };
      }),
    
    getDocumentContext: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Get document info
        const document = await database.select().from(documents).where(sql`${documents.id} = ${input.documentId} AND ${documents.userId} = ${ctx.user.id}`).limit(1);
        if (!document.length) throw new TRPCError({ code: 'NOT_FOUND', message: 'Documento não encontrado' });
        
        // Get related client if exists
        let relatedClient = null;
        if (document[0].clientId) {
          const clientResult = await database.select().from(clients).where(sql`${clients.id} = ${document[0].clientId}`).limit(1);
          relatedClient = clientResult[0] || null;
        }
        
        // Get related process if exists
        let relatedProcess = null;
        if (document[0].processId) {
          const processResult = await database.select().from(processes).where(sql`${processes.id} = ${document[0].processId}`).limit(1);
          relatedProcess = processResult[0] || null;
        }
        
        return {
          document: document[0],
          client: relatedClient,
          process: relatedProcess,
        };
      }),
    
    getPipelineContext: protectedProcedure
      .input(z.object({ pipelineItemId: z.number() }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Get pipeline item
        const item = await database.select().from(pipelineItems).where(sql`${pipelineItems.id} = ${input.pipelineItemId} AND ${pipelineItems.userId} = ${ctx.user.id}`).limit(1);
        if (!item.length) throw new TRPCError({ code: 'NOT_FOUND', message: 'Item do pipeline não encontrado' });
        
        // Get stage info
        let stage = null;
        if (item[0].stageId) {
          const stageResult = await database.select().from(pipelineStages).where(sql`${pipelineStages.id} = ${item[0].stageId}`).limit(1);
          stage = stageResult[0] || null;
        }
        
        // Get related client if exists
        let relatedClient = null;
        if (item[0].clientId) {
          const clientResult = await database.select().from(clients).where(sql`${clients.id} = ${item[0].clientId}`).limit(1);
          relatedClient = clientResult[0] || null;
        }
        
        // Get related process if exists
        let relatedProcess = null;
        if (item[0].processId) {
          const processResult = await database.select().from(processes).where(sql`${processes.id} = ${item[0].processId}`).limit(1);
          relatedProcess = processResult[0] || null;
        }
        
        // Get recent insights
        const relatedInsights = await database.select().from(insights).where(sql`${insights.pipelineItemId} = ${input.pipelineItemId} AND ${insights.dismissed} = false`).limit(5);
        
        return {
          item: item[0],
          stage,
          client: relatedClient,
          process: relatedProcess,
          insights: relatedInsights,
        };
      }),
  }),

  // SmartPipeline Automation (Núcleo 9)
  smartPipeline: router({
    runAllAutomations: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { runAllAutomations } = await import("./SmartPipelineAutomation");
        const results = await runAllAutomations(ctx.user.id);
        return results;
      }),
    
    checkInactiveCases: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { checkInactiveCases } = await import("./SmartPipelineAutomation");
        const result = await checkInactiveCases(ctx.user.id);
        return result;
      }),
    
    markAsUrgent: protectedProcedure
      .input(z.object({ pipelineItemId: z.number(), deadline: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { onDeadlineDetected } = await import("./SmartPipelineAutomation");
        const result = await onDeadlineDetected(ctx.user.id, input.pipelineItemId, input.deadline);
        return result;
      }),
  }),

  // Auto-Checklist (Núcleo 9)
  checklists: router({
    create: protectedProcedure
      .input(z.object({
        caseType: z.enum(["civel", "consumidor", "imobiliario", "processual", "empresarial"]),
        clientId: z.number().optional(),
        processId: z.number().optional(),
        pipelineItemId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createChecklist } = await import("./AutoChecklist");
        const result = await createChecklist(
          ctx.user.id,
          input.caseType,
          input.clientId,
          input.processId,
          input.pipelineItemId
        );
        return result;
      }),
    
    list: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        processId: z.number().optional(),
        pipelineItemId: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        let query = sql`${checklists.userId} = ${ctx.user.id}`;
        
        if (input.clientId) {
          query = sql`${query} AND ${checklists.clientId} = ${input.clientId}`;
        }
        if (input.processId) {
          query = sql`${query} AND ${checklists.processId} = ${input.processId}`;
        }
        if (input.pipelineItemId) {
          query = sql`${query} AND ${checklists.pipelineItemId} = ${input.pipelineItemId}`;
        }
        
        const result = await database.select().from(checklists).where(query);
        return result;
      }),
    
    getItems: protectedProcedure
      .input(z.object({ checklistId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const items = await database.select().from(checklistItems)
          .where(sql`${checklistItems.checklistId} = ${input.checklistId}`)
          .orderBy(checklistItems.order);
        
        return items;
      }),
    
    toggleItem: protectedProcedure
      .input(z.object({ itemId: z.number(), checked: z.boolean() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await database.update(checklistItems)
          .set({ checked: input.checked })
          .where(sql`${checklistItems.id} = ${input.itemId}`);
        
        return { success: true };
      }),
  }),

  // Auto-Insight (Núcleo 9)
  insights: router({
    analyze: protectedProcedure
      .input(z.object({
        text: z.string(),
        clientId: z.number().optional(),
        processId: z.number().optional(),
        pipelineItemId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { analyzeAndSave } = await import("./AutoInsight");
        const result = await analyzeAndSave({
          text: input.text,
          clientId: input.clientId,
          processId: input.processId,
          pipelineItemId: input.pipelineItemId,
          userId: ctx.user.id,
        });
        return result;
      }),
    
    list: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        processId: z.number().optional(),
        pipelineItemId: z.number().optional(),
        dismissed: z.boolean().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        let query = sql`${insights.userId} = ${ctx.user.id}`;
        
        if (input.clientId) {
          query = sql`${query} AND ${insights.clientId} = ${input.clientId}`;
        }
        if (input.processId) {
          query = sql`${query} AND ${insights.processId} = ${input.processId}`;
        }
        if (input.pipelineItemId) {
          query = sql`${query} AND ${insights.pipelineItemId} = ${input.pipelineItemId}`;
        }
        if (input.dismissed !== undefined) {
          query = sql`${query} AND ${insights.dismissed} = ${input.dismissed}`;
        }
        
        const result = await database.select().from(insights).where(query).orderBy(sql`${insights.createdAt} DESC`);
        return result;
      }),
    
    dismiss: protectedProcedure
      .input(z.object({ insightId: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await database.update(insights)
          .set({ dismissed: true })
          .where(sql`${insights.id} = ${input.insightId}`);
        
        return { success: true };
      }),
  }),

  // Document Automation (Núcleo 9)
  documentAutomation: router({
    analyzeDocument: protectedProcedure
      .input(z.object({
        documentText: z.string(),
        clientId: z.number().optional(),
        processId: z.number().optional(),
        pipelineItemId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { onDocumentUploadedWithAutomation } = await import("./DocumentAutomation");
        const result = await onDocumentUploadedWithAutomation({
          documentText: input.documentText,
          userId: ctx.user.id,
          clientId: input.clientId,
          processId: input.processId,
          pipelineItemId: input.pipelineItemId,
        });
        return result;
      }),
  }),

  // Financial Module (Núcleo 10)
  financial: router({
    // Financial Records CRUD
    listRecords: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        caseId: z.number().optional(),
        type: z.enum(["entrada", "saida", "honorario", "despesa"]).optional(),
        status: z.enum(["pago", "pendente"]).optional(),
      }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        let query = sql`${financialRecords.userId} = ${ctx.user.id}`;
        
        if (input.clientId) {
          query = sql`${query} AND ${financialRecords.clientId} = ${input.clientId}`;
        }
        if (input.caseId) {
          query = sql`${query} AND ${financialRecords.caseId} = ${input.caseId}`;
        }
        if (input.type) {
          query = sql`${query} AND ${financialRecords.type} = ${input.type}`;
        }
        if (input.status) {
          query = sql`${query} AND ${financialRecords.status} = ${input.status}`;
        }
        
        const result = await database.select().from(financialRecords).where(query).orderBy(sql`${financialRecords.date} DESC`);
        return result;
      }),
    
    createRecord: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        caseId: z.number().optional(),
        description: z.string(),
        type: z.enum(["entrada", "saida", "honorario", "despesa"]),
        value: z.string(),
        date: z.date(),
        status: z.enum(["pago", "pendente"]).default("pendente"),
        paymentMethod: z.enum(["pix", "boleto", "transferencia", "dinheiro", "cartao"]).optional(),
        docUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await database.insert(financialRecords).values({
          ...input,
          userId: ctx.user.id,
        });
        
        // Enviar notificação automática para entradas pagas
        if ((input.type === "entrada" || input.type === "honorario") && input.status === "pago") {
          await sendFinanceUpdate(ctx.user.id, 0, input.type, parseFloat(input.value), input.description);
        }
        
        return { success: true };
      }),
    
    updateRecord: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        value: z.string().optional(),
        date: z.date().optional(),
        status: z.enum(["pago", "pendente"]).optional(),
        paymentMethod: z.enum(["pix", "boleto", "transferencia", "dinheiro", "cartao"]).optional(),
        docUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const { id, ...updates } = input;
        await database.update(financialRecords)
          .set(updates)
          .where(sql`${financialRecords.id} = ${id}`);
        
        return { success: true };
      }),
    
    deleteRecord: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await database.delete(financialRecords).where(sql`${financialRecords.id} = ${input.id}`);
        return { success: true };
      }),
    
    // Financial Settings
    getSettings: protectedProcedure
      .query(async ({ ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const result = await database.select().from(financialSettings)
          .where(sql`${financialSettings.userId} = ${ctx.user.id}`);
        
        return result[0] || null;
      }),
    
    updateSettings: protectedProcedure
      .input(z.object({
        defaultEntryValue: z.string().optional(),
        defaultHonorarioValue: z.string().optional(),
        defaultPaymentMethod: z.enum(["pix", "boleto", "transferencia", "dinheiro", "cartao"]).optional(),
        internalNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if settings exist
        const existing = await database.select().from(financialSettings)
          .where(sql`${financialSettings.userId} = ${ctx.user.id}`);
        
        if (existing.length === 0) {
          // Create new settings
          await database.insert(financialSettings).values({
            userId: ctx.user.id,
            ...input,
          });
        } else {
          // Update existing settings
          await database.update(financialSettings)
            .set(input)
            .where(sql`${financialSettings.userId} = ${ctx.user.id}`);
        }
        
        return { success: true };
      }),
    
    // Dashboard Stats
    getStats: protectedProcedure
      .input(z.object({
        month: z.number().optional(),
        year: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const now = new Date();
        const month = input.month || now.getMonth() + 1;
        const year = input.year || now.getFullYear();
        
        // Get all records for the month
        const records = await database.select().from(financialRecords)
          .where(sql`${financialRecords.userId} = ${ctx.user.id} AND MONTH(${financialRecords.date}) = ${month} AND YEAR(${financialRecords.date}) = ${year}`);
        
        // Calculate totals
        let totalEntradas = 0;
        let totalSaidas = 0;
        
        records.forEach((record) => {
          const value = parseFloat(record.value);
          if (record.type === "entrada" || record.type === "honorario") {
            totalEntradas += value;
          } else {
            totalSaidas += value;
          }
        });
        
        return {
          totalEntradas,
          totalSaidas,
          balance: totalEntradas - totalSaidas,
          recordCount: records.length,
        };
      }),
  }),

  // Agenda (Núcleo 11 - Agenda Jurídica Inteligente)
  agenda: router({
    // CRUD
    list: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        caseId: z.number().optional(),
        type: z.enum(["prazo", "compromisso", "lembrete"]).optional(),
        status: z.enum(["pendente", "concluido"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        let query = sql`${agenda.userId} = ${ctx.user.id}`;
        
        if (input.clientId) {
          query = sql`${query} AND ${agenda.clientId} = ${input.clientId}`;
        }
        if (input.caseId) {
          query = sql`${query} AND ${agenda.caseId} = ${input.caseId}`;
        }
        if (input.type) {
          query = sql`${query} AND ${agenda.type} = ${input.type}`;
        }
        if (input.status) {
          query = sql`${query} AND ${agenda.status} = ${input.status}`;
        }
        if (input.startDate) {
          query = sql`${query} AND ${agenda.date} >= ${input.startDate}`;
        }
        if (input.endDate) {
          query = sql`${query} AND ${agenda.date} <= ${input.endDate}`;
        }
        
        const result = await database.select().from(agenda).where(query).orderBy(sql`${agenda.date} ASC`);
        return result;
      }),
    
    create: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        caseId: z.number().optional(),
        title: z.string(),
        description: z.string().optional(),
        date: z.date(),
        time: z.string().optional(),
        type: z.enum(["prazo", "compromisso", "lembrete"]),
        source: z.enum(["manual", "documento", "pipeline", "historico"]).default("manual"),
        priority: z.enum(["normal", "alta"]).default("normal"),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await database.insert(agenda).values({
          ...input,
          userId: ctx.user.id,
        });
        
        // Enviar notificação automática se for prazo
        if (input.type === "prazo") {
          const daysUntilDeadline = Math.ceil((input.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysUntilDeadline <= 0) {
            // Prazo já venceu ou vence hoje
            await sendDeadlineToday(ctx.user.id, 0, input.title);
          } else if (daysUntilDeadline <= 2) {
            // Prazo próximo (2 dias)
            await sendDeadlineSoon(ctx.user.id, 0, input.title, daysUntilDeadline);
          }
        }
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
        time: z.string().optional(),
        status: z.enum(["pendente", "concluido"]).optional(),
        priority: z.enum(["normal", "alta"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const { id, ...updates } = input;
        await database.update(agenda)
          .set(updates)
          .where(sql`${agenda.id} = ${id}`);
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await database.delete(agenda).where(sql`${agenda.id} = ${input.id}`);
        return { success: true };
      }),
    
    // AutoPrazos - Create from deadline detection
    createFromDeadline: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        caseId: z.number().optional(),
        title: z.string(),
        description: z.string(),
        date: z.date(),
        documentExcerpt: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await database.insert(agenda).values({
          clientId: input.clientId,
          caseId: input.caseId,
          title: input.title,
          description: input.description + (input.documentExcerpt ? `\n\nTrecho do documento: ${input.documentExcerpt}` : ""),
          date: input.date,
          type: "prazo",
          source: "documento",
          priority: "alta",
          userId: ctx.user.id,
        });
        
        return { success: true };
      }),
    
    // Get urgent items (prazos in 2 days or less)
    getUrgent: protectedProcedure
      .query(async ({ ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
        
        const result = await database.select().from(agenda)
          .where(sql`${agenda.userId} = ${ctx.user.id} AND ${agenda.type} = 'prazo' AND ${agenda.status} = 'pendente' AND ${agenda.date} <= ${twoDaysFromNow}`)
          .orderBy(sql`${agenda.date} ASC`);
        
        return result;
      }),
    
    // Get today's items
    getToday: protectedProcedure
      .query(async ({ ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const result = await database.select().from(agenda)
          .where(sql`${agenda.userId} = ${ctx.user.id} AND ${agenda.status} = 'pendente' AND ${agenda.date} >= ${today} AND ${agenda.date} < ${tomorrow}`)
          .orderBy(sql`${agenda.date} ASC`);
        
        return result;
      }),
  }),

  // AutoAlertas (Núcleo 11 - Agenda Jurídica Inteligente)
  autoAlertas: router({
    runAll: protectedProcedure
      .query(async ({ ctx }) => {
        const alerts = await runAllAutoAlertas(ctx.user.id);
        return alerts;
      }),
    
    createDocumentoPrazoAlert: protectedProcedure
      .input(z.object({
        agendaItemId: z.number(),
        title: z.string(),
        clientId: z.number().optional(),
        caseId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const alert = await createDocumentoPrazoAlert(
          ctx.user.id,
          input.agendaItemId,
          input.title,
          input.clientId,
          input.caseId
        );
        
        // Salvar como insight
        const database = await getDb();
        if (database) {
          await database.insert(insights).values({
            userId: ctx.user.id,
            type: alert.type,
            severity: alert.severity,
            title: alert.title,
            description: alert.description,
            clientId: alert.clientId,
            processId: alert.caseId,
          });
        }
        
        return alert;
      }),
  }),

  // ProcessManager (Núcleo 12 - Controle de Processos)
  processManager: router({
    // CRUD
    list: protectedProcedure
      .input(z.object({
        stage: z.string().optional(),
        status: z.enum(["ativo", "arquivado", "suspenso", "concluido"]).optional(),
        clientId: z.number().optional(),
        responsible: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        let query = sql`${processManager.userId} = ${ctx.user.id}`;
        
        if (input.stage) {
          query = sql`${query} AND ${processManager.stage} = ${input.stage}`;
        }
        if (input.status) {
          query = sql`${query} AND ${processManager.status} = ${input.status}`;
        }
        if (input.clientId) {
          query = sql`${query} AND ${processManager.clientId} = ${input.clientId}`;
        }
        if (input.responsible) {
          query = sql`${query} AND ${processManager.responsible} = ${input.responsible}`;
        }
        
        const result = await database.select().from(processManager).where(query).orderBy(sql`${processManager.lastMoveDate} DESC`);
        return result;
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const result = await database.select().from(processManager)
          .where(sql`${processManager.id} = ${input.id} AND ${processManager.userId} = ${ctx.user.id}`);
        
        if (result.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Processo não encontrado' });
        }
        
        return result[0];
      }),
    
    create: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        clientId: z.number().optional(),
        stage: z.string(),
        lastMove: z.string().optional(),
        nextAction: z.string().optional(),
        responsible: z.string().optional(),
        status: z.enum(["ativo", "arquivado", "suspenso", "concluido"]).default("ativo"),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await database.insert(processManager).values({
          ...input,
          userId: ctx.user.id,
          lastMoveDate: new Date(),
        });
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        stage: z.string().optional(),
        lastMove: z.string().optional(),
        lastMoveDate: z.date().optional(),
        nextAction: z.string().optional(),
        responsible: z.string().optional(),
        status: z.enum(["ativo", "arquivado", "suspenso", "concluido"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const { id, ...updates } = input;
        await database.update(processManager)
          .set(updates)
          .where(sql`${processManager.id} = ${id}`);
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await database.delete(processManager).where(sql`${processManager.id} = ${input.id}`);
        return { success: true };
      }),
    
    // Atualizações automáticas
    updateOnDocumentUpload: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        documentType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Buscar processManager pelo caseId
        const result = await database.select().from(processManager)
          .where(sql`${processManager.caseId} = ${input.caseId} AND ${processManager.userId} = ${ctx.user.id}`);
        
        if (result.length > 0) {
          const process = result[0];
          
          // Se for envio de peça, muda stage
          if (input.documentType.toLowerCase().includes("peça") || input.documentType.toLowerCase().includes("petição")) {
            await database.update(processManager)
              .set({
                stage: "Aguardando decisão",
                lastMove: `Enviada ${input.documentType}`,
                lastMoveDate: new Date(),
              })
              .where(sql`${processManager.id} = ${process.id}`);
          }
        }
        
        return { success: true };
      }),
    
    updateOnDeadlineDetected: protectedProcedure
      .input(z.object({
        caseId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Buscar processManager pelo caseId
        const result = await database.select().from(processManager)
          .where(sql`${processManager.caseId} = ${input.caseId} AND ${processManager.userId} = ${ctx.user.id}`);
        
        if (result.length > 0) {
          const process = result[0];
          
          // Marca como urgente
          await database.update(processManager)
            .set({
              status: "ativo",
              lastMove: "Prazo detectado - URGENTE",
              lastMoveDate: new Date(),
            })
            .where(sql`${processManager.id} = ${process.id}`);
        }
        
        return { success: true };
      }),
    
    checkInactiveProcesses: protectedProcedure
      .mutation(async ({ ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const twentyDaysAgo = new Date();
        twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
        
        // Buscar processos sem movimentação há 20 dias
        const inactiveProcesses = await database.select().from(processManager)
          .where(sql`${processManager.userId} = ${ctx.user.id} AND ${processManager.lastMoveDate} < ${twentyDaysAgo} AND ${processManager.status} = 'ativo'`);
        
        // Marcar como parado
        for (const process of inactiveProcesses) {
          await database.update(processManager)
            .set({
              status: "suspenso",
              lastMove: "Processo parado há mais de 20 dias",
            })
            .where(sql`${processManager.id} = ${process.id}`);
        }
        
        return { updated: inactiveProcesses.length };
       }),
  }),

  // Analytics (Núcleo 13 - Analytics Module)
  analytics: analyticsRouter,
  notifications: notificationsRouter,
  state: stateRouter,
  
  // Blog (Núcleo 17 - Blog CMS)
  blog: blogRouter,
  
  // Document Repository (Núcleo 18 - Document Repository)
  docs: docsRouter,

  // Templates (Núcleo 18 - Templates System)
  templates: templatesRouter,

  // Metadata Extraction (Sugestão 1)
  metadata: metadataRouter,

  // Signature Workflows (Sugestão 2)
  signatures: signaturesRouter,

  // Clause Library (Sugestão 3)
  clauses: clausesRouter,
});
export type AppRouter = typeof appRouter;
