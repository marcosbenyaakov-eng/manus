import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json, datetime, date } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Legal processes/cases table
 */
export const processes = mysqlTable("processes", {
  id: int("id").autoincrement().primaryKey(),
  processNumber: varchar("processNumber", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "pending", "archived", "closed"]).default("active").notNull(),
  processType: varchar("processType", { length: 100 }).notNull(), // civil, criminal, trabalhista, etc
  court: varchar("court", { length: 255 }),
  judge: varchar("judge", { length: 255 }),
  plaintiff: varchar("plaintiff", { length: 255 }),
  defendant: varchar("defendant", { length: 255 }),
  responsibleUserId: int("responsibleUserId").notNull(),
  createdById: int("createdById").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  deadline: timestamp("deadline"),
  closedAt: timestamp("closedAt"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Process = typeof processes.$inferSelect;
export type InsertProcess = typeof processes.$inferInsert;

/**
 * Documents associated with processes
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  processId: int("processId"),
  clientId: int("clientId"),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  documentType: varchar("documentType", { length: 100 }).notNull(), // petition, sentence, contract, evidence, etc
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(), // S3 URL
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"), // in bytes
  version: int("version").default(1).notNull(),
  uploadedById: int("uploadedById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Activities and timeline events for processes
 */
export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  processId: int("processId").notNull(),
  userId: int("userId").notNull(),
  activityType: varchar("activityType", { length: 100 }).notNull(), // hearing, filing, update, deadline, etc
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduledAt"),
  completedAt: timestamp("completedAt"),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * Notifications (Núcleo 14 - Notification Engine 2.0)
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
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
  ]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  origin: varchar("origin", { length: 100 }).notNull(),
  entityId: int("entityId"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Conversation sessions for organizing chat history
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  processId: int("processId"), // optional: linked to specific process
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"), // AI-generated summary
  tags: text("tags"), // JSON array of tags for search
  messageCount: int("messageCount").default(0).notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Chat messages with AI assistant
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(), // link to conversation
  userId: int("userId").notNull(),
  processId: int("processId"), // optional: context-specific chat
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  feedback: mysqlEnum("feedback", ["positive", "negative"]), // user feedback on assistant messages
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Automation templates for legal documents
 */
export const automationTemplates = mysqlTable("automationTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  templateType: varchar("templateType", { length: 100 }).notNull(), // petition, contract, motion, etc
  content: text("content").notNull(), // Template content with placeholders
  createdById: int("createdById").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutomationTemplate = typeof automationTemplates.$inferSelect;
export type InsertAutomationTemplate = typeof automationTemplates.$inferInsert;

/**
 * Notes/annotations for cases and clients
 */
export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  tags: text("tags"), // JSON array of tags
  userId: int("userId").notNull(), // Author
  processId: int("processId"), // Optional link to process
  clientId: int("clientId"), // Optional link to client
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

/**
 * Tool execution history for legal tools
 */
export const toolHistory = mysqlTable("toolHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  toolType: varchar("toolType", { length: 100 }).notNull(), // generateDraft, summarizeDocument, etc
  input: text("input").notNull(), // JSON of input parameters
  output: text("output").notNull(), // Result text
  legalMode: varchar("legalMode", { length: 50 }), // civel, consumidor, etc
  executedAt: timestamp("executedAt").defaultNow().notNull(),
});

export type ToolHistory = typeof toolHistory.$inferSelect;
export type InsertToolHistory = typeof toolHistory.$inferInsert;

/**
 * Clients table for lawyer dashboard
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }),
  address: text("address"),
  notes: text("notes"),
  userId: int("userId").notNull(), // Lawyer who manages this client
  lastInteraction: timestamp("lastInteraction").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Pipeline stages for case management (Núcleo 8)
 */
export const pipelineStages = mysqlTable("pipelineStages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  order: int("order").notNull(), // Display order
  color: varchar("color", { length: 50 }), // Badge color
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PipelineStage = typeof pipelineStages.$inferSelect;
export type InsertPipelineStage = typeof pipelineStages.$inferInsert;

/**
 * Pipeline items (cases/leads in stages)
 */
export const pipelineItems = mysqlTable("pipelineItems", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  stageId: int("stageId").notNull(),
  clientId: int("clientId"),
  processId: int("processId"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }),
  order: int("order").notNull(),
  tags: text("tags"), // JSON array of tags (e.g., ["Prazo ativo", "Financeiro pendente"])
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PipelineItem = typeof pipelineItems.$inferSelect;
export type InsertPipelineItem = typeof pipelineItems.$inferInsert;

/**
 * Leads for lawyer dashboard
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  source: varchar("source", { length: 100 }), // website, referral, social media, etc
  status: mysqlEnum("status", ["new", "contacted", "qualified", "converted", "lost"]).default("new").notNull(),
  caseType: varchar("caseType", { length: 100 }), // civil, consumer, real estate, etc
  description: text("description"),
  estimatedValue: decimal("estimatedValue", { precision: 10, scale: 2 }),
  userId: int("userId").notNull(),
  convertedToClientId: int("convertedToClientId"), // Link to client if converted
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Appointments/Calendar for lawyer dashboard
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  location: varchar("location", { length: 255 }),
  type: mysqlEnum("type", ["meeting", "hearing", "deadline", "consultation", "other"]).default("meeting").notNull(),
  clientId: int("clientId"), // Optional link to client
  processId: int("processId"), // Optional link to process
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "rescheduled"]).default("scheduled").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Insights automáticos (Núcleo 9 - Auto-Insight)
 */
export const insights = mysqlTable("insights", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["contradiction", "missing_document", "deadline_mentioned", "risk", "strength", "next_step", "prazo_2_dias", "prazo_hoje", "compromisso_hoje", "documento_prazo", "caso_parado"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  clientId: int("clientId"), // Optional link to client
  processId: int("processId"), // Optional link to process
  pipelineItemId: int("pipelineItemId"), // Optional link to pipeline item
  dismissed: boolean("dismissed").default(false).notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = typeof insights.$inferInsert;

/**
 * Checklists por tipo de caso (Núcleo 9 - Auto-Checklist)
 */
export const checklists = mysqlTable("checklists", {
  id: int("id").autoincrement().primaryKey(),
  caseType: mysqlEnum("caseType", ["civel", "consumidor", "imobiliario", "processual", "empresarial"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  clientId: int("clientId"), // Optional link to client
  processId: int("processId"), // Optional link to process
  pipelineItemId: int("pipelineItemId"), // Optional link to pipeline item
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = typeof checklists.$inferInsert;

/**
 * Itens do checklist
 */
export const checklistItems = mysqlTable("checklistItems", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  checked: boolean("checked").default(false).notNull(),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = typeof checklistItems.$inferInsert;

/**
 * Regras de automação (Núcleo 9 - SmartPipeline Automation)
 */
export const automationRules = mysqlTable("automationRules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  trigger: mysqlEnum("trigger", ["document_uploaded", "multiple_documents", "no_action_10_days", "deadline_detected"]).notNull(),
  action: mysqlEnum("action", ["move_to_stage", "add_tag", "mark_urgent", "create_alert"]).notNull(),
  targetStageId: int("targetStageId"), // For move_to_stage action
  tagName: varchar("tagName", { length: 100 }), // For add_tag action
  enabled: boolean("enabled").default(true).notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutomationRule = typeof automationRules.$inferSelect;
export type InsertAutomationRule = typeof automationRules.$inferInsert;

/**
 * Log de automações executadas
 */
export const automationLogs = mysqlTable("automationLogs", {
  id: int("id").autoincrement().primaryKey(),
  ruleId: int("ruleId").notNull(),
  pipelineItemId: int("pipelineItemId"), // Optional link to pipeline item
  clientId: int("clientId"), // Optional link to client
  action: varchar("action", { length: 255 }).notNull(),
  result: text("result"),
  executedAt: timestamp("executedAt").defaultNow().notNull(),
});

export type AutomationLog = typeof automationLogs.$inferSelect;
export type InsertAutomationLog = typeof automationLogs.$inferInsert;

/**
 * Financial Records (Núcleo 10 - Módulo Financeiro)
 */
export const financialRecords = mysqlTable("financialRecords", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId"),
  caseId: int("caseId"), // Optional link to pipeline item or process
  description: varchar("description", { length: 500 }).notNull(),
  type: mysqlEnum("type", ["entrada", "saida", "honorario", "despesa"]).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  status: mysqlEnum("status", ["pago", "pendente"]).default("pendente").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "boleto", "transferencia", "dinheiro", "cartao"]),
  docUrl: varchar("docUrl", { length: 1000 }), // Receipt/invoice URL
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = typeof financialRecords.$inferInsert;

/**
 * Financial Settings (Núcleo 10 - Configurações Financeiras)
 */
export const financialSettings = mysqlTable("financialSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  defaultEntryValue: decimal("defaultEntryValue", { precision: 10, scale: 2 }),
  defaultHonorarioValue: decimal("defaultHonorarioValue", { precision: 10, scale: 2 }),
  defaultPaymentMethod: mysqlEnum("defaultPaymentMethod", ["pix", "boleto", "transferencia", "dinheiro", "cartao"]).default("pix"),
  internalNotes: text("internalNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialSettings = typeof financialSettings.$inferSelect;
export type InsertFinancialSettings = typeof financialSettings.$inferInsert;

/**
 * Agenda (Núcleo 11 - Agenda Jurídica Inteligente)
 */
export const agenda = mysqlTable("agenda", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId"),
  caseId: int("caseId"),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  time: varchar("time", { length: 10 }), // HH:MM format
  type: mysqlEnum("type", ["prazo", "compromisso", "lembrete"]).notNull(),
  source: mysqlEnum("source", ["manual", "documento", "pipeline", "historico"]).default("manual").notNull(),
  priority: mysqlEnum("priority", ["normal", "alta"]).default("normal").notNull(),
  status: mysqlEnum("status", ["pendente", "concluido"]).default("pendente").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgendaItem = typeof agenda.$inferSelect;
export type InsertAgendaItem = typeof agenda.$inferInsert;

/**
 * Process Manager (Núcleo 12 - Controle de Processos)
 */
export const processManager = mysqlTable("processManager", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId"),
  clientId: int("clientId"),
  stage: varchar("stage", { length: 200 }), // Fase do processo
  lastMove: text("lastMove"), // Última movimentação
  lastMoveDate: timestamp("lastMoveDate"),
  nextAction: text("nextAction"), // Próxima ação
  responsible: varchar("responsible", { length: 200 }), // Responsável
  status: mysqlEnum("status", ["ativo", "arquivado", "suspenso", "concluido"]).default("ativo").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProcessManager = typeof processManager.$inferSelect;
export type InsertProcessManager = typeof processManager.$inferInsert;

/**
 * Analytics (Núcleo 13 - Analytics Jurídico)
 */
export const analyticsCache = mysqlTable("analyticsCache", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metricKey: varchar("metricKey", { length: 100 }).notNull(), // kpis, financial, processes, etc.
  period: varchar("period", { length: 20 }), // 7d, 30d, 90d, 6m, 1y
  area: varchar("area", { length: 50 }), // civel, consumidor, imobiliario, empresarial
  data: json("data").notNull(), // Cached metric data
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsCache = typeof analyticsCache.$inferSelect;
export type InsertAnalyticsCache = typeof analyticsCache.$inferInsert;

export const analyticsLogs = mysqlTable("analyticsLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // view_analytics, export_report, etc.
  metadata: json("metadata"), // Additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsLog = typeof analyticsLogs.$inferSelect;
export type InsertAnalyticsLog = typeof analyticsLogs.$inferInsert;

export const aiInsightsGlobal = mysqlTable("aiInsightsGlobal", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  insightType: varchar("insightType", { length: 100 }).notNull(), // growth, warning, recommendation
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  dismissed: boolean("dismissed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiInsightGlobal = typeof aiInsightsGlobal.$inferSelect;
export type InsertAiInsightGlobal = typeof aiInsightsGlobal.$inferInsert;


// Notification Preferences (Melhorias Pós-Núcleo 14)
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  prazo_proximo: boolean("prazo_proximo").default(true),
  prazo_hoje: boolean("prazo_hoje").default(true),
  prazo_atrasado: boolean("prazo_atrasado").default(true),
  nova_movimentacao_processo: boolean("nova_movimentacao_processo").default(true),
  documento_anexado: boolean("documento_anexado").default(true),
  insight_critico: boolean("insight_critico").default(true),
  caso_inativo: boolean("caso_inativo").default(true),
  pagamento_recebido: boolean("pagamento_recebido").default(true),
  lead_convertido: boolean("lead_convertido").default(true),
  checklist_incompleto: boolean("checklist_incompleto").default(true),
  emailEnabled: boolean("emailEnabled").default(false),
  emailAddress: varchar("emailAddress", { length: 255 }),
  quietHoursStart: varchar("quietHoursStart", { length: 5 }), // formato "22:00"
  quietHoursEnd: varchar("quietHoursEnd", { length: 5 }), // formato "08:00"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// State Engine 2.0 (Núcleo 15)
export const stateLogs = mysqlTable("stateLogs", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entityType", { length: 50 }).notNull(), // "processo", "documento", "agenda", "pipeline", "financeiro", "cliente", "insight"
  entityId: int("entityId").notNull(),
  fromState: varchar("fromState", { length: 50 }),
  toState: varchar("toState", { length: 50 }).notNull(),
  reason: text("reason"),
  userId: int("userId"), // quem fez a transição
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const stateTransitions = mysqlTable("stateTransitions", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId").notNull(),
  currentState: varchar("currentState", { length: 50 }).notNull(),
  allowedNextStates: json("allowedNextStates").$type<string[]>().notNull(), // ["estado1", "estado2"]
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== NÚCLEO 17: BLOG JURÍDICO ====================

export const blogCategories = mysqlTable("blog_categories", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  coverImage: varchar("cover_image", { length: 500 }),
  categoryId: int("category_id").references(() => blogCategories.id),
  tags: json("tags").$type<string[]>(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  seoKeywords: varchar("seo_keywords", { length: 500 }),
  published: boolean("published").notNull().default(false),
  authorId: int("author_id").notNull().references(() => users.id),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const blogComments = mysqlTable("blog_comments", {
  id: int("id").primaryKey().autoincrement(),
  postId: int("post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message").notNull(),
  approved: boolean("approved").notNull().default(false),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const blogViews = mysqlTable("blog_views", {
  id: int("id").primaryKey().autoincrement(),
  postId: int("post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  viewDate: date("view_date").notNull(),
  ip: varchar("ip", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// NÚCLEO 18 - DOCUMENT REPOSITORY
// ============================================

export const repositoryDocuments = mysqlTable("repository_documents", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: int("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  uploadedBy: int("uploaded_by").notNull().references(() => users.id),
  visibility: varchar("visibility", { length: 20 }).notNull().default("internal"), // public/internal/private
  tags: json("tags"),
  extractedMeta: json("extracted_meta"),
  versionGroupId: int("version_group_id"),
  currentVersionId: int("current_version_id"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const repositoryVersions = mysqlTable("repository_versions", {
  id: int("id").primaryKey().autoincrement(),
  documentId: int("document_id").notNull().references(() => repositoryDocuments.id),
  versionNumber: int("version_number").notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileSize: int("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  changelog: text("changelog"),
  createdBy: int("created_by").notNull().references(() => users.id),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const templateCategories = mysqlTable("template_categories", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

export const templates = mysqlTable("templates", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  categoryId: int("category_id").references(() => templateCategories.id),
  content: text("content").notNull(),
  fieldsSchema: json("fields_schema"),
  tags: json("tags"),
  published: boolean("published").notNull().default(false),
  createdBy: int("created_by").notNull().references(() => users.id),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  usageCount: int("usage_count").notNull().default(0),
});

export const repositoryAccess = mysqlTable("repository_access", {
  id: int("id").primaryKey().autoincrement(),
  documentId: int("document_id").notNull().references(() => repositoryDocuments.id),
  userId: int("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 20 }).notNull(), // viewer/editor
  expiresAt: datetime("expires_at"),
});

export const repositoryLogs = mysqlTable("repository_logs", {
  id: int("id").primaryKey().autoincrement(),
  documentId: int("document_id").notNull().references(() => repositoryDocuments.id),
  userId: int("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(), // view/download/update/upload
  meta: json("meta"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const repositorySearchIndex = mysqlTable("repository_search_index", {
  id: int("id").primaryKey().autoincrement(),
  documentId: int("document_id").notNull().references(() => repositoryDocuments.id),
  contentSnippet: text("content_snippet").notNull(),
  indexedAt: datetime("indexed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Document Metadata Extraction (Sugestão 1)
 */
export const documentMetadata = mysqlTable("document_metadata", {
  id: int("id").primaryKey().autoincrement(),
  documentId: int("document_id").notNull().references(() => repositoryDocuments.id),
  extractedAt: datetime("extracted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  processNumber: varchar("process_number", { length: 100 }),
  parties: json("parties"), // [{name, role, cpfCnpj}]
  deadlines: json("deadlines"), // [{date, description, type}]
  courtInfo: json("court_info"), // {court, judge, district}
  caseValue: decimal("case_value", { precision: 15, scale: 2 }),
  extractedText: text("extracted_text"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00-1.00
  extractionMethod: varchar("extraction_method", { length: 20 }).notNull(), // llm/ocr/hybrid
});

/**
 * Document Signatures (Sugestão 2)
 */
export const signatureWorkflows = mysqlTable("signature_workflows", {
  id: int("id").primaryKey().autoincrement(),
  documentId: int("document_id").notNull().references(() => repositoryDocuments.id),
  createdBy: int("created_by").notNull().references(() => users.id),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).notNull().default("pending"),
  dueDate: datetime("due_date"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: datetime("completed_at"),
});

export const documentSignatures = mysqlTable("document_signatures", {
  id: int("id").primaryKey().autoincrement(),
  workflowId: int("workflow_id").notNull().references(() => signatureWorkflows.id),
  signerId: int("signer_id").notNull().references(() => users.id),
  signerEmail: varchar("signer_email", { length: 255 }).notNull(),
  signerName: varchar("signer_name", { length: 255 }).notNull(),
  order: int("order").notNull().default(1), // Ordem de assinatura
  status: mysqlEnum("status", ["pending", "signed", "rejected", "expired"]).notNull().default("pending"),
  signedAt: datetime("signed_at"),
  ipAddress: varchar("ip_address", { length: 45 }),
  signatureHash: varchar("signature_hash", { length: 255 }),
  rejectionReason: text("rejection_reason"),
});

export const signatureAuditLog = mysqlTable("signature_audit_log", {
  id: int("id").primaryKey().autoincrement(),
  workflowId: int("workflow_id").notNull().references(() => signatureWorkflows.id),
  userId: int("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(), // created/signed/rejected/cancelled/reminded
  details: json("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Clause Library (Sugestão 3)
 */
export const clauseCategories = mysqlTable("clause_categories", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  parentId: int("parent_id").references((): any => clauseCategories.id),
});

export const clauseTags = mysqlTable("clause_tags", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

export const clauseLibrary = mysqlTable("clause_library", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  categoryId: int("category_id").references(() => clauseCategories.id),
  content: text("content").notNull(),
  description: text("description"),
  tags: json("tags"), // Array of tag IDs
  variables: json("variables"), // [{name, description, defaultValue}]
  usageCount: int("usage_count").notNull().default(0),
  createdBy: int("created_by").notNull().references(() => users.id),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  published: boolean("published").notNull().default(false),
});
