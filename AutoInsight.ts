/**
 * Auto-Insight (Núcleo 9 - IA Interna)
 * 
 * Detectores automáticos usando LLM:
 * 1. Contradições
 * 2. Ausência de documentos
 * 3. Prazo mencionado
 * 4. Risco identificado
 * 5. Pontos fortes do caso
 * 6. Possíveis próximos passos
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { insights } from "../drizzle/schema";

export type InsightType = "contradiction" | "missing_document" | "deadline_mentioned" | "risk" | "strength" | "next_step";
export type InsightSeverity = "low" | "medium" | "high" | "critical";

export interface AnalysisInput {
  text: string;
  clientId?: number;
  processId?: number;
  pipelineItemId?: number;
  userId: number;
}

export interface InsightResult {
  type: InsightType;
  title: string;
  description: string;
  severity: InsightSeverity;
}

/**
 * Analyze text and generate insights using LLM
 */
export async function analyzeText(input: AnalysisInput): Promise<InsightResult[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente jurídico especializado em análise de casos. Analise o texto fornecido e identifique:

1. **Contradições**: Informações conflitantes no texto
2. **Documentos faltantes**: Menções a documentos que deveriam existir mas não foram anexados
3. **Prazos mencionados**: Datas ou prazos importantes citados
4. **Riscos identificados**: Pontos fracos, problemas potenciais ou ameaças ao caso
5. **Pontos fortes**: Argumentos sólidos, provas favoráveis ou vantagens
6. **Próximos passos**: Ações recomendadas baseadas no contexto

Responda APENAS com um JSON array contendo objetos no formato:
{
  "type": "contradiction" | "missing_document" | "deadline_mentioned" | "risk" | "strength" | "next_step",
  "title": "Título curto do insight",
  "description": "Descrição detalhada",
  "severity": "low" | "medium" | "high" | "critical"
}

Se não houver insights, retorne um array vazio [].`,
        },
        {
          role: "user",
          content: input.text,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "insights_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["contradiction", "missing_document", "deadline_mentioned", "risk", "strength", "next_step"],
                    },
                    title: { type: "string" },
                    description: { type: "string" },
                    severity: {
                      type: "string",
                      enum: ["low", "medium", "high", "critical"],
                    },
                  },
                  required: ["type", "title", "description", "severity"],
                  additionalProperties: false,
                },
              },
            },
            required: ["insights"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') return [];

    const parsed = JSON.parse(content);
    return parsed.insights || [];
  } catch (error) {
    console.error("[AutoInsight] analyzeText error:", error);
    return [];
  }
}

/**
 * Analyze and save insights to database
 */
export async function analyzeAndSave(input: AnalysisInput): Promise<{ success: boolean; count: number }> {
  const database = await getDb();
  if (!database) return { success: false, count: 0 };

  try {
    const results = await analyzeText(input);

    for (const insight of results) {
      await database.insert(insights).values({
        type: insight.type,
        title: insight.title,
        description: insight.description,
        severity: insight.severity,
        clientId: input.clientId || undefined,
        processId: input.processId || undefined,
        pipelineItemId: input.pipelineItemId || undefined,
        dismissed: false,
        userId: input.userId,
      });
    }

    return { success: true, count: results.length };
  } catch (error) {
    console.error("[AutoInsight] analyzeAndSave error:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Detector 1: Contradições
 */
export async function detectContradictions(text: string, userId: number): Promise<InsightResult[]> {
  const results = await analyzeText({ text, userId });
  return results.filter((r) => r.type === "contradiction");
}

/**
 * Detector 2: Ausência de documentos
 */
export async function detectMissingDocuments(text: string, userId: number): Promise<InsightResult[]> {
  const results = await analyzeText({ text, userId });
  return results.filter((r) => r.type === "missing_document");
}

/**
 * Detector 3: Prazo mencionado
 */
export async function detectDeadlines(text: string, userId: number): Promise<InsightResult[]> {
  const results = await analyzeText({ text, userId });
  return results.filter((r) => r.type === "deadline_mentioned");
}

/**
 * Detector 4: Risco identificado
 */
export async function detectRisks(text: string, userId: number): Promise<InsightResult[]> {
  const results = await analyzeText({ text, userId });
  return results.filter((r) => r.type === "risk");
}

/**
 * Detector 5: Pontos fortes
 */
export async function detectStrengths(text: string, userId: number): Promise<InsightResult[]> {
  const results = await analyzeText({ text, userId });
  return results.filter((r) => r.type === "strength");
}

/**
 * Detector 6: Próximos passos
 */
export async function detectNextSteps(text: string, userId: number): Promise<InsightResult[]> {
  const results = await analyzeText({ text, userId });
  return results.filter((r) => r.type === "next_step");
}
