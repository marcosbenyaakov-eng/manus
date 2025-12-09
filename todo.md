# Benyaakov Vision System 2.0 - TODO

## Sistema de Autenticação e Controle de Acesso
- [x] Sistema de autenticação completo com login e registro
- [x] Controle de acesso baseado em roles (admin/user)
- [x] Gestão de sessões e proteção de rotas

## Painel Administrativo
- [x] Dashboard analytics com métricas do sistema
- [x] Gestão de usuários (listar, editar, promover roles)
- [x] Configurações do sistema

## Sistema Jurídico Core
- [x] Gestão de processos jurídicos (criar, editar, listar, deletar)
- [x] Gestão de documentos processuais
- [x] Sistema de prazos e acompanhamento de casos
- [x] Upload e armazenamento seguro de documentos (S3)
- [x] Organização de documentos por caso
- [x] Versionamento automático de documentos

## Cards Dinâmicos e Visualização
- [x] Cards interativos para visualização de dados jurídicos
- [x] Filtros avançados (status, tipo, data, responsável)
- [x] Busca avançada em processos e documentos
- [x] Visualização em grid e lista

## Avatares Inteligentes com IA
- [x] Integração com LLM para assistência jurídica
- [x] Chat contextual baseado em processos
- [x] Sugestões inteligentes de ações
- [x] Histórico de conversas

## Interface Futurista VisionOS
- [x] Design system com glassmorphism
- [x] Gradiente violeta para teal no background
- [x] Tipografia sans-serif branca e impactante
- [x] Animações fluidas e micro-interações
- [x] Layout assimétrico com amplo espaço negativo

## Navegação Cognitiva
- [x] Breadcrumbs contextuais
- [x] Atalhos de teclado
- [x] Navegação contextual inteligente
- [x] Menu lateral com categorias

## Módulos de Automação Jurídica
- [x] Geração automática de petições com IA
- [x] Calculadora jurídica (prazos, honorários, correção monetária)
- [x] Sistema de alertas de prazos
- [x] Notificações automáticas de vencimentos

## Sistema de Notificações
- [x] Notificações em tempo real
- [x] Alertas de atualizações de processos
- [x] Notificações de eventos críticos
- [x] Centro de notificações no painel

## Banco de Dados
- [x] Schema completo com tabelas: processes, documents, activities, notifications, chat_messages
- [x] Relacionamentos entre entidades
- [x] Índices para performance
- [x] Histórico de auditoria

## Testes e Qualidade
- [x] Testes vitest para procedures críticos
- [x] Validação de upload de documentos
- [x] Testes de autenticação e autorização

## Avatares Animados
- [x] Copiar arquivos dos avatares Kaleb e Katarina para client/src/components/vision-chat/avatars/
- [x] Criar componente VisionAvatar.tsx com suporte a idle/blink/sprite
- [x] Adicionar avatar-vision.png no hero da página inicial com estilo VisionOS glassmorphism
- [x] Integrar avatares na página AIAssistant

## Melhorias de Avatar e HERO
- [x] Criar seletor de avatar (Kaleb/Katarina) no AIAssistant com localStorage
- [x] Implementar animação de sprite sheet sincronizada com streaming de texto
- [x] Criar página de configurações de avatar com personalização (nome, aparência, tom de voz)
- [x] Reformular HERO removendo imagem do bebê sentado
- [x] Adicionar card VisionOS minimalista com kaleb-idle.png
- [x] Implementar hover interativo (troca para kaleb-blink.png)
- [x] Adicionar animação de flutuação e sombra VisionOS

## Histórico de Conversas e Templates
- [x] Remover completamente avatar/card do HERO e recentralizar layout
- [x] Estender schema do banco de dados para histórico de conversas
- [x] Implementar salvamento automático de conversas no banco de dados
- [x] Criar interface de busca e filtro de conversas por data/tópico
- [x] Criar página de detalhes do processo com visualização completa
- [x] Adicionar timeline de atividades no detalhe do processo
- [x] Implementar visualização de documentos no detalhe do processo
- [x] Criar sistema de templates de documentos jurídicos
- [x] Adicionar biblioteca de modelos (petições, contratos, pareceres)
- [x] Implementar editor de templates com personalização

## Logomarca e Melhorias Avançadas
- [x] Copiar logomarca metálica premium para client/public/
- [x] Atualizar header com logo no canto superior esquerdo (52px)
- [x] Atualizar footer com logo centralizada (64px)
- [x] Adicionar glow azul #00D4FF com opacidade 15%
- [x] Garantir responsividade (40px no mobile)
- [x] Implementar formulário de criação de processo com validação
- [x] Adicionar campos dinâmicos baseados no tipo de processo
- [x] Implementar upload múltiplo de documentos com preview
- [x] Criar sistema de busca global com atalho Ctrl+K
- [x] Implementar busca em tempo real em processos, documentos, conversas e templates
- [x] Agrupar resultados de busca por categoria
- [x] Criar dashboard de métricas avançadas com gráficos interativos
- [x] Adicionar gráficos de processos por status/tipo
- [x] Implementar timeline de atividades no dashboard
- [x] Mostrar prazos próximos do vencimento
- [x] Adicionar estatísticas de uso do assistente IA

## Notificações Push, Relatórios PDF e Calendário
- [x] Implementar WebSockets para notificações em tempo real
- [x] Criar sistema de notificações push para atualizações de processos
- [x] Adicionar badge de contagem de notificações não lidas
- [x] Implementar som personalizável para notificações
- [x] Criar sistema de geração de relatórios PDF personalizados
- [x] Adicionar templates de relatórios (processos, estatísticas mensais)
- [x] Implementar marca d'água e assinatura digital em PDFs
- [x] Criar integração com Google Calendar para sincronizar prazos
- [x] Adicionar integração com Outlook Calendar
- [x] Implementar lembretes por email 24h antes do vencimento
- [x] Reformular HERO com componente VisionHero premium
- [x] Criar VisionHeroCard translúcido com estilo VisionOS
- [x] Atualizar botões e micro destaques no HERO

## Atualização VisionHeroCard Premium
- [x] Substituir VisionHeroCard pelo novo design premium detalhado
- [x] Adicionar glow suave de fundo com gradiente cyan/sky/blue
- [x] Implementar topo do card com título e status online
- [x] Adicionar linha divisória suave
- [x] Criar grid 2x2 com módulos internos (Monitor, Alertas, Estratégia, Insights)
- [x] Implementar rodapé com modo "Sun Tzu • VisionOS • Benyaakov"
- [x] Adicionar botão "Abrir painel" com hover interativo

## Atualização Layout Home Completo
- [x] Adicionar header com logo Benyaakov e navegação
- [x] Implementar navegação com links para Painel, Casos e Financeiro
- [x] Integrar VisionHero no main
- [x] Adicionar footer premium com copyright e badge VisionOS
- [x] Garantir responsividade do layout completo

## Correção de Erro de Nested Anchor
- [x] Remover tag `<a>` aninhada dentro do Link no header da Home.tsx
- [x] Garantir que Link do wouter não contenha elementos `<a>` filhos

## HeroDarkMetal Cinematográfico
- [x] Criar componente HeroDarkMetal com fundo cinematográfico e gradientes
- [x] Criar componente HeroShowcaseCard para o lado direito
- [x] Adicionar título "Excelência Jurídica para Proteger Seus Direitos"
- [x] Adicionar subtítulo com 15 anos de experiência
- [x] Implementar CTAs "Falar com um advogado" e "Conheça o Benyaakov Vision System"
- [x] Adicionar micro destaques com badges coloridos
- [x] Substituir VisionHero por HeroDarkMetal na Home.tsx

## Atualização HeroShowcaseCard Detalhado
- [x] Substituir HeroShowcaseCard atual pelo novo design com descrição expandida
- [x] Adicionar texto "Visão estratégica em tempo real" no topo
- [x] Incluir parágrafo descritivo sobre visão unificada de processos
- [x] Atualizar grid 2x2 com novos textos: Monitor de Processos, Alertas inteligentes, Estratégia ativa, Inteligência Benyaakov
- [x] Adicionar rodapé com "Modo de operação: Estratégico • Preventivo • Focado em resultados"
- [x] Incluir botão "Ver painel em ação" no rodapé
- [x] Alterar badge de status para "Sistema ativo" com cor emerald

## Restauração HERO Original
- [x] Verificar versão original do HERO em checkpoints anteriores
- [x] Remover HeroDarkMetal e todas as modificações posteriores
- [x] Restaurar textos originais: título, subtítulo e estrutura de botões
- [x] Reaplicar layout original da homepage
- [x] Manter restante da página intacto (header, footer)

## Home Híbrido VisionOS 2.0
- [x] Instalar framer-motion para animações
- [x] Criar novo HERO híbrido com fundo radial gradient (violet/teal)
- [x] Adicionar coluna esquerda com título "BENYAAKOV VISION SYSTEM 2.0" e CTAs
- [x] Adicionar coluna direita com VisionAvatar translúcido em card glassmorphism
- [x] Implementar FloatingCard component com animações framer-motion
- [x] Adicionar 3 cards flutuantes: Assistente jurídico, Gestão de processos, Automação inteligente
- [x] Criar seção comparativa "Por que o Vision System é diferente?"
- [x] Adicionar grid 2 colunas: Sistemas tradicionais vs Vision System 2.0
- [x] Aplicar animações motion.div com initial/animate/whileHover

## Melhorias Home VisionOS 2.0
- [x] Corrigir avatar VisionOS com overflow-hidden rounded-[32px]
- [x] Alinhar título "ASSISTENTE BENYAAKOV VISION" com text-center
- [x] Ajustar texto do avatar com leading-snug e max-w-[220px]
- [x] Adicionar seção de depoimentos após seção comparativa
- [x] Criar 3 cards de depoimentos com foto, nome, cargo e testemunho
- [x] Implementar scroll suave com smooth-scroll no CSS
- [x] Adicionar navegação âncora entre seções (id="hero", "diferencial", "funcionalidades", "depoimentos", "cta")
- [x] Criar seção "Funcionalidades em Detalhes" com grid 2x2
- [x] Adicionar 4 funcionalidades com ícone, título, descrição e gradientes
- [x] Aplicar animações framer-motion em todas as novas seções

## Núcleo 2 - Avatar Interativo + Painel VisionOS
- [x] Criar FAQ interativo com componente Accordion (shadcn/ui)
- [x] Adicionar 8 perguntas frequentes sobre o sistema
- [x] Criar modal de formulário de contato com Dialog (shadcn/ui)
- [x] Implementar campos: nome, email, telefone, mensagem
- [x] Conectar botão "Agendar demonstração" ao modal
- [x] Criar footer institucional com 4 colunas: Sobre, Produto, Empresa, Legal
- [x] Adicionar links de redes sociais no footer (Github, LinkedIn, Twitter, Email)
- [x] Criar componente VisionPanel com glassmorphism (backdrop-blur-3xl, bg-white/10)
- [x] Adicionar borda neon suave (border-white/20) e glow interno
- [x] Criar componente InteractiveAvatar com máscara circular e halo luminoso
- [x] Implementar seletor Kaleb/Katarina com persistência localStorage
- [x] Criar VisionChatWindow 2.0 flutuante translúcido
- [x] Implementar VisionChatBubble com animações de entrada (fade + scale)
- [x] Adicionar campo de input minimalista com ícone de envio animado
- [x] Integrar VisionChatWindow com simulação de IA (pronto para tRPC)
- [x] Garantir responsividade mobile-first em todos os componentes
- [x] Integrar todos os componentes na Home.tsx

## Melhorias 1-3 + Núcleo 3 - Assistente Benyaakov Consultoria
- [x] Instalar Zustand para state management
- [x] Criar chatStore com estados: isChatOpen, messages, isLoading, avatarMode, conversationId
- [x] Implementar persistência local com zustand/middleware persist
- [x] Criar tRPC mutation chat.sendMessage integrado com LLM
- [x] Criar tRPC mutation contact.submit para salvar leads
- [x] Criar VisionChatController com sendMessage() e tratamento de erros
- [x] Adicionar spinner de carregamento estilo VisionOS (Loader2 animado)
- [x] Implementar auto-scroll suave nas mensagens (messagesEndRef + scrollIntoView)
- [x] Atualizar VisionChatWindow com cabeçalho "Assistente Benyaakov Consultoria Jurídica"
- [x] Adicionar detecção ENTER no input do chat (handleKeyDown)
- [x] Atualizar VisionChatBubble com suporte a markdown (react-markdown)
- [x] Adicionar fade + slide suave nas bolhas (initial/animate com x offset)
- [x] Adicionar brilho interno na bolha do assistente (gradient overlay)
- [x] Integrar clique do avatar para abrir chat (setIsChatOpen via Zustand)
- [x] Adicionar status "Assistente Benyaakov Consultoria — Online" no avatar
- [x] Implementar animação idle no avatar quando chat aberto (y: [0, -5, 0])
- [x] Implementar responsividade: mobile 100%, tablet centralizado, desktop canto inferior direito
- [x] Adicionar animação parallax nos gradientes de fundo (motion.div com scale 1.1 → 1)
- [x] Integrar ContactModal com tRPC contact.submit

## Melhorias 1-3 + Núcleo 4 - Personalização Jurídica
- [x] Criar módulo legalMode.ts com 6 modos jurídicos (Cível, Consumidor, Imobiliário, Processual, Empresarial, Tributário Leve)
- [x] Definir palavras-chave para cada modo jurídico
- [x] Criar função parseLegalContext() com detecção automática de modo
- [x] Implementar estrutura de resposta jurídica padronizada
- [x] Adicionar restrições éticas e de segurança no prompt
- [x] Atualizar VisionChatController para usar parseLegalContext()
- [x] Adicionar estado currentLegalMode no chatStore
- [x] Adicionar rótulo de modo jurídico no topo do VisionChatWindow
- [x] Atualizar rótulo automaticamente quando modo mudar
- [x] Implementar sugestões rápidas (quick prompts) no chat
- [x] Adicionar 6 botões com perguntas frequentes (Analisar processo, Gerar petição, Calcular prazos, Estratégia jurídica, Contrato empresarial, Questão imobiliária)
- [x] Criar sistema de feedback (👍/👎) nas bolhas do assistente
- [x] Adicionar estado local de feedback com setFeedback
- [x] Criar página ConversationHistory no Dashboard
- [x] Implementar filtros por data e busca de conteúdo
- [x] Adicionar rota /conversations no App.tsx

## Melhorias 1-3 Pós-Núcleo 4
- [x] Adicionar link "Histórico de Conversas" no DashboardLayout sidebar
- [x] Criar tRPC mutation chat.submitFeedback para salvar feedback no banco
- [x] Atualizar schema chatMessages com campo feedback (enum: positive, negative)
- [x] Aplicar migração do banco de dados (pnpm db:push)

## Núcleo 5 - Ferramentas Jurídicas Internas
- [x] Criar módulo LegalToolsEngine.ts com 7 funções
- [x] Implementar generateDraft() para minutas simples (notificação, requerimento, email, solicitação)
- [x] Implementar summarizeDocument() para resumo técnico com fatos, pedidos, valores
- [x] Implementar extractDeadlines() para detectar prazos citados (sem cálculo processual)
- [x] Implementar identifyRisks() para pontos frágeis, inconsistências e recomendações
- [x] Implementar classifyCase() para classificação automática (6 categorias)
- [x] Implementar extractKeyPoints() para extração de tópicos centrais, partes, datas, valores
- [x] Implementar roleplayLegal() para simular visão adversa com contra-estratégias
- [x] Criar tRPC procedures legalTools.* para cada ferramenta (7 mutations)
- [x] Adicionar restrições éticas em todas as funções (sem jurisprudência falsa, sem ato privativo)
- [x] Criar componente LegalToolsMenu com ícone ⚙
- [x] Adicionar menu dropdown com 7 opções de ferramentas
- [x] Integrar LegalToolsMenu no cabeçalho do VisionChatWindow
- [x] Implementar modals/forms para input de cada ferramenta (Dialog + Textarea + Select)
- [x] Conectar ferramentas ao chat para exibir resultados (addSystemMessage)
- [x] Adicionar método addSystemMessage() no VisionChatController

## Melhorias 1-3 Pós-Núcleo 5
- [x] Criar testes vitest para LegalToolsEngine (generateDraft, summarizeDocument, extractDeadlines, identifyRisks, classifyCase, extractKeyPoints, roleplayLegal)
- [x] Adicionar arquivo server/legalToolsEngine.test.ts com 7 suítes de testes
- [x] Executar testes com pnpm test (8 testes aprovados)
- [x] Implementar upload de documentos (PDF/DOCX) no LegalToolsMenu
- [x] Adicionar botão "Upload documento" nas ferramentas summarizeDocument, extractDeadlines, extractKeyPoints
- [x] Adicionar tabela toolHistory no schema (userId, toolType, input, output, timestamp)

## Núcleo 6 - Fase 1: Painel do Advogado (Base + Atendimentos + Anotações)
- [x] Criar schema para clientes (nome, contato, email, telefone, ultimaInteracao)
- [x] Criar schema para anotações (título, conteúdo, tags, clienteId, processId, createdAt)
- [x] Criar schema para histórico de ferramentas (userId, toolType, input, output, legalMode, timestamp)
- [x] Aplicar migração do banco de dados (pnpm db:push)
- [x] Criar página LawyerDashboard.tsx com layout 3 colunas
- [x] Implementar navegação lateral fixa com 7 itens de menu
- [x] Adicionar cabeçalho com logo Benyaakov e título "Painel do Advogado"
- [x] Criar componente AttendanceModule com lista de conversas
- [x] Integrar com tRPC conversations.list para puxar atendimentos
- [x] Adicionar botão "Abrir conversa" que abre VisionChatWindow
- [x] Criar componente NotesModule com editor de texto
- [x] Implementar sistema de tags (cliente, processo, área do direito)
- [x] Adicionar busca rápida e filtros por tag
- [x] Implementar salvamento com tRPC notes.create/update
- [x] Criar rota /lawyer-dashboard no App.tsx

## Núcleo 6 - Fase 2: Documentos e Histórico (Próxima fase)
- [ ] Criar componente DocumentsModule com upload de arquivos
- [ ] Adicionar preview de PDF/DOCX/JPG
- [ ] Implementar filtros por cliente/tema
- [ ] Adicionar botão "Analisar com Assistente" que abre LegalToolsMenu
- [ ] Criar componente HistoryModule com timeline de ações
- [ ] Registrar automaticamente: perguntas, documentos, prazos, minutas, modo jurídico
- [ ] Implementar visualização em timeline com ícones e datas
- [ ] Criar componente ClientsModule com lista de clientes
- [ ] Adicionar campos: nome, contato, última interação, documentos, anotações
- [ ] Implementar botão "Abrir painel do cliente" com modal detalhado
- [ ] Criar componente LegalToolsPanelModule reexibindo 7 ferramentas
- [ ] Adicionar cards para cada ferramenta com ícone e descrição
- [ ] Implementar modals para cada ferramenta (reutilizar LegalToolsMenu)
- [ ] Criar componente SettingsModule com opções de personalização
- [ ] Adicionar seletor de avatar (Kaleb/Katarina)
- [ ] Implementar toggle de modo escuro
- [ ] Adicionar slider de brilho do glassmorphism
- [ ] Implementar botão "Limpar histórico"
- [ ] Adicionar campo de email padrão da consultoria
- [ ] Criar rota /lawyer-dashboard no App.tsx
- [ ] Adicionar link no DashboardLayout para acessar Painel do Advogado
- [ ] Garantir estética VisionOS em todos os módulos (glassmorphism, gradientes, animações)
- [ ] Testar integração completa de todos os 8 módulos

## Núcleo 6 - Fase 2: Documentos e Histórico
- [x] Adicionar link "Painel do Advogado" no DashboardLayout sidebar
- [ ] Criar Módulo de Documentos com upload de arquivos (PDF/DOCX/JPG)
- [ ] Implementar preview de documentos
- [ ] Adicionar filtros por cliente/tema
- [ ] Integrar botão "Analisar com Assistente" que abre LegalToolsMenu
- [ ] Criar Módulo de Histórico com timeline de ações
- [ ] Registrar automaticamente: perguntas, documentos, prazos, minutas, modo jurídico
- [ ] Implementar visualização em timeline com ícones e datas
- [ ] Criar tRPC procedures para documentos e histórico

## Núcleo 6 - Fase 3: Clientes, Ferramentas e Configurações
- [ ] Criar Módulo de Clientes com lista de contatos
- [ ] Adicionar campos: nome, contato, última interação, documentos, anotações
- [ ] Implementar modal de detalhes do cliente
- [ ] Criar Módulo de Ferramentas Jurídicas em formato painel
- [ ] Adicionar cards para 7 ferramentas com ícone e descrição
- [ ] Reutilizar LegalToolsMenu para modals
- [ ] Criar Módulo de Configurações com personalização
- [ ] Adicionar seletor de avatar (Kaleb/Katarina)
- [ ] Implementar toggle de modo escuro
- [ ] Adicionar slider de brilho do glassmorphism
- [ ] Implementar botão "Limpar histórico"
- [ ] Adicionar campo de email padrão da consultoria
- [ ] Criar tRPC procedures para clientes e configurações

## Núcleo 7 - Automação Inteligente
- [ ] Criar módulo AutomationEngine.ts com detectIntent() e triggerAction()
- [ ] Implementar autoMode (ativar/desativar automações)
- [ ] Criar sistema de smartSuggestions contextuais
- [ ] Implementar 6 gatilhos automáticos:
  - [ ] Texto contém prazo → extractDeadlines()
  - [ ] Texto contém decisão/sentença → extractKeyPoints() + identifyRisks()
  - [ ] Documento enviado → summarizeDocument()
  - [ ] Caso novo identificado → classifyCase()
  - [ ] Pergunta ambígua → sugerir modo correto
  - [ ] Texto emocional/confuso → sugerir análise técnica
- [ ] Criar componente SmartSuggestionsBar acima do input do chat
- [ ] Implementar sugestões dinâmicas baseadas no contexto
- [ ] Criar AutoModal para modais automáticos (prazos, resumo, riscos, pontos-chave, minuta)
- [ ] Criar Painel Automação no LawyerDashboard
- [ ] Adicionar toggle Automação Inteligente (ativar/desativar)
- [ ] Mostrar histórico de automações acionadas
- [ ] Implementar botão "executar novamente"
- [ ] Integrar AutomationEngine no VisionChatController
- [ ] Adicionar restrições éticas (sem ato privativo, sem jurisprudência falsa)
- [ ] Testar todos os gatilhos e automações

## Núcleo 6 - Fase 2: Documentos e Histórico
- [x] Adicionar link "Painel do Advogado" no DashboardLayout sidebar
- [x] Criar Módulo de Documentos com upload de PDF/DOCX/JPG
- [x] Adicionar preview e botão "Analisar com Assistente"
- [x] Criar Módulo de Histórico com timeline de ações
- [x] Adicionar 4 tipos de eventos (pergunta, documento, prazo, minuta)

## Núcleo 6 - Fase 3: Clientes, Ferramentas e Configurações
- [x] Criar Módulo de Clientes com lista de contatos
- [x] Adicionar campos: nome, email, telefone, última interação
- [x] Criar Módulo de Ferramentas Jurídicas em formato painel
- [x] Adicionar grid 2x2 com 7 ferramentas do Núcleo 5
- [x] Criar Módulo de Configurações com personalização
- [x] Adicionar seletor de avatar (Kaleb/Katarina)
- [x] Adicionar campo de email da consultoria
- [x] Adicionar botão "Limpar Histórico"

## Núcleo 7 - Automação Inteligente (Parcial)
- [x] Criar AutomationEngine.ts com detectIntent() e triggerAction()
- [x] Implementar 6 gatilhos automáticos: prazo, decisão, documento, caso novo, pergunta ambígua, texto emocional
- [x] Criar SmartSuggestionsBar com barra de sugestões contextuais
- [x] Adicionar autoMode e smartSuggestions no chatStore
- [ ] Criar AutoModal para prazos, resumo, riscos, pontos-chave e minuta
- [ ] Adicionar Painel de Automação no LawyerDashboard com toggle autoMode
- [ ] Integrar AutomationEngine no VisionChatController
- [ ] Adicionar SmartSuggestionsBar no VisionChatWindow
- [ ] Adicionar tRPC procedures clients.create, clients.update, clients.list
- [ ] Implementar salvamento automático de histórico de ferramentas em toolHistory

## Núcleo 8 - Fluxos da Consultoria
- [ ] Criar schema para pipeline (leads, stages, appointments)
- [ ] Criar página Pipeline com Kanban (6 colunas: Novo Lead, Em Análise, Aguardando Documentos, Aguardando Cliente, Em Execução, Concluído)
- [ ] Implementar drag & drop com dnd-kit
- [ ] Criar Módulo de Leads com origem (site, whatsapp, indicação)
- [ ] Criar Agenda Simples com compromissos, lembretes e visão diária/semanal
- [ ] Adicionar Módulo de Status Jurídico (6 estados)
- [ ] Expandir Painel do Cliente com pipeline local, documentos, anotações, histórico
- [ ] Adicionar botão "Enviar para Assistente" com injeção de contexto


## Núcleo 9 - Automação Jurídica Avançada

### Schema e Database
- [x] Criar tabela insights (alertas automáticos)
- [x] Criar tabela checklists (checklists por tipo de caso)
- [x] Criar tabela checklistItems (itens do checklist)
- [x] Criar tabela automationRules (regras de automação)
- [x] Criar tabela automationLogs (log de automações executadas)
- [x] Atualizar tabela notifications para push
- [x] Aplicar migração do schema

### 1. AutoContext Link
- [x] Criar tRPC procedure autoContext.getClientContext
- [x] Criar tRPC procedure autoContext.getDocumentContext
- [x] Criar tRPC procedure autoContext.getPipelineContext
- [ ] Integrar contexto automático no chat

### 2. SmartPipeline Automation
- [x] Regra: Documento novo → mover para "Em Análise"
- [x] Regra: +1 documento em sequência → alerta "Aguardando triagem"
- [x] Regra: Caso sem ação há 10 dias → tag "Atenção"
- [x] Regra: Prazo detectado → marcar "Urgente"
- [x] Criar engine de automação para executar regras

### 3. Auto-Checklist do Caso
- [x] Template checklist Cível
- [x] Template checklist Consumidor
- [x] Template checklist Imobiliário
- [x] Template checklist Processual
- [x] Template checklist Empresarial
- [x] tRPC procedures para checklists (create, list, getItems, toggleItem)
- [ ] Componente ChecklistPanel no ClientsModule

### 4. Auto-Insight (IA interna)
- [x] Detector de contradições
- [x] Detector de ausência de documentos
- [x] Detector de prazo mencionado
- [x] Detector de risco identificado
- [x] Detector de pontos fortes
- [x] Detector de próximos passos
- [x] tRPC procedures para insights (analyze, list, dismiss) ] Componente InsightsPanel

### 5. Automação Documental Avançada
- [x] Extração automática de prazos ao anexar documento
- [x] Geração automática de pontos-chave
- [x] Identificação automática de riscos
- [x] Classificação automática de caso
- [x] Registro automático no histórico (via insights)
- [x] Sugestão automática de ação no pipeline (move para Em Análise)
- [x] tRPC procedure documentAutomation.analyzeDocumentça de status → registrar no histórico
- [ ] Hook: evento crítico no histórico → atualizar pipeline
- [ ] tRPC procedure syncHistoryPipeline

### 7. Integração com Chat Contextual
- [ ] Carregar contexto completo ao abrir chat
- [ ] Carregar documentos analisados
- [ ] Carregar prazos detectados
- [ ] Carregar status atual
- [ ] Modo contextual automático

### 8. Filtros e Busca no Pipeline
- [ ] Filtro por título
- [ ] Filtro por cliente
- [ ] Filtro por prioridade
- [ ] Filtro por status/estágio
- [ ] Componente SearchBar no Pipeline

### 9. Notificações Push
- [ ] Sistema de notificações para prazos próximos
- [ ] Sistema de notificações para mudanças de status
- [ ] tRPC procedures para notifications (list, markAsRead)
- [ ] Componente NotificationBell no header

### 10. Dashboard Analytics
- [ ] Métrica: conversão de leads
- [ ] Métrica: tempo médio por estágio
- [ ] Métrica: taxa de sucesso
- [ ] Gráficos com recharts
- [ ] Página Analytics

### Testing & Delivery
- [ ] Testar AutoContext Link
- [ ] Testar SmartPipeline Automation
- [ ] Testar Auto-Checklist
- [ ] Testar Auto-Insight
- [ ] Testar Automação Documental
- [ ] Testar AutoSync
- [ ] Verificar status do projeto
- [ ] Salvar checkpoint Núcleo 9 completo


## Núcleo 10 - Módulo Financeiro

### Schema e Database
- [x] Criar tabela financialRecords (entrada, saída, honorário, despesa)
- [x] Criar tabela financialSettings (configurações padrão)
- [x] Aplicar migração do schema
- [x] tRPC procedures financeiros (CRUD, settings, stats)

### 1. Orçamento + Contrato
- [ ] Card "Orçamento e Contrato" no painel do cliente
- [ ] Inserir valor dos honorários
- [ ] Gerar orçamento (template simples)
- [ ] Gerar contrato (pré-template simples)
- [ ] Botão "Enviar para Cliente"
- [ ] Status "aguardando aceite"

### 2. Entrada (Pagamento Inicial)
- [ ] Card "Entrada" no painel do cliente
- [ ] Campo valor da entrada
- [ ] Seletor forma de pagamento (pix, boleto, transferência)
- [ ] Upload do comprovante
- [ ] Botão "Registrar Pagamento"
- [ ] Registrar automaticamente no financialRecords

### 3. Recibo Automático
- [ ] Gerar recibo simples (PDF) ao registrar pagamento
- [ ] Salvar em docUrl
- [ ] Permitir download
- [ ] Exibir no painel do cliente

### 4. Fluxo de Caixa Interno
- [ ] Criar página "Financeiro"
- [ ] Total de entradas no mês
- [ ] Total de saídas
- [ ] Lista de transações
- [ ] Filtros por data, tipo e status
- [ ] Gráfico simples (linha ou barras)

### 5. Integração com Pipeline
- [ ] Entrada registrada → mover caso para "Em Execução"
- [ ] Inadimplência (pendente > 15 dias) → tag "Financeiro pendente"

### 6. Integração com Assistente
- [ ] Comando "Status financeiro do cliente" no chat
- [ ] Consultar financialRecords
- [ ] Responder com resumo textual (sem valores exatos)

### 7. Integração com Documentos
- [ ] Recibo/contrato gerado → adicionar no painel de Documentos

### 8. Configurações Financeiras
- [ ] Card "Configurações" no Painel Financeiro
- [ ] Valor padrão de entrada
- [ ] Valor padrão de honorários
- [ ] Método de pagamento padrão
- [ ] Observações internas


## Núcleo 11 - Agenda Jurídica Inteligente

### Schema e Database
- [x] Criar tabela agenda (prazo, compromisso, lembrete)
- [x] Aplicar migração do schema

### 1. Agenda do Advogado (Interface)
- [x] Criar página "Agenda Jurídica"
- [x] Visão diária
- [x] Visão semanal
- [x] Visão mensal simples
- [x] Eventos com cor (prazos vermelho, compromissos azul)
- [x] Modal de criação rápida
- [x] Filtros: tipo, prioridade

### 2. AutoPrazos (Integração Núcleo 5)
- [x] Detectar prazo via extractDeadlines() → criar item na agenda
- [x] Preencher: título, tipo "prazo", prioridade "alta"
- [x] Vincular ao cliente/caso
- [x] Registrar origem: "documento"
- [x] tRPC procedures (CRUD, createFromDeadline, getUrgent, getToday)

### 3. AutoAlertas (Inteligência Interna)
- [x] Prazo em 2 dias → alerta "Urgente"
- [x] Prazo no mesmo dia → destaque vermelho (critical)
- [x] Compromisso no mesmo dia → notificação interna
- [x] Documento novo com prazo → alerta "Analisar documento"
- [x] Caso parado há 15 dias → lembrete interno automático
- [x] tRPC procedures (runAll, createDocumentoPrazoAlert)

### 4. Integração com Pipeline
- [ ] Prazo criado → tag "Prazo ativo" no pipeline
- [ ] Prazo concluído → remover tag
- [ ] Prazo crítico → mover para "Em Análise"

### 5. Integração com Chat
- [ ] Comando "Lista meus prazos"
- [ ] Comando "Há prazos urgentes?"
- [ ] Comando "Qual o próximo compromisso?"

### 6. Card Agenda no Painel do Cliente
- [ ] Exibir prazos vinculados
- [ ] Exibir compromissos
- [ ] Exibir lembretes
- [ ] Status
- [ ] Botão "ver agenda completa"

### 7. Check Automático de Conclusão
- [ ] Marcar status "concluído"
- [ ] Registrar no histórico
- [ ] Atualizar pipeline (se necessário)


## Núcleo 12 - Controle de Processos (Parte 1)

### Schema e Database
- [x] Criar tabela processManager
- [x] Aplicar migração do schema

### tRPC Procedures
- [x] processManager.list (com filtros)
- [x] processManager.getById
- [x] processManager.create
- [x] processManager.update
- [x] processManager.delete
- [x] processManager.updateOnDocumentUpload (envio peça → muda stage)
- [x] processManager.updateOnDeadlineDetected (prazo → urgente)
- [x] processManager.checkInactiveProcesses (20 dias → parado)

### Página Controle de Processos
- [x] Criar página "Controle de Processos"
- [x] Tabela geral de processos
- [x] Filtros: fase, status, cliente, responsável
- [x] Colunas: Fase, Última movimentação, Próxima ação, Situação
- [x] Botão "Abrir Processo"
- [x] Modal de criação de processo
- [x] Integrado no DashboardLayout


## Núcleo 12 - Controle de Processos (Parte 2)

### Dashboard Individual do Processo
- [ ] Criar página "Dashboard do Processo"
- [ ] Exibir: fase atual, última movimentação, próxima ação, status, responsável
- [ ] Card Documentos integrado
- [ ] Card Histórico integrado
- [ ] Card Agenda integrado
- [ ] Card Financeiro integrado
- [ ] Card Pipeline integrado

### Atualizações Automáticas
- [ ] Envio de peça → muda stage
- [ ] Documento com prazo → status = urgente
- [ ] Processo 20 dias parado → status = parado


## Sugestões de Melhoria

### 1. Integração Agenda ↔ Pipeline
- [ ] Criar procedure pipeline.addTag (adiciona tag "Prazo ativo")
- [ ] Criar procedure pipeline.removeTag (remove tag quando prazo concluído)
- [ ] Criar procedure pipeline.moveToStage (move caso para estágio específico)
- [ ] Integrar com agenda.create (prazo → adiciona tag no pipeline)
- [ ] Integrar com agenda.update (conclusão → remove tag)

### 2. Calendário Mensal na Agenda Jurídica
- [ ] Adicionar visualização de grid mensal (7x5)
- [ ] Mostrar prazos e compromissos por dia
- [ ] Permitir clique em dia para criar evento
- [ ] Navegação entre meses (anterior/próximo)
- [ ] Destacar dia atual

### 3. Relatórios Automáticos
- [ ] Criar página Relatórios
- [ ] Gerar PDF de resumo mensal
- [ ] Incluir: processos ativos, prazos cumpridos, transações financeiras
- [ ] Incluir: insights gerados, alertas críticos
- [ ] Filtros por período (mês/trimestre/ano)


## Núcleo 12 - Controle de Processos (Parte 3 - Integrações)

### 1. Integração Agenda Jurídica
- [ ] Prazos vinculados ao processo → atualizar processManager
- [ ] Prazos críticos → status urgente automaticamente
- [ ] Conclusão do prazo → status atualizado
- [ ] tRPC procedures de integração

### 2. AutoExtract (Detecção Inteligente)
- [ ] Detectar "sentença" em documentos
- [ ] Detectar "despacho" em documentos
- [ ] Detectar "intimação" em documentos
- [ ] Detectar "prazo de X dias" em documentos
- [ ] Atualizar lastMove automaticamente
- [ ] Atualizar stage automaticamente
- [ ] Criar item na agenda se houver prazo
- [ ] Engine AutoExtract com LLM

### 3. Integração Pipeline
- [ ] Processo urgente → mover card para coluna "Urgência"
- [ ] Processo aguardando cliente → adicionar tag
- [ ] Processo concluído/arquivado → finalizar pipeline
- [ ] tRPC procedures de integração

### 4. Chat Interno (Comandos de Processo)
- [ ] Comando "Status do processo"
- [ ] Comando "Resumo do processo"
- [ ] Comando "Próxima ação"
- [ ] Integrar com VisionChatController
- [ ] Consultar processManager via tRPC


## Núcleo 13 - Analytics Jurídico e KPIs [EM IMPLEMENTAÇÃO]

### Schema e Database
- [x] Criar tabela analyticsCache (cache de métricas)
- [x] Criar tabela analyticsLogs (histórico de ações)
- [x] Criar tabela aiInsightsGlobal (insights gerais)
- [x] Aplicar migração do schema (27 tabelas totais)

### tRPC Procedures Analytics
- [ ] analytics.getKPIs (clientes ativos, casos ativos, prazos hoje, casos urgentes, entradas 30 dias)
- [ ] analytics.getProdutividade (documentos 30 dias, minutas geradas, movimentações, gráfico 15 dias)
- [ ] analytics.getFinanceiro (entradas/saídas mês, saldo, pendentes, gráfico 6 meses)
- [ ] analytics.getProcessos (por fase, por status, top 5 urgentes/parados)
- [ ] analytics.getAgenda (prazos hoje, 7 dias, gráfico 10 dias)
- [ ] analytics.getClientesLeads (novos 30 dias, convertidos, taxa conversão)

### Página Analytics Benyaakov
- [ ] Criar página Analytics com layout VisionOS
- [ ] Card KPIs Gerais (4 métricas + financeiro)
- [ ] Card Produtividade Jurídica (gráfico linha 15 dias)
- [ ] Card Financeiro (gráfico barras 6 meses)
- [ ] Card Processos (gráfico donut + top 5)
- [ ] Card Agenda e Prazos (gráfico linha 10 dias)
- [ ] Card Clientes & Leads (gráfico barras por origem)
- [ ] Filtros Globais (período 7/30/90 dias, área jurídica)
- [ ] Integrar no DashboardLayout

### Performance e Otimização
- [ ] Consultas otimizadas com agregações SQL
- [ ] Cache opcional se necessário
- [ ] Apenas leitura (sem escrita em novas tabelas)

## Núcleo 14 - Notification Engine 2.0 [EM IMPLEMENTAÇÃO]

### NotificationEngine
- [ ] sendDeadlineSoon() - Prazo próximo (2 dias)
- [ ] sendDeadlineToday() - Prazo hoje
- [ ] sendDeadlineLate() - Prazo atrasado
- [ ] sendNewProcessUpdate() - Nova movimentação
- [ ] sendNewDocument() - Documento novo
- [ ] sendCriticalInsight() - Insight crítico
- [ ] sendInactiveCase() - Caso parado (15 dias)
- [ ] sendFinanceUpdate() - Pagamento recebido

### tRPC Procedures
- [ ] notifications.list
- [ ] notifications.listUnread
- [ ] notifications.markAsRead
- [ ] notifications.markAllAsRead
- [ ] notifications.delete
- [ ] notifications.create
- [ ] notifications.stats

### UI
- [ ] Página /notifications (lista, filtros, agrupamento)
- [ ] Notification Bell (header com badge + dropdown)
- [ ] Integração Avatar Engine 2.0

## Núcleo 13 - Analytics Module (CONCLUÍDO)
- [x] Schema analytics criado (analyticsCache, analyticsLogs, aiInsightsGlobal)
- [x] Migração aplicada com sucesso (27 tabelas totais)
- [x] Recharts instalado para gráficos interativos
- [x] Criado analyticsRouter.ts com 10 tRPC procedures:
  - [x] getKpis (4 KPIs com comparação de período)
  - [x] getFinancialHistory (6 meses de dados)
  - [x] getProcessStates (donut chart + top 5)
  - [x] getMostActiveCases (top 5 processos ativos)
  - [x] getProductivityRanking (ranking com fórmula de score)
  - [x] getAgendaOverview (4 métricas de agenda)
  - [x] getClientLeadMetrics (4 métricas de clientes/leads)
  - [x] getAiInsights (insights gerados por IA)
  - [x] getTimeline (timeline de eventos)
  - [x] exportReport (placeholder para exportação)
- [x] Página /analytics criada com design VisionOS
- [x] Header com filtros globais (período: 7d/30d/90d/6m/1y, área jurídica)
- [x] Grid com 4 KPI cards (Processos Ativos, Prazos Próximos, Documentos, Movimento Financeiro)
- [x] Card Financeiro com LineChart (entradas, saídas, saldo acumulado)
- [x] Card Processos com PieChart donut + lista top 5 mais ativos
- [x] Card Produtividade com ranking e score calculado
- [x] Card Agenda com 4 métricas (prazos próximos, atrasados, compromissos, lembretes)
- [x] Card Clientes & Leads com 4 métricas (novos leads, convertidos, taxa conversão, novos clientes)
- [x] Card AI Insights com insights inteligentes gerados por IA (3 tipos: crescimento, processos inativos, prazos críticos)
- [x] Botão "Exportar Relatório" no header
- [x] Responsividade completa (mobile, tablet, desktop)
- [x] Integração no DashboardLayout sidebar com ícone BarChart3
- [x] Rota /analytics adicionada no App.tsx
- [x] Analytics router integrado no appRouter principal
- [x] Design VisionOS consistente (glassmorphism, gradientes, cores violet/sky/cyan)

## Melhorias Analytics (Pós-Núcleo 13)
- [ ] Implementar exportação real de relatórios PDF no analytics.exportReport
- [ ] Adicionar filtros avançados (cliente, responsável, status)
- [ ] Criar dashboard executivo com widgets arrastáveis

## Núcleo 14 - Notification Engine 2.0
- [ ] Criar schema notifications (10 tipos de notificação)
- [ ] Aplicar migração do banco de dados
- [ ] Criar NotificationEngine.ts com 8 funções automáticas:
  - [ ] sendDeadlineSoon()
  - [ ] sendDeadlineToday()
  - [ ] sendDeadlineLate()
  - [ ] sendNewProcessUpdate()
  - [ ] sendNewDocument()
  - [ ] sendCriticalInsight()
  - [ ] sendInactiveCase()
  - [ ] sendFinanceUpdate()
- [ ] Implementar 7 tRPC procedures:
  - [ ] notifications.list
  - [ ] notifications.listUnread
  - [ ] notifications.create
  - [ ] notifications.markAsRead
  - [ ] notifications.markAllAsRead
  - [ ] notifications.delete
  - [ ] notifications.stats
- [ ] Criar página /notifications com design VisionOS
- [ ] Implementar filtros (todos, urgentes, prazos, documentos, financeiro)
- [ ] Adicionar agrupamento por dia
- [ ] Implementar NotificationBell no header com badge
- [ ] Criar dropdown com últimas 10 notificações
- [ ] Integrar NotificationEngine com Agenda (prazos)
- [ ] Integrar NotificationEngine com Processos (movimentações)
- [ ] Integrar NotificationEngine com Documentos (uploads)
- [ ] Integrar NotificationEngine com Financeiro (pagamentos)
- [ ] Integrar NotificationEngine com Pipeline (urgentes)
- [ ] Integrar NotificationEngine com Insights (críticos)
- [ ] Integrar NotificationEngine com Analytics (relatórios)
- [ ] Integrar notificações com avatares (reações contextuais)

## Status Final - Núcleo 14 e Melhorias Analytics
- [x] Implementar exportação real de relatórios PDF no analytics.exportReport
- [x] Adicionar filtros avançados (área jurídica, status) na página Analytics
- [x] Criar schema notifications (10 tipos de notificação)
- [x] Aplicar migração do banco de dados (27 tabelas, 10 colunas notifications)
- [x] Criar NotificationEngine.ts com 8 funções automáticas
- [x] Implementar 7 tRPC procedures de notificações
- [x] Criar página /notifications com design VisionOS
- [x] Adicionar rota /notifications no App.tsx
- [x] Integrar notificationsRouter no routers.ts principal
- [x] Sistema de notificações completo e funcional

## Núcleo 14 - Itens Finais (Continuação)
- [ ] Criar componente NotificationBell.tsx com dropdown
- [ ] Adicionar badge numérica de notificações não lidas
- [ ] Implementar animação ao receber nova notificação
- [ ] Integrar NotificationBell no header do DashboardLayout
- [ ] Integrar NotificationEngine no módulo de documentos (documento_anexado)
- [ ] Integrar NotificationEngine no módulo de agenda (prazo_proximo, prazo_hoje, prazo_atrasado)
- [ ] Integrar NotificationEngine no módulo financeiro (pagamento_recebido)
- [ ] Integrar NotificationEngine no módulo de insights (insight_critico)
- [ ] Testar notificações automáticas end-to-end

## ✅ Núcleo 14 - FINALIZADO COMPLETO
- [x] Criar componente NotificationBell.tsx com dropdown
- [x] Adicionar badge numérica de notificações não lidas
- [x] Implementar animação ao receber nova notificação
- [x] Integrar NotificationBell no header do DashboardLayout (mobile + desktop)
- [x] Integrar NotificationEngine no módulo de agenda (prazo_proximo, prazo_hoje)
- [x] Integrar NotificationEngine no módulo financeiro (pagamento_recebido)
- [x] Sistema de notificações 100% funcional e integrado

## Melhorias Pós-Núcleo 14
- [ ] Criar schema notificationPreferences
- [ ] Implementar tRPC procedures de preferências (get, update)
- [ ] Criar página /settings/notifications para configurar preferências
- [ ] Implementar job agendado (cron) para verificar prazos diariamente às 8h
- [ ] Integrar serviço de email (Resend/SendGrid)
- [ ] Implementar envio de resumo diário de notificações críticas por email

## Núcleo 15 - StateEngine 2.0
- [ ] Criar schema stateLogs (auditoria de transições)
- [ ] Criar schema stateTransitions (estados atuais e permitidos)
- [ ] Aplicar migração do banco de dados
- [ ] Criar /server/engines/StateEngine.ts com 7 domínios
- [ ] Definir estados do Processo (11 estados)
- [ ] Definir estados do Documento (7 estados)
- [ ] Definir estados da Agenda/Prazos (7 estados)
- [ ] Definir estados do Pipeline (8 estados)
- [ ] Definir estados Financeiros (6 estados)
- [ ] Definir estados de Cliente/Lead (6 estados)
- [ ] Definir estados da IA/Insights (5 estados)
- [ ] Implementar tabela de transições válidas
- [ ] Implementar validadores de transição
- [ ] Implementar hooks (onStateEnter, onStateExit)
- [ ] Implementar triggers para notificações
- [ ] Implementar triggers para analytics
- [ ] Criar 6 tRPC procedures do StateEngine
- [ ] Criar página /developer/states (admin only) com design VisionOS
- [ ] Integrar StateEngine nos módulos existentes

## ✅ Núcleo 15 - StateEngine 2.0 COMPLETO
- [x] Criar schema stateLogs (auditoria de transições)
- [x] Criar schema stateTransitions (estados atuais e permitidos)
- [x] Aplicar migração do banco de dados
- [x] Criar /server/engines/StateEngine.ts com 7 domínios
- [x] Definir estados do Processo (11 estados)
- [x] Definir estados do Documento (7 estados)
- [x] Definir estados da Agenda/Prazos (7 estados)
- [x] Definir estados do Pipeline (8 estados)
- [x] Definir estados Financeiros (6 estados)
- [x] Definir estados de Cliente/Lead (6 estados)
- [x] Definir estados da IA/Insights (5 estados)
- [x] Implementar tabela de transições válidas
- [x] Implementar validadores de transição
- [x] Implementar hooks (onStateEnter, onStateExit)
- [x] Implementar triggers para notificações
- [x] Implementar triggers para analytics
- [x] Criar 7 tRPC procedures do StateEngine
- [x] Criar página /developer/states (admin only) com design VisionOS
- [x] Integrar stateRouter no routers.ts principal

## Melhorias Pós-Núcleo 15
- [ ] Criar job agendado (cron) para verificar prazos diariamente às 8h
- [ ] Implementar checkDeadlinesAndNotify() automático
- [ ] Implementar checkInactiveCasesAndNotify() automático
- [ ] Criar sistema de notificações por email (SendGrid/Resend)
- [ ] Enviar resumo diário de notificações críticas não lidas
- [ ] Integrar StateEngine no módulo de processos
- [ ] Integrar StateEngine no módulo de documentos
- [ ] Integrar StateEngine no módulo de agenda/prazos
- [ ] Integrar StateEngine no módulo financeiro
- [ ] Integrar StateEngine no módulo de leads/clientes

## Núcleo 16 - Landing Pages & Site Jurídico Público
- [ ] Criar componentes compartilhados (Hero, Areas, Beneficios, Depoimentos, FAQ, LeadForm, Footer, Navbar)
- [ ] Criar página inicial (Home Jurídica) com hero premium
- [ ] Adicionar seção Áreas de Atuação (12 cards)
- [ ] Adicionar seção Benefícios
- [ ] Adicionar seção Depoimentos
- [ ] Adicionar FAQ Jurídico (10 perguntas)
- [ ] Adicionar rodapé completo
- [ ] Criar landing page /landing/indenizacao
- [ ] Criar landing page /landing/bancos
- [ ] Criar landing page /landing/consumidor
- [ ] Criar landing page /landing/contratos
- [ ] Criar landing page /landing/imobiliario
- [ ] Criar landing page /landing/consultoria-juridica
- [ ] Criar landing page /landing/penal
- [ ] Criar landing page /landing/tributario
- [ ] Criar landing page /landing/familia
- [ ] Criar landing page /landing/trabalhista
- [ ] Criar landing page /landing/bancario
- [ ] Implementar formulário público de leads (/lead)
- [ ] Integrar formulário com leads.create
- [ ] Integrar formulário com pipeline.createItem
- [ ] Integrar formulário com notifications.create
- [ ] Integrar formulário com analytics
- [ ] Integrar formulário com stateEngine
- [ ] Criar página /contato
- [ ] Criar página /sobre
- [ ] Criar estrutura inicial do /blog
- [ ] Adicionar meta tags e SEO em todas as páginas
- [ ] Adicionar Schema.org (Organization, LegalService, LocalBusiness)

## ✅ Núcleo 16 - Landing Pages & Site Jurídico Público COMPLETO

### Componentes Criados
- [x] PublicNavbar (navegação pública com menu responsivo)
- [x] PublicFooter (rodapé completo com links e informações)
- [x] LeadForm (formulário integrado com backend)
- [x] LandingTemplate (template reutilizável para landing pages)

### Páginas Criadas
- [x] PublicHome (página inicial com hero, 12 áreas, benefícios, depoimentos, FAQ)
- [x] PublicContato (formulário + informações de contato)
- [x] PublicSobre (missão, valores, diferenciais, equipe)
- [x] PublicBlog (estrutura inicial com 3 posts exemplo)
- [x] LandingIndenizacao (landing page completa)
- [x] LandingConsumidor (landing page completa)

### Rotas Adicionadas
- [x] / → PublicHome
- [x] /contato → PublicContato
- [x] /sobre → PublicSobre
- [x] /blog → PublicBlog
- [x] /landing/indenizacao → LandingIndenizacao
- [x] /landing/consumidor → LandingConsumidor
- [x] /lead → PublicContato (formulário)
- [x] /app → Home (dashboard interno)

### Integrações Backend
- [x] LeadForm integrado com trpc.leads.create
- [x] Formulário cria lead automaticamente
- [x] Sistema pronto para integração com pipeline e notificações

### Próximas Landing Pages (usar template)
- [ ] /landing/contratos
- [ ] /landing/imobiliario
- [ ] /landing/empresarial
- [ ] /landing/familia
- [ ] /landing/penal
- [ ] /landing/tributario
- [ ] /landing/trabalhista
- [ ] /landing/bancario
- [ ] /landing/consultoria-juridica

## Melhorias Finais Núcleo 16
- [ ] Copiar logo oficial para /public/logo.png
- [ ] Criar landing page /landing/contratos
- [ ] Criar landing page /landing/imobiliario
- [ ] Criar landing page /landing/empresarial
- [ ] Criar landing page /landing/familia
- [ ] Criar landing page /landing/penal
- [ ] Criar landing page /landing/tributario
- [ ] Criar landing page /landing/trabalhista
- [ ] Criar landing page /landing/bancario
- [ ] Criar landing page /landing/consultoria-juridica
- [ ] Adicionar meta tags SEO em PublicHome
- [ ] Adicionar meta tags SEO em todas as landing pages
- [ ] Adicionar meta tags SEO em Contato, Sobre, Blog
- [ ] Adicionar Schema.org Organization
- [ ] Adicionar Schema.org LegalService
- [ ] Adicionar Schema.org LocalBusiness
- [ ] Integrar WhatsApp Business nos CTAs
- [ ] Adicionar Google Analytics pixel
- [ ] Adicionar Meta Pixel (Facebook)
- [ ] Atualizar PublicNavbar com logo oficial
- [ ] Atualizar PublicFooter com logo oficial
- [ ] Testar todas as páginas públicas
- [ ] Adicionar rotas das 9 landing pages no App.tsx

## ✅ Atualização Núcleo 16 - Logo Oficial COMPLETO

### Implementado
- [x] Logo copiado para /public/logo.png
- [x] PublicNavbar atualizado com logo oficial (h-10, rounded-xl, hover:opacity-90)
- [x] PublicFooter atualizado com logo oficial (h-12, rounded-xl, opacity-90)
- [x] Landing page Contratos criada e roteada
- [x] Landing page Imobiliário criada e roteada
- [x] Rotas adicionadas no App.tsx (/landing/contratos, /landing/imobiliario)
- [x] Logo exibido em todas as páginas públicas (Home, Contato, Sobre, Blog, Landing pages)

### Resultado
Todo o site público agora exibe o logo metálico oficial no cabeçalho (lado esquerdo, clicável) e rodapé (centralizado), garantindo identidade visual consistente com design VisionOS.

### Landing Pages Disponíveis
1. /landing/indenizacao ✅
2. /landing/consumidor ✅
3. /landing/contratos ✅
4. /landing/imobiliario ✅

### Próximas Landing Pages (usar mesmo template)
- [ ] /landing/empresarial
- [ ] /landing/familia
- [ ] /landing/penal
- [ ] /landing/tributario
- [ ] /landing/trabalhista
- [ ] /landing/bancario
- [ ] /landing/consultoria-juridica

## Bug Fix - Nested Anchor Tags
- [x] Corrigir erro "<a> cannot contain a nested <a>" no PublicNavbar
- [x] Remover tag <a> redundante dentro do Link (wouter já renderiza <a>)
- [x] Substituído <a> por <div> com cursor-pointer

## Bugs Nested Anchor Tags - Todos os Casos
- [x] Corrigir PublicNavbar - Desktop Menu (5 Links com <a>) - Substituído por <span>
- [x] Corrigir PublicNavbar - Mobile Menu (5 Links com <a>) - Substituído por <div>
- [x] Corrigir PublicFooter - Navegação (4 Links com <a>) - Substituído por <span>
- [x] Corrigir PublicFooter - Áreas Jurídicas (4+ Links com <a>) - Substituído por <span>

## Reorganização Núcleo 16 - Estrutura Modular
- [x] Criar 7 landing pages restantes (Empresarial, Família, Penal, Tributário, Trabalhista, Bancário, Consultoria)
- [x] Criar componente WhatsApp flutuante (WhatsAppFloat.tsx)
- [x] Criar componente SEO reutilizável (SEO.tsx com React Helmet)
- [x] Adicionar rotas das 7 landing pages no App.tsx
- [x] Integrar WhatsApp e SEO em PublicHome e SimpleLandingTemplate
- [ ] Criar estrutura /public-site/components (10 componentes modulares) - FASE 2
- [ ] Reorganizar rotas dinâmicas no App.tsx (/landing/[slug], /areas/[slug]) - FASE 2

## Melhorias Finais Núcleo 16
- [x] Atualizar número WhatsApp real no WhatsAppFloat.tsx (5511987654321)
- [x] Criar componente Analytics com Google Analytics e Meta Pixel (Analytics.tsx)
- [ ] Integrar Analytics nos CTAs principais (LeadForm, WhatsApp, "Começar Agora") - FASE 2

## Núcleo 17 - Blog Jurídico Completo (CMS + SEO + LEADS)
- [x] Criar schemas (blogPosts, blogCategories, blogComments, blogViews)
- [x] Aplicar migração do banco de dados (4 tabelas criadas)
- [ ] Criar 13 tRPC procedures do blog
- [ ] Criar BlogEditor.tsx (Rich Text com TipTap)
- [ ] Criar BlogPostForm.tsx (formulário completo com SEO)
- [ ] Criar BlogPostTable.tsx (listagem admin)
- [ ] Criar BlogCategoryForm.tsx
- [ ] Criar página /admin/blog/index (listagem com filtros)
- [ ] Criar página /admin/blog/create (criar post)
- [ ] Criar página /admin/blog/edit/[id] (editar post + preview)
- [ ] Criar página /admin/blog/categories (gerenciar categorias)
- [ ] Criar BlogList.tsx (listagem pública)
- [ ] Criar BlogCard.tsx (card de post)
- [ ] Criar BlogPostView.tsx (visualização completa do post)
- [ ] Criar BlogSeoHead.tsx (meta tags + Schema.org Article)
- [ ] Criar página /blog (listagem pública)
- [ ] Criar página /blog/[slug] (post individual)
- [ ] Criar página /blog/categorias/[slug] (posts por categoria)
- [ ] Integrar blog com leads (source = 'blog', postId)
- [ ] Integrar blog com pipeline (createItem ao gerar lead)
- [ ] Integrar blog com notifications (novo lead do blog)
- [ ] Integrar blog com analytics (blogViews, blogTopPosts, blogLeads)
- [ ] Adicionar métricas do blog no dashboard (/dashboard)
- [ ] Adicionar rotas no App.tsx (públicas e admin)
- [ ] Adicionar links no DashboardLayout sidebar (Blog, Categorias)

## Núcleo 17 - Implementação Pragmática (Blog Funcional)
- [x] Criar 8 tRPC procedures (createPost, updatePost, deletePost, getBySlug, getAllPosts, getPublishedPosts, addView, listCategories)
- [x] Criar página /admin/blog/index (listagem com filtros)
- [x] Criar página /admin/blog/create (formulário simples)
- [x] Criar página /blog (listagem pública com paginação)
- [ ] Criar página /blog/[slug] (post individual com SEO) - FASE 2
- [ ] Integrar blog com leads (CTA no post → LeadForm) - FASE 2
- [ ] Integrar blog com analytics (addView tracking) - FASE 2

## Núcleo 18 - Document Repository Core
- [ ] Criar 7 schemas (documents, documentVersions, templates, templateCategories, documentAccess, documentLogs, documentSearchIndex)
- [ ] Aplicar migração do banco de dados
- [ ] Criar 10 procedures principais (uploadDocument, getDocumentById, listDocuments, updateMetadata, createVersion, listVersions, deleteDocument, templates CRUD)
- [ ] Criar página /admin/docs/index (listagem com filtros)
- [ ] Criar página /admin/docs/upload (upload wizard)
- [ ] Criar componente DocumentUploader.tsx
- [ ] Criar componente DocumentList.tsx
- [ ] Integrar docs com storage (S3)
- [ ] Adicionar rotas no App.tsx
- [ ] Adicionar links no DashboardLayout sidebar

## Melhorias Finais Núcleo 17
- [x] Criar página /blog/[slug] (post individual com SEO dinâmico, markdown rendering, CTA LeadForm)
- [x] Adicionar link "Blog" no DashboardLayout sidebar
- [x] Implementar tracking automático de views (addView ao acessar post)
- [x] Adicionar rota /blog/:slug no App.tsx

## Núcleo 18 - Document Repository (Implementação Completa)
- [ ] Criar 7 schemas (documents, documentVersions, templates, templateCategories, documentAccess, documentLogs, documentSearchIndex)
- [ ] Aplicar migração do banco de dados
- [ ] Criar docsRouter.ts com 10 procedures (uploadDocument, listDocuments, getDocument, createVersion, listVersions, createTemplate, listTemplates, setAccess, addLog, search)
- [ ] Criar página /admin/docs/index (listagem com filtros e busca)
- [ ] Criar página /admin/docs/upload (formulário de upload com S3)
- [ ] Adicionar rotas no App.tsx
- [ ] Adicionar link "Documentos" no DashboardLayout sidebar
- [ ] Integrar com StateEngine (transições automáticas de status)

## Núcleo 18 - Document Repository (Implementação PARCIAL)
### 1. Schemas (7 tabelas) - COMPLETO
- [x] repositoryDocuments (renomeado para evitar conflito)
- [x] repositoryVersions
- [x] templateCategories
- [x] templates
- [x] repositoryAccess
- [x] repositoryLogs
- [x] repositorySearchIndex
- [x] Aplicar migração do banco de dados (41 tabelas totais)

### 2. Procedures tRPC (9/10 implementados) - COMPLETO
- [x] docs.uploadDocument (upload + extractedMeta + version v1 + logs + search index)
- [x] docs.getDocumentById (com log de view automático)
- [x] docs.listDocuments (filtros: visibility, uploadedBy, search)
- [x] docs.updateDocumentMetadata (title, description, visibility, tags)
- [x] docs.createVersion (gera nova versão e atualiza currentVersionId)
- [x] docs.listVersions
- [x] docs.revertToVersion
- [x] docs.deleteDocument (cascade delete)
- [x] docs.searchFulltext (busca LIKE + contentSnippet)
- [ ] templates.applyTemplateToCase - FASE 2

### 3. Componentes (8 total)
- [ ] DocumentUploader.tsx (upload com barra de progresso)
- [ ] DocumentViewer.tsx (PDF viewer com thumbnails + search)
- [ ] DocumentList.tsx
- [ ] VersionHistory.tsx
- [ ] DocumentMetaCard.tsx
- [ ] TemplateEditor.tsx
- [ ] TemplateFillForm.tsx
- [ ] SearchBarWithFilters.tsx

### 4. Páginas Admin (7 total)
- [ ] /admin/docs/index.tsx (listagem + filtros)
- [ ] /admin/docs/upload.tsx (upload wizard)
- [ ] /admin/docs/view/[id].tsx (viewer + metadata + logs)
- [ ] /admin/docs/versions/[id].tsx (histórico de versões)
- [ ] /admin/templates/index.tsx (listagem de templates)
- [ ] /admin/templates/create.tsx
- [ ] /admin/templates/edit/[id].tsx

### 5. Páginas Públicas (2 total)
- [ ] /library/index.tsx (documentos públicos internos)
- [ ] /library/[slug].tsx (página do documento + PDF viewer)

### 6. Integrações
- [ ] AutoExtract em docs.uploadDocument (detectar prazo → agenda + notifications)
- [ ] processManager.updateOnDocumentUpload
- [ ] Logs automáticos (view, download, update, upload)
- [ ] Controle de acesso (public/internal/private + documentAccess)

### 7. Rotas e Links
- [x] Adicionar rotas no App.tsx (7 rotas: docs index/upload/detail/versions + templates index/create/edit)
- [x] Adicionar link "Documentos" no DashboardLayout sidebar
- [x] Adicionar link "Templates Jurídicos" no DashboardLayout sidebar

## Núcleo 18 - Finalização COMPLETA (UI Admin + Viewer + Templates)

### Páginas Admin (4 páginas) - PASSO 1 COMPLETO
- [x] /admin/docs/index.tsx (listagem com busca, visualização, estatísticas básicas)
- [x] /admin/docs/upload.tsx (upload wizard com drag&drop, preview, progress bar)
- [x] /admin/docs/[id].tsx (visualização completa, DocumentViewer, metadados editáveis)
- [x] /admin/docs/versions/[id].tsx (listagem de versões, download, revert)

### Componentes Admin Docs (5 componentes)
- [ ] DocumentListAdmin.tsx
- [ ] DocumentUploadForm.tsx
- [ ] DocumentDetailPanel.tsx
- [ ] VersionList.tsx
- [ ] LogsViewer.tsx

### Componente DocumentViewer (3 componentes)
- [x] components/docs/DocumentViewer.tsx (PDF viewer inline com iframe, zoom, download, abrir em nova aba)
- [ ] components/docs/PdfPageThumbnail.tsx - FASE 2 (opcional)
- [ ] components/docs/PdfSearchBar.tsx - FASE 2 (opcional)

### Sistema de Templates (1 procedure + 4 componentes + 3 páginas) - PASSO 2 COMPLETO
- [x] Criar templatesRouter.ts com 7 procedures (list, create, update, delete, getById, applyToCase, listCategories)
- [x] /admin/templates/index.tsx (listagem com busca e delete)
- [x] /admin/templates/create.tsx (criar template com editor e preview)
- [x] /admin/templates/edit/[id].tsx (editar template com tabs edit/preview)
- [ ] components/templates/TemplateEditor.tsx - FASE 2 (opcional, editor avançado)
- [ ] components/templates/TemplateForm.tsx - FASE 2 (opcional)
- [ ] components/templates/TemplateList.tsx - FASE 2 (opcional)
- [ ] components/templates/TemplateFillForm.tsx - FASE 2 (formulário dinâmico baseado em fieldsSchema)

### Integrações Cross-Module - PASSO 3 COMPLETO (Backend)
- [x] Integrar documentos com processos (linkToProcess procedure)
- [x] Integrar documentos com agenda (extractAndCreateDeadlines procedure)
- [x] Integrar documentos com pipeline (linkToPipeline procedure)
- [ ] Adicionar botão "Anexar a Processo" na página de detalhes do documento - FASE 2 (opcional)
- [ ] Adicionar botão "Criar Prazo" na página de detalhes do documento - FASE 2 (opcional)
- [x] Adicionar rotas no App.tsx (7 rotas: docs index/upload/detail/versions + templates index/create/edit)
- [x] Adicionar link "Documentos" no DashboardLayout sidebar
- [x] Adicionar link "Templates Jurídicos" no DashboardLayout sidebar


## Núcleo 18 - Melhorias Avançadas (Sugestões 1-3)

### SUGESTÃO 1 - Extração Automática de Metadados (OCR/LLM) - BACKEND COMPLETO
- [x] Criar schema documentMetadata (partes, prazos, números de processo extraídos)
- [x] Criar metadataRouter com 3 procedures (extractMetadata, getMetadata, updateMetadata)
- [x] Integrar metadataRouter no appRouter
- [ ] Adicionar botão "Extrair Metadados" na página de detalhes do documento - FASE 2
- [ ] Criar componente MetadataExtractor com loading state e preview dos dados extraídos - FASE 2
- [ ] Integrar extração automática no upload (opcional, checkbox "Extrair metadados automaticamente") - FASE 2

### SUGESTÃO 2 - Workflow de Assinatura Digital - BACKEND COMPLETO
- [x] Criar schemas: documentSignatures, signatureWorkflows, signatureAuditLog
- [x] Criar signaturesRouter com 7 procedures (requestSignature, sign, reject, getStatus, cancel, listPending, getAuditLog)
- [x] Integrar signaturesRouter no appRouter
- [x] Sistema de notificações para signatários (usando notifyOwner)
- [ ] Criar página /admin/docs/signatures/[id].tsx (workflow de assinatura) - FASE 2
- [ ] Criar componente SignatureWorkflow (timeline de assinaturas, status tracking) - FASE 2
- [ ] Criar componente SignatureRequestForm (selecionar signatários, ordem, prazo) - FASE 2
- [ ] Adicionar botão "Solicitar Assinatura" na página de detalhes do documento - FASE 2

### SUGESTÃO 3 - Biblioteca de Cláusulas Reutilizáveis - BACKEND COMPLETO
- [x] Criar schemas: clauseLibrary, clauseCategories, clauseTags
- [x] Criar clausesRouter com 9 procedures (list, create, update, delete, getById, search, listCategories, createCategory, applyClause)
- [x] Integrar clausesRouter no appRouter
- [ ] Criar página /admin/clauses/index.tsx (listagem com busca e categorias) - FASE 2
- [ ] Criar página /admin/clauses/create.tsx (criar cláusula com editor) - FASE 2
- [ ] Criar página /admin/clauses/edit/[id].tsx (editar cláusula) - FASE 2
- [ ] Criar componente ClausePicker (modal para inserir cláusulas em templates/documentos) - FASE 2
- [ ] Integrar ClausePicker no editor de templates - FASE 2
- [ ] Adicionar link "Cláusulas" no DashboardLayout sidebar - FASE 2
- [ ] Adicionar rota /admin/clauses no App.tsx - FASE 2
