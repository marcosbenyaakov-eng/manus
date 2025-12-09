#!/bin/bash

# Landing Consumidor
cat > /home/ubuntu/benyaakov-vision-system-2/client/src/pages/public/LandingConsumidor.tsx << 'LANDING'
import LandingTemplate from "@/components/public/LandingTemplate";
import { Shield } from "lucide-react";

export default function LandingConsumidor() {
  return (
    <LandingTemplate
      area="Consumidor"
      heroTitle="Direito do Consumidor"
      heroDescription="Defenda seus direitos como consumidor. Atuamos em casos de produtos defeituosos, serviços mal prestados, cobranças indevidas e negativação irregular."
      heroIcon={<Shield className="h-5 w-5 text-primary" />}
      problemas={[
        "Comprou produto com defeito e não consegue troca/devolução?",
        "Foi negativado indevidamente?",
        "Sofreu cobrança abusiva ou indevida?",
        "Teve problemas com serviços contratados?",
        "Propaganda enganosa ou oferta não cumprida?",
        "Empresa não respeita garantia ou direito de arrependimento?",
      ]}
      solucao={{
        title: "Defesa Completa do Consumidor",
        description: "Protegemos seus direitos perante fornecedores e empresas",
        items: [
          "Análise do caso sob a ótica do Código de Defesa do Consumidor",
          "Tentativa de resolução amigável via Procon ou SAC",
          "Ação judicial para reparação de danos e indenização",
          "Cancelamento de negativações indevidas",
          "Revisão de contratos abusivos",
          "Acompanhamento até a solução definitiva",
        ],
      }}
      processo={{
        step1: {
          title: "Análise do Caso",
          description: "Avaliamos a relação de consumo e identificamos as violações aos seus direitos",
        },
        step2: {
          title: "Estratégia de Ação",
          description: "Definimos a melhor abordagem: administrativa ou judicial",
        },
        step3: {
          title: "Resolução",
          description: "Atuamos até garantir a reparação dos danos e o respeito aos seus direitos",
        },
      }}
      documentos={[
        "Nota fiscal ou comprovante de compra",
        "Contrato ou termo de adesão",
        "Comprovantes de pagamento",
        "Fotos ou vídeos do produto/serviço",
        "Protocolos de atendimento (SAC, Procon)",
        "E-mails e mensagens trocadas",
        "Comprovante de negativação (se aplicável)",
      ]}
      casos={[
        {
          title: "Produto Defeituoso",
          description: "Troca, devolução do valor pago e indenização por danos morais e materiais",
        },
        {
          title: "Negativação Indevida",
          description: "Cancelamento da negativação e indenização por danos morais",
        },
        {
          title: "Cobrança Abusiva",
          description: "Devolução em dobro do valor cobrado indevidamente",
        },
      ]}
    />
  );
}
LANDING

echo "Landing Consumidor criada"
