import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { documentMetadata, repositoryDocuments } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

export const metadataRouter = router({
  /**
   * Extract metadata from document using LLM
   */
  extractMetadata: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        method: z.enum(["llm", "ocr", "hybrid"]).default("llm"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get document
      const [doc] = await db
        .select()
        .from(repositoryDocuments)
        .where(eq(repositoryDocuments.id, input.documentId))
        .limit(1);

      if (!doc) {
        throw new Error("Document not found");
      }

      // For PDF documents, use LLM to extract metadata
      let extractedData: any = {
        processNumber: null,
        parties: [],
        deadlines: [],
        courtInfo: {},
        caseValue: null,
        extractedText: "",
        confidence: 0.85,
      };

      if (input.method === "llm" || input.method === "hybrid") {
        // Call LLM to analyze document
        const prompt = `Você é um assistente jurídico especializado em análise de documentos. Analise o documento PDF e extraia as seguintes informações em formato JSON:

1. Número do processo (processNumber)
2. Partes envolvidas (parties) - array de objetos com {name, role (autor/réu/advogado), cpfCnpj}
3. Prazos (deadlines) - array de objetos com {date (ISO), description, type (prazo/audiência/recurso)}
4. Informações do tribunal (courtInfo) - objeto com {court, judge, district}
5. Valor da causa (caseValue) - número decimal

Documento: ${doc.title}
URL: ${doc.fileUrl}

Retorne APENAS o JSON sem texto adicional.`;

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "Você é um assistente jurídico especializado em extração de metadados de documentos legais.",
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: prompt,
                  },
                  {
                    type: "file_url",
                    file_url: {
                      url: doc.fileUrl,
                      mime_type: "application/pdf",
                    },
                  },
                ],
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "document_metadata",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    processNumber: { type: ["string", "null"] },
                    parties: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          role: { type: "string" },
                          cpfCnpj: { type: ["string", "null"] },
                        },
                        required: ["name", "role"],
                        additionalProperties: false,
                      },
                    },
                    deadlines: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          date: { type: "string" },
                          description: { type: "string" },
                          type: { type: "string" },
                        },
                        required: ["date", "description", "type"],
                        additionalProperties: false,
                      },
                    },
                    courtInfo: {
                      type: "object",
                      properties: {
                        court: { type: ["string", "null"] },
                        judge: { type: ["string", "null"] },
                        district: { type: ["string", "null"] },
                      },
                      required: [],
                      additionalProperties: false,
                    },
                    caseValue: { type: ["number", "null"] },
                    extractedText: { type: "string" },
                  },
                  required: ["processNumber", "parties", "deadlines", "courtInfo", "caseValue", "extractedText"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (content && typeof content === "string") {
            extractedData = JSON.parse(content);
            extractedData.confidence = 0.90; // Higher confidence for LLM extraction
          }
        } catch (error) {
          console.error("LLM extraction failed:", error);
          // Fallback to empty data with low confidence
          extractedData.confidence = 0.20;
        }
      }

      // Save extracted metadata
      const [result] = await db.insert(documentMetadata).values({
        documentId: input.documentId,
        processNumber: extractedData.processNumber,
        parties: extractedData.parties,
        deadlines: extractedData.deadlines,
        courtInfo: extractedData.courtInfo,
        caseValue: extractedData.caseValue?.toString(),
        extractedText: extractedData.extractedText,
        confidence: extractedData.confidence?.toString(),
        extractionMethod: input.method,
      });

      return {
        id: Number(result.insertId),
        ...extractedData,
        extractionMethod: input.method,
      };
    }),

  /**
   * Get metadata for a document
   */
  getMetadata: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [metadata] = await db
        .select()
        .from(documentMetadata)
        .where(eq(documentMetadata.documentId, input.documentId))
        .orderBy(documentMetadata.extractedAt)
        .limit(1);

      return metadata || null;
    }),

  /**
   * Update metadata manually
   */
  updateMetadata: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        processNumber: z.string().optional(),
        parties: z.any().optional(),
        deadlines: z.any().optional(),
        courtInfo: z.any().optional(),
        caseValue: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;

      await db
        .update(documentMetadata)
        .set(updates)
        .where(eq(documentMetadata.id, id));

      return { success: true };
    }),
});
