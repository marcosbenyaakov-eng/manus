/**
 * Auto-Checklist do Caso (Núcleo 9)
 * 
 * Templates de checklist automáticos baseados no tipo de caso:
 * - Cível: fatos, provas, pedidos, prazos
 * - Consumidor: contrato, pagamento, vício, atendimento
 * - Imobiliário: laudos, perícia, ABNT, cláusulas
 * - Processual: decisão, prazo, recurso
 * - Empresarial: contrato, cláusulas, validade
 */

export type CaseType = "civel" | "consumidor" | "imobiliario" | "processual" | "empresarial";

export interface ChecklistTemplate {
  caseType: CaseType;
  title: string;
  items: string[];
}

/**
 * Template: Cível
 */
export const CHECKLIST_CIVEL: ChecklistTemplate = {
  caseType: "civel",
  title: "Checklist - Caso Cível",
  items: [
    "Identificar os fatos relevantes do caso",
    "Reunir provas documentais (contratos, recibos, e-mails)",
    "Identificar testemunhas potenciais",
    "Definir pedidos principais e subsidiários",
    "Verificar prazos processuais aplicáveis",
    "Analisar jurisprudência relevante",
    "Calcular valores de causa e honorários",
    "Preparar estratégia de defesa ou ataque",
  ],
};

/**
 * Template: Consumidor
 */
export const CHECKLIST_CONSUMIDOR: ChecklistTemplate = {
  caseType: "consumidor",
  title: "Checklist - Direito do Consumidor",
  items: [
    "Obter cópia do contrato ou termo de adesão",
    "Verificar comprovantes de pagamento",
    "Identificar vício do produto ou serviço",
    "Documentar tentativas de atendimento (protocolos, e-mails)",
    "Verificar prazo de garantia legal e contratual",
    "Analisar cláusulas abusivas no contrato",
    "Calcular danos materiais e morais",
    "Preparar notificação extrajudicial (se aplicável)",
  ],
};

/**
 * Template: Imobiliário
 */
export const CHECKLIST_IMOBILIARIO: ChecklistTemplate = {
  caseType: "imobiliario",
  title: "Checklist - Direito Imobiliário",
  items: [
    "Obter matrícula atualizada do imóvel",
    "Verificar laudos técnicos e perícias",
    "Analisar conformidade com normas ABNT",
    "Revisar cláusulas contratuais (compra, locação, financiamento)",
    "Verificar documentação de regularização (habite-se, IPTU)",
    "Identificar vícios ocultos ou aparentes",
    "Calcular valores de indenização ou reparação",
    "Preparar estratégia de negociação ou litígio",
  ],
};

/**
 * Template: Processual
 */
export const CHECKLIST_PROCESSUAL: ChecklistTemplate = {
  caseType: "processual",
  title: "Checklist - Acompanhamento Processual",
  items: [
    "Analisar decisão ou sentença proferida",
    "Verificar prazo para recurso ou manifestação",
    "Identificar fundamentos jurídicos da decisão",
    "Preparar recurso (apelação, agravo, embargos)",
    "Reunir documentos e provas para recurso",
    "Calcular custas processuais e honorários",
    "Verificar possibilidade de acordo ou transação",
    "Acompanhar andamento processual (publicações, intimações)",
  ],
};

/**
 * Template: Empresarial
 */
export const CHECKLIST_EMPRESARIAL: ChecklistTemplate = {
  caseType: "empresarial",
  title: "Checklist - Direito Empresarial",
  items: [
    "Obter cópia do contrato empresarial",
    "Analisar cláusulas de rescisão e multas",
    "Verificar validade e vigência do contrato",
    "Identificar obrigações de cada parte",
    "Analisar cláusulas de confidencialidade e não-concorrência",
    "Verificar garantias contratuais (fiança, penhor, hipoteca)",
    "Calcular valores de indenização ou perdas e danos",
    "Preparar estratégia de negociação ou litígio",
  ],
};

/**
 * Get checklist template by case type
 */
export function getChecklistTemplate(caseType: CaseType): ChecklistTemplate {
  switch (caseType) {
    case "civel":
      return CHECKLIST_CIVEL;
    case "consumidor":
      return CHECKLIST_CONSUMIDOR;
    case "imobiliario":
      return CHECKLIST_IMOBILIARIO;
    case "processual":
      return CHECKLIST_PROCESSUAL;
    case "empresarial":
      return CHECKLIST_EMPRESARIAL;
    default:
      return CHECKLIST_CIVEL; // fallback
  }
}

/**
 * Create checklist for a case
 */
export async function createChecklist(
  userId: number,
  caseType: CaseType,
  clientId?: number,
  processId?: number,
  pipelineItemId?: number
) {
  const { getDb } = await import("./db");
  const { checklists, checklistItems } = await import("../drizzle/schema");
  
  const database = await getDb();
  if (!database) return { success: false, message: "Database not available" };

  try {
    const template = getChecklistTemplate(caseType);

    // Create checklist
    const result = await database.insert(checklists).values({
      caseType,
      title: template.title,
      clientId: clientId || undefined,
      processId: processId || undefined,
      pipelineItemId: pipelineItemId || undefined,
      userId,
    });

    const checklistId = Number(result.insertId);

    // Create checklist items
    for (let i = 0; i < template.items.length; i++) {
      await database.insert(checklistItems).values({
        checklistId,
        label: template.items[i],
        checked: false,
        order: i + 1,
      });
    }

    return { success: true, checklistId, itemCount: template.items.length };
  } catch (error) {
    console.error("[AutoChecklist] createChecklist error:", error);
    return { success: false, message: "Failed to create checklist" };
  }
}
