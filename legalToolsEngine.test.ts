import { describe, it, expect, vi, beforeEach } from "vitest";
import { invokeLLM } from "./_core/llm";

// Mock invokeLLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

describe("LegalToolsEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateDraft", () => {
    it("deve gerar minuta de notificação com sucesso", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "NOTIFICAÇÃO EXTRAJUDICIAL\n\nAo Senhor João Silva...",
            },
          },
        ],
      };
      vi.mocked(invokeLLM).mockResolvedValue(mockResponse as any);

      const { generateDraft } = await import("./legalToolsEngine");
      const result = await generateDraft({
        type: "notificacao",
        context: "Cobrança de dívida de R$ 5.000,00",
        recipient: "João Silva",
      });

      expect(result).toContain("NOTIFICAÇÃO");
      expect(invokeLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: "system" }),
            expect.objectContaining({ role: "user" }),
          ]),
        })
      );
    });

    it("deve retornar mensagem de erro quando LLM falhar", async () => {
      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [{ message: { content: null } }],
      } as any);

      const { generateDraft } = await import("./legalToolsEngine");
      const result = await generateDraft({
        type: "email",
        context: "Teste",
      });

      expect(result).toBe("Erro ao gerar minuta.");
    });
  });

  describe("summarizeDocument", () => {
    it("deve resumir documento com pontos-chave", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "Resumo do documento",
                keyFacts: ["Fato 1", "Fato 2"],
                requests: ["Pedido 1"],
                values: ["R$ 10.000,00"],
                nextSteps: ["Próximo passo 1"],
              }),
            },
          },
        ],
      };
      vi.mocked(invokeLLM).mockResolvedValue(mockResponse as any);

      const { summarizeDocument } = await import("./legalToolsEngine");
      const result = await summarizeDocument({
        document: "Contrato de prestação de serviços...",
      });

      expect(result.summary).toBe("Resumo do documento");
      expect(result.keyFacts).toHaveLength(2);
      expect(result.requests).toHaveLength(1);
    });
  });

  describe("extractDeadlines", () => {
    it("deve extrair prazos do texto", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                deadlines: [
                  {
                    description: "Prazo para contestação",
                    period: "15 dias",
                    type: "corridos",
                  },
                ],
                chronology: "Prazo inicia após citação",
              }),
            },
          },
        ],
      };
      vi.mocked(invokeLLM).mockResolvedValue(mockResponse as any);

      const { extractDeadlines } = await import("./legalToolsEngine");
      const result = await extractDeadlines({
        text: "O réu terá 15 dias corridos para contestar após a citação.",
      });

      expect(result.deadlines).toHaveLength(1);
      expect(result.deadlines[0].period).toBe("15 dias");
    });
  });

  describe("identifyRisks", () => {
    it("deve identificar riscos e pontos frágeis", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                risks: [
                  {
                    category: "Probatório",
                    severity: "alta",
                    description: "Falta de documentação",
                  },
                ],
                weakPoints: ["Ausência de testemunhas"],
                inconsistencies: ["Datas conflitantes"],
                recommendations: ["Buscar documentos adicionais"],
              }),
            },
          },
        ],
      };
      vi.mocked(invokeLLM).mockResolvedValue(mockResponse as any);

      const { identifyRisks } = await import("./legalToolsEngine");
      const result = await identifyRisks({
        caseDescription: "Caso de cobrança sem documentos",
      });

      expect(result.risks).toHaveLength(1);
      expect(result.risks[0].severity).toBe("alta");
    });
  });

  describe("classifyCase", () => {
    it("deve classificar caso corretamente", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                primaryCategory: "consumidor",
                secondaryCategories: ["contratual"],
                confidence: 85,
                reasoning: "Relação de consumo clara",
              }),
            },
          },
        ],
      };
      vi.mocked(invokeLLM).mockResolvedValue(mockResponse as any);

      const { classifyCase } = await import("./legalToolsEngine");
      const result = await classifyCase({
        caseDescription: "Compra de produto com defeito",
      });

      expect(result.primaryCategory).toBe("consumidor");
      expect(result.confidence).toBe(85);
    });
  });

  describe("extractKeyPoints", () => {
    it("deve extrair pontos-chave do texto", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                mainPoints: ["Ponto principal 1", "Ponto principal 2"],
                parties: ["Autor: João", "Réu: Maria"],
                dates: ["01/01/2024"],
                amounts: ["R$ 5.000,00"],
                legalBasis: ["CDC Art. 18"],
              }),
            },
          },
        ],
      };
      vi.mocked(invokeLLM).mockResolvedValue(mockResponse as any);

      const { extractKeyPoints } = await import("./legalToolsEngine");
      const result = await extractKeyPoints({
        text: "Ação de cobrança movida por João contra Maria...",
      });

      expect(result.mainPoints).toHaveLength(2);
      expect(result.parties).toHaveLength(2);
    });
  });

  describe("roleplayLegal", () => {
    it("deve simular visão adversa", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                adverseArguments: ["Argumento contrário 1"],
                counterStrategies: ["Contra-estratégia 1"],
                anticipatedObjections: ["Objeção 1"],
                strengthAssessment: "Posição moderadamente forte",
              }),
            },
          },
        ],
      };
      vi.mocked(invokeLLM).mockResolvedValue(mockResponse as any);

      const { roleplayLegal } = await import("./legalToolsEngine");
      const result = await roleplayLegal({
        caseDescription: "Ação de cobrança",
        yourPosition: "Autor cobrando dívida",
      });

      expect(result.adverseArguments).toHaveLength(1);
      expect(result.strengthAssessment).toContain("forte");
    });
  });
});
