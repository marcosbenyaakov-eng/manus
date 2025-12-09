import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, templateCategories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Document Repository & Templates (Núcleo 18)", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let userId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create template category first
    const existingCategory = await db.select().from(templateCategories).limit(1);
    if (existingCategory.length === 0) {
      await db.insert(templateCategories).values({
        name: "Test Category",
        slug: "test-category",
      });
    }

    // Create or get test user
    const existingUser = await db.select().from(users).where(eq(users.openId, "test-openid-docs")).limit(1);
    
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
    } else {
      const [userResult] = await db.insert(users).values({
        openId: "test-openid-docs",
        name: "Test User Docs",
        email: "test-docs@example.com",
        role: "admin",
      });
      userId = Number(userResult.insertId);
    }

    // Create caller with test user context
    caller = appRouter.createCaller({
      user: { id: userId, openId: "test-openid-docs", name: "Test User Docs", email: "test-docs@example.com", role: "admin" },
      req: {} as any,
      res: {} as any,
    });
  });

  describe("Document Repository", () => {
    it("should upload a document", async () => {
      const timestamp = Date.now();
      const result = await caller.docs.uploadDocument({
        title: `Test Document ${timestamp}`,
        description: "Test description",
        fileName: "test.pdf",
        fileData: Buffer.from("fake pdf content").toString("base64"),
        mimeType: "application/pdf",
        fileSize: 1024,
        visibility: "internal",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("slug");
      expect(result).toHaveProperty("fileUrl");
    });

    it("should list documents", async () => {
      const result = await caller.docs.listDocuments({
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should get document by ID", async () => {
      // Upload first
      const timestamp = Date.now();
      const uploaded = await caller.docs.uploadDocument({
        title: `Test Document for Get ${timestamp}`,
        fileName: "test2.pdf",
        fileData: Buffer.from("fake pdf content").toString("base64"),
        mimeType: "application/pdf",
        fileSize: 1024,
        visibility: "internal",
      });

      const result = await caller.docs.getDocumentById({ id: uploaded.id });

      expect(result).toHaveProperty("id", uploaded.id);
      expect(result.title).toContain("Test Document for Get");
    });

    it("should create a new version", async () => {
      // Upload first
      const timestamp = Date.now();
      const uploaded = await caller.docs.uploadDocument({
        title: `Test Document for Versioning ${timestamp}`,
        fileName: "test3.pdf",
        fileData: Buffer.from("fake pdf content").toString("base64"),
        mimeType: "application/pdf",
        fileSize: 1024,
        visibility: "internal",
      });

      const result = await caller.docs.createVersion({
        documentId: uploaded.id,
        fileName: "test3-v2.pdf",
        fileData: Buffer.from("fake pdf content v2").toString("base64"),
        mimeType: "application/pdf",
        fileSize: 2048,
        changelog: "Updated content",
      });

      expect(result).toHaveProperty("versionId");
      expect(result).toHaveProperty("versionNumber", 2);
    });

    it("should list versions", async () => {
      // Upload first
      const timestamp = Date.now();
      const uploaded = await caller.docs.uploadDocument({
        title: `Test Document for Version List ${timestamp}`,
        fileName: "test4.pdf",
        fileData: Buffer.from("fake pdf content").toString("base64"),
        mimeType: "application/pdf",
        fileSize: 1024,
        visibility: "internal",
      });

      const result = await caller.docs.listVersions({ documentId: uploaded.id });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty("versionNumber", 1);
    });
  });

  describe("Templates System", () => {
    it("should list template categories", async () => {
      const result = await caller.templates.listCategories();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should create a template", async () => {
      const timestamp = Date.now();
      const result = await caller.templates.create({
        name: `Test Template ${timestamp}`,
        slug: `test-template-${timestamp}`,
        categoryId: 1,
        content: "This is a test template with {{variable}}",
        published: false,
      });

      expect(result).toHaveProperty("id");
    });

    it("should list templates", async () => {
      const result = await caller.templates.list({
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should get template by ID", async () => {
      // Create first
      const timestamp = Date.now();
      const created = await caller.templates.create({
        name: `Test Template for Get ${timestamp}`,
        slug: `test-template-get-${timestamp}`,
        categoryId: 1,
        content: "Test content",
        published: false,
      });

      const result = await caller.templates.getById({ id: created.id });

      expect(result).toHaveProperty("id", created.id);
      expect(result.name).toContain("Test Template for Get");
    });

    it("should update a template", async () => {
      // Create first
      const timestamp = Date.now();
      const created = await caller.templates.create({
        name: `Test Template for Update ${timestamp}`,
        slug: `test-template-update-${timestamp}`,
        categoryId: 1,
        content: "Original content",
        published: false,
      });

      const result = await caller.templates.update({
        id: created.id,
        content: "Updated content",
      });

      expect(result).toHaveProperty("success", true);

      const updated = await caller.templates.getById({ id: created.id });
      expect(updated.content).toBe("Updated content");
    });

    it("should apply template to case", async () => {
      // Create first
      const timestamp = Date.now();
      const created = await caller.templates.create({
        name: `Test Template for Apply ${timestamp}`,
        slug: `test-template-apply-${timestamp}`,
        categoryId: 1,
        content: "Client: {{clientName}}, Case: {{caseNumber}}",
        published: false,
      });

      const result = await caller.templates.applyToCase({
        templateId: created.id,
        variables: {
          clientName: "John Doe",
          caseNumber: "12345",
        },
      });

      expect(result.name).toContain("Test Template for Apply");
      expect(result).toHaveProperty("content");
      expect(result.content).toContain("Client: John Doe");
      expect(result.content).toContain("Case: 12345");
    });
  });

  describe("Cross-Module Integrations", () => {
    it("should link document to process", async () => {
      // Upload document first
      const timestamp = Date.now();
      const uploaded = await caller.docs.uploadDocument({
        title: `Test Document for Process Link ${timestamp}`,
        fileName: "test-process.pdf",
        fileData: Buffer.from("fake pdf content").toString("base64"),
        mimeType: "application/pdf",
        fileSize: 1024,
        visibility: "internal",
      });

      const result = await caller.docs.linkToProcess({
        documentId: uploaded.id,
        processId: 1,
      });

      expect(result).toHaveProperty("success", true);
    });

    it("should extract deadlines and create agenda events", async () => {
      // Upload document first
      const timestamp = Date.now();
      const uploaded = await caller.docs.uploadDocument({
        title: `Test Document for Deadline Extraction ${timestamp}`,
        fileName: "test-deadline.pdf",
        fileData: Buffer.from("fake pdf content").toString("base64"),
        mimeType: "application/pdf",
        fileSize: 1024,
        visibility: "internal",
      });

      const result = await caller.docs.extractAndCreateDeadlines({
        documentId: uploaded.id,
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("message");
    });

    it("should link document to pipeline", async () => {
      // Upload document first
      const timestamp = Date.now();
      const uploaded = await caller.docs.uploadDocument({
        title: `Test Document for Pipeline Link ${timestamp}`,
        fileName: "test-pipeline.pdf",
        fileData: Buffer.from("fake pdf content").toString("base64"),
        mimeType: "application/pdf",
        fileSize: 1024,
        visibility: "internal",
      });

      const result = await caller.docs.linkToPipeline({
        documentId: uploaded.id,
        pipelineItemId: 1,
      });

      expect(result).toHaveProperty("success", true);
    });
  });
});
