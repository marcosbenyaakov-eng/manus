import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, clauseCategories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Advanced Features (Sugestões 1-3)", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let userId: number;
  let documentId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create or get test user
    const existingUser = await db.select().from(users).where(eq(users.openId, "test-openid-advanced")).limit(1);
    
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
    } else {
      const [userResult] = await db.insert(users).values({
        openId: "test-openid-advanced",
        name: "Test User Advanced",
        email: "test-advanced@example.com",
        role: "admin",
      });
      userId = Number(userResult.insertId);
    }

    // Create caller with test user context
    caller = appRouter.createCaller({
      user: { id: userId, openId: "test-openid-advanced", name: "Test User Advanced", email: "test-advanced@example.com", role: "admin" },
      req: {} as any,
      res: {} as any,
    });

    // Upload a test document for metadata extraction
    const uploaded = await caller.docs.uploadDocument({
      title: `Test Document for Advanced Features ${Date.now()}`,
      fileName: "test-advanced.pdf",
      fileData: Buffer.from("fake pdf content").toString("base64"),
      mimeType: "application/pdf",
      fileSize: 1024,
      visibility: "internal",
    });
    documentId = uploaded.id;
  });

  describe("Sugestão 1 - Metadata Extraction", () => {
    it("should extract metadata from document", async () => {
      const result = await caller.metadata.extractMetadata({
        documentId,
        method: "llm",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("extractionMethod", "llm");
      expect(result).toHaveProperty("confidence");
    });

    it("should get metadata for document", async () => {
      const result = await caller.metadata.getMetadata({ documentId });

      expect(result).toBeTruthy();
      if (result) {
        expect(result).toHaveProperty("documentId", documentId);
        expect(result).toHaveProperty("extractionMethod");
      }
    });

    it("should update metadata manually", async () => {
      // Get existing metadata first
      const existing = await caller.metadata.getMetadata({ documentId });
      
      if (existing) {
        const result = await caller.metadata.updateMetadata({
          id: existing.id,
          processNumber: "1234567-89.2024.8.01.0001",
          caseValue: "50000.00",
        });

        expect(result).toHaveProperty("success", true);
      }
    });
  });

  describe("Sugestão 2 - Signature Workflows", () => {
    let workflowId: number;
    let signatureId: number;

    it("should create signature workflow", async () => {
      const result = await caller.signatures.requestSignature({
        documentId,
        signers: [
          {
            signerId: userId,
            signerEmail: "test-advanced@example.com",
            signerName: "Test User Advanced",
            order: 1,
          },
        ],
      });

      expect(result).toHaveProperty("workflowId");
      expect(result).toHaveProperty("signersCount", 1);
      workflowId = result.workflowId;
    });

    it("should get workflow status", async () => {
      const result = await caller.signatures.getStatus({ workflowId });

      expect(result).toHaveProperty("workflow");
      expect(result).toHaveProperty("signatures");
      expect(result.workflow.id).toBe(workflowId);
      expect(result.signatures.length).toBe(1);
      
      signatureId = result.signatures[0].id;
    });

    it("should list pending signatures", async () => {
      const result = await caller.signatures.listPending();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should sign document", async () => {
      const result = await caller.signatures.sign({
        signatureId,
        ipAddress: "127.0.0.1",
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("allSigned", true);
    });

    it("should get audit log", async () => {
      const result = await caller.signatures.getAuditLog({ workflowId });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Sugestão 3 - Clause Library", () => {
    let categoryId: number;
    let clauseId: number;

    it("should create clause category", async () => {
      const timestamp = Date.now();
      const result = await caller.clauses.createCategory({
        name: `Test Category ${timestamp}`,
        slug: `test-category-${timestamp}`,
        description: "Test category description",
      });

      expect(result).toHaveProperty("id");
      categoryId = result.id;
    });

    it("should list categories", async () => {
      const result = await caller.clauses.listCategories();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should create a clause", async () => {
      const timestamp = Date.now();
      const result = await caller.clauses.create({
        title: `Test Clause ${timestamp}`,
        slug: `test-clause-${timestamp}`,
        categoryId,
        content: "Esta cláusula estabelece que {{party1}} concorda com {{party2}} em {{subject}}.",
        description: "Test clause for contract",
        published: false,
      });

      expect(result).toHaveProperty("id");
      clauseId = result.id;
    });

    it("should list clauses", async () => {
      const result = await caller.clauses.list({
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should get clause by ID", async () => {
      const result = await caller.clauses.getById({ id: clauseId });

      expect(result).toHaveProperty("id", clauseId);
      expect(result).toHaveProperty("content");
    });

    it("should search clauses", async () => {
      const result = await caller.clauses.search({
        query: "Test",
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should apply clause with variables", async () => {
      const result = await caller.clauses.applyClause({
        clauseId,
        variables: {
          party1: "João Silva",
          party2: "Maria Santos",
          subject: "prestação de serviços jurídicos",
        },
      });

      expect(result).toHaveProperty("content");
      expect(result.content).toContain("João Silva");
      expect(result.content).toContain("Maria Santos");
      expect(result.content).toContain("prestação de serviços jurídicos");
    });

    it("should update a clause", async () => {
      const result = await caller.clauses.update({
        id: clauseId,
        published: true,
      });

      expect(result).toHaveProperty("success", true);

      const updated = await caller.clauses.getById({ id: clauseId });
      expect(updated.published).toBe(true);
    });

    it("should delete a clause", async () => {
      const result = await caller.clauses.delete({ id: clauseId });

      expect(result).toHaveProperty("success", true);
    });
  });
});
