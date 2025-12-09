import { eq, desc, and, or, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  processes, 
  documents, 
  activities, 
  notifications, 
  conversations,
  chatMessages, 
  automationTemplates,
  InsertProcess,
  InsertDocument,
  InsertActivity,
  InsertNotification,
  InsertConversation,
  InsertChatMessage,
  InsertAutomationTemplate
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ============ PROCESS OPERATIONS ============
export async function createProcess(process: InsertProcess) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(processes).values(process);
  return result;
}

export async function getProcessById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(processes).where(eq(processes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllProcesses(filters?: {
  status?: string;
  processType?: string;
  responsibleUserId?: number;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(processes);
  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(processes.status, filters.status as any));
  }
  if (filters?.processType) {
    conditions.push(eq(processes.processType, filters.processType));
  }
  if (filters?.responsibleUserId) {
    conditions.push(eq(processes.responsibleUserId, filters.responsibleUserId));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(processes.title, `%${filters.search}%`),
        like(processes.processNumber, `%${filters.search}%`),
        like(processes.plaintiff, `%${filters.search}%`),
        like(processes.defendant, `%${filters.search}%`)
      )!
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)!) as any;
  }

  return await query.orderBy(desc(processes.createdAt));
}

export async function updateProcess(id: number, data: Partial<InsertProcess>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(processes).set(data).where(eq(processes.id, id));
}

export async function deleteProcess(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(processes).where(eq(processes.id, id));
}

// ============ DOCUMENT OPERATIONS ============
export async function createDocument(document: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documents).values(document);
  return result;
}

export async function getDocumentsByProcessId(processId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(documents).where(eq(documents.processId, processId)).orderBy(desc(documents.createdAt));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documents).where(eq(documents.id, id));
}

// ============ ACTIVITY OPERATIONS ============
export async function createActivity(activity: InsertActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(activities).values(activity);
  return result;
}

export async function getActivitiesByProcessId(processId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(activities).where(eq(activities.processId, processId)).orderBy(desc(activities.createdAt));
}

export async function updateActivity(id: number, data: Partial<InsertActivity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(activities).set(data).where(eq(activities.id, id));
}

// ============ NOTIFICATION OPERATIONS ============
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(notification);
  return result;
}

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ readAt: new Date() }).where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ readAt: new Date() }).where(eq(notifications.userId, userId));
}

// ============ CONVERSATION OPERATIONS ============
export async function createConversation(conversation: InsertConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(conversations).values(conversation);
  return Number(result[0]?.insertId) || 0;
}

export async function getConversationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.lastMessageAt));
}

export async function getConversationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateConversation(id: number, data: Partial<InsertConversation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(conversations).set(data).where(eq(conversations.id, id));
}

export async function deleteConversation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete all messages first
  await db.delete(chatMessages).where(eq(chatMessages.conversationId, id));
  // Then delete conversation
  await db.delete(conversations).where(eq(conversations.id, id));
}

// ============ CHAT OPERATIONS ============
export async function createChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chatMessages).values(message);
  return result;
}

export async function getChatMessagesByConversationId(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.createdAt);
}

export async function getChatMessagesByUserId(userId: number, processId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (processId) {
    return await db.select().from(chatMessages)
      .where(and(eq(chatMessages.userId, userId), eq(chatMessages.processId, processId))!)
      .orderBy(chatMessages.createdAt);
  }
  
  return await db.select().from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(chatMessages.createdAt);
}

// ============ AUTOMATION TEMPLATE OPERATIONS ============
export async function createAutomationTemplate(template: InsertAutomationTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(automationTemplates).values(template);
  return result;
}

export async function getAllAutomationTemplates() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(automationTemplates).where(eq(automationTemplates.isActive, true)).orderBy(desc(automationTemplates.createdAt));
}

export async function getAutomationTemplateById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(automationTemplates).where(eq(automationTemplates.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============ DASHBOARD ANALYTICS ============
export async function getDashboardStats(userId?: number) {
  const db = await getDb();
  if (!db) return null;

  const totalProcesses = await db.select({ count: sql<number>`count(*)` }).from(processes);
  const activeProcesses = await db.select({ count: sql<number>`count(*)` }).from(processes).where(eq(processes.status, "active"));
  const totalDocuments = await db.select({ count: sql<number>`count(*)` }).from(documents);
  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);

  return {
    totalProcesses: Number(totalProcesses[0]?.count || 0),
    activeProcesses: Number(activeProcesses[0]?.count || 0),
    totalDocuments: Number(totalDocuments[0]?.count || 0),
    totalUsers: Number(totalUsers[0]?.count || 0),
  };
}


export async function getMonthlyStats(month: number, year: number) {
  const db = await getDb();
  if (!db) return {
    totalProcesses: 0,
    activeProcesses: 0,
    closedProcesses: 0,
    totalDocuments: 0,
    processesByType: {},
    processesByStatus: {},
  };

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const allProcesses = await db.select().from(processes);
  const monthProcesses = allProcesses.filter(p => {
    const createdAt = new Date(p.createdAt);
    return createdAt >= startDate && createdAt <= endDate;
  });

  const processesByType: Record<string, number> = {};
  const processesByStatus: Record<string, number> = {};

  monthProcesses.forEach(p => {
    processesByType[p.processType] = (processesByType[p.processType] || 0) + 1;
    processesByStatus[p.status] = (processesByStatus[p.status] || 0) + 1;
  });

  const allDocuments = await db.select().from(documents);
  const monthDocuments = allDocuments.filter(d => {
    const createdAt = new Date(d.createdAt);
    return createdAt >= startDate && createdAt <= endDate;
  });

  return {
    totalProcesses: monthProcesses.length,
    activeProcesses: monthProcesses.filter(p => p.status === "active").length,
    closedProcesses: monthProcesses.filter(p => p.status === "closed").length,
    totalDocuments: monthDocuments.length,
    processesByType,
    processesByStatus,
  };
}
