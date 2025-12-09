/**
 * Automação Documental Avançada (Núcleo 9)
 * 
 * Quando um documento for anexado:
 * 1. Extrair prazos
 * 2. Gerar pontos-chave
 * 3. Identificar riscos
 * 4. Classificar caso
 * 5. Registrar no histórico
 * 6. Sugerir ação no pipeline
 */

import { invokeLLM } from "./_core/llm";
import { analyzeAndSave } from "./AutoInsight";
import { onDocumentUploaded } from "./SmartPipelineAutomation";

export interface DocumentAnalysis {
  deadlines: string[];
  keyPoints: string[];
  risks: string[];
  caseType: "civel" | "consumidor" | "imobiliario" | "processual" | "empresarial" | "unknown";
  summary: string;
}

/**
 * Analyze document content using LLM
 */
export async function analyzeDocument(documentText: string): Promise<DocumentAnalysis> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente jurídico especializado em análise documental. Analise o documento fornecido e extraia:

1. **Prazos**: Todas as datas, prazos e deadlines mencionados
2. **Pontos-chave**: Principais informações, fatos relevantes e argumentos
3. **Riscos**: Problemas potenciais, cláusulas desfavoráveis ou ameaças
4. **Tipo de caso**: Classifique como cível, consumidor, imobiliário, processual, empresarial ou unknown
5. **Resumo**: Breve resumo do documento (máximo 200 caracteres)

Responda APENAS com um JSON no formato:
{
  "deadlines": ["prazo 1", "prazo 2"],
  "keyPoints": ["ponto 1", "ponto 2"],
  "risks": ["risco 1", "risco 2"],
  "caseType": "civel" | "consumidor" | "imobiliario" | "processual" | "empresarial" | "unknown",
  "summary": "Resumo breve"
}`,
        },
        {
          role: "user",
          content: documentText,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "document_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              deadlines: {
                type: "array",
                items: { type: "string" },
              },
              keyPoints: {
                type: "array",
                items: { type: "string" },
              },
              risks: {
                type: "array",
                items: { type: "string" },
              },
              caseType: {
                type: "string",
                enum: ["civel", "consumidor", "imobiliario", "processual", "empresarial", "unknown"],
              },
              summary: { type: "string" },
            },
            required: ["deadlines", "keyPoints", "risks", "caseType", "summary"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      return {
        deadlines: [],
        keyPoints: [],
        risks: [],
        caseType: "unknown",
        summary: "Análise não disponível",
      };
    }

    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error("[DocumentAutomation] analyzeDocument error:", error);
    return {
      deadlines: [],
      keyPoints: [],
      risks: [],
      caseType: "unknown",
      summary: "Erro na análise",
    };
  }
}

/**
 * Process document upload with full automation
 */
export async function onDocumentUploadedWithAutomation(input: {
  documentText: string;
  userId: number;
  clientId?: number;
  processId?: number;
  pipelineItemId?: number;
}): Promise<{
  success: boolean;
  analysis: DocumentAnalysis;
  insightsCount: number;
  pipelineUpdated: boolean;
}> {
  try {
    // 1. Analyze document
    const analysis = await analyzeDocument(input.documentText);

    // 2. Generate insights from analysis
    const insightsText = `
Documento analisado:
${analysis.summary}

Prazos detectados: ${analysis.deadlines.join(", ")}
Pontos-chave: ${analysis.keyPoints.join(", ")}
Riscos identificados: ${analysis.risks.join(", ")}
Tipo de caso: ${analysis.caseType}
    `;

    const insightsResult = await analyzeAndSave({
      text: insightsText,
      userId: input.userId,
      clientId: input.clientId,
      processId: input.processId,
      pipelineItemId: input.pipelineItemId,
    });

    // 3. Trigger SmartPipeline automation (move to "Em Análise")
    let pipelineUpdated = false;
    if (input.clientId || input.processId) {
      const pipelineResult = await onDocumentUploaded(
        input.userId,
        input.clientId || null,
        input.processId || null
      );
      pipelineUpdated = pipelineResult.success;
    }

    return {
      success: true,
      analysis,
      insightsCount: insightsResult.count,
      pipelineUpdated,
    };
  } catch (error) {
    console.error("[DocumentAutomation] onDocumentUploadedWithAutomation error:", error);
    return {
      success: false,
      analysis: {
        deadlines: [],
        keyPoints: [],
        risks: [],
        caseType: "unknown",
        summary: "Erro na automação",
      },
      insightsCount: 0,
      pipelineUpdated: false,
    };
  }
}
