/**
 * LegalToolsEngine - Núcleo 5
 * Conjunto de ferramentas internas jurídicas para o Assistente Benyaakov
 * 
 * RESTRIÇÕES ÉTICAS:
 * - Não produzir ato privativo da advocacia
 * - Não inventar jurisprudência ou artigos
 * - Não emitir parecer definitivo
 * - Atuar apenas como assistente de apoio
 */

import { invokeLLM } from "./_core/llm";

/**
 * 1. generateDraft - Gera minuta jurídica simples
 * Tipos suportados: notificação, requerimento, email jurídico, solicitação
 */
export async function generateDraft(params: {
  type: "notificacao" | "requerimento" | "email" | "solicitacao";
  context: string;
  recipient?: string;
}): Promise<string> {
  const systemPrompt = `Você é um assistente jurídico que gera minutas simples e profissionais.

**RESTRIÇÕES:**
- Não criar peças processuais completas (petições iniciais, contestações, recursos)
- Não assinar como advogado
- Não incluir artigos de lei inventados
- Gerar apenas textos curtos e objetivos
- Linguagem profissional mas acessível

**TIPO DE MINUTA:** ${params.type}
${params.recipient ? `**DESTINATÁRIO:** ${params.recipient}` : ""}

Gere uma minuta simples, direta e profissional baseada no contexto fornecido.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: params.context },
    ],
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === 'string' ? content : "Erro ao gerar minuta.";
}

/**
 * 2. summarizeDocument - Resumo técnico claro
 */
export async function summarizeDocument(params: {
  document: string;
}): Promise<{
  summary: string;
  keyFacts: string[];
  requests: string[];
  values: string[];
  nextSteps: string[];
}> {
  const systemPrompt = `Você é um assistente jurídico que faz resumos técnicos objetivos.

**TAREFA:**
1. Identificar fatos centrais
2. Identificar pedidos principais
3. Pontuar contradições (se houver)
4. Extrair valores mencionados
5. Sugerir próximos passos de forma neutra

**FORMATO DE RESPOSTA:**
Retorne um JSON com:
{
  "summary": "Resumo geral em 2-3 parágrafos",
  "keyFacts": ["fato 1", "fato 2", ...],
  "requests": ["pedido 1", "pedido 2", ...],
  "values": ["R$ 10.000,00", ...],
  "nextSteps": ["sugestão 1", "sugestão 2", ...]
}

**RESTRIÇÕES:**
- Não emitir parecer jurídico
- Não inventar informações
- Ser objetivo e neutro`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: params.document },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "document_summary",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            keyFacts: { type: "array", items: { type: "string" } },
            requests: { type: "array", items: { type: "string" } },
            values: { type: "array", items: { type: "string" } },
            nextSteps: { type: "array", items: { type: "string" } },
          },
          required: ["summary", "keyFacts", "requests", "values", "nextSteps"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : '{}';
  return JSON.parse(content);
}

/**
 * 3. extractDeadlines - Detecta prazos citados no texto
 * NÃO calcula prazo processual real, apenas identifica menções
 */
export async function extractDeadlines(params: {
  text: string;
}): Promise<{
  deadlines: Array<{
    description: string;
    period: string;
    type: "corridos" | "uteis" | "indefinido";
  }>;
  chronology: string;
}> {
  const systemPrompt = `Você é um assistente que identifica prazos mencionados em textos jurídicos.

**TAREFA:**
- Reconhecer números + palavras-chave ("dias", "úteis", "corridos", "contados de")
- Padronizar a resposta
- Exibir cronologia

**IMPORTANTE:**
- NÃO calcular prazo processual real
- Apenas indicar o prazo citado no texto
- Exemplo: "Prazo identificado: 15 dias corridos a partir da ciência"

**FORMATO DE RESPOSTA:**
Retorne um JSON com:
{
  "deadlines": [
    {
      "description": "Prazo para resposta",
      "period": "15 dias",
      "type": "corridos"
    }
  ],
  "chronology": "Descrição da ordem temporal dos prazos"
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: params.text },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "deadline_extraction",
        strict: true,
        schema: {
          type: "object",
          properties: {
            deadlines: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  period: { type: "string" },
                  type: { type: "string", enum: ["corridos", "uteis", "indefinido"] },
                },
                required: ["description", "period", "type"],
                additionalProperties: false,
              },
            },
            chronology: { type: "string" },
          },
          required: ["deadlines", "chronology"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : '{"deadlines":[],"chronology":""}';
  return JSON.parse(content);
}

/**
 * 4. identifyRisks - Pontos frágeis, riscos e inconsistências
 */
export async function identifyRisks(params: {
  caseDescription: string;
}): Promise<{
  risks: Array<{
    category: string;
    description: string;
    severity: "alta" | "media" | "baixa";
  }>;
  weakPoints: string[];
  inconsistencies: string[];
  recommendations: string[];
}> {
  const systemPrompt = `Você é um assistente jurídico que identifica riscos e pontos frágeis em casos.

**TAREFA:**
1. Destacar o que enfraquece o caso
2. Indicar pontos frágeis do documento
3. Mostrar inconsistências
4. Detectar omissões
5. Sugerir cautelas

**RESTRIÇÕES:**
- Atuar como assistente, nunca como advogado
- Não emitir parecer definitivo
- Ser objetivo e construtivo

**FORMATO DE RESPOSTA:**
Retorne um JSON estruturado.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: params.caseDescription },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "risk_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string", enum: ["alta", "media", "baixa"] },
                },
                required: ["category", "description", "severity"],
                additionalProperties: false,
              },
            },
            weakPoints: { type: "array", items: { type: "string" } },
            inconsistencies: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
          },
          required: ["risks", "weakPoints", "inconsistencies", "recommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : '{"risks":[],"weakPoints":[],"inconsistencies":[],"recommendations":[]}';
  return JSON.parse(content);
}

/**
 * 5. classifyCase - Classificação automática do tipo de caso
 */
export async function classifyCase(params: {
  caseDescription: string;
}): Promise<{
  primaryCategory: "civel" | "consumidor" | "imobiliario" | "processual" | "empresarial" | "tributario";
  secondaryCategories: string[];
  confidence: number;
  reasoning: string;
}> {
  const systemPrompt = `Você é um assistente jurídico que classifica casos automaticamente.

**CATEGORIAS PRINCIPAIS:**
- civel: contratos, danos materiais, responsabilidade civil, cobranças
- consumidor: bancos, financiamentos, vícios, CDC, cláusulas abusivas
- imobiliario: vícios construtivos, contratos imobiliários, financiamento, usucapião, locação
- processual: CPC, prazos, recursos, análise de decisões
- empresarial: contratos empresariais, MEI, fluxo contratual
- tributario: questões tributárias básicas

**FORMATO DE RESPOSTA:**
Retorne um JSON com classificação e confiança (0-100).`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: params.caseDescription },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "case_classification",
        strict: true,
        schema: {
          type: "object",
          properties: {
            primaryCategory: { 
              type: "string", 
              enum: ["civel", "consumidor", "imobiliario", "processual", "empresarial", "tributario"] 
            },
            secondaryCategories: { type: "array", items: { type: "string" } },
            confidence: { type: "number" },
            reasoning: { type: "string" },
          },
          required: ["primaryCategory", "secondaryCategories", "confidence", "reasoning"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : '{"primaryCategory":"civel","secondaryCategories":[],"confidence":0,"reasoning":""}';
  return JSON.parse(content);
}

/**
 * 6. extractKeyPoints - Extrai tópicos centrais de texto jurídico
 */
export async function extractKeyPoints(params: {
  text: string;
}): Promise<{
  mainPoints: string[];
  parties: string[];
  dates: string[];
  amounts: string[];
  legalBasis: string[];
}> {
  const systemPrompt = `Você é um assistente jurídico que extrai pontos-chave de textos.

**TAREFA:**
- Identificar tópicos centrais
- Extrair partes envolvidas
- Identificar datas relevantes
- Extrair valores monetários
- Identificar base legal mencionada (sem inventar)

**FORMATO DE RESPOSTA:**
Retorne um JSON estruturado.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: params.text },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "key_points_extraction",
        strict: true,
        schema: {
          type: "object",
          properties: {
            mainPoints: { type: "array", items: { type: "string" } },
            parties: { type: "array", items: { type: "string" } },
            dates: { type: "array", items: { type: "string" } },
            amounts: { type: "array", items: { type: "string" } },
            legalBasis: { type: "array", items: { type: "string" } },
          },
          required: ["mainPoints", "parties", "dates", "amounts", "legalBasis"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : '{"mainPoints":[],"parties":[],"dates":[],"amounts":[],"legalBasis":[]}';
  return JSON.parse(content);
}

/**
 * 7. roleplayLegal - Simula visão contrária para previsão de argumento adverso
 */
export async function roleplayLegal(params: {
  caseDescription: string;
  yourPosition: string;
}): Promise<{
  adverseArguments: string[];
  counterStrategies: string[];
  anticipatedObjections: string[];
  strengthAssessment: string;
}> {
  const systemPrompt = `Você é um assistente jurídico que simula a visão da parte contrária.

**TAREFA:**
- Analisar o caso da perspectiva adversa
- Identificar argumentos que a outra parte pode usar
- Sugerir contra-estratégias
- Antecipar objeções

**RESTRIÇÕES:**
- Não emitir parecer definitivo
- Ser objetivo e construtivo
- Atuar como assistente de apoio

**FORMATO DE RESPOSTA:**
Retorne um JSON estruturado.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Caso: ${params.caseDescription}\n\nNossa posição: ${params.yourPosition}` },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "roleplay_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            adverseArguments: { type: "array", items: { type: "string" } },
            counterStrategies: { type: "array", items: { type: "string" } },
            anticipatedObjections: { type: "array", items: { type: "string" } },
            strengthAssessment: { type: "string" },
          },
          required: ["adverseArguments", "counterStrategies", "anticipatedObjections", "strengthAssessment"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : '{"adverseArguments":[],"counterStrategies":[],"anticipatedObjections":[],"strengthAssessment":""}';
  return JSON.parse(content);
}
