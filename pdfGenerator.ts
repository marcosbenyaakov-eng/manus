import PDFDocument from "pdfkit";
import { storagePut } from "./storage";

interface ProcessReportData {
  processNumber: string;
  title: string;
  type: string;
  status: string;
  createdAt: Date;
  documents: Array<{
    title: string;
    type: string;
    uploadedAt: Date;
  }>;
  activities: Array<{
    type: string;
    description: string;
    createdAt: Date;
  }>;
}

interface MonthlyStatsData {
  month: string;
  year: number;
  totalProcesses: number;
  activeProcesses: number;
  closedProcesses: number;
  totalDocuments: number;
  processesByType: Record<string, number>;
  processesByStatus: Record<string, number>;
}

export async function generateProcessReport(data: ProcessReportData): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", async () => {
        const pdfBuffer = Buffer.concat(chunks);
        const fileName = `process-report-${data.processNumber.replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}.pdf`;
        const { url } = await storagePut(`reports/${fileName}`, pdfBuffer, "application/pdf");
        resolve(url);
      });

      // Header with watermark
      doc.fontSize(10).fillColor("#888888").text("BENYAAKOV VISION SYSTEM 2.0", 50, 30, { align: "right" });
      doc.moveDown(2);

      // Title
      doc.fontSize(24).fillColor("#000000").text("Relatório de Processo", { align: "center" });
      doc.moveDown(1);

      // Process Information
      doc.fontSize(14).text(`Número do Processo: ${data.processNumber}`, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Título: ${data.title}`);
      doc.text(`Tipo: ${data.type}`);
      doc.text(`Status: ${data.status}`);
      doc.text(`Data de Criação: ${new Date(data.createdAt).toLocaleDateString()}`);
      doc.moveDown(1);

      // Documents Section
      doc.fontSize(16).text("Documentos", { underline: true });
      doc.moveDown(0.5);
      if (data.documents.length > 0) {
        data.documents.forEach((doc_item, index) => {
          doc.fontSize(11).text(`${index + 1}. ${doc_item.title} (${doc_item.type})`, { indent: 20 });
          doc.fontSize(9).fillColor("#666666").text(`   Enviado em: ${new Date(doc_item.uploadedAt).toLocaleDateString()}`, { indent: 20 });
          doc.fillColor("#000000");
        });
      } else {
        doc.fontSize(11).fillColor("#666666").text("Nenhum documento anexado", { indent: 20 });
        doc.fillColor("#000000");
      }
      doc.moveDown(1);

      // Activities Section
      doc.fontSize(16).text("Histórico de Atividades", { underline: true });
      doc.moveDown(0.5);
      if (data.activities.length > 0) {
        data.activities.forEach((activity, index) => {
          doc.fontSize(11).text(`${index + 1}. ${activity.type}`, { indent: 20 });
          doc.fontSize(10).text(`   ${activity.description}`, { indent: 20 });
          doc.fontSize(9).fillColor("#666666").text(`   ${new Date(activity.createdAt).toLocaleString()}`, { indent: 20 });
          doc.fillColor("#000000");
          doc.moveDown(0.3);
        });
      } else {
        doc.fontSize(11).fillColor("#666666").text("Nenhuma atividade registrada", { indent: 20 });
        doc.fillColor("#000000");
      }

      // Footer with digital signature placeholder
      doc.moveDown(2);
      doc.fontSize(8).fillColor("#888888").text("Este documento foi gerado automaticamente pelo Benyaakov Vision System 2.0", { align: "center" });
      doc.text(`Gerado em: ${new Date().toLocaleString()}`, { align: "center" });
      doc.text("Assinatura Digital: [HASH_PLACEHOLDER]", { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateMonthlyStatsReport(data: MonthlyStatsData): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", async () => {
        const pdfBuffer = Buffer.concat(chunks);
        const fileName = `monthly-stats-${data.year}-${data.month}-${Date.now()}.pdf`;
        const { url } = await storagePut(`reports/${fileName}`, pdfBuffer, "application/pdf");
        resolve(url);
      });

      // Header
      doc.fontSize(10).fillColor("#888888").text("BENYAAKOV VISION SYSTEM 2.0", 50, 30, { align: "right" });
      doc.moveDown(2);

      // Title
      doc.fontSize(24).fillColor("#000000").text("Relatório Mensal de Estatísticas", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(14).text(`${data.month}/${data.year}`, { align: "center" });
      doc.moveDown(1.5);

      // Summary Stats
      doc.fontSize(16).text("Resumo Geral", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Total de Processos: ${data.totalProcesses}`);
      doc.text(`Processos Ativos: ${data.activeProcesses}`);
      doc.text(`Processos Fechados: ${data.closedProcesses}`);
      doc.text(`Total de Documentos: ${data.totalDocuments}`);
      doc.moveDown(1);

      // Processes by Type
      doc.fontSize(16).text("Processos por Tipo", { underline: true });
      doc.moveDown(0.5);
      Object.entries(data.processesByType).forEach(([type, count]) => {
        doc.fontSize(12).text(`${type}: ${count}`, { indent: 20 });
      });
      doc.moveDown(1);

      // Processes by Status
      doc.fontSize(16).text("Processos por Status", { underline: true });
      doc.moveDown(0.5);
      Object.entries(data.processesByStatus).forEach(([status, count]) => {
        doc.fontSize(12).text(`${status}: ${count}`, { indent: 20 });
      });

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).fillColor("#888888").text("Este documento foi gerado automaticamente pelo Benyaakov Vision System 2.0", { align: "center" });
      doc.text(`Gerado em: ${new Date().toLocaleString()}`, { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

interface AnalyticsReportData {
  period: string;
  generatedAt: Date;
  kpis: {
    processosAtivos: number;
    prazosProximos: number;
    documentosAnexados: number;
    movimentoFinanceiro: number;
  };
  financialHistory: Array<{
    month: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
  processStates: Array<{
    name: string;
    value: number;
  }>;
  productivity: Array<{
    name: string;
    pecas: number;
    prazos: number;
    documentos: number;
    score: number;
  }>;
  clientLeadMetrics: {
    novosLeads: number;
    leadsConvertidos: number;
    taxaConversao: number;
    novosClientes: number;
  };
}

export async function generateAnalyticsReport(data: AnalyticsReportData): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", async () => {
        const pdfBuffer = Buffer.concat(chunks);
        const fileName = `analytics-report-${data.period}-${Date.now()}.pdf`;
        const { url } = await storagePut(`reports/${fileName}`, pdfBuffer, "application/pdf");
        resolve(url);
      });

      // Header with watermark
      doc.fontSize(10).fillColor("#888888").text("BENYAAKOV VISION SYSTEM 2.0 - ANALYTICS REPORT", 50, 30, { align: "right" });
      doc.moveDown(2);

      // Title
      doc.fontSize(24).fillColor("#8b5cf6").text("Relatório de Analytics", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor("#666666").text(`Período: ${data.period}`, { align: "center" });
      doc.fontSize(10).fillColor("#888888").text(`Gerado em: ${data.generatedAt.toLocaleDateString('pt-BR')} às ${data.generatedAt.toLocaleTimeString('pt-BR')}`, { align: "center" });
      doc.moveDown(2);

      // KPIs Section
      doc.fontSize(18).fillColor("#000000").text("KPIs Globais", { underline: true });
      doc.moveDown(1);
      
      doc.fontSize(12).fillColor("#333333");
      doc.text(`• Processos Ativos: ${data.kpis.processosAtivos}`, { indent: 20 });
      doc.text(`• Prazos Próximos (7 dias): ${data.kpis.prazosProximos}`, { indent: 20 });
      doc.text(`• Documentos Anexados: ${data.kpis.documentosAnexados}`, { indent: 20 });
      doc.text(`• Movimento Financeiro: R$ ${data.kpis.movimentoFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, { indent: 20 });
      doc.moveDown(2);

      // Financial History Section
      doc.fontSize(18).fillColor("#000000").text("Histórico Financeiro (6 meses)", { underline: true });
      doc.moveDown(1);
      
      doc.fontSize(10).fillColor("#333333");
      data.financialHistory.forEach(record => {
        doc.text(`${record.month}: Entradas R$ ${record.entradas.toFixed(2)} | Saídas R$ ${record.saidas.toFixed(2)} | Saldo R$ ${record.saldo.toFixed(2)}`, { indent: 20 });
      });
      doc.moveDown(2);

      // Process States Section
      doc.fontSize(18).fillColor("#000000").text("Distribuição de Processos por Fase", { underline: true });
      doc.moveDown(1);
      
      doc.fontSize(12).fillColor("#333333");
      data.processStates.forEach(state => {
        doc.text(`• ${state.name}: ${state.value} processo(s)`, { indent: 20 });
      });
      doc.moveDown(2);

      // Productivity Section
      if (data.productivity.length > 0) {
        doc.fontSize(18).fillColor("#000000").text("Ranking de Produtividade", { underline: true });
        doc.moveDown(1);
        
        doc.fontSize(12).fillColor("#333333");
        data.productivity.forEach((lawyer, idx) => {
          doc.text(`${idx + 1}. ${lawyer.name} - Score: ${lawyer.score}`, { indent: 20 });
          doc.fontSize(10).fillColor("#666666");
          doc.text(`   Peças: ${lawyer.pecas} | Prazos: ${lawyer.prazos} | Documentos: ${lawyer.documentos}`, { indent: 30 });
          doc.fontSize(12).fillColor("#333333");
        });
        doc.moveDown(2);
      }

      // Client & Lead Metrics Section
      doc.fontSize(18).fillColor("#000000").text("Métricas de Clientes & Leads", { underline: true });
      doc.moveDown(1);
      
      doc.fontSize(12).fillColor("#333333");
      doc.text(`• Novos Leads: ${data.clientLeadMetrics.novosLeads}`, { indent: 20 });
      doc.text(`• Leads Convertidos: ${data.clientLeadMetrics.leadsConvertidos}`, { indent: 20 });
      doc.text(`• Taxa de Conversão: ${data.clientLeadMetrics.taxaConversao}%`, { indent: 20 });
      doc.text(`• Novos Clientes: ${data.clientLeadMetrics.novosClientes}`, { indent: 20 });
      doc.moveDown(2);

      // Footer
      doc.fontSize(8).fillColor("#888888").text(
        "Este relatório foi gerado automaticamente pelo Benyaakov Vision System 2.0",
        50,
        doc.page.height - 50,
        { align: "center" }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
