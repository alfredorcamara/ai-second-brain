/**
 * AI SECOND BRAIN — Cockpit Bilingual I18N Engine (PT ⇄ EN)
 *
 * Features:
 * 1. Auto-detects machine/browser language on first visit (PT for pt-*, EN for all others).
 * 2. Syncs bi-directionally with local server (brain.config.json) so CLI & Cockpit share language state.
 * 3. Shares localStorage key ('asb-lang') with the public Landing Page for seamless navigation.
 * 4. Translates static HTML, attributes, and dynamic DOM mutations (MutationObserver with takeRecords guard).
 */
(() => {
    'use strict';

    const STORAGE_KEY = 'asb-lang';
    const INLINE_TAGS = new Set(['STRONG', 'EM', 'B', 'I', 'CODE', 'BR', 'A', 'SPAN', 'SMALL', 'MARK', 'KBD']);
    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'CANVAS', 'NOSCRIPT', 'IFRAME']);

    // Raw PT -> EN dictionary
    const RAW_DICT_EN = {
        // Title & Boot HUD
        "Sincronizando contratos de governança e sinapses neurais...": "Synchronizing governance contracts and neural synapses...",
        "Inicializando conexões...": "Initializing connections...",
        "Carregando cofre neural e contratos...": "Loading neural vault and contracts...",
        "Conectando ao cofre ao vivo (/api/vault)...": "Connecting to live vault (/api/vault)...",
        "Sincronizando projetos sob governança e telemetria...": "Synchronizing governed projects and telemetry...",
        "Sinapses prontas. Bem-vindo!": "Synapses ready. Welcome!",
        "Cofre Ativo": "Active Vault",
        "Contratos Vivos": "Live Contracts",

        // Sidebar & Tree Navigation
        "Buscar no cérebro...": "Search the brain...",
        "Limpar pesquisa (Esc)": "Clear search (Esc)",
        "Pergunte ao Cérebro com IA (Ctrl+K)": "Ask the Brain with AI (Ctrl+K)",
        "✨ IA": "✨ AI",
        "Ver novidades e histórico de versões": "View release notes and version history",
        "Novidades ✨": "What's New ✨",
        "Apoiar com uma estrela no GitHub": "Support with a star on GitHub",
        "⭐ Apoiar no GitHub": "⭐ Star on GitHub",
        "+ Novo": "+ New",
        "Conectar ou Criar Novo Projeto": "Connect or Create New Project",
        "CÉREBRO & GOVERNANÇA": "BRAIN & GOVERNANCE",
        "Arquivos": "Files",
        "Projetos": "Projects",
        "Visão Geral": "Overview",
        "Grafo Neural": "Neural Graph",
        "Documentação da Solução": "Solution Documentation",
        "Docs & Guias": "Docs & Guides",
        "Sistema / Core": "System / Core",
        "Guia de Projetos": "Projects Guide",
        "PROJECT.md (Visão Geral)": "PROJECT.md (Overview)",
        "CURRENT_STATE.md (Estado Atual)": "CURRENT_STATE.md (Current State)",
        "ARCHITECTURE.md (Arquitetura)": "ARCHITECTURE.md (Architecture)",
        "OVERVIEW.md (Visão Geral)": "OVERVIEW.md (Overview)",
        "Gerenciar Projeto": "Manage Project",
        "+ Adicionar com Quickstart": "+ Add with Quickstart",
        "✏️ Editar este Arquivo": "✏️ Edit this File",

        // Topbar & Vault Status Badge
        "🧠 Visão Geral": "🧠 Overview",
        "🔮 Grafo Neural": "🔮 Neural Graph",
        "📚 Documentação da Solução": "📚 Solution Documentation",
        "📘 Documentação da Solução": "📘 Solution Documentation",
        "Pergunte ao Cérebro": "Ask the Brain",
        "Configurar Conexão de IA": "Configure AI Connection",
        "Status do Cérebro": "Brain Status",
        "Ao Vivo (Disco)": "Live (Disk)",
        "<span class=\"status-dot live\"></span> Ao Vivo (Disco)": "<span class=\"status-dot live\"></span> Live (Disk)",
        "Conectado diretamente aos arquivos do projeto no disco com hot-reload.": "Connected directly to project files on disk with hot-reload.",
        "Pasta em Cache": "Cached Folder",
        "✕ Limpar Cache": "✕ Clear Cache",
        "Limpar cache e conectar ao Servidor Ao Vivo": "Clear cache and connect to Live Server",
        "Lendo arquivos da pasta em cache. Clique em Limpar Cache para voltar ao Servidor Ao Vivo.": "Reading files from cached folder. Click Clear Cache to return to Live Server.",
        "Visualizador Web Estático (Portfólio / Vercel / GitHub Pages). Para editar no disco e abrir pastas no Windows, execute localmente com \"start-brain.bat\".": "Static Web Visualizer (Portfolio / Vercel / GitHub Pages). To edit on disk and open folders on Windows, run locally with \"start-brain.bat\".",
        "Visualizando snapshot local dos arquivos. Inicie \"start-brain.bat\" para modo ao vivo.": "Viewing local file snapshot. Run \"start-brain.bat\" for live mode.",
        "AI Second Brain • Ver Novidades e Histórico": "AI Second Brain • What's New & Changelog",
        "Selecionar pasta do projeto para leitura local dinâmica": "Select project folder for dynamic local reading",
        "📂 Conectar Pasta": "📂 Connect Folder",
        "Alternar visualização": "Toggle view",
        "Alternar idioma / Switch language (PT ⇄ EN)": "Switch language / Alternar idioma (PT ⇄ EN)",

        // Graph View & HUD
        "🪐 Em Órbita": "🪐 Orbiting",
        "⏸️ Órbita Pausada": "⏸️ Orbit Paused",
        "⚡ Duplo-clique para abrir": "⚡ Double-click to open",
        "✨ Sol Central: Projeto": "✨ Central Sun: Project",
        "Pesquisar documento no grafo...": "Search document in graph...",
        "Pesquisar documento no projeto...": "Search document in project...",
        "Aproximar Zoom (+)": "Zoom In (+)",
        "Afastar Zoom (-)": "Zoom Out (-)",
        "Girar Planeta (↺)": "Rotate Planet (↺)",
        "Girar Planeta (↻)": "Rotate Planet (↻)",
        "Auto-Órbita do Planeta (🪐)": "Planet Auto-Orbit (🪐)",
        "Disparar Pulso Elétrico Sináptico (⚡)": "Trigger Synaptic Electric Pulse (⚡)",
        "Centralizar Planeta (⊙)": "Center Planet (⊙)",
        "Tela Cheia (⛶)": "Fullscreen (⛶)",
        "Alternar estilo dos nós (🧠 Neurônios / 🪐 Esferas)": "Toggle node style (🧠 Neurons / 🪐 Spheres)",
        "Mostrar ícones nos nós": "Show icons on nodes",
        "<kbd>Girar Planeta</kbd> Arrastar botão esquerdo": "<kbd>Rotate Planet</kbd> Left-click drag",
        "<kbd>Mover Câmera</kbd> Botão direito / Pan": "<kbd>Pan Camera</kbd> Right-click / Pan",
        "<kbd>Scroll</kbd> Zoom 3D": "<kbd>Scroll</kbd> 3D Zoom",
        "<kbd>Arrastar Nó</kbd> Arrasta nós interligados (física elástica)": "<kbd>Drag Node</kbd> Pulls connected nodes (elastic physics)",
        "<kbd>Clique</kbd> Selecionar e destacar rota da pasta": "<kbd>Click</kbd> Select and highlight folder path",
        "<kbd>Duplo-Clique</kbd> Abrir documento/projeto": "<kbd>Double-Click</kbd> Open document/project",
        "<kbd>N</kbd> Alternar Esferas / Neurônios": "<kbd>N</kbd> Toggle Spheres / Neurons",
        "<kbd>I</kbd> Alternar ícones nos nós": "<kbd>I</kbd> Toggle node icons",
        "<kbd>Puxar Nó</kbd> Arrastar esfera 3D": "<kbd>Pull Node</kbd> Drag 3D sphere",
        "<kbd>Zoom</kbd> Scroll roda do mouse": "<kbd>Zoom</kbd> Mouse wheel scroll",
        "<kbd>Mover</kbd> Shift + Arrastar": "<kbd>Pan</kbd> Shift + Drag",
        "<kbd>Clique</kbd> Destacar rota pasta / arquivo": "<kbd>Click</kbd> Highlight folder / file route",
        "Filtrar por camadas e configurar cores": "Filter by layers and customize colors",
        "Camadas": "Layers",
        "<span>🪐</span> Camadas & Cores": "<span>🪐</span> Layers & Colors",
        "Restaurar paleta original de cores": "Restore default color palette",
        "↺ Padrão": "↺ Default",
        "Fechar painel": "Close panel",

        // Project Workspace View
        "Nome do Projeto": "Project Name",
        "🟢 Ativo": "🟢 Active",
        "🧠 Dashboard Geral": "🧠 Main Dashboard",
        "Clique para abrir esta pasta no Explorador de Arquivos": "Click to open this folder in File Explorer",
        "Carregando caminho...": "Loading path...",
        "Copiar caminho da pasta": "Copy folder path",
        "📋 Copiar Caminho": "📋 Copy Path",
        "Copiar prompt com contexto completo para colar na sua IDE ou agente de IA": "Copy full context prompt to paste into your IDE or AI agent",
        "✨ Copiar Prompt para Agente": "✨ Copy Agent Prompt",
        "<span class=\"pw-tab-icon\">📄</span> Visão Geral": "<span class=\"pw-tab-icon\">📄</span> Overview",
        "<span class=\"pw-tab-icon\">🧮</span> Memória & Saúde": "<span class=\"pw-tab-icon\">🧮</span> Memory & Health",
        "<span class=\"pw-tab-icon\">🔮</span> Grafo Neural": "<span class=\"pw-tab-icon\">🔮</span> Neural Graph",
        "<span class=\"pw-tab-icon\">📦</span> Backup & Exportação": "<span class=\"pw-tab-icon\">📦</span> Backup & Export",
        "<span class=\"pw-tab-icon\">⚙️</span> Gerenciar & Desvincular": "<span class=\"pw-tab-icon\">⚙️</span> Manage & Unlink",
        "Carregando visão geral...": "Loading overview...",
        "Carregando laboratório de pesquisa...": "Loading research lab...",
        "Carregando diagnóstico de memória...": "Loading memory diagnostics...",
        "Carregando dados de backup...": "Loading backup data...",
        "Carregando opções de gerenciamento...": "Loading management options...",
        "Carregando laboratório de conhecimento e inteligência...": "Loading knowledge and intelligence lab...",
        "Arquivos no Projeto": "Files in Project",
        "Tamanho da Governança": "Governance Size",
        "Decisões Registradas": "Recorded Decisions",
        "Sessões de Memória": "Memory Sessions",
        "📄 Visão Geral & Contratos": "📄 Overview & Contracts",
        "⚡ Edição Rápida": "⚡ Quick Edit",
        "✕ Cancelar": "✕ Cancel",
        "📝 Editor Markdown": "📝 Markdown Editor",
        "📝 Editor Markdown Completo": "📝 Full Markdown Editor",
        "Objetivo / Missão do Projeto": "Project Goal / Mission",
        "Objetivo do Projeto": "Project Goal",
        "Stack Tecnológica": "Tech Stack",
        "Status Operacional": "Operational Status",
        "Tipo de Integração": "Integration Type",
        "Brownfield (Externo)": "Brownfield (External)",
        "Greenfield (Nativo)": "Greenfield (Native)",
        "Repositório Físico": "Physical Repository",
        "Verificados no disco": "Verified on disk",
        "👁️ Ver": "👁️ View",
        "✏️ Editar": "✏️ Edit",
        "Contratos Recomendados Disponíveis": "Recommended Contracts Available",
        "Não criado": "Not created",
        "+ Nova Decisão (ADR)": "+ New Decision (ADR)",
        "⚖️ Nenhuma decisão registrada": "⚖️ No decisions recorded",
        "Pendente (+25%)": "Pending (+25%)",
        "+ Registrar Decisão (ADR-001)": "+ Record Decision (ADR-001)",
        "(Decisão Arquitetural)": "(Architectural Decision)",
        "🔌 Pontes de IA para IDEs (.cursorrules, CLAUDE.md, etc.)": "🔌 IDE AI Bridges (.cursorrules, CLAUDE.md, etc.)",
        "Conecta este projeto à sua IDE para que o agente leia os contratos automaticamente": "Connects this project to your IDE so the agent reads contracts automatically",
        "🌐 Todas as IDEs": "🌐 All IDEs",
        "🎯 Roadmap Ativo": "🎯 Active Roadmap",
        "Clique no ✓ para retornar ao roadmap": "Click ✓ to return to roadmap",
        "+ Adicionar marco concluído...": "+ Add completed milestone...",
        "Adicionar": "Add",
        "Ações imediatas": "Immediate actions",
        "Nenhum próximo passo pendente. Parabéns! Adicione novos abaixo.": "No pending next steps. Great job! Add new ones below.",
        "✓ Concluir": "✓ Complete",
        "Digite uma nova meta / próximo passo e pressione Enter...": "Type a new goal / next step and press Enter...",
        "+ Adicionar Passo": "+ Add Step",
        "⚙️ Propriedades do Repositório": "⚙️ Repository Properties",
        "Nome do Projeto:": "Project Name:",
        "Tipo de Integração:": "Integration Type:",
        "Caminho Original:": "Original Path:",
        "Stack Declarada:": "Declared Stack:",

        // Dashboard Hero & Cards
        "Seu segundo cérebro para desenvolvimento com IA. Organiza conhecimento, decisões, memória e governança para todos os seus projetos.": "Your second brain for AI-driven development. Organizes knowledge, architectural decisions, memory, and governance across all your projects.",
        "Novo ou Conectar Projeto": "New or Connect Project",
        "Ver Grafo Neural": "View Neural Graph",
        "Abrir Documentação Completa da Solução": "Open Full Solution Documentation",
        "Documentação": "Documentation",
        "🏗️ Arquitetura do Sistema": "🏗️ System Architecture",
        "Como funciona a troca de motor de IA e as pontes no disco?": "How do AI engine switching and disk bridges work?",
        "Ajuda sobre Arquitetura do Sistema": "System Architecture Help",
        "Clique para trocar a IDE ou Agente de IA orquestrador": "Click to switch the orchestrating IDE or AI Agent",
        "Selecione sua IDE ou Agente de IA preferido": "Select your preferred IDE or AI Agent",
        "🌐 Universal (Agnóstico)": "🌐 Universal (Agnostic)",
        "Jogos / Mobile": "Games / Mobile",
        "Como funciona o fluxo de decisão e roteamento de IA?": "How does the AI decision and routing flow work?",
        "Clique para ver o princípio central da árvore de decisão": "Click to view the core principle of the decision tree",
        "TAREFA": "TASK",
        "Etapa 1: É Determinística? Clique para ver detalhes": "Step 1: Is it Deterministic? Click for details",
        "Determinística?": "Deterministic?",
        "Clique para ver: Código Determinístico Puro (Custo zero / <1ms)": "Click to view: Pure Deterministic Code (Zero cost / <1ms)",
        "SIM → CÓDIGO": "YES → CODE",
        "NÃO ↓": "NO ↓",
        "Etapa 2: É Decisão ou Classificação? Clique para ver detalhes": "Step 2: Is it a Decision or Classification? Click for details",
        "Decisão?": "Decision?",
        "Clique para ver: AIJev / Jev (Alta velocidade / Auditável)": "Click to view: AIJev / Jev (High speed / Auditable)",
        "SIM → AIJEV": "YES → AIJEV",
        "Etapa 3: Precisa Gerar Linguagem? Clique para ver detalhes": "Step 3: Does it need Language Generation? Click for details",
        "Geração?": "Generation?",
        "Clique para ver: LLM via AI Gateway (Linguagem natural)": "Click to view: LLM via AI Gateway (Natural language)",
        "SIM → LLM": "YES → LLM",
        "Etapa 4: Validação Programática Obrigatória. Clique para ver detalhes": "Step 4: Mandatory Programmatic Validation. Click for details",
        "VALIDAÇÃO": "VALIDATION",
        "📊 Métricas do Cérebro": "📊 Brain Metrics",
        "O que significa cada métrica de governança do cérebro?": "What does each brain governance metric mean?",
        "Ajuda sobre Métricas do Cérebro": "Brain Metrics Help",

        // Dashboard Projects Section
        "Projetos Sob Governança": "Governed Projects",
        "Workspaces conectados e governados pelo AI Second Brain": "Workspaces connected and governed by AI Second Brain",
        "Criar novo projeto ou vincular pasta existente": "Create new project or link existing folder",
        "<span>✨</span> Conectar Novo Projeto": "<span>✨</span> Connect New Project",
        "Buscar por nome, pasta, descrição ou tecnologia... (Pressione / para focar)": "Search by name, folder, description, or tech stack... (Press / to focus)",
        "Limpar busca": "Clear search",
        "Carregando projetos...": "Loading projects...",
        "Restaurar todos os filtros": "Reset all filters",
        "<span>↺</span> Limpar Filtros": "<span>↺</span> Clear Filters",
        "Todos os Status": "All Statuses",
        "🟢 Em Planejamento / Ativo": "🟢 Planning / Active",
        "🚀 Em Desenvolvimento Ativo": "🚀 Active Development",
        "🟡 Em Testes / Homologação": "🟡 Testing / Staging",
        "✅ Em Produção / Concluído": "✅ In Production / Completed",
        "⏸️ Pausado": "⏸️ Paused",
        "Todas as Stacks": "All Stacks",
        "<span class=\"proj-filter-label-icon\">🛡️</span> Governança": "<span class=\"proj-filter-label-icon\">🛡️</span> Governance",
        "Todas as Conformidades": "All Compliance Levels",
        "🛡️ 100% Conforme (Ouro)": "🛡️ 100% Compliant (Gold)",
        "⚠️ Pendente (< 100%)": "⚠️ Pending (< 100%)",
        "🔬 Com Research Labs": "🔬 With Research Labs",
        "<span class=\"proj-filter-label-icon\">⇅</span> Ordenar": "<span class=\"proj-filter-label-icon\">⇅</span> Sort",
        "Nome (A → Z)": "Name (A → Z)",
        "Nome (Z → A)": "Name (Z → A)",
        "Governança (Maior → Menor)": "Governance (High → Low)",
        "Mais Documentos": "Most Documents",
        "Mais Labs de Pesquisa": "Most Research Labs",
        "Nenhum projeto encontrado": "No projects found",
        "Nenhum workspace sob governança corresponde aos termos ou filtros selecionados.": "No governed workspace matches the selected search terms or filters.",
        "🔮 Grafo 3D": "🔮 3D Graph",
        "⚙️ Gerenciar": "⚙️ Manage",
        "Abrir Dashboard Completo": "Open Full Workspace Dashboard",
        "Explorar Grafo Neural 3D": "Explore 3D Neural Graph",
        "Ver Experimentos de Pesquisa": "View Research Experiments",
        "Configurar Projeto": "Configure Project",
        "Projeto arquitetado e governado pelos contratos do AI Second Brain.": "Project architected and governed by AI Second Brain contracts.",

        // ============================================================
        // SOLUTION DOCUMENTATION VIEW (#solutionDocsView) — Complete
        // ============================================================
        "Sumário da Solução": "Solution Contents",
        "1. Visão Geral & Problema": "1. Overview & Problem",
        "2. Arquitetura da Solução": "2. Solution Architecture",
        "3. Governança & Roteamento": "3. Governance & Routing",
        "3. Roteamento & AIJev": "3. AI Routing & AIJev",
        "4. Research Lab Autônomo": "4. Autonomous Research Lab",
        "5. Ciclo de Vida & Hands-on": "5. Lifecycle & Hands-on",
        "6. Grafo Neural 3D": "6. 3D Neural Graph",
        "6. Segurança & Governança": "6. Security & Governance",
        "7. Guia de Comandos & CLI": "7. Commands & CLI Guide",
        "8. Perguntas Frequentes (FAQ)": "8. Frequently Asked Questions (FAQ)",
        "🧠 Ir ao Dashboard": "🧠 Go to Dashboard",
        "✨ Conectar Projeto": "✨ Connect Project",
        "DOCUMENTAÇÃO OFICIAL DA SOLUÇÃO • ALFREDO AI OS": "OFFICIAL SOLUTION DOCUMENTATION • ALFREDO AI OS",
        "O Sistema Operacional de Governança, Memória Persistente e Pesquisa Autônoma para Desenvolvimento com Inteligência Artificial.": "The Operating System for Governance, Persistent Memory, and Autonomous Research in AI-Driven Software Development.",
        "⏱️ Leitura: ~12 minutos": "⏱️ Read time: ~12 minutes",
        "🏛️ Arquitetura: Hub Central & Satélites": "🏛️ Architecture: Central Hub & Satellites",
        "🔬 Motor: Universal AI Gateway + SSE": "🔬 Engine: Universal AI Gateway + SSE",
        "🟢 Status: 100% Operacional": "🟢 Status: 100% Operational",

        // Cap 1: Visão Geral & O Problema Real
        "Visão Geral & O Problema Real": "Overview & The Real Problem",
        "O maior gargalo atual do desenvolvimento com agentes de IA (Google Antigravity, Cursor, Claude Code) não é a capacidade de gerar código, mas sim a <strong>amnésia de contexto e a ausência de governança de longo prazo</strong>.": "Today's biggest bottleneck in developing with AI agents (Google Antigravity, Cursor, Claude Code) is not code generation capability, but rather <strong>context amnesia and the lack of long-term governance</strong>.",
        "<strong>O Risco do \"Vibe Coding\" sem Arquitetura:</strong> Desenvolver apenas trocando mensagens em chats soltos funciona nos primeiros 2 dias. Após algumas semanas, gera código duplicado, regressões silenciosas, classes desordenadas e alto custo financeiro de tokens.": "<strong>The Risk of Unarchitected \"Vibe Coding\":</strong> Developing purely by exchanging messages in loose chats works for the first 2 days. After a few weeks, it breeds duplicated code, silent regressions, tangled classes, and high token costs.",
        "Amnésia de Contexto": "Context Amnesia",
        "Cada nova janela de contexto reinicia o modelo. Sem um cérebro externo, o agente esquece por que escolheu cada biblioteca e refaz erros passados.": "Every new context window resets the model. Without an external brain, the agent forgets why each library was chosen and repeats past mistakes.",
        "Sem diretrizes de arquitetura centralizadas, a base de código degrada com padrões conflitantes a cada novo prompt.": "Without centralized architectural guidelines, the codebase degrades with conflicting patterns on every new prompt.",
        "Desperdício de Tokens": "Token Waste",
        "Uso abusivo de LLMs caros para resolver lógicas determinísticas que código simples ou motores de regras resolvem com latência zero.": "Overusing expensive LLMs to solve deterministic logic that plain code or rule engines handle with zero latency.",

        // Cap 2: Arquitetura da Solução & Camadas do Cérebro
        "Arquitetura da Solução & Camadas do Cérebro": "Solution Architecture & Brain Layers",
        "O <strong>AI Second Brain</strong> adota o padrão de <strong>Hub Central de Governança & Repositórios Satélites Físicos</strong>. O cérebro central armazena regras, memória, decisões e pesquisas, enquanto os repositórios contêm o código executável dos seus produtos.": "<strong>AI Second Brain</strong> adopts a <strong>Central Governance Hub &amp; Physical Satellite Repositories</strong> pattern. The central brain stores rules, memory, decisions, and research, while your repositories hold the executable product code.",
        "DIAGRAMA ARQUITETURAL INTERATIVO": "INTERACTIVE ARCHITECTURAL DIAGRAM",
        "● SVG Animado": "● Animated SVG",
        "Arquitetura Hub Central e Repositórios Satélites": "Central Hub and Satellite Repositories Architecture",
        "Figura 1: O Hub Central transmitindo contratos, regras e memória para múltiplos projetos satélites em qualquer stack.": "Figure 1: The Central Hub broadcasting contracts, rules, and persistent memory to multiple satellite projects across any stack.",
        "Onde Mora Cada Informação no Cérebro?": "Where Does Each Piece of Information Live in the Brain?",
        "Camada": "Layer",
        "Diretório": "Directory",
        "Finalidade Estratégica": "Strategic Purpose",
        "<strong>Regras Absolutas</strong>": "<strong>Absolute Rules</strong>",
        "Regras Absolutas": "Absolute Rules",
        "Restrições universais inegociáveis de IA, segurança e qualidade de código.": "Non-negotiable universal constraints for AI behavior, security, and code quality.",
        "<strong>Skills do Agente</strong>": "<strong>Agent Skills</strong>",
        "Skills do Agente": "Agent Skills",
        "Workflows acionáveis (onboarding de projetos, revisão arquitetural, persistência de sessão).": "Actionable workflows (project onboarding, architectural review, session persistence).",
        "<strong>Base de Conhecimento</strong>": "<strong>Knowledge Base</strong>",
        "Base de Conhecimento": "Knowledge Base",
        "Padrões conceituais universais (AI Gateway, AIJev, OWASP, Arquitetura).": "Universal conceptual patterns (AI Gateway, AIJev, OWASP, Architecture).",
        "<strong>Memória Global</strong>": "<strong>Global Memory</strong>",
        "Memória Global": "Global Memory",
        "Histórico de continuidade entre sessões (<code>current-state.md</code> e <code>lessons-learned.md</code>).": "Cross-session continuity history (<code>current-state.md</code> and <code>lessons-learned.md</code>).",
        "<strong>Projetos Governados</strong>": "<strong>Governed Projects</strong>",
        "Hub de contratos individuais (<code>PROJECT.md</code>, <code>CURRENT_STATE.md</code>, <code>BACKUPS/</code>, <code>RESEARCH/</code>).": "Hub of individual project contracts (<code>PROJECT.md</code>, <code>CURRENT_STATE.md</code>, <code>BACKUPS/</code>, <code>RESEARCH/</code>).",
        "<code>projects/&lt;nome&gt;/RESEARCH/</code>": "<code>projects/&lt;name&gt;/RESEARCH/</code>",
        "Laboratório autônomo de geração de conhecimento em duas camadas.": "Autonomous two-layer knowledge generation laboratory.",

        // Cap 3: Governança & Roteamento de IA (AIJev First)
        "Governança & Roteamento de IA (AIJev First)": "AI Governance & Routing (AIJev First)",
        "O coração da eficiência do Alfredo AI OS é o <strong>Roteamento Inteligente de Tarefas</strong>. Antes de executar qualquer ação, o agente avalia se o problema é determinístico, de decisão ou de geração.": "The heart of Alfredo AI OS efficiency is <strong>Intelligent Task Routing</strong>. Before taking any action, the agent evaluates whether the problem is deterministic, a structured decision, or open generation.",
        "FLUXO DE DECISÃO DE ENGENHARIA": "ENGINEERING DECISION FLOW",
        "Árvore de Roteamento de Decisão com IA": "AI Decision Routing Tree",
        "Figura 2: Árvore de Roteamento com priorização estrita: Código Determinístico ➔ AIJev ➔ LLM apenas quando essencial.": "Figure 2: Routing Tree with strict priority: Deterministic Code ➔ AIJev ➔ LLM only when essential.",
        "<strong>Regra de Ouro de Custo & Latência:</strong> Se uma tarefa pode ser resolvida por um cálculo, regex ou regra de negócio condicional, ela <strong>NUNCA</strong> deve ser enviada para um LLM. O modelo generativo só é convocado quando há real necessidade de síntese semântica ou geração de código inédito.": "<strong>Golden Rule of Cost &amp; Latency:</strong> If a task can be solved by a calculation, regex, or conditional business rule, it must <strong>NEVER</strong> be sent to an LLM. The generative model is only invoked when semantic synthesis or novel code generation is genuinely required.",
        "<strong>Camada Generativa 100% Agnóstica:</strong> Quando um LLM é realmente necessário, a chamada é orquestrada pelo <strong>Universal AI Gateway</strong>. Você conecta sua própria chave de API e alterna livremente entre <em>Google Gemini, Anthropic Claude, OpenAI, Groq Cloud, DeepSeek, OpenRouter</em> ou modelos locais offline via <em>Ollama</em>, com zero dependência de fornecedor único.": "<strong>100% Agnostic Generative Layer:</strong> When an LLM is truly needed, the call is orchestrated by the <strong>Universal AI Gateway</strong>. Connect your own API key and switch freely between <em>Google Gemini, Anthropic Claude, OpenAI, Groq Cloud, DeepSeek, OpenRouter</em>, or offline local models via <em>Ollama</em>, with zero vendor lock-in.",

        // Cap 4: O Laboratório de Pesquisa Autônomo (Research Lab)
        "O Laboratório de Pesquisa Autônomo (Research Lab)": "The Autonomous Research Lab",
        "O <strong>Research Lab</strong> transforma intenções brutas do desenvolvedor em pesquisas técnicas aprofundadas com dezenas de páginas de documentação, schemas de banco de dados e algoritmos prontos.": "The <strong>Research Lab</strong> turns raw developer intent into deep technical studies with dozens of pages of documentation, database schemas, and production-ready algorithms.",
        "TAXONOMIA EM DUAS CAMADAS": "TWO-LAYER TAXONOMY",
        "Taxonomia de Duas Camadas do Research Lab": "Research Lab Two-Layer Taxonomy",
        "Figura 3: Separação automática entre Fundamentos Conceituais (knowledge) e Especificações de Código (actionable).": "Figure 3: Automatic separation between Conceptual Foundations (knowledge) and Code Specifications (actionable).",
        "Camada 1: Knowledge": "Layer 1: Knowledge",
        "Arquivos conceituais contendo teorias de engenharia, arquitetura de sistemas, trade-offs e boas práticas de mercado.": "Conceptual files covering engineering theory, systems architecture, trade-offs, and industry best practices.",
        "Camada 2: Actionable": "Layer 2: Actionable",
        "Especificações práticas, schemas SQL Server / Prisma, controllers TypeScript / Node.js e testes automatizados prontos para uso.": "Practical specifications, SQL Server / Prisma schemas, TypeScript / Node.js controllers, and ready-to-use automated tests.",
        "Resiliência contra Rate Limits (IA Conectada ao Projeto)": "Rate Limit Resilience (Project-Connected AI)",
        "O motor autônomo (<code>scripts/research-engine.js</code>) opera com zero dependências externas e possui:": "The autonomous engine (<code>scripts/research-engine.js</code>) operates with zero external dependencies and features:",
        "<strong>Rate Limit Recovery com Parser Dinâmico</strong>: Extrai o tempo de espera do cabeçalho da IA e aguarda com +2s de segurança antes de retentar.": "<strong>Rate Limit Recovery with Dynamic Parser</strong>: Extracts retry-after timing from AI headers and waits with a +2s safety buffer before retrying.",
        "<strong>Cadência Preventiva de 6s</strong>: Pausa estratégica entre arquivos gerados para evitar esgotamento do bucket de TPM.": "<strong>Preventive 6s Pacing</strong>: Strategic pause between generated files to prevent exhausting the TPM bucket.",
        "<strong>Resumabilidade Automática</strong>: Detecta arquivos já catalogados no disco e não queima tokens redundantes ao retomar pesquisas.": "<strong>Automatic Resumability</strong>: Detects files already cataloged on disk and never burns redundant tokens when resuming studies.",
        "<strong>Streaming em Tempo Real (SSE)</strong>: Comunicação contínua com a interface informando exatamente qual arquivo a IA está gerando.": "<strong>Real-Time Streaming (SSE)</strong>: Continuous UI telemetry reporting the exact file currently being synthesized by AI.",

        // Cap 5: Ciclo de Vida de um Projeto na Prática (Hands-on)
        "Ciclo de Vida de um Projeto na Prática (Hands-on)": "Project Lifecycle in Practice (Hands-on)",
        "O fluxo de trabalho diário com o AI Second Brain elimina a perda de contexto e torna cada minuto de desenvolvimento produtivo:": "The daily workflow with AI Second Brain eliminates context loss and makes every development minute productive:",
        "LOOP CONTÍNUO DE DESENVOLVIMENTO": "CONTINUOUS DEVELOPMENT LOOP",
        "Ciclo Contínuo de Desenvolvimento com Zero Amnésia": "Zero-Amnesia Continuous Development Cycle",
        "Figura 4: O ciclo em 4 etapas contínuas garantindo continuidade entre qualquer sessão.": "Figure 4: The continuous 4-stage loop guaranteeing seamless continuity across every session.",
        "Etapa 1": "Step 1",
        "Início da Sessão (Prompt Bootstrap & IDE Hooks)": "Session Start (Prompt Bootstrap & IDE Hooks)",
        "No Cockpit, clique em <code>✨ Copiar Prompt para Agente</code> para colar o contexto pré-aquecido (regras, restrições e estado atual) no chat do agente. Em seguida, clique em <code>💻 VS Code</code> ou <code>⚡ Cursor</code> para abrir a pasta do projeto diretamente do navegador.": "In the Cockpit, click <code>✨ Copy Agent Prompt</code> to paste the pre-warmed context (rules, constraints, and current state) into your agent's chat. Then click <code>💻 VS Code</code> or <code>⚡ Cursor</code> to open the project folder directly from the browser.",
        "Etapa 2": "Step 2",
        "Desenvolvimento Focado com IA": "Focused AI-Assisted Development",
        "A escrita de código e arquitetura segue rigidamente as diretrizes em <code>.agents/rules/</code> e o <code>ARCHITECTURE.md</code> do projeto.": "Code writing and architecture strictly follow the guidelines in <code>.agents/rules/</code> and the project's <code>ARCHITECTURE.md</code>.",
        "Etapa 3": "Step 3",
        "Testes & Validação de Qualidade": "Testing & Quality Validation",
        "Execução de scripts, checagens de linters e testes de integração garantindo que não haja regressão.": "Running scripts, linter checks, and integration tests to guarantee zero regressions.",
        "Etapa 4": "Step 4",
        "Fechamento & Session Capture com IA (Draft & Commit)": "Wrap-Up & AI Session Capture (Draft & Commit)",
        "Ao concluir o trabalho, clique em <code>🧠 Registrar Sessão</code>. A IA inspeciona seus commits Git e arquivos alterados, sintetizando um rascunho com entregas e pendências. O desenvolvedor revisa e aprova o rascunho antes da gravação em <code>CURRENT_STATE.md</code> e <code>MEMORY/sessions/</code>.": "When finishing your work, click <code>🧠 Capture Session</code>. The AI inspects your Git commits and modified files, synthesizing a draft of deliverables and next steps. You review and approve the draft before it is committed to <code>CURRENT_STATE.md</code> and <code>MEMORY/sessions/</code>.",

        // Cap 6: Grafo Neural 3D & Recursos Visuais
        "Grafo Neural 3D & Recursos Visuais": "3D Neural Graph & Visual Capabilities",
        "O visualizador web (<code>docs/brain-ui/</code>) transforma o conhecimento abstrato em um universo interativo navegável:": "The web visualizer (<code>docs/brain-ui/</code>) transforms abstract knowledge into an interactive, navigable universe:",
        "Grafo Neural 3D (Three.js)": "3D Neural Graph (Three.js)",
        "Os projetos atuam como estrelas centrais com campo gravitacional. Regras, skills, arquivos locais e pesquisas orbitam como satélites interligados.": "Projects act as central stars with a gravitational field. Rules, skills, local files, and research studies orbit as interconnected satellites.",
        "Editor de texto completo integrado à interface com salvamento instantâneo via <code>Ctrl+S</code> direto nos arquivos do disco rígido.": "Full-featured text editor integrated into the UI with instant <code>Ctrl+S</code> saving directly to files on your hard drive.",
        "Sidebar em Árvore Hierárquica": "Hierarchical Tree Sidebar",
        "Menu lateral colapsável com linhas guias verticais, ordenação sequencial e chevrons direcionais inspirados no Obsidian e VS Code.": "Collapsible sidebar with vertical guide lines, sequential sorting, and directional chevrons inspired by Obsidian and VS Code.",

        // Cap 7: Checklists de Governança & FAQ Técnico
        "Checklists de Governança & FAQ Técnico": "Governance Checklists & Technical FAQ",
        "Checklist de Início de Tarefa:": "Task Start Checklist:",
        "Ler o <code>PROJECT.md</code> e o <code>CURRENT_STATE.md</code> do projeto relevante.": "Read the relevant project's <code>PROJECT.md</code> and <code>CURRENT_STATE.md</code>.",
        "Verificar <code>.agents/rules/</code> para restrições de arquitetura e segurança.": "Check <code>.agents/rules/</code> for architectural and security constraints.",
        "Classificar a tarefa antes de agir (Determinística, Decisão ou Geração).": "Classify the task before acting (Deterministic, Decision, or Generation).",
        "Perguntas Frequentes (FAQ)": "Frequently Asked Questions (FAQ)",
        "Como os projetos são vinculados sem duplicar arquivos?": "How are projects linked without duplicating files?",
        "No Windows, o AI Second Brain utiliza <strong>Junções NTFS (Junctions)</strong> ou symlinks de diretório. Os arquivos permanecem nos seus repositórios originais e apenas o espelho de governança é conectado ao cérebro.": "On Windows, AI Second Brain uses <strong>NTFS Junctions</strong> or directory symlinks. Your files remain in their original repositories and only the governance mirror is connected to the brain.",
        "Como o Session Capture garante a segurança de senhas e segredos (.env)?": "How does Session Capture protect passwords and secrets (.env)?",
        "O motor do Session Capture opera sob o padrão <strong>Draft & Commit</strong> com inspeção segura: arquivos de variáveis sensíveis como <code>.env</code>, chaves de API e credenciais são excluídos do diff. Além disso, nenhuma alteração é persistida na memória sem a revisão e aprovação explícita do desenvolvedor no modal.": "The Session Capture engine operates under a <strong>Draft &amp; Commit</strong> pattern with safe inspection: sensitive files like <code>.env</code>, API keys, and credentials are excluded from the diff. Furthermore, no change is persisted to memory without the developer's explicit review and approval in the modal.",
        "O que acontece se o provedor de IA atual ficar indisponível ou atingir a cota?": "What happens if the current AI provider goes down or hits its quota?",
        "O <strong>Universal AI Gateway</strong> possui resiliência ativa: monitora cabeçalhos de rate limit (429), aplica backoff exponencial automático e permite a você alternar de provedor com <strong>1 clique</strong> no Cockpit (ex: migrar instantaneamente para OpenAI, Claude, Gemini, DeepSeek ou Ollama local 100% offline). Além disso, todas as regras determinísticas e o motor AIJev rodam localmente, garantindo continuidade mesmo sem internet.": "The <strong>Universal AI Gateway</strong> has active resilience: it monitors rate-limit headers (429), applies automatic exponential backoff, and lets you switch providers with <strong>1 click</strong> in the Cockpit (e.g., instantly switch to OpenAI, Claude, Gemini, DeepSeek, or 100% offline local Ollama). Moreover, all deterministic rules and the AIJev engine run locally, ensuring continuity even without internet.",
        "Onde são salvos os backups e dossiês de governança?": "Where are governance backups and dossiers saved?",
        "Na pasta física <code>projects/&lt;nome&gt;/BACKUPS/</code>, com exportação completa em formato Markdown (legível para humanos) e JSON estruturado (auditável por scripts).": "In the physical <code>projects/&lt;name&gt;/BACKUPS/</code> folder, with full exports in both Markdown (human-readable) and structured JSON (script-auditable).",

        // Quickstart Studio (Step 1, Step 2 Greenfield "Criando Projeto do Zero" & Brownfield, Step 3)
        "← Trocar modo": "← Switch mode",
        "← Voltar aos dados": "← Back to form",
        "← Ajustar respostas": "← Adjust answers",
        "Adicionar Projeto ao AI Second Brain": "Add Project to AI Second Brain",
        "Criando Projeto do Zero": "Creating Project from Scratch",
        "Vincular Repositório Existente": "Link Existing Repository",
        "🎯 Sabatina Técnica com IA (Grill Studio)": "🎯 AI Technical Interview (Grill Studio)",
        "⚡ Síntese Neural de Governança": "⚡ Neural Governance Synthesis",
        "📄 Contratos Prontos para Revisão": "📄 Contracts Ready for Review",
        "Governança, decisões de arquitetura e memória persistente em menos de 3 minutos.": "Governance, architectural decisions, and persistent memory in under 3 minutes.",
        "O Arquiteto de IA está processando requisitos e consolidando os contratos vivos...": "The AI Architect is processing requirements and consolidating live contracts...",
        "Modo": "Mode",
        "Configuração": "Setup",
        "Conectado!": "Connected!",
        "Novo Sistema": "New System",
        "Criar Projeto do Zero": "Create Project from Scratch",
        "Ideal para novas ideias ou projetos que você vai começar agora com governança de IA.": "Ideal for new ideas or greenfield projects starting with AI governance from day one.",
        "✨ Cria <code>PROJECT.md</code> e <code>CURRENT_STATE.md</code>": "✨ Creates <code>PROJECT.md</code> and <code>CURRENT_STATE.md</code>",
        "🏗️ Template de <code>ARCHITECTURE.md</code>": "🏗️ Generates <code>ARCHITECTURE.md</code> template",
        "⚖️ Diretório de Decisões e Memória de Sessões": "⚖️ Decisions Directory & Session Memory",
        "Criar do Zero →": "Create from Scratch →",
        "Repositório Existente": "Existing Repository",
        "Vincular Projeto Existente": "Link Existing Project",
        "Conecta qualquer pasta ou repo Git que você já tem no computador sem duplicar nenhum arquivo.": "Connects any existing folder or Git repo on your machine without duplicating a single file.",
        "⚡ Junção NTFS / Symlink nativo instantâneo": "⚡ Instant native NTFS Junction / Symlink",
        "📂 Mantém seu código 100% no local original": "📂 Keeps your code 100% in its original folder",
        "🧠 Adiciona governança e memória imediatamente": "🧠 Adds governance and persistent memory immediately",
        "Vincular Pasta →": "Link Folder →",
        "Nome do Projeto <span class=\"req\">*</span>": "Project Name <span class=\"req\">*</span>",
        "Nome do Projeto": "Project Name",
        "ex: api-pagamentos, meu-saas, app-mobile. Use letras, números, hífens ou underscores.": "e.g., payments-api, my-saas, mobile-app. Use letters, numbers, hyphens, or underscores.",
        "Descrição Rápida (Opcional)": "Brief Description (Optional)",
        "<span>⛶</span> Expandir Visão": "<span>⛶</span> Expand View",
        "Expandir Visão": "Expand View",
        "Expandir no editor de documentos em tela cheia com abas de formatação e pré-visualização": "Expand in full-screen document editor with formatting and preview tabs",
        "Ajuda o Grill Studio a entender o domínio de negócio e gerar contratos cirúrgicos sem suposições.": "Helps Grill Studio understand your business domain and generate surgical contracts without guesswork.",
        "<strong>Contexto registrado!</strong> A Sabatina da IA usará este objetivo para calibrar perguntas e contratos sob medida.": "<strong>Context recorded!</strong> The AI Interview will use this goal to calibrate tailored questions and contracts.",
        "<strong>Dica:</strong> Uma breve descrição (ex: <em>\"App de receitas de bolos\"</em> ou <em>\"Microsserviço de pagamentos\"</em>) ajuda o Grill Studio a entender o domínio de negócio e gerar contratos cirúrgicos sem suposições.": "<strong>Tip:</strong> A brief description (e.g., <em>\"Cake recipe app\"</em> or <em>\"Payments microservice\"</em>) helps Grill Studio understand the business domain and generate surgical contracts without guesswork.",
        "Stack Tecnológica & Versionamento Git": "Tech Stack & Git Versioning",
        "Expandir +": "Expand +",
        "Recolher −": "Collapse −",
        "Definir Stack * • Git ✓": "Define Stack * • Git ✓",
        "Definir Stack * • Git ✕": "Define Stack * • Git ✕",
        "Stack Tecnológica Principal": "Primary Tech Stack",
        "🌐 Web & Fullstack": "🌐 Web & Fullstack",
        "⚡ Backend & APIs": "⚡ Backend & APIs",
        "📱 Mobile & Multiplataforma": "📱 Mobile & Cross-Platform",
        "✏️ Personalizada": "✏️ Custom",
        "Node.js / TypeScript (Padrão)": "Node.js / TypeScript (Default)",
        "✏️ Outra / Stack Personalizada...": "✏️ Other / Custom Stack...",
        "Digite a stack (obrigatório — ex: Elixir / Phoenix, FastAPI + SvelteKit, Bun + Elysia...)": "Enter the tech stack (required — e.g., Elixir / Phoenix, FastAPI + SvelteKit, Bun + Elysia...)",
        "Inicializar repositório Git local automaticamente (<code>git init</code>)": "Automatically initialize local Git repository (<code>git init</code>)",
        "Cria versionamento Git local, gera <code>.gitignore</code> padrão e pontes de IA instantaneamente.": "Initializes local Git, generates a secret-safe <code>.gitignore</code> and multi-AI bridges instantly.",
        "Requisitos & Documentos de Especificação": "Requirements & Specification Documents",
        "(Opcional • .md, .txt, .json)": "(Optional • .md, .txt, .json)",
        "0 arquivos": "0 files",
        "1 arquivo": "1 file",
        "📎 Anexar Arquivos (Até 5)": "📎 Attach Files (Up to 5)",
        "📋 Colar Texto / PRD": "📋 Paste Text / PRD",
        "<strong>Arraste arquivos <code>.md</code>, <code>.txt</code> ou <code>.json</code></strong> ou <span class=\"qs-dropzone-link\">clique para selecionar</span> <small>Até 5 arquivos • Máximo 1 MB total • Salvos em <code>projects/&lt;nome&gt;/SPECS/</code></small>": "<strong>Drag <code>.md</code>, <code>.txt</code>, or <code>.json</code> files</strong> or <span class=\"qs-dropzone-link\">click to browse</span> <small>Up to 5 files • Max 1 MB total • Saved in <code>projects/&lt;name&gt;/SPECS/</code></small>",
        "Arraste arquivos <code>.md</code>, <code>.txt</code> ou <code>.json</code>": "Drag <code>.md</code>, <code>.txt</code>, or <code>.json</code> files",
        "clique para selecionar": "click to browse",
        "Até 5 arquivos • Máximo 1 MB total • Salvos em <code>projects/&lt;nome&gt;/SPECS/</code>": "Up to 5 files • Max 1 MB total • Saved in <code>projects/&lt;name&gt;/SPECS/</code>",
        "Nome do arquivo (ex: requisitos.md)": "Filename (e.g., requirements.md)",
        "Arquivo que será salvo na pasta <code>SPECS/</code>": "File to be saved in the <code>SPECS/</code> folder",
        "Cole aqui o conteúdo em Markdown, texto puro ou JSON de requisitos, histórias de usuário ou PRD...": "Paste Markdown, plain text, or JSON requirements, user stories, or PRD here...",
        "Remover arquivo": "Remove file",
        "Modo de Inicialização do Projeto": "Project Initialization Mode",
        "Modo Assistido com IA (Grill Studio)": "AI-Assisted Mode (Grill Studio)",
        "Recomendado": "Recommended",
        "Sabatina técnica dinâmica adaptada à stack e às SPECS, gerando contratos ricos e roadmap ativo antes da gravação.": "Dynamic technical interview tailored to your stack and SPECS, generating rich contracts and an active roadmap before saving.",
        "🎯 Iniciar Sabatina com IA →": "🎯 Start AI Technical Interview →",
        "Modo Express (50ms)": "Express Mode (50ms)",
        "Determinístico": "Deterministic",
        "Criação imediata com contratos padrão limpos e pasta SPECS/ inicializada no disco.": "Instant creation with clean standard contracts and initialized SPECS/ folder on disk.",
        "⚡ Criar Projeto Imediato (50ms) →": "⚡ Create Project Instantly (50ms) →",
        "Criando projeto (Express)...": "Creating project (Express)...",
        "Por favor, informe o nome do projeto para prosseguir.": "Please enter the project name to proceed.",
        "Stack Tecnológica Obrigatória": "Required Tech Stack",
        "PREENCHIMENTO REQUERIDO": "REQUIRED FIELD",
        "Você selecionou a opção <strong>Outra / Stack Personalizada</strong>.<br><br>Por favor, informe a linguagem, framework ou stack tecnológica do projeto no campo correspondente antes de continuar.": "You selected <strong>Other / Custom Stack</strong>.<br><br>Please enter the project's language, framework, or tech stack in the field before continuing.",
        "Informar Stack": "Enter Stack",
        "Arquiteto de IA formulando sabatina técnica...": "AI Architect formulating technical interview...",
        "Analisando a stack e o domínio para identificar perguntas cirúrgicas sem alucinação.": "Analyzing stack and domain to craft surgical questions with zero hallucination.",
        "🎯 Decisões Arquiteturais da Sabatina": "🎯 Technical Interview Decisions",
        "🔄 Refazer perguntas com IA": "🔄 Regenerate questions with AI",
        "Descartar respostas e formular novas perguntas com IA": "Discard answers and generate new questions with AI",
        "Descartar respostas e refazer sabatina?": "Discard answers and redo interview?",
        "Formular novas perguntas com IA?": "Generate new questions with AI?",
        "Você já preencheu respostas para as perguntas atuais deste projeto.<br><br>Deseja realmente <strong>descartar as respostas</strong> e solicitar que o Arquiteto de IA formule <strong>4 novas perguntas</strong>?": "You have already answered questions for this project.<br><br>Do you really want to <strong>discard your answers</strong> and ask the AI Architect to formulate <strong>4 new questions</strong>?",
        "Deseja solicitar que o Arquiteto de IA analise a stack e formule <strong>4 novas perguntas cirúrgicas</strong> para este projeto?": "Would you like the AI Architect to analyze the stack and formulate <strong>4 new surgical questions</strong> for this project?",
        "Descartar e Refazer": "Discard & Redo",
        "Sim, Formular Novas": "Yes, Generate New",
        "Manter Atuais": "Keep Current",
        "✓ Definido": "✓ Defined",
        "Decisão Arquitetural": "Architectural Decision",
        "Decisão Técnica": "Technical Decision",
        "Decisão": "Decision",
        "Arquitetura": "Architecture",
        "Resiliência": "Resilience",
        "Logs & Métricas": "Logs & Metrics",
        "Persistência": "Persistence",
        "Autenticação": "Authentication",
        "Segurança": "Security",
        "Mensageria": "Messaging",
        "Testes & QA": "Testing & QA",
        "Integrações": "Integrations",
        "Domínio & Foco": "Domain & Focus",
        "Avançar ↵": "Next ↵",
        "Confirmar e avançar": "Confirm and advance",
        "Digite sua resposta customizada...": "Type your custom answer...",
        "Descreva sua abordagem técnica...": "Describe your technical approach...",
        "Aprofundar Sabatina (+ Perguntas)": "Deepen Interview (+ Questions)",
        "Até +4": "Up to +4",
        "Máx 8": "Max 8",
        "✓ Sabatina completa (8 perguntas)": "✓ Interview complete (8 questions)",
        "Formulando +4 perguntas com IA...": "Formulating +4 questions with AI...",
        "Deseja que o Arquiteto de IA formule mais perguntas cirúrgicas para aprofundar resiliência, observabilidade e arquitetura?": "Would you like the AI Architect to craft more surgical questions to deepen resilience, observability, and architecture?",
        "🎯 Gerar mais perguntas com IA →": "🎯 Generate more questions with AI →",
        "Gerar Contratos com IA": "Generate Contracts with AI",
        "Próxima Etapa": "Next Step",
        "Concluir a sabatina técnica e sintetizar os 4 contratos de governança (PROJECT, ARCHITECTURE, STATE e ADR-0001).": "Complete the technical interview and synthesize all 4 governance contracts (PROJECT, ARCHITECTURE, STATE, and ADR-0001).",
        "✨ Sintetizar contratos vivos →": "✨ Synthesize live contracts →",
        "Auditando coerência com IA...": "Auditing coherence with AI...",
        "Arquiteto de IA Projetando a Governança": "AI Architect Designing Governance",
        "Tempo decorrido": "Elapsed time",
        "Transformando especificações técnicas e decisões da sabatina em contratos vivos de governança.": "Transforming technical specifications and interview decisions into live governance contracts.",
        "Iniciando análise de especificações...": "Starting specification analysis...",
        "Extração de Requisitos": "Requirements Extraction",
        "Extração de Requisitos & Regras de Negócio": "Requirements & Business Rules Extraction",
        "Mapeamento de RFs e RNs": "Mapping FRs & Business Rules",
        "<span class=\"qs-synth-mini-spinner\"></span> Analisando": "<span class=\"qs-synth-mini-spinner\"></span> Analyzing",
        "<span class=\"qs-synth-mini-spinner\"></span> Sintetizando": "<span class=\"qs-synth-mini-spinner\"></span> Synthesizing",
        "<span class=\"qs-synth-mini-spinner\"></span> Modelando": "<span class=\"qs-synth-mini-spinner\"></span> Modeling",
        "<span class=\"qs-synth-mini-spinner\"></span> Formalizando": "<span class=\"qs-synth-mini-spinner\"></span> Formalizing",
        "Analisando": "Analyzing",
        "Sintetizando": "Synthesizing",
        "Modelando": "Modeling",
        "Formalizando": "Formalizing",
        "Lendo anexo para extrair requisitos funcionais, regras de negócio e modelo relacional.": "Reading attachment to extract functional requirements, business rules, and relational model.",
        "Processando documento...": "Processing document...",
        "✓ Dispensado": "✓ Skipped",
        "Sem anexo (Geração direta)": "No attachment (Direct generation)",
        "Mapeando entidades e RFs...": "Mapping entities & FRs...",
        "✓ Mapeado": "✓ Mapped",
        "RFs e RNs extraídos": "FRs & BRs extracted",
        "Análise profunda concluída": "Deep analysis completed",
        "PROJECT.md — Escopo, Visão & Personas": "PROJECT.md — Scope, Vision & Personas",
        "Escopo, Visão & Personas": "Scope, Vision & Personas",
        "Visão executiva, detalhamento exaustivo de RF-001..RF-012, personas e critérios de aceite.": "Executive vision, exhaustive FR-001..FR-012 breakdown, personas, and acceptance criteria.",
        "Escrevendo escopo e RFs...": "Writing scope & FRs...",
        "✓ Concluído": "✓ Completed",
        "Concluído": "Completed",
        "ARCHITECTURE.md — Modelagem & Engenharia": "ARCHITECTURE.md — Modeling & Engineering",
        "Modelagem & Engenharia": "Modeling & Engineering",
        "Dicionário de dados SQL Server, tabelas relacionais, rotas REST, concorrência e LGPD.": "SQL Server data dictionary, relational tables, REST routes, concurrency, and data privacy.",
        "Dicionário SQL e REST...": "SQL dictionary & REST...",
        "CURRENT_STATE.md & ADR-0001 (Padrão MADR)": "CURRENT_STATE.md & ADR-0001 (MADR Standard)",
        "Roadmap & Decisão MADR": "Roadmap & MADR Decision",
        "Roadmap em 3 marcos práticos para o Cockpit e decisão arquitetural ADR-0001 no padrão MADR.": "3-milestone practical roadmap for the Cockpit and ADR-0001 architectural decision in MADR standard.",
        "Roadmap e ADR-0001...": "Roadmap & ADR-0001...",
        "Pronto para revisão": "Ready for review",
        "✨ Todos os contratos de governança foram sintetizados com sucesso!": "✨ All governance contracts have been synthesized successfully!",
        "⏳ Na fila": "⏳ Queued",
        "Aguardando...": "Waiting...",
        "TELEMETRIA EM TEMPO REAL — PIPELINE DE ARQUITETURA": "REAL-TIME TELEMETRY — ARCHITECTURE PIPELINE",
        "A síntese está ativa e transparente. Em menos de 2 minutos você terá todos os contratos prontos para revisar e editar.": "Synthesis is active and transparent. In under 2 minutes all contracts will be ready for review and editing.",
        "<span class=\"tab-icon\">⚖️</span> ADR-0001 (Decisão)": "<span class=\"tab-icon\">⚖️</span> ADR-0001 (Decision)",
        "ADR-0001 (Decisão)": "ADR-0001 (Decision)",
        "VISUALIZANDO PROJECT.md (Visão & Escopo)": "VIEWING PROJECT.md (Vision & Scope)",
        "VISUALIZANDO ARCHITECTURE.md (Padrões & Camadas)": "VIEWING ARCHITECTURE.md (Patterns & Layers)",
        "VISUALIZANDO CURRENT_STATE.md (Roadmap Ativo)": "VIEWING CURRENT_STATE.md (Active Roadmap)",
        "VISUALIZANDO ADR-0001 (Decisão de Stack Inicial)": "VIEWING ADR-0001 (Initial Stack Decision)",
        "CONTRATO DE GOVERNANÇA": "GOVERNANCE CONTRACT",
        "Revise os termos gerados ou use o Prompt Vivo abaixo.": "Review the generated terms or use Live Prompt below.",
        "Ajustar escala / zoom do documento": "Adjust document scale / zoom",
        "Aumentar zoom (+10%)": "Zoom in (+10%)",
        "Clique para redefinir para 80%": "Click to reset to 80%",
        "Diminuir zoom (-10%)": "Zoom out (-10%)",
        "Expandir visualização em tela cheia": "Expand full-screen view",
        "⛶ Expandir": "⛶ Expand",
        "Prompt Vivo: O que você gostaria de melhorar ou ajustar?": "Live Prompt: What would you like to improve or adjust?",
        "ex: Troque o banco para PostgreSQL e adicione autenticação JWT com refresh token": "e.g., Switch database to PostgreSQL and add JWT authentication with refresh token",
        "<span>✨ Melhorar com IA</span>": "<span>✨ Improve with AI</span>",
        "✨ Melhorar com IA": "✨ Improve with AI",
        "<span>↺ Desfazer</span>": "<span>↺ Undo</span>",
        "↺ Desfazer": "↺ Undo",
        "Desfazer último ajuste da IA": "Undo last AI adjustment",
        "Refinando...": "Refining...",
        "Criando no disco...": "Creating on disk...",
        "💾 Aprovar e Criar Projeto no Disco": "💾 Approve & Create Project on Disk",
        "Caminho da Pasta no seu Computador <span class=\"req\">*</span>": "Folder Path on Your Computer <span class=\"req\">*</span>",
        "ex: C:\\Projetos\\meu-sistema ou D:\\Code\\Api": "e.g., C:\\Projects\\my-system or D:\\Code\\Api",
        "Colar caminho da área de transferência": "Paste path from clipboard",
        "📋 Colar": "📋 Paste",
        "<span class=\"status-dot snapshot\" style=\"margin-right:6px\"></span> Verificando caminho no computador...": "<span class=\"status-dot snapshot\" style=\"margin-right:6px\"></span> Checking path on your computer...",
        "✕ Pasta não encontrada no disco.": "✕ Folder not found on disk.",
        "✕ Não foi possível conectar ao servidor local.": "✕ Could not connect to local server.",
        "💡 <strong>Dica rápida:</strong> No Windows Explorer, basta clicar com o botão direito na pasta do projeto e selecionar <em>\"Copiar como caminho\"</em>.": "💡 <strong>Quick tip:</strong> In Windows Explorer, right-click the project folder and select <em>\"Copy as path\"</em>.",
        "Nome do Projeto no Segundo Cérebro <span class=\"req\">*</span>": "Project Name in Second Brain <span class=\"req\">*</span>",
        "ex: meu-sistema": "e.g., my-system",
        "Preenchido automaticamente ao validar a pasta.": "Automatically filled when validating the folder.",
        "Voltar": "Back",
        "🔗 Vincular Repositório ao Cérebro": "🔗 Link Repository to Brain",
        "Projeto Conectado com Sucesso!": "Project Connected Successfully!",
        "O AI Second Brain agora governa este projeto com governança de IA, arquitetura e memória de sessões.": "AI Second Brain now governs this project with AI rules, architecture contracts, and session memory.",
        "Visão Geral & Contratos": "Overview & Contracts",
        "Estado Atual": "Current State",
        "Decisões Técnicas": "Technical Decisions",
        "Memória de Sessões": "Session Memory",
        "📄 Abrir Documentação": "📄 Open Documentation",
        "🔮 Ver no Grafo Neural 3D": "🔮 View in 3D Neural Graph",
        "Concluir": "Finish",

        // Quickstart Validation, Clarification & Exit Modals
        "⚠️ AUDITORIA DE RESPOSTA": "⚠️ ANSWER AUDIT",
        "Ajuste Necessário na Sabatina Técnica": "Adjustment Needed in Technical Interview",
        "Identificamos uma resposta incompleta ou fora do contexto de arquitetura.": "We identified an incomplete or out-of-context architectural answer.",
        "❓ Pergunta da Sabatina:": "❓ Interview Question:",
        "❌ Resposta informada:": "❌ Submitted Answer:",
        "🔍 Diagnóstico:": "🔍 Diagnosis:",
        "💡 Sugestão do Arquiteto de IA:": "💡 AI Architect Suggestion:",
        "✏️ Corrigir Esta Resposta": "✏️ Edit This Answer",
        "⚡ Aplicar Sugestão Recomendada": "⚡ Apply Recommended Suggestion",
        "🤔 CLARIFICAÇÃO NECESSÁRIA": "🤔 CLARIFICATION NEEDED",
        "A IA precisa de mais detalhes": "AI Needs More Details",
        "Sua solicitação no Prompt Vivo gerou uma dúvida técnica que precisa ser esclarecida.": "Your Live Prompt request raised a technical question that needs clarification.",
        "✨ Sua solicitação:": "✨ Your request:",
        "❓ Dúvida do Arquiteto de IA:": "❓ AI Architect Question:",
        "💡 Motivo:": "💡 Reason:",
        "⚡ Sugestões rápidas (clique para preencher):": "⚡ Quick suggestions (click to fill):",
        "Sua resposta (obrigatória):": "Your answer (required):",
        "Digite sua resposta detalhada para orientar a IA...": "Type your detailed answer to guide the AI...",
        "⚠️ O preenchimento é obrigatório para continuar o refinamento.": "⚠️ An answer is required to continue refinement.",
        "⚡ Responder e Continuar": "⚡ Answer & Continue",
        "⚠️ LIMITE DE CRÉDITOS / RATE LIMIT (429)": "⚠️ CREDIT LIMIT / RATE LIMIT (429)",
        "Créditos de IA Esgotados": "AI Credits Exhausted",
        "O provedor de IA atingiu o limite de taxa ou cota disponível.": "The AI provider reached its rate limit or available quota.",
        "🤖 Provedor de IA:": "🤖 AI Provider:",
        "📋 Diagnóstico da Falha:": "📋 Failure Diagnosis:",
        "⏳ Janela de Redefinição Informada:": "⏳ Reported Reset Window:",
        "💡 Como Resolver Agora:": "💡 How to Fix Now:",
        "✕ Fechar": "✕ Close",
        "⚙️ Abrir Configurações de IA": "⚙️ Open AI Settings",
        "⚠️ CONFIRMAÇÃO DE SAÍDA": "⚠️ EXIT CONFIRMATION",
        "Descartar Configuração do Projeto?": "Discard Project Setup?",
        "Você já iniciou as etapas deste projeto e há dados em elaboração.": "You have already started configuring this project and there is unsaved progress.",
        "⚠️ Atenção:": "⚠️ Warning:",
        "Se fechar o assistente agora, as informações preenchidas, respostas da sabatina técnica e contratos em síntese serão <strong>descartados</strong>.": "If you close the wizard now, filled information, technical interview answers, and synthesized contracts will be <strong>discarded</strong>.",
        "💡 Para Salvar:": "💡 To Save:",
        "Para persistir os arquivos no seu disco com governança completa, continue até a última etapa e clique no botão verde <strong>\"💾 Aprovar e Criar Projeto no Disco\"</strong>.": "To persist the files to your disk with full governance, continue to the final step and click the green button <strong>\"💾 Approve &amp; Create Project on Disk\"</strong>.",
        "← Continuar Preenchendo": "← Continue Editing",
        "Sim, Descartar e Sair": "Yes, Discard & Exit",

        // Editor & Expanded Specs/Description Modals
        "👁️ PRÉ-VISUALIZAÇÃO": "👁️ PREVIEW",
        "✏️ EDITOR INTEGRADO": "✏️ INTEGRATED EDITOR",
        "👁️ PRÉ-VISUALIZAÇÃO DESCRIÇÃO": "👁️ DESCRIPTION PREVIEW",
        "👁️ PRÉ-VISUALIZAÇÃO SPECS": "👁️ SPECS PREVIEW",
        "✏️ EDITOR DE CONTRATO": "✏️ CONTRACT EDITOR",
        "👁️ PRÉ-VISUALIZAÇÃO DE CONTRATO": "👁️ CONTRACT PREVIEW",
        "📄 SPECS & REQUISITOS": "📄 SPECS & REQUIREMENTS",
        "📝 DESCRIÇÃO DO PROJETO": "📝 PROJECT DESCRIPTION",
        "PROJECT.md (Visão Geral & Domínio)": "PROJECT.md (Overview & Domain)",
        "Visualizar Arquivo": "View File",
        "👁️ Pré-visualizar": "👁️ Preview",
        "✏️ Escrever": "✏️ Edit",
        "Subtítulo": "Subtitle",
        "Seção": "Section",
        "Negrito": "Bold",
        "Itálico": "Italic",
        "Item de Lista": "List Item",
        "Checklist / Tarefa": "Checklist / Task",
        "Bloco de Código": "Code Block",
        "Nota / Citação": "Note / Quote",
        "• Lista": "• List",
        "☑ Tarefa": "☑ Task",
        "“ Nota": "“ Quote",
        "💡 Ctrl+S para salvar": "💡 Ctrl+S to save",
        "Digite seu conteúdo em Markdown aqui...": "Type your Markdown content here...",
        "Cole ou digite aqui os requisitos de sistema, histórias de usuário ou PRD em Markdown, Texto ou JSON...": "Paste or type system requirements, user stories, or PRD in Markdown, Text, or JSON here...",
        "Descreva os objetivos de negócio, problemas a resolver, funcionalidades chave ou arquitetura esperada para guiar o Arquiteto IA...": "Describe business goals, problems to solve, key features, or expected architecture to guide the AI Architect...",
        "<span class=\"status-dot\" style=\"background:#6366f1\"></span> Editando documento em tela cheia (Ctrl+S para concluir)": "<span class=\"status-dot\" style=\"background:#6366f1\"></span> Editing document in full screen (Ctrl+S to finish)",
        "Editando documento em tela cheia (Ctrl+S para concluir)": "Editing document in full screen (Ctrl+S to finish)",
        "<span class=\"status-dot\" style=\"background:#6366f1\"></span> Editando descrição em tela cheia (Ctrl+S para concluir)": "<span class=\"status-dot\" style=\"background:#6366f1\"></span> Editing description in full screen (Ctrl+S to finish)",
        "Editando descrição em tela cheia (Ctrl+S para concluir)": "Editing description in full screen (Ctrl+S to finish)",
        "<span class=\"status-dot\" style=\"background:#6366f1\"></span> Editando documento (Ctrl+S para concluir)": "<span class=\"status-dot\" style=\"background:#6366f1\"></span> Editing document (Ctrl+S to finish)",
        "Editando documento (Ctrl+S para concluir)": "Editing document (Ctrl+S to finish)",
        "<span class=\"status-dot\" style=\"background:#10b981\"></span> Modo de Edição (Ctrl+S para salvar)": "<span class=\"status-dot\" style=\"background:#10b981\"></span> Edit Mode (Ctrl+S to save)",
        "Modo de Edição (Ctrl+S para salvar)": "Edit Mode (Ctrl+S to save)",
        "<span class=\"status-dot\" style=\"background:#10b981\"></span> Modo de Pré-visualização (clique em \"Escrever\" para editar)": "<span class=\"status-dot\" style=\"background:#10b981\"></span> Preview Mode (click \"Edit\" to modify)",
        "Modo de Pré-visualização (clique em \"Escrever\" para editar)": "Preview Mode (click \"Edit\" to modify)",
        "<span class=\"status-dot snapshot\"></span> Carregando conteúdo...": "<span class=\"status-dot snapshot\"></span> Loading content...",
        "Carregando conteúdo...": "Loading content...",
        "<span class=\"status-dot\" style=\"background:#f59e0b\"></span> Arquivo novo ou vazio. Pronto para criar.": "<span class=\"status-dot\" style=\"background:#f59e0b\"></span> New or empty file. Ready to create.",
        "Arquivo novo ou vazio. Pronto para criar.": "New or empty file. Ready to create.",
        "<span class=\"status-dot snapshot\"></span> 🌐 Modo Demo: edições não são salvas no disco em produção.": "<span class=\"status-dot snapshot\"></span> 🌐 Demo Mode: edits are not saved to disk in production.",
        "🌐 Modo Demo: edições não são salvas no disco em produção.": "🌐 Demo Mode: edits are not saved to disk in production.",
        "<span class=\"status-dot snapshot\"></span> Salvando no disco...": "<span class=\"status-dot snapshot\"></span> Saving to disk...",
        "Salvando no disco...": "Saving to disk...",
        "<span>✓ Salvo!</span>": "<span>✓ Saved!</span>",
        "✓ Salvo!": "✓ Saved!",
        "<span>💾 Salvar no Disco</span>": "<span>💾 Save to Disk</span>",
        "<span class=\"status-dot snapshot\" style=\"margin-right:6px\"></span> Vinculando repositório...": "<span class=\"status-dot snapshot\" style=\"margin-right:6px\"></span> Linking repository...",
        "Vinculando repositório...": "Linking repository...",
        "ENTRADA REQUERIDA": "INPUT REQUIRED",
        "<span class=\"status-dot\" style=\"background:#f59e0b\"></span> Cota de IA Esgotada!": "<span class=\"status-dot\" style=\"background:#f59e0b\"></span> AI Quota Exhausted!",
        "Cota de IA Esgotada!": "AI Quota Exhausted!",
        "<span class=\"status-dot\" style=\"background:#f59e0b\"></span> Cota de IA esgotada.": "<span class=\"status-dot\" style=\"background:#f59e0b\"></span> AI quota exhausted.",
        "Cota de IA esgotada.": "AI quota exhausted.",
        "<span class=\"status-dot\" style=\"background:#ef4444\"></span> Título e registro da sessão não podem ficar vazios.": "<span class=\"status-dot\" style=\"background:#ef4444\"></span> Session title and log cannot be empty.",
        "Título e registro da sessão não podem ficar vazios.": "Session title and log cannot be empty.",
        "Registrar Sessão com IA": "Record Session with AI",
        "<span class=\"status-dot snapshot\"></span> Rascunho assistido por IA (Grill Studio)": "<span class=\"status-dot snapshot\"></span> AI-assisted draft (Grill Studio)",
        "Rascunho assistido por IA (Grill Studio)": "AI-assisted draft (Grill Studio)",
        "<span class=\"status-dot snapshot\"></span> Pronto para editar": "<span class=\"status-dot snapshot\"></span> Ready to edit",
        "Pronto para editar": "Ready to edit",
        "💾 Salvar no Disco": "💾 Save to Disk",
        "Voltar ao Wizard": "Back to Wizard",
        "💾 Aprovar e Criar Projeto": "💾 Approve & Create Project",
        "Voltar ao Quickstart": "Back to Quickstart",
        "✓ Concluir e Atualizar": "✓ Finish & Update",
        "Cancelar": "Cancel",
        "Confirmar": "Confirm",
        "Entendido": "Got it",
        "Entendi! Fechar": "Got it! Close",
        "💾 Salvar no Disco": "💾 Save to Disk",
        "Voltar ao Wizard": "Back to Wizard",
        "💾 Aprovar e Criar Projeto": "💾 Approve & Create Project",
        "Voltar ao Quickstart": "Back to Quickstart",
        "✓ Concluir e Atualizar": "✓ Finish & Update",
        "Prompt Vivo: O que você gostaria de melhorar ou ajustar?": "Live Prompt: What would you like to improve or adjust?",
        "✨ Melhorar com IA": "✨ Improve with AI",
        "Melhorar com IA": "Improve with AI",
        "↺ Desfazer": "↺ Undo",

        // Session Capture Modal
        "🧠 MEMÓRIA · IA ESCRIBA": "🧠 MEMORY · AI SCRIBE",
        "Registrar Sessão com IA": "Capture Session with AI",
        "A IA lê seus commits, arquivos alterados e notas e propõe o registro da sessão.": "AI inspects your commits, modified files, and notes to draft the session record.",
        "<strong>Git do projeto</strong><span>Commits desde a última sessão, arquivos alterados e diffstat. O conteúdo do código nunca é enviado.</span>": "<strong>Project Git</strong><span>Commits since last session, modified files, and diffstat. Raw source code is never sent.</span>",
        "<strong>Suas notas</strong><span>Cole o resumo do chat com o agente ou escreva livremente (opcional se houver commits).</span>": "<strong>Your notes</strong><span>Paste your agent chat summary or write freely (optional if commits exist).</span>",
        "Notas da sessão <span class=\"rl-hint\" style=\"display:inline;margin-left:6px;\">(opcional)</span>": "Session notes <span class=\"rl-hint\" style=\"display:inline;margin-left:6px;\">(optional)</span>",
        "A IA usa apenas o que estiver aqui, nos commits e nos contratos — nada é inventado. Você revisa tudo antes de gravar.": "AI uses only what is here, in your commits, and in contracts — nothing is fabricated. You review everything before saving.",
        "Escrevendo a memória da sessão…": "Writing session memory…",
        "🔍 Lendo commits e arquivos alterados no Git...": "🔍 Reading Git commits and modified files...",
        "Lendo histórico Git e arquivos modificados": "Reading Git history and modified files",
        "Cruzando com contratos (PROJECT.md, CURRENT_STATE.md)": "Cross-referencing contracts (PROJECT.md, CURRENT_STATE.md)",
        "Consultando lições aprendidas e ADRs existentes": "Consulting lessons learned and existing ADRs",
        "Sintetizando resumo de governança com IA para sua revisão": "Synthesizing AI governance summary for your review",
        "🔄 Regenerar": "🔄 Regenerate",
        "✨ Gerar rascunho": "✨ Generate draft",
        "💾 Gravar na memória": "💾 Commit to memory",

        // Research Lab Modals
        "🔬 RESEARCH LAB · IA MOTOR": "🔬 RESEARCH LAB · AI ENGINE",
        "Novo Laboratório de Pesquisa": "New Research Lab",
        "A IA contextualizará sua pesquisa com os contratos e arquitetura do projeto.": "AI will contextualize your research using the project's contracts and architecture.",
        "Tema / Título da Pesquisa <span class=\"req\">*</span>": "Research Topic / Title <span class=\"req\">*</span>",
        "💡 Sugestões rápidas:": "💡 Quick presets:",
        "Sua Intenção / O que você quer pesquisar e aprender? <span class=\"req\">*</span>": "Your Intent / What do you want to research and learn? <span class=\"req\">*</span>",
        "O <strong>Prompt Vivo</strong> pode ser alterado a qualquer momento para enriquecer ou refocar a pesquisa.": "The <strong>Live Prompt</strong> can be updated anytime to enrich or refocus your research.",
        "<span class=\"pulse-dot\"></span> Sugestão Refinada pela IA (Contexto do Projeto Aplicado)": "<span class=\"pulse-dot\"></span> AI-Refined Suggestion (Project Context Applied)",
        "✓ Aplicar ao Briefing": "✓ Apply to Brief",
        "✏️ Aplicar e Editar": "✏️ Apply & Edit",
        "✕ Descartar": "✕ Discard",
        "Sua Ideia Original": "Your Original Idea",
        "Briefing Estruturado & Contextualizado": "Structured & Contextualized Brief",
        "🔮 Subtópicos & Estrutura das Camadas": "🔮 Subtopics & Layer Structure",
        "A IA pode decompor o tema em camadas de <strong>Conhecimento Teórico</strong> e <strong>Ações Práticas</strong>.": "AI decomposes the topic into <strong>Theoretical Knowledge</strong> and <strong>Actionable Specs</strong> layers.",
        "🔮 Pré-visualizar Subtópicos": "🔮 Preview Subtopics",
        "Pronto para criar laboratório": "Ready to create lab",
        "🚀 Inicializar Laboratório": "🚀 Initialize Research Lab",
        "✏️ PROMPT VIVO · VERSIONAMENTO": "✏️ LIVE PROMPT · VERSIONING",
        "Evolução do Prompt da Pesquisa": "Research Prompt Evolution",
        "Altere o briefing a qualquer momento. Versões anteriores são preservadas no histórico.": "Update the brief anytime. Previous versions are preserved in history.",
        "Definição Atual do Laboratório": "Current Lab Definition",
        "Refinar com IA": "Refine with AI",
        "📜 Histórico de Definições Desta Pesquisa": "📜 Definition History for This Research",
        "Pronto para salvar nova versão": "Ready to save new version",
        "💾 Salvar Nova Versão (Prompt Vivo)": "💾 Save New Version (Live Prompt)",
        "🔮 TAXONOMIA · SUBTÓPICOS": "🔮 TAXONOMY · SUBTOPICS",
        "Decomposição Temática do Laboratório": "Lab Thematic Decomposition",
        "Estrutura de conhecimento planejada pela IA para esta pesquisa.": "Knowledge structure planned by AI for this research.",
        "Excluir Item": "Delete Item",
        "CONFIRMAÇÃO NECESSÁRIA": "CONFIRMATION REQUIRED",
        "Tem certeza que deseja prosseguir com esta ação?": "Are you sure you want to proceed with this action?",

        // Help Modals (Architecture, Decision Flow, Brain Metrics)
        "Guia de Governança & Integração": "Governance & Integration Guide",
        "Como Funciona a Troca de Motor de IA?": "How Does AI Engine Switching Work?",
        "<span>🧠</span> Como o Projeto & a IA sabem o que fazer na prática?": "<span>🧠</span> How Do the Project &amp; AI Know What to Do in Practice?",
        "Ferramentas como <strong>Cursor, Claude Code, Windsurf e Antigravity</strong> são programas independentes que rodam no seu sistema operacional. Elas <strong>não leem o navegador nem o painel web</strong>.": "Tools like <strong>Cursor, Claude Code, Windsurf, and Antigravity</strong> are standalone programs running on your OS. They <strong>do not read your browser or web panel</strong>.",
        "A única ponte física entre o seu Segundo Cérebro e o agente de IA é um <strong>arquivo de texto na raiz do seu repositório</strong>. O fluxo opera assim:": "The physical bridge between your Second Brain and the AI agent is a <strong>discovery text file in your repository root</strong>. Here is how it works:",
        "<span>🖥️</span> O que muda na Interface vs. no Disco?": "<span>🖥️</span> What Changes in the UI vs. on Disk?",
        "Ao alternar o motor no nó do diagrama, a interface reage visualmente com as cores da ferramenta e adapta os botões rápidos do Workspace.": "When switching the engine in the diagram node, the UI reacts visually with the tool's theme and adapts the Workspace quick buttons.",
        "<strong>🔒 Princípio de Soberania do Desenvolvedor:</strong> O sistema <em>não</em> injeta ou altera arquivos no seu repositório Git de forma invisível. Você decide quando gerar a ponte para manter seu histórico de commits 100% limpo e sob seu controle.": "<strong>🔒 Developer Sovereignty Principle:</strong> The system <em>never</em> invisibly injects or alters files in your Git repository. You decide when to generate bridges so your commit history stays 100% clean and under your control.",
        "<span>📄</span> Arquivos que cada Ferramenta lê na Raiz do Projeto": "<span>📄</span> Files Each Tool Reads in the Project Root",
        "Cada ecossistema possui seu próprio arquivo padrão de descoberta:": "Each ecosystem has its own standard discovery file:",
        "Ferramenta": "Tool",
        "Arquivo de Ponte": "Bridge File",
        "Como Opera na Prática": "How It Works in Practice",
        "Dica: Gere as pontes diretamente no Workspace do seu projeto com 1 clique.": "Tip: Generate bridges directly inside your project's Workspace with 1 click.",
        "Roteamento & Governança de Inteligência": "Intelligence Routing & Governance",
        "Como Funciona o AI Decision Flow?": "How Does the AI Decision Flow Work?",
        "<span>⚖️</span> O Princípio da Prioridade Determinística (AIJev First)": "<span>⚖️</span> The Deterministic Priority Principle (AIJev First)",
        "<span>🪜</span> As 4 Etapas da Árvore de Decisão": "<span>🪜</span> The 4 Stages of the Decision Tree",
        "<span>📋</span> Guia Prático: Onde Cada Demanda Deve Cair?": "<span>📋</span> Practical Guide: Where Should Each Task Go?",
        "Necessidade de Software": "Software Need",
        "Destino no Flow": "Flow Destination",
        "Motivo de Engenharia": "Engineering Reason",
        "Telemetria & Acervo Vivo": "Telemetry & Living Vault",
        "O que Significam as Métricas do Cérebro?": "What Do the Brain Metrics Mean?",
        "<span>🧠</span> O Índice de Inteligência & Governança": "<span>🧠</span> The Intelligence &amp; Governance Index",
        "<span>🔍</span> Entendendo Cada uma das 6 Métricas": "<span>🔍</span> Understanding Each of the 6 Metrics",

        // AI Settings Modal (BYOK)
        "Conectar Cérebro Digital": "Connect Digital Brain",
        "O motor cognitivo do <strong>AI Second Brain</strong> está pronto, mas precisa de combustível. Conecte sua própria inteligência artificial para sintetizar pesquisas no <strong>Research Lab</strong>, refinar prompts contextuais e receber análises de arquitetura em tempo real.": "The cognitive engine of <strong>AI Second Brain</strong> is ready, and just needs fuel. Connect your own AI provider to synthesize deep studies in the <strong>Research Lab</strong>, refine contextual prompts, and get real-time architectural analysis.",
        "Agora não": "Not now",
        "Configurar Agora": "Configure Now",
        "Configuração de IA": "AI Configuration",
        "Cota de Inferência Esgotada no Modelo Ativo (429)": "Inference Quota Exhausted on Active Model (429)",
        "1. Escolha o Provedor": "1. Choose Provider",
        "2. Sua API Key": "2. Your API Key",
        "Cole sua chave aqui...": "Paste your API key here...",
        "Mostrar/ocultar chave": "Show/hide key",
        "Testar e validar chave da API": "Test and validate API key",
        "3. Modelo de IA": "3. AI Model",
        "✏️ Digitar ID manualmente": "✏️ Enter model ID manually",
        "Clique em \"Testar\" acima para listar os modelos disponíveis...": "Click \"Test\" above to list available models...",
        "4. Parâmetros de Execução": "4. Execution Parameters",
        "Performance & Resiliência": "Performance & Resilience",
        "Cache TTL (Tempo de Vida)": "Cache TTL (Time to Live)",
        "Respostas de prompts idênticos são guardadas em memória pelo período configurado. Poupa tokens da sua cota e entrega sínteses repetidas com latência zero (0ms).": "Identical prompt responses are cached in memory for the configured duration. Saves quota tokens and delivers repeated syntheses with zero latency (0ms).",
        "Tentativas Automáticas (Retries)": "Automatic Retries",
        "Em instabilidades de rede ou saturação momentânea (<code>HTTP 429</code>), o Gateway efetua tentativas adicionais com backoff exponencial antes de falhar.": "During network glitches or temporary rate limits (<code>HTTP 429</code>), the Gateway automatically retries with exponential backoff before failing.",
        "Salvar e Ativar ⚡": "Save & Activate ⚡",
        "Síntese técnica autônoma e aceleração cognitiva com controle total de chaves e dados.": "Autonomous technical synthesis and cognitive acceleration with full control over keys and data.",
        "Card 1 (Security & Privacidade)": "Card 1 (Security & Privacy)",
        "<strong>Armazenamento 100% Local & Seguro</strong> — Sua chave de API é gravada exclusivamente no arquivo <code>.env</code> local na máquina. Zero envio a servidores intermediários e protegida no <code>.gitignore</code>.": "<strong>100% Local &amp; Secure Storage</strong> — Your API key is stored exclusively in your local <code>.env</code> file on your machine. Zero transmission to intermediary servers and protected by <code>.gitignore</code>.",
        "🛡️ Chaves blindadas sem telemetria em nuvem": "🛡️ Shielded keys with zero cloud telemetry",
        "🔒 Validação em memória hot-swappable em tempo real": "🔒 Real-time hot-swappable in-memory validation",
        "Card 2 (Scope & Governança)": "Card 2 (Scope & Governance)",
        "<strong>O que a IA fará no Workspace</strong> — Auxilia em pesquisas conceituais e síntese de especificações no Research Lab com rígido controle arquitetural.": "<strong>What AI Does in the Workspace</strong> — Assists with conceptual research and specification synthesis in the Research Lab under strict architectural control.",
        "🔬 Geração autônoma de especificações e artigos técnicos": "🔬 Autonomous generation of specs and technical articles",
        "⚡ Prioridade determinística: nunca usa LLM quando código resolve": "⚡ Deterministic priority: never uses LLM when plain code solves it",
        "🛑 Nenhuma ação destrutiva sem confirmação explícita do dev": "🛑 Zero destructive actions without explicit developer confirmation",
        "Aviso do Sistema": "System Notice",
        "Cota de IA Esgotada!": "AI Quota Exhausted!",
        "Configurar IA": "Configure AI",

        // Ask the Brain Modal (Ctrl+K) & RAG Help Modal
        "Entenda a inteligência do ranking e arquitetura RAG": "Understand the ranking intelligence and RAG architecture",
        "Como Funciona": "How It Works",
        "ESC para fechar": "ESC to close",
        "Faça uma pergunta sobre projetos, decisões, regras ou lições aprendidas...": "Ask a question about projects, decisions, rules, or lessons learned...",
        "Perguntar": "Ask",
        "📁 Escopo:": "📁 Scope:",
        "Todo o Cérebro (Global)": "Entire Brain (Global)",
        "🏷️ Categoria:": "🏷️ Category:",
        "Todas as Categorias": "All Categories",
        "⚖️ ADRs (Decisões Arquiteturais)": "⚖️ ADRs (Architectural Decisions)",
        "🔬 Research Lab (Pesquisas)": "🔬 Research Lab (Studies)",
        "🛡️ Regras Universais": "🛡️ Universal Rules",
        "🧠 Lições Aprendidas": "🧠 Lessons Learned",
        "📦 Contratos de Projetos": "📦 Project Contracts",
        "🕒 Recentes:": "🕒 Recent:",
        "Limpar buscas recentes": "Clear recent searches",
        "Inteligência Cognitiva do Segundo Cérebro": "Second Brain Cognitive Intelligence",
        "Pesquise decisões arquiteturais (ADRs), regras determinísticas, lições aprendidas e estado de todos os projetos conectados com citação direta de fontes e <strong>Zero Fabricação</strong>.": "Search architectural decisions (ADRs), deterministic rules, lessons learned, and the state of all connected projects with direct source citations and <strong>Zero Fabrication</strong>.",
        "Consultando sinapses neurais...": "Querying neural synapses...",
        "Recuperando trechos e sintetizando resposta verificada": "Retrieving snippets and synthesizing verified answer",
        "🛡️ Zero Fabricação": "🛡️ Zero Fabrication",
        "<span>💡</span> Resposta Sintetizada": "<span>💡</span> Synthesized Answer",
        "📋 Copiar Resposta": "📋 Copy Answer",
        "📚 Trechos & Fontes Citadas:": "📚 Cited Excerpts & Sources:",
        "ARQUITETURA & RAG": "ARCHITECTURE & RAG",
        "Como Funciona a Busca Cognitiva": "How Cognitive Search Works",
        "<span>🧠 1. Existe inteligência para classificar os arquivos?</span>": "<span>🧠 1. How are files intelligently ranked?</span>",
        "A. Multiplicadores por Autoridade de Governança": "A. Governance Authority Multipliers",
        "⚖️ ADRs & Decisões": "⚖️ ADRs & Decisions",
        "🟢 Estado Atual": "🟢 Current State",
        "📦 Contratos & Lições": "📦 Contracts & Lessons",
        "🛠️ Specs Acionáveis": "🛠️ Actionable Specs",
        "🔬 Pesquisas Gerais": "🔬 General Research",
        "B. Pontuação por Posição Estrutural no Documento": "B. Document Structural Position Scoring",
        "<span>🎯 2. Por que a síntese foca nos primeiros documentos (Top 5 a 7)?</span>": "<span>🎯 2. Why does synthesis focus on the top 5–7 documents?</span>",
        "<span>✨ 3. Progressive Disclosure (O Melhor dos Dois Mundos)</span>": "<span>✨ 3. Progressive Disclosure (The Best of Both Worlds)</span>",
        "← Voltar ao Pergunte ao Cérebro": "← Back to Ask the Brain",

        // Help Modal 1: Governance & Integration Guide (#aiEngineHelpModal)
        "1. Você seleciona a ferramenta no nó do diagrama.<br> 2. O arquivo de ponte correspondente (ex: <span style=\"color:#f43f5e;\">CLAUDE.md</span> ou <span style=\"color:#a855f7;\">.cursorrules</span>) é gravado no disco.<br> 3. Quando você abre a IDE ou roda o comando no terminal (<code style=\"color:#38bdf8;\">$ claude</code>), a IA lê esse arquivo.<br> 4. O arquivo instrui a IA a consultar os contratos oficiais: <span style=\"color:#34d399;\">PROJECT.md</span>, <span style=\"color:#34d399;\">CURRENT_STATE.md</span> e <span style=\"color:#34d399;\">DECISIONS/</span>.": "1. You select the tool in the diagram node.<br> 2. The corresponding bridge file (e.g., <span style=\"color:#f43f5e;\">CLAUDE.md</span> or <span style=\"color:#a855f7;\">.cursorrules</span>) is written to disk.<br> 3. When you open the IDE or run the command in the terminal (<code style=\"color:#38bdf8;\">$ claude</code>), the AI reads that file.<br> 4. The file instructs the AI to consult the official contracts: <span style=\"color:#34d399;\">PROJECT.md</span>, <span style=\"color:#34d399;\">CURRENT_STATE.md</span>, and <span style=\"color:#34d399;\">DECISIONS/</span>.",
        "Ao rodar <code>claude</code> no terminal, ele lê o arquivo e segue o Segundo Cérebro.": "When running <code>claude</code> in the terminal, it reads the file and follows the Second Brain.",
        "O agente do Cursor carrega as regras automaticamente em cada prompt e chat.": "Cursor's agent automatically loads the rules in every prompt and chat.",
        "O Cascade Agent aplica as diretrizes de arquitetura e decisões registradas.": "The Cascade Agent applies the architectural guidelines and recorded decisions.",
        "O assistente nativo lê regras de <code>.agents/rules/</code> e governança central.": "The native assistant reads rules from <code>.agents/rules/</code> and central governance.",
        "Instruções personalizadas no diretório <code>.github/</code>.": "Custom instructions in the <code>.github/</code> directory.",
        "Diretrizes mandatórias para execução autônoma de tarefas no VS Code.": "Mandatory guidelines for autonomous task execution in VS Code.",
        "<strong style=\"color: #6ee7b7; display: block; margin-bottom: 4px; font-size: 13.5px;\">💡 Super-Poder: Coexistência Sem Conflitos!</strong> Todas essas pontes podem conviver na mesma pasta do projeto. Você pode usar Cursor pela manhã, Claude Code à tarde no terminal e Antigravity à noite: <strong>todas as IAs compartilharão a mesma memória, os mesmos contratos e as mesmas decisões arquiteturais!</strong>": "<strong style=\"color: #6ee7b7; display: block; margin-bottom: 4px; font-size: 13.5px;\">💡 Superpower: Conflict-Free Coexistence!</strong> All these bridges can coexist in the same project folder. You can use Cursor in the morning, Claude Code in the terminal in the afternoon, and Antigravity at night: <strong>all AIs will share the exact same memory, contracts, and architectural decisions!</strong>",
        "💡 Super-Poder: Coexistência Sem Conflitos!": "💡 Superpower: Conflict-Free Coexistence!",

        // Help Modal 2: Intelligence Routing & Governance (#aiDecisionFlowHelpModal)
        "No desenvolvimento assistido por IA, o erro mais comum e custoso é usar <strong>LLMs generativos para tudo</strong>. Modelos generativos trazem latência em segundos, custos contínuos de tokens e risco de alucinação em regras de negócio críticas.": "In AI-assisted development, the most common and costly mistake is using <strong>generative LLMs for everything</strong>. Generative models introduce multi-second latency, ongoing token costs, and hallucination risks in critical business rules.",
        "O <strong>AI Decision Flow</strong> estabelece uma hierarquia rigorosa: <strong style=\"color: #f8fafc;\">código puro sempre que possível, árvores de decisão estruturadas (AIJev) para classificações, e LLMs apenas para geração textual aberta ou raciocínio não-estruturado.</strong>": "The <strong>AI Decision Flow</strong> establishes a strict hierarchy: <strong style=\"color: #f8fafc;\">pure code whenever possible, structured decision trees (AIJev) for classifications, and LLMs only for open text generation or unstructured reasoning.</strong>",
        "1. É Determinística? → CÓDIGO PURO / REGRA": "1. Is it Deterministic? → PURE CODE / RULE",
        "Custo Zero · Latência &lt;1ms": "Zero Cost · Latency &lt;1ms",
        "Custo Zero · Latência <1ms": "Zero Cost · Latency <1ms",
        "Cálculos matemáticos, validação de campos, expressões regulares, operadores lógicos (<code>if/else</code>) e consultas SQL padrão. Se a resposta pode ser expressa por matemática ou regras exatas, <strong>NUNCA use IA</strong>.": "Mathematical calculations, field validation, regular expressions, logical operators (<code>if/else</code>), and standard SQL queries. If the answer can be expressed by math or exact rules, <strong>NEVER use AI</strong>.",
        "2. É Decisão ou Classificação? → AIJEV / JEV": "2. Is it a Decision or Classification? → AIJEV / JEV",
        "Alta Velocidade · 100% Auditável": "High Speed · 100% Auditable",
        "Roteamento de eventos, triagem de severidade de erros, aprovação de pedidos, classificação de risco ou priorização de alertas. O AIJev avalia o estado atual contra opções tipadas e retorna probabilidades numéricas explicáveis, sem texto prolixo.": "Event routing, error severity triage, order approval, risk classification, or alert prioritization. AIJev evaluates current state against typed options and returns explainable numerical probabilities without verbose text.",
        "3. Precisa Gerar Linguagem? → LLM (AI GATEWAY)": "3. Does it Need Language Generation? → LLM (AI GATEWAY)",
        "Raciocínio Aberto · Linguagem Natural": "Open Reasoning · Natural Language",
        "Redigir e-mails, resumir históricos técnicos, sintetizar relatórios ou gerar código. Acesso via <strong>AI Gateway</strong> com provedores dinâmicos (Claude, Gemini, OpenAI, Groq, Ollama) com fallback automático, cache e observabilidade.": "Drafting emails, summarizing technical history, synthesizing reports, or generating code. Accessed via <strong>AI Gateway</strong> with dynamic providers (Claude, Gemini, OpenAI, Groq, Ollama) featuring automatic fallback, caching, and observability.",
        "4. Fechamento Obrigatório: VALIDAÇÃO PROGRAMÁTICA": "4. Mandatory Closure: PROGRAMMATIC VALIDATION",
        "Blindagem de Segurança": "Security Shielding",
        "Nenhum output produzido por LLM é gravado em disco ou executado cegamente. O resultado passa por validação determinística de schemas (JSON Schema / Zod), checagem de tipos e revisão humana de segurança.": "No LLM output is written to disk or executed blindly. Every result undergoes deterministic schema validation (JSON Schema / Zod), type checking, and human security review.",
        "Cálculo de juros, desconto ou conciliação": "Interest calculation, discount, or reconciliation",
        "<span style=\"color:#34d399; font-weight:600;\">Código Puro</span>": "<span style=\"color:#34d399; font-weight:600;\">Pure Code</span>",
        "Determinismo matemático absoluto; custo zero.": "Absolute mathematical determinism; zero cost.",
        "Classificar severidade de falha em SQL Job": "Classify SQL Job failure severity",
        "<span style=\"color:#fbbf24; font-weight:600;\">AIJev / Regras</span>": "<span style=\"color:#fbbf24; font-weight:600;\">AIJev / Rules</span>",
        "AIJev / Regras": "AIJev / Rules",
        "Decisão rápida, probabilística e explicável para auditoria.": "Fast, probabilistic, and explainable decision for auditing.",
        "Roteamento de chamado para suporte nível 1 ou 2": "Ticket routing to Tier 1 or Tier 2 support",
        "Categorização direta por padrões sem gasto de tokens.": "Direct pattern categorization with zero token cost.",
        "Gerar explicação humana de incidente para diretoria": "Generate human-readable incident summary for leadership",
        "<span style=\"color:#38bdf8; font-weight:600;\">LLM (Gateway)</span>": "<span style=\"color:#38bdf8; font-weight:600;\">LLM (Gateway)</span>",
        "Capacidade de síntese e nuances de linguagem natural.": "Synthesis capability and natural language nuance.",
        "Persistir sessão ou alterar código do repositório": "Persist session or modify repository code",
        "<span style=\"color:#c084fc; font-weight:600;\">Validação</span>": "<span style=\"color:#c084fc; font-weight:600;\">Validation</span>",
        "Validação": "Validation",
        "Garante integridade antes de qualquer alteração no disco.": "Guarantees integrity before any disk modification.",
        "<strong style=\"color: #6ee7b7; display: block; margin-bottom: 4px; font-size: 13.5px;\">💡 Como Usar no Seu Dia a Dia:</strong> Ao pedir uma nova funcionalidade no chat do agente, ative a skill <code>ai-decision-gate</code>. O agente analisará a demanda e apresentará a divisão exata entre regras determinísticas, AIJev e LLM antes de escrever o código.": "<strong style=\"color: #6ee7b7; display: block; margin-bottom: 4px; font-size: 13.5px;\">💡 How to Use in Your Daily Workflow:</strong> When requesting a new feature in your agent chat, activate the <code>ai-decision-gate</code> skill. The agent will analyze the request and present the exact breakdown between deterministic rules, AIJev, and LLM before writing code.",
        "💡 Como Usar no Seu Dia a Dia:": "💡 How to Use in Your Daily Workflow:",
        "Documentação técnica completa em <code>knowledge/ai/AIJEV.md</code> e <code>GEMINI.md</code>.": "Full technical documentation in <code>knowledge/ai/AIJEV.md</code> and <code>GEMINI.md</code>.",

        // Help Modal 3: Telemetry & Living Vault (#brainMetricsHelpModal)
        "As <strong>Métricas do Cérebro</strong> refletem o volume e a densidade de inteligência do seu workspace. Elas monitoram os 6 pilares estruturais que mantêm o desenvolvimento com IA seguro, ágil e livre de amnésia técnica entre sessões.": "<strong>Brain Metrics</strong> reflect the volume and intelligence density of your workspace. They monitor the 6 structural pillars that keep AI development safe, agile, and free of technical amnesia across sessions.",
        "RULES (Regras Absolutas)": "RULES (Absolute Rules)",
        "Diretrizes invioláveis em <code>.agents/rules/</code> (Segurança, C#, SQL Server, Zero Fabricação de Contexto). O agente é obrigado a consultá-las antes de propor qualquer alteração de código.": "Inviolable guidelines in <code>.agents/rules/</code> (Security, C#, SQL Server, Zero Context Fabrication). The agent is required to consult them before proposing any code change.",
        "SKILLS (Playbooks Operacionais)": "SKILLS (Operational Playbooks)",
        "Procedimentos padronizados em <code>.agents/skills/</code> (como <code>project-onboarding</code>, <code>new-feature</code>, <code>bug-investigation</code>, <code>session-memory</code>). Garantem processos consistentes de engenharia.": "Standardized procedures in <code>.agents/skills/</code> (such as <code>project-onboarding</code>, <code>new-feature</code>, <code>bug-investigation</code>, <code>session-memory</code>). Ensure consistent engineering workflows.",
        "PROJECTS (Projetos Conectados)": "PROJECTS (Connected Projects)",
        "O total de repositórios governados em <code>projects/</code> (Greenfield e Brownfield). Cada projeto mantém seus contratos (<code>PROJECT.md</code>, <code>CURRENT_STATE.md</code>) e histórico totalmente isolados.": "Total governed repositories in <code>projects/</code> (Greenfield and Brownfield). Each project keeps its contracts (<code>PROJECT.md</code>, <code>CURRENT_STATE.md</code>) and history completely isolated.",
        "KNOWLEDGE (Base de Conhecimento)": "KNOWLEDGE (Knowledge Base)",
        "Guias conceituais e padrões arquiteturais em <code>knowledge/</code> (AI Gateway, AIJev, Seleção de Modelos). Serve de base teórica compartilhada para todos os projetos do workspace.": "Conceptual guides and architectural patterns in <code>knowledge/</code> (AI Gateway, AIJev, Model Selection). Serves as a shared theoretical foundation across all workspace projects.",
        "DECISIONS (ADRs Arquiteturais)": "DECISIONS (Architectural ADRs)",
        "Registros Imutáveis de Decisões Arquiteturais em <code>DECISIONS/</code>. Registram por que uma tecnologia foi adotada, impedindo que IAs futuras revertam decisões tomadas no passado.": "Immutable Architecture Decision Records in <code>DECISIONS/</code>. Document why a technology was chosen, preventing future AI sessions from reverting past decisions.",
        "MEMORY (Memória & Sessões)": "MEMORY (Memory & Sessions)",
        "Registros diários de trabalho (<code>MEMORY/sessions/</code>) e lições aprendidas (<code>LESSONS_LEARNED.md</code>). Permitem que qualquer agente retome o contexto sem perda de tempo.": "Daily work logs (<code>MEMORY/sessions/</code>) and lessons learned (<code>LESSONS_LEARNED.md</code>). Allow any agent to resume context with zero wasted time.",
        "<strong style=\"color: #7dd3fc; display: block; margin-bottom: 4px; font-size: 13.5px;\">🔄 Sincronização Automática em Tempo Real:</strong> Esses contadores são computados a partir dos arquivos físicos do seu workspace e atualizados no carregamento do Cockpit. Eles alimentam diretamente os nós visíveis no <strong>Grafo Neural 3D</strong>.": "<strong style=\"color: #7dd3fc; display: block; margin-bottom: 4px; font-size: 13.5px;\">🔄 Automatic Real-Time Synchronization:</strong> These counters are computed from the physical files in your workspace and updated when the Cockpit loads. They directly feed the visible nodes in the <strong>3D Neural Graph</strong>.",
        "🔄 Sincronização Automática em Tempo Real:": "🔄 Automatic Real-Time Synchronization:",
        "Dica: Use o botão <code>+ Novo ou Conectar Projeto</code> para expandir seu ecossistema.": "Tip: Use the <code>+ New or Connect Project</code> button to expand your ecosystem.",

        // Help Modal 4: How Cognitive Search Works (#askBrainHelpModal)
        "<strong>Sim, e ela é multifatorial e determinística.</strong> O motor em <code>scripts/brain-search.js</code> não faz um simples <code>indexOf()</code>. Ele implementa uma adaptação de <strong>TF-IDF / BM25</strong> combinada com <strong>pesos semânticos de arquitetura</strong>:": "<strong>Yes — it is multifactorial and deterministic.</strong> The engine in <code>scripts/brain-search.js</code> doesn't just run a simple <code>indexOf()</code>. It implements an adaptation of <strong>TF-IDF / BM25</strong> combined with <strong>semantic architectural weights</strong>:",
        "Decisões arquiteturais oficiais têm prioridade máxima absoluta no cofre.": "Official architectural decisions have absolute top priority in the vault.",
        "<code>CURRENT_STATE.md</code> reflete exatamente o que está rodando agora.": "<code>CURRENT_STATE.md</code> reflects exactly what is running right now.",
        "Diretrizes em <code>.agents/rules/</code> e governança determinística.": "Guidelines in <code>.agents/rules/</code> and deterministic governance.",
        "Códigos e schemas em <code>RESEARCH/.../actionable/</code>.": "Code and schemas in <code>RESEARCH/.../actionable/</code>.",
        "Fundamentos conceituais em <code>knowledge/</code> do Research Lab.": "Conceptual foundations in <code>knowledge/</code> inside Research Lab.",
        "<strong>Match Exato da Pergunta</strong>: Se a frase inteira bater no título (+90) ou no corpo (+70).": "<strong>Exact Query Match</strong>: If the full phrase matches in the title (+90) or body (+70).",
        "<strong>Cabeçalhos Markdown (# H1, ## H2)</strong>: Se o termo for título de seção, o documento dedica um capítulo inteiro àquele tema.": "<strong>Markdown Headings (# H1, ## H2)</strong>: If the term is a section heading, the document dedicates an entire chapter to that topic.",
        "<strong>Nome do Arquivo</strong>: +40 se for idêntico ao termo, +20 se contiver a palavra.": "<strong>Filename</strong>: +40 if identical to the term, +20 if it contains the word.",
        "<strong>Bônus de Cobertura Total</strong>: Documentos que cobrem todas as palavras digitadas pelo desenvolvedor.": "<strong>Full Coverage Bonus</strong>: Documents covering all keywords entered by the developer.",
        "<strong>Frequência no Corpo</strong>: 4 pts por ocorrência (com teto anti-spam para evitar viés).": "<strong>Body Frequency</strong>: 4 pts per occurrence (with anti-spam cap to prevent bias).",
        "+4 pts / un": "+4 pts / ea",
        "Essa calibração é o <strong>padrão ouro em engenharia RAG (Retrieval-Augmented Generation)</strong> por três razões fundamentais:": "This calibration is the <strong>gold standard in RAG (Retrieval-Augmented Generation) engineering</strong> for three fundamental reasons:",
        "MOTIVO A": "REASON A",
        "MOTIVO B": "REASON B",
        "MOTIVO C": "REASON C",
        "O Efeito \"Lost in the Middle\" dos Modelos de IA:": "The \"Lost in the Middle\" Effect in AI Models:",
        "Pesquisas acadêmicas consagradas (Stanford e Anthropic) comprovaram que ao enviar 15 ou 20 documentos a um LLM de uma vez só, o modelo foca apenas nos primeiros 2 e no último, ignorando ou alucinando sobre os dados do meio. Com <strong>3 a 5 fontes densas e focadas</strong>, a IA atinge o pico de precisão com <strong>Zero Fabricação</strong>.": "Established research (Stanford and Anthropic) proved that when sending 15 or 20 documents to an LLM at once, the model focuses only on the first 2 and the last one, ignoring or hallucinating over the middle data. With <strong>3 to 5 dense, focused sources</strong>, AI achieves peak accuracy with <strong>Zero Fabrication</strong>.",
        "Janela de Contexto, Latência e Custo:": "Context Window, Latency, and Cost:",
        "Cada snippet do cofre é calibrado com 800 a 1.400 caracteres (ancorado em cabeçalhos para não truncar código ou listas). 5 trechos somam ~1.800 tokens de contexto, gerando respostas ultrarrápidas (~1.2s). Enviar 15 trechos elevaria a latência para 5s a 7s e esgotaria cotas (TPM).": "Each vault snippet is calibrated to 800–1,400 characters (anchored on headings to avoid truncating code or lists). 5 snippets total ~1,800 context tokens, yielding ultra-fast answers (~1.2s). Sending 15 snippets would raise latency to 5–7s and exhaust TPM quotas.",
        "Carga Cognitiva e Ergonomia do Desenvolvedor:": "Cognitive Load and Developer Ergonomics:",
        "O objetivo é tirar uma dúvida de arquitetura em menos de 30 segundos no meio do código. Exibir 15 blocos longos criaria uma \"parede de texto\" que poluiria o fluxo de trabalho.": "The goal is to answer an architectural question in under 30 seconds while coding. Displaying 15 long blocks would create a \"wall of text\" that clutters your workflow.",
        "O sistema une o <strong>foco analítico da IA</strong> à <strong>liberdade de exploração do dev</strong>: o motor busca até <strong>12 documentos relevantes</strong>. A IA formula a resposta baseada nos mais densos (com badge <span class=\"ask-source-badge-synth\" style=\"display:inline-block; padding:1px 6px;\">Citada na Síntese</span>), e você pode abrir o botão <strong>\"📄 Ver mais N fontes encontradas (+N)\"</strong> para inspecionar todos os documentos correlacionados com 1 clique (com badge <span class=\"ask-source-badge-extra\" style=\"display:inline-block; padding:1px 6px;\">Fonte Adicional</span>), abrindo no editor ou focando no Grafo Neural 3D.": "The system combines <strong>AI analytical focus</strong> with <strong>developer exploration freedom</strong>: the engine retrieves up to <strong>12 relevant documents</strong>. AI synthesizes the answer from the densest ones (badged <span class=\"ask-source-badge-synth\" style=\"display:inline-block; padding:1px 6px;\">Cited in Synthesis</span>), and you can click <strong>\"📄 View N more sources found (+N)\"</strong> to inspect all correlated documents with 1 click (badged <span class=\"ask-source-badge-extra\" style=\"display:inline-block; padding:1px 6px;\">Additional Source</span>), opening them in the editor or focusing them in the 3D Neural Graph.",

        // Project Workspace Tabs — Tab 1: Overview (renderProjectOverviewTab & Governance Explainer)
        "Projeto conectado ao AI Second Brain": "Project connected to AI Second Brain",
        "Caminho no Disco:": "Disk Path:",
        "Caminho Físico:": "Physical Path:",
        "Cofre do Projeto:": "Project Vault:",
        "Ponte Ativa:": "Active Bridge:",
        "Pontes no Disco:": "Bridges on Disk:",
        "Última Sessão:": "Last Session:",
        "Sem sessões": "No sessions",
        "Sem sessão registrada": "No recorded session",
        "Nenhuma sessão registrada": "No recorded session",
        "Nenhuma ponte gerada no disco": "No bridge generated on disk",
        "🛡️ Saúde da Governança & Contratos": "🛡️ Governance & Contracts Health",
        "Auditoria em tempo real dos artefatos de memória e arquitetura deste projeto": "Real-time audit of this project's memory and architecture artifacts",
        "Auditoria de Governança": "Governance Audit",
        "Verificar Saúde": "Check Health",
        "Contratos Principais": "Core Contracts",
        "Contratos de Governança": "Governance Contracts",
        "Decisões Arquiteturais (ADRs)": "Architectural Decisions (ADRs)",
        "Decisões Arquiteturais / ADRs": "Architectural Decisions / ADRs",
        "Nenhum ADR registrado ainda.": "No ADRs recorded yet.",
        "Use o Grill-Me ou crie manualmente em DECISIONS/": "Use Grill-Me or create manually in DECISIONS/",
        "➕ Criar Primeiro ADR": "➕ Create First ADR",
        "✓ O que já foi definido": "✓ Defined & Completed",
        "🎯 Próximos Passos": "🎯 Next Steps",
        "Nenhum item listado em CURRENT_STATE.md": "No items listed in CURRENT_STATE.md",
        "Nenhuma pendência listada em CURRENT_STATE.md": "No pending items listed in CURRENT_STATE.md",
        "✏️ Editar Estado": "✏️ Edit State",
        "✏️ Editar Contrato": "✏️ Edit Contract",
        "📄 Abrir": "📄 Open",
        "➕ Criar": "➕ Create",
        "➕ Gerar Contrato": "➕ Generate Contract",
        "Presente": "Present",
        "Ausente": "Missing",
        "Vazio": "Empty",
        "OK (Preenchido)": "OK (Populated)",
        "Pendente / Vazio": "Pending / Empty",
        "Arquivo não encontrado": "File not found",
        "Contrato oficial de visão, stack e regras do projeto": "Official vision, stack, and project rules contract",
        "Fotografia viva do estado atual e próximos passos": "Live snapshot of current state and next steps",
        "Ponte nativa de instruções na raiz do repositório": "Native instructions bridge at repository root",
        "Pelo menos 1 decisão arquitetural documentada": "At least 1 documented architectural decision",
        "Histórico de sessões de desenvolvimento capturadas": "History of captured development sessions",
        "🛡️ Diagnóstico de Governança": "🛡️ Governance Diagnostics",
        "Como o AI Second Brain calcula a conformidade arquitetural deste projeto": "How AI Second Brain calculates architectural compliance for this project",
        "Pontuação de Conformidade": "Compliance Score",
        "Critérios Avaliados": "Evaluated Criteria",
        "Como atingir 100% de Conformidade?": "How to reach 100% Compliance?",
        "Preencha os arquivos ausentes ou use o <strong>Grill-Me Studio</strong> para refinar a arquitetura e gerar ADRs automaticamente.": "Populate missing files or use <strong>Grill-Me Studio</strong> to refine architecture and generate ADRs automatically.",
        "🔥 Abrir Grill-Me Studio": "🔥 Open Grill-Me Studio",

        // Project Workspace Tabs — Tab 2: Research Lab (renderProjectResearchTab, Prompt Vivo, Decompose)
        "🔬 Research Lab — Pesquisas Profundas": "🔬 Research Lab — Deep Research",
        "Estruture temas complexos, execute pesquisas assistidas por IA e decomponha o conhecimento em contratos acionáveis.": "Structure complex topics, run AI-assisted research, and decompose knowledge into actionable contracts.",
        "➕ Nova Pesquisa": "➕ New Research",
        "Nenhuma pesquisa criada para este projeto": "No research created for this project",
        "Crie um pacote de pesquisa para investigar arquiteturas, comparar bibliotecas, desenhar schemas de banco ou explorar domínios complexos antes de codificar.": "Create a research package to investigate architectures, compare libraries, design database schemas, or explore complex domains before coding.",
        "🚀 Criar Primeira Pesquisa": "🚀 Create First Research",
        "🟢 Decomposta": "🟢 Decomposed",
        "🟡 Pronta p/ Decompor": "🟡 Ready to Decompose",
        "🔵 Aguardando Pesquisa": "🔵 Awaiting Research",
        "⚪ Rascunho": "⚪ Draft",
        "📄 Ver Overview": "📄 View Overview",
        "⚡ Prompt Vivo": "⚡ Live Prompt",
        "🧬 Decompor Conhecimento": "🧬 Decompose Knowledge",
        "🔄 Re-decompor": "🔄 Re-decompose",
        "📂 Arquivos Gerados": "📂 Generated Files",
        "📝 Colar Resultado Manual": "📝 Paste Manual Result",
        "🗑️ Excluir": "🗑️ Delete",
        "Criada em": "Created on",
        "Atualizada em": "Updated on",
        "Fontes:": "Sources:",
        "Conceitos:": "Concepts:",
        "Acionáveis:": "Actionables:",
        "ADRs:": "ADRs:",
        "Visão Geral (OVERVIEW.md)": "Overview (OVERVIEW.md)",
        "Prompt de Pesquisa (RESEARCH_PROMPT.md)": "Research Prompt (RESEARCH_PROMPT.md)",
        "Fontes Brutas (sources/)": "Raw Sources (sources/)",
        "Conhecimento (knowledge/)": "Knowledge (knowledge/)",
        "Artefatos Acionáveis (actionable/)": "Actionable Artifacts (actionable/)",
        "⚡ Executar Pesquisa Ao Vivo com IA": "⚡ Run Live AI Research",
        "A IA vai ler o <code>RESEARCH_PROMPT.md</code>, investigar profundamente todos os tópicos e gravar o dossiê completo em <code>OVERVIEW.md</code> em tempo real.": "AI will read <code>RESEARCH_PROMPT.md</code>, deeply investigate all topics, and write the complete dossier to <code>OVERVIEW.md</code> in real time.",
        "Provedor de IA:": "AI Provider:",
        "Modo de Execução:": "Execution Mode:",
        "Pesquisa Completa + Decomposição Automática (Recomendado)": "Full Research + Auto-Decomposition (Recommended)",
        "Apenas Pesquisa (Gerar OVERVIEW.md)": "Research Only (Generate OVERVIEW.md)",
        "🚀 Iniciar Pesquisa Ao Vivo": "🚀 Start Live Research",
        "📋 Copiar Prompt para Chat Externo": "📋 Copy Prompt for External Chat",
        "Iniciando motor de pesquisa profunda...": "Starting deep research engine...",
        "Conectando ao AI Gateway e estruturando investigação...": "Connecting to AI Gateway and structuring investigation...",
        "Gerando dossiê de pesquisa em tempo real...": "Generating research dossier in real time...",
        "Decompondo pesquisa em artefatos acionáveis e conceitos...": "Decomposing research into actionable artifacts and concepts...",
        "✅ Pesquisa Concluída com Sucesso!": "✅ Research Completed Successfully!",
        "O dossiê foi salvo em <code>OVERVIEW.md</code> e os artefatos foram sincronizados no cofre.": "The dossier was saved to <code>OVERVIEW.md</code> and artifacts were synced to the vault.",
        "🧬 Decomposição Inteligente de Pesquisa": "🧬 Intelligent Research Decomposition",
        "Transforme o dossiê bruto (OVERVIEW.md) em conhecimento modular, schemas acionáveis e ADRs no projeto.": "Transform the raw dossier (OVERVIEW.md) into modular knowledge, actionable schemas, and project ADRs.",
        "O que a Decomposição Automática faz?": "What does Auto-Decomposition do?",
        "Extrai conceitos teóricos puros para <code>knowledge/</code>": "Extracts pure theoretical concepts into <code>knowledge/</code>",
        "Gera scripts, schemas SQL, configs e checklists em <code>actionable/</code>": "Generates scripts, SQL schemas, configs, and checklists in <code>actionable/</code>",
        "Propõe ou registra Decisões Arquiteturais (ADRs) em <code>DECISIONS/</code>": "Proposes or records Architectural Decisions (ADRs) in <code>DECISIONS/</code>",
        "Atualiza o grafo neural 3D com as novas conexões de conhecimento": "Updates the 3D neural graph with the new knowledge connections",
        "⚡ Executar Decomposição via IA Agora": "⚡ Run AI Decomposition Now",
        "📋 Copiar Comando CLI": "📋 Copy CLI Command",
        "Deseja re-decompor esta pesquisa? Os arquivos gerados anteriormente em knowledge/ e actionable/ serão atualizados.": "Do you want to re-decompose this research? Previously generated files in knowledge/ and actionable/ will be updated.",

        // Project Workspace Tabs — Tab 3: Memory & Health (renderProjectMemoryTab & Session Capture)
        "🧮 Memória Episódica & Saúde do Projeto": "🧮 Episodic Memory & Project Health",
        "Histórico cronológico de sessões de engenharia, lições aprendidas e estado operacional.": "Chronological history of engineering sessions, lessons learned, and operational state.",
        "⚡ Capturar Sessão com IA": "⚡ Capture Session with AI",
        "📝 Editar CURRENT_STATE.md": "📝 Edit CURRENT_STATE.md",
        "📚 Lições Aprendidas": "📚 Lessons Learned",
        "Histórico de Sessões (MEMORY/sessions/)": "Session History (MEMORY/sessions/)",
        "Nenhuma sessão capturada neste projeto ainda": "No sessions captured in this project yet",
        "Ao finalizar um bloco de trabalho, clique em \"Capturar Sessão com IA\". O Segundo Cérebro analisa os commits recentes, arquivos alterados e notas para atualizar o CURRENT_STATE.md e criar o log da sessão automaticamente.": "When finishing a work block, click \"Capture Session with AI\". Second Brain analyzes recent commits, modified files, and notes to update CURRENT_STATE.md and create the session log automatically.",
        "⚡ Capturar Primeira Sessão": "⚡ Capture First Session",
        "Estado Atual do Projeto (CURRENT_STATE.md)": "Current Project State (CURRENT_STATE.md)",
        "⚡ Captura Inteligente de Sessão": "⚡ Intelligent Session Capture",
        "Registre o que foi construído hoje. A IA atualizará o histórico de memória e o CURRENT_STATE.md do projeto.": "Record what was built today. AI will update the memory history and the project's CURRENT_STATE.md.",
        "O que foi feito nesta sessão? (Resumo ou notas rápidas)": "What was done in this session? (Summary or quick notes)",
        "Ex: Implementamos autenticação JWT, corrigimos bug no cálculo de frete e criamos a tabela de auditoria...": "E.g., Implemented JWT auth, fixed shipping calculation bug, and created audit table...",
        "Detectar alterações do Git automaticamente (commits e arquivos modificados)": "Auto-detect Git changes (commits and modified files)",
        "Propor novo ADR se houver decisão arquitetural relevante": "Propose new ADR if there is a relevant architectural decision",
        "🧠 Analisar e Estruturar Sessão": "🧠 Analyze & Structure Session",
        "Analisando commits, diffs e estruturando memória da sessão...": "Analyzing commits, diffs, and structuring session memory...",
        "Revisão da Sessão Estruturada": "Structured Session Review",
        "Confira o resumo gerado pela IA antes de gravar no cofre do projeto:": "Review the AI-generated summary before saving to the project vault:",
        "Resumo da Sessão (Arquivo em MEMORY/sessions/)": "Session Summary (File in MEMORY/sessions/)",
        "Atualização do CURRENT_STATE.md": "CURRENT_STATE.md Update",
        "💾 Confirmar e Gravar no Cofre": "💾 Confirm & Save to Vault",

        // Project Workspace Tabs — Tab 4: Neural Graph (renderProjectGraphTab, Category Panel, Search)
        "🔮 Subgrafo Neural do Projeto": "🔮 Project Neural Subgraph",
        "Visualização isolada das conexões entre contratos, decisões, pesquisas e memórias deste projeto.": "Isolated visualization of connections between contracts, decisions, research, and memories of this project.",
        "🔍 Buscar nó no grafo...": "🔍 Search node in graph...",
        "🎯 Centralizar": "🎯 Center",
        "🌐 Ver no Grafo Global": "🌐 View in Global Graph",
        "Categorias Visíveis": "Visible Categories",
        "Mostrar Todas": "Show All",
        "Ocultar Todas": "Hide All",
        "Dica: Clique em qualquer nó para inspecionar ou editar o documento.": "Tip: Click any node to inspect or edit the document.",
        "Focar no Grafo": "Focus in Graph",
        "Abrir Documento": "Open Document",
        "Conexões (Sinapses):": "Connections (Synapses):",

        // Project Workspace Tabs — Tab 5: Backup & Export (renderProjectBackupTab)
        "📦 Backup, Exportação & Portabilidade": "📦 Backup, Export & Portability",
        "Exporte o cérebro deste projeto, gere snapshots de governança ou sincronize pontes de IA.": "Export this project's brain, generate governance snapshots, or synchronize AI bridges.",
        "📥 Exportar Bundle JSON do Projeto": "📥 Export Project JSON Bundle",
        "Baixa um arquivo único contendo todos os contratos (PROJECT.md, CURRENT_STATE.md), ADRs, pesquisas e memórias deste projeto para backup ou migração.": "Downloads a single file containing all contracts (PROJECT.md, CURRENT_STATE.md), ADRs, research, and memories of this project for backup or migration.",
        "⬇️ Baixar Bundle (.json)": "⬇️ Download Bundle (.json)",
        "📋 Copiar Contexto Consolidado (Clipboard)": "📋 Copy Consolidated Context (Clipboard)",
        "Gera um super-prompt Markdown com toda a visão, regras, estado atual e decisões do projeto pronto para colar em qualquer LLM web (ChatGPT, Claude Web, Gemini).": "Generates a Markdown super-prompt with all project vision, rules, current state, and decisions ready to paste into any web LLM (ChatGPT, Claude Web, Gemini).",
        "📋 Copiar Super-Contexto": "📋 Copy Super-Context",
        "✅ Contexto copiado para a área de transferência!": "✅ Context copied to clipboard!",
        "🔗 Sincronizar Pontes de Agentes (IDE / CLI)": "🔗 Synchronize Agent Bridges (IDE / CLI)",
        "Recria ou atualiza os arquivos de instrução nativa na pasta física do projeto para garantir que todos os agentes leiam as regras mais recentes.": "Recreates or updates native instruction files in the project's physical folder to ensure all agents read the latest rules.",
        "🔄 Sincronizar Todas as Pontes": "🔄 Synchronize All Bridges",
        "Arquivos de Governança Incluídos no Backup": "Governance Files Included in Backup",

        // Project Workspace Tabs — Tab 6: Manage & Unlink (renderProjectSettingsTab & unlinkProject)
        "⚙️ Gerenciamento, Pontes & Desconexão": "⚙️ Management, Bridges & Unlink",
        "Configure metadados, gerencie arquivos de ponte no repositório físico ou desconecte o projeto do Cockpit.": "Configure metadata, manage bridge files in the physical repository, or unlink the project from the Cockpit.",
        "Configurações & Metadados do Projeto": "Project Settings & Metadata",
        "Status Operacional:": "Operational Status:",
        "Ativo (Em Desenvolvimento)": "Active (In Development)",
        "Em Planejamento (Discovery)": "Planning (Discovery)",
        "Pausado / Manutenção": "Paused / Maintenance",
        "Arquivado / Concluído": "Archived / Completed",
        "Stack Tecnológica Principal:": "Primary Tech Stack:",
        "Caminho do Repositório Físico:": "Physical Repository Path:",
        "💾 Salvar Alterações": "💾 Save Changes",
        "Gerenciador de Pontes de IA (Repositório Físico)": "AI Bridge Manager (Physical Repository)",
        "Ative ou crie pontes individuais para cada IDE/Agente diretamente na raiz do código-fonte:": "Activate or create individual bridges for each IDE/Agent directly at the source code root:",
        "⚠️ Zona de Perigo — Desconectar Projeto": "⚠️ Danger Zone — Unlink Project",
        "Remover este projeto do AI Second Brain Cockpit. Você pode escolher manter os arquivos físicos intactos ou remover apenas o registro do cofre.": "Remove this project from the AI Second Brain Cockpit. You can keep physical files intact or remove only the vault record.",
        "🔌 Desconectar Projeto do Cérebro": "🔌 Unlink Project from Brain",
        "Tem certeza que deseja desconectar o projeto": "Are you sure you want to unlink the project",
        "O código-fonte físico do seu repositório NÃO será apagado.": "Your repository's physical source code will NOT be deleted.",
        "Projeto desconectado com sucesso!": "Project unlinked successfully!",
        "Configurações do projeto salvas com sucesso!": "Project settings saved successfully!",

        // Quickstart Studio & Grill-Me Studio (app.js dynamic flows)
        "Escolha uma categoria de tecnologia...": "Choose a technology category...",
        "Descreva sua ideia com suas palavras. Não precisa ser técnico — a IA vai entrevistar você no Grill-Me para fechar as lacunas!": "Describe your idea in your own words. No need to be technical — AI will interview you in Grill-Me to close the gaps!",
        "Informe o nome do projeto antes de continuar.": "Please enter the project name before continuing.",
        "Informe o caminho físico do repositório ou selecione a pasta.": "Please enter the physical repository path or select the folder.",
        "Analisando repositório físico e detectando tecnologias...": "Analyzing physical repository and detecting technologies...",
        "Repositório escaneado com sucesso!": "Repository scanned successfully!",
        "Preparando perguntas cirúrgicas de arquitetura (Grill-Me)...": "Preparing surgical architecture questions (Grill-Me)...",
        "Gerando perguntas de entrevista arquitetural com IA...": "Generating architectural interview questions with AI...",
        "Sintetizando respostas e gerando contratos oficiais (PROJECT.md, CURRENT_STATE.md, ADRs)...": "Synthesizing answers and generating official contracts (PROJECT.md, CURRENT_STATE.md, ADRs)...",
        "Refinando contratos com base nas suas observações...": "Refining contracts based on your feedback...",
        "Validando consistência arquitetural...": "Validating architectural consistency...",
        "Gravar Contratos e Conectar Projeto": "Save Contracts & Connect Project",
        "✅ Projeto Conectado e Governado com Sucesso!": "✅ Project Connected and Governed Successfully!",
        "Sugestão da IA:": "AI Suggestion:",
        "✨ Usar Sugestão da IA": "✨ Use AI Suggestion",
        "Sua Resposta:": "Your Answer:",
        "Digite sua decisão ou clique em 'Usar Sugestão da IA'...": "Type your decision or click 'Use AI Suggestion'...",
        " Respondida": " Answered",
        " Pendente": " Pending",
        "Pergunta ": "Question ",

        // AI Settings / BYOK / Terminal / Errors (app.js)
        "Conectado e Pronto": "Connected & Ready",
        "Chave de API configurada": "API Key configured",
        "Chave não configurada (Clique para configurar)": "Key not configured (Click to configure)",
        "Servidor Local Detectado": "Local Server Detected",
        "Testando conexão com o provedor...": "Testing connection with provider...",
        "Conexão validada com sucesso!": "Connection validated successfully!",
        "Falha ao conectar no provedor de IA": "Failed to connect to AI provider",
        "Configurações de IA salvas com sucesso!": "AI settings saved successfully!",
        "Erro de Comunicação com o Motor de IA": "AI Engine Communication Error",
        "Verifique sua chave de API (BYOK) ou troque para outro provedor no seletor superior.": "Check your API key (BYOK) or switch to another provider in the top selector.",
        "⚙️ Abrir Configurações de IA": "⚙️ Open AI Settings",

        // File Editor & General Alerts/Confirms
        "Arquivo salvo com sucesso no disco!": "File saved to disk successfully!",
        "Erro ao salvar arquivo:": "Error saving file:",
        "Copiado!": "Copied!",
        "📋 Copiar": "📋 Copy",
        "Fechar": "Close",
        "Cancelar": "Cancel",
        "Confirmar": "Confirm",
        "Salvar": "Save",
        "Carregando...": "Loading...",
        "Processando...": "Processing...",

        // Optgroup labels in #qsNewStackSelect and #aiModelSelect
        "🌐 Desenvolvimento Web & SaaS": "🌐 Web & SaaS Development",
        "⚙️ Backend, APIs & Microsserviços": "⚙️ Backend, APIs & Microservices",
        "📱 Mobile & Desktop": "📱 Mobile & Desktop",
        "🤖 Dados, IA & Automação": "🤖 Data, AI & Automation",
        "🏢 Sistemas Corporativos & Outros": "🏢 Enterprise Systems & Others",

        // Changelog Modal & Star Toast
        "O que há de novo no AI Second Brain": "What's New in AI Second Brain",
        "Melhorias contínuas, novos motores neurais e governança assistida por IA": "Continuous improvements, new neural engines, and AI-assisted governance",
        "Nova versão disponível no repositório!": "New version available in repository!",
        "Execute <code>git pull origin main</code> para baixar as últimas melhorias.": "Run <code>git pull origin main</code> to download the latest improvements.",
        "📋 Copiar git pull": "📋 Copy git pull",
        "Carregando notas da versão...": "Loading release notes...",
        "Código aberto · Licença MIT · Desenvolvido por Alfredo R. Câmara": "Open Source · FSL-1.1-MIT License · Developed by Alfredo R. Câmara",
        "Ver no GitHub": "View on GitHub",
        "Continuar no Cockpit ✨": "Continue in Cockpit ✨",
        "O Second Brain te ajudou?": "Did Second Brain help you?",
        "Sou dev solo e cada estrela no GitHub ajuda muito o projeto a crescer e alcançar mais desenvolvedores.": "I'm a solo dev and every star on GitHub helps the project grow and reach more developers.",
        "⭐ Dar Estrela": "⭐ Give a Star",
        "Já dei ⭐": "Already starred ⭐",
        "Depois": "Later",
        "Fechar (lembrar mais tarde)": "Close (remind me later)",

        // ═══════════════════════════════════════════════════════════════════
        // PROJECT JOURNEY COMPLETE COVERAGE (Cards, Workspace, 6 Tabs, Modals)
        // ═══════════════════════════════════════════════════════════════════

        // 1. Dashboard Project Cards, Badges, Filters & Governance Explainer
        "Governança de Arquitetura": "Architecture Governance",
        "Desenvolvimento": "Development",
        "Planejamento": "Planning",
        "Testes": "Testing",
        "Concluído": "Completed",
        "Pausado": "Paused",
        "🟢 Em Planejamento / Ativo": "🟢 In Planning / Active",
        "🚀 Em Desenvolvimento Ativo": "🚀 In Active Development",
        "🟡 Em Testes / Homologação": "🟡 In Testing / QA",
        "✅ Em Produção / Concluído": "✅ In Production / Completed",
        "⏸️ Pausado / Arquivado": "⏸️ Paused / Archived",
        "🟢 Ativo / Em Desenvolvimento": "🟢 Active / In Development",
        "🟢 Ativo": "🟢 Active",
        "Não especificada": "Unspecified",
        "<span>💻</span> Não especificada": "<span>💻</span> Unspecified",
        "Livre": "Free / Agnostic",
        "<span>💻</span> Livre": "<span>💻</span> Free / Agnostic",
        "Projeto externo vinculado ao AI Second Brain.": "External project linked to AI Second Brain.",
        "Projeto criado no AI Second Brain": "Project created in AI Second Brain",
        "Projeto criado no AI Second Brain.": "Project created in AI Second Brain.",
        "Projeto conectado e governado pelo AI Second Brain.": "Project connected and governed by AI Second Brain.",
        "Inicialização no AI Second Brain com governança ativa.": "Initialized in AI Second Brain with active governance.",
        "Definir os próximos passos do projeto.": "Define the next steps for the project.",
        "Nenhum Projeto Conectado": "No Connected Projects",
        "O workspace está limpo e agnóstico. Use o Quickstart Studio para criar ou conectar um projeto agora mesmo.": "The workspace is clean and agnostic. Use Quickstart Studio to create or connect a project right now.",
        "✨ Clique aqui para iniciar o Quickstart de 3 minutos": "✨ Click here to start the 3-minute Quickstart",
        "Nenhum projeto encontrado": "No projects found",
        "Nenhum workspace sob governança corresponde aos termos ou filtros selecionados.": "No governed workspace matches the selected search terms or filters.",
        "Stack de Tecnologia": "Tech Stack",
        "Clique para ver o detalhamento do cálculo de governança": "Click to view the governance score breakdown",
        "O que significa este percentual? (Clique para ver o detalhamento)": "What does this percentage mean? (Click for breakdown)",
        "Informações sobre governança": "Governance information",
        "✓ PROJECT.md ativo (Clique para visualizar)": "✓ PROJECT.md active (Click to view)",
        "⚠️ Clique para inicializar PROJECT.md": "⚠️ Click to initialize PROJECT.md",
        "✓ CURRENT_STATE.md ativo (Clique para visualizar)": "✓ CURRENT_STATE.md active (Click to view)",
        "⚠️ Clique para inicializar CURRENT_STATE.md": "⚠️ Click to initialize CURRENT_STATE.md",
        "✓ ARCHITECTURE.md ativo (Clique para visualizar)": "✓ ARCHITECTURE.md active (Click to view)",
        "⚠️ Clique para inicializar ARCHITECTURE.md": "⚠️ Click to initialize ARCHITECTURE.md",
        "✓ Decisões registradas (Clique para ver no Workspace)": "✓ Decisions recorded (Click to view in Workspace)",
        "⚠️ Clique para registrar a primeira decisão (ADR-001) e bater 100%!": "⚠️ Click to record the first decision (ADR-001) and reach 100%!",
        "Documentos e especificações indexados": "Indexed documents and specifications",
        "Pesquisas e Experimentos de IA": "AI Research & Experiments",
        "Contratos vivos (PROJECT, CURRENT_STATE, ARCHITECTURE, DECISIONS)": "Live contracts (PROJECT, CURRENT_STATE, ARCHITECTURE, DECISIONS)",
        "Abrir Dashboard Completo": "Open Full Workspace",
        "Explorar Grafo Neural 3D": "Explore 3D Neural Graph",
        "Ver Experimentos de Pesquisa": "View Research Experiments",
        "Configurar Projeto": "Configure Project",
        "🔮 Grafo 3D": "🔮 3D Graph",
        "⚙️ Gerenciar": "⚙️ Manage",
        "GOVERNANÇA & CONTRATOS VIVOS": "GOVERNANCE & LIVE CONTRACTS",
        "Identidade, visão do produto, proposta de valor e stack técnica.": "Product identity, vision, value proposition, and tech stack.",
        "Status atual do desenvolvimento, backlog e próximos passos imediatos.": "Current development status, backlog, and immediate next steps.",
        "Desenho de arquitetura, contratos técnicos e fluxos do sistema.": "Architecture design, technical contracts, and system flows.",
        "Registro formal de decisões técnicas tomadas (ex.: escolha de libs, banco, arquitetura).": "Formal record of technical decisions made (e.g., library, database, architecture choices).",
        "+25% (Ativo)": "+25% (Active)",
        "+25% (Pendente)": "+25% (Pending)",
        "A <strong>Governança de Arquitetura</strong> representa o nível de conformidade e clareza estrutural do projeto. Ela garante que agentes de Inteligência Artificial e desenvolvedores operem com <strong>contexto exato</strong>, sem alucinações e sem retrabalho.": "<strong>Architecture Governance</strong> represents the project's structural clarity and compliance level. It ensures AI agents and developers operate with <strong>exact context</strong>, zero hallucinations, and no rework.",
        "<span>➕</span> Registrar Decisão Inicial (ADR-001) para 100%": "<span>➕</span> Record Initial Decision (ADR-001) for 100%",
        "Registrar Decisão Inicial (ADR-001) para 100%": "Record Initial Decision (ADR-001) for 100%",
        "PROJECT.md (Visão Geral)": "PROJECT.md (Overview)",
        "CURRENT_STATE.md (Estado Atual)": "CURRENT_STATE.md (Current State)",
        "ARCHITECTURE.md (Arquitetura)": "ARCHITECTURE.md (Architecture)",
        "OVERVIEW.md (Visão Geral)": "OVERVIEW.md (Overview)",
        "Guia de Projetos": "Projects Guide",

        // 2. Project Workspace Header & Tab 1: Overview
        "Nome do Projeto": "Project Name",
        "Carregando detalhes do projeto...": "Loading project details...",
        "Caminho local": "Local path",
        "Carregando caminho...": "Loading path...",
        "Brownfield 🔗 (Vínculo Externo)": "Brownfield 🔗 (External Link)",
        "Greenfield 🚀 (Nativo)": "Greenfield 🚀 (Native)",
        "Greenfield 🚀 (Offline)": "Greenfield 🚀 (Offline)",
        "Modo offline (snapshot embutido)": "Offline mode (embedded snapshot)",
        "Erro ao conectar ao projeto.": "Error connecting to project.",
        "Erro ao carregar detalhes do projeto": "Error loading project details",
        "Voltar ao Dashboard": "Back to Dashboard",
        "🧠 Dashboard Geral": "🧠 Main Dashboard",
        "Clique para abrir esta pasta no Explorador de Arquivos": "Click to open this folder in File Explorer",
        "Copiar caminho da pasta": "Copy folder path",
        "📋 Copiar Caminho": "📋 Copy Path",
        "Copiar prompt com contexto completo para colar na sua IDE ou agente de IA": "Copy full-context prompt to paste into your IDE or AI agent",
        "✨ Copiar Prompt para Agente": "✨ Copy Prompt for Agent",
        "✓ Prompt Copiado!": "✓ Prompt Copied!",
        "<span class=\"pw-tab-icon\">📄</span> Visão Geral": "<span class=\"pw-tab-icon\">📄</span> Overview",
        "<span class=\"pw-tab-icon\">🧮</span> Memória & Saúde": "<span class=\"pw-tab-icon\">🧮</span> Memory & Health",
        "<span class=\"pw-tab-icon\">🔮</span> Grafo Neural": "<span class=\"pw-tab-icon\">🔮</span> Neural Graph",
        "<span class=\"pw-tab-icon\">📦</span> Backup & Exportação": "<span class=\"pw-tab-icon\">📦</span> Backup & Export",
        "<span class=\"pw-tab-icon\">⚙️</span> Gerenciar & Desvincular": "<span class=\"pw-tab-icon\">⚙️</span> Manage & Unlink",
        "Memória & Saúde": "Memory & Health",
        "Backup & Exportação": "Backup & Export",
        "Gerenciar & Desvincular": "Manage & Unlink",
        "Carregando visão geral...": "Loading overview...",
        "Carregando laboratório de pesquisa...": "Loading research lab...",
        "Carregando diagnóstico de memória...": "Loading memory diagnostics...",
        "Carregando dados de backup...": "Loading backup data...",
        "Carregando opções de gerenciamento...": "Loading management options...",
        "Arquivos no Projeto": "Project Files",
        "Tamanho da Governança": "Governance Size",
        "Decisões Registradas": "Recorded Decisions",
        "Sessões de Memória": "Memory Sessions",
        "📄 Visão Geral & Contratos": "📄 Overview & Contracts",
        "✕ Cancelar": "✕ Cancel",
        "⚡ Edição Rápida": "⚡ Quick Edit",
        "📝 Editor Markdown": "📝 Markdown Editor",
        "📝 Editor Markdown Completo": "📝 Full Markdown Editor",
        "Objetivo / Missão do Projeto": "Project Goal / Mission",
        "Descreva os objetivos principais deste projeto...": "Describe the main goals of this project...",
        "Stack Tecnológica": "Tech Stack",
        "Ex: Node.js, React, Python...": "E.g., Node.js, React, Python...",
        "Status Operacional": "Operational Status",
        "💾 Salvar Visão Geral & Status": "💾 Save Overview & Status",
        "Objetivo do Projeto": "Project Goal",
        "Tipo de Integração": "Integration Type",
        "Brownfield (Externo)": "Brownfield (External)",
        "Greenfield (Nativo)": "Greenfield (Native)",
        "Repositório Físico": "Physical Repository",
        "Verificados no disco": "Verified on disk",
        "Nenhum contrato de governança detectado na pasta deste projeto.": "No governance contracts detected in this project folder.",
        "👁️ Ver": "👁️ View",
        "✏️ Editar": "✏️ Edit",
        "Contratos Recomendados Disponíveis": "Recommended Contracts Available",
        "Não criado": "Not created",
        "+ Nova Decisão (ADR)": "+ New Decision (ADR)",
        "⚖️ Nenhuma decisão registrada": "⚖️ No decisions recorded",
        "Pendente (+25%)": "Pending (+25%)",
        "+ Registrar Decisão (ADR-001)": "+ Record Decision (ADR-001)",
        "(Decisão Arquitetural)": "(Architectural Decision)",
        "🔌 Pontes de IA para IDEs (.cursorrules, CLAUDE.md, etc.)": "🔌 AI Bridges for IDEs (.cursorrules, CLAUDE.md, etc.)",
        "Como funcionam as pontes de IA no disco?": "How do AI bridges work on disk?",
        "Conecta este projeto à sua IDE para que o agente leia os contratos automaticamente": "Connects this project to your IDE so the agent reads contracts automatically",
        "Gera arquivos de pontes para todas as IDEs suportadas simultaneamente": "Generates bridge files for all supported IDEs simultaneously",
        "🌐 Todas as IDEs": "🌐 All IDEs",
        "🎯 Roadmap Ativo": "🎯 Active Roadmap",
        "Clique no ✓ para retornar ao roadmap": "Click ✓ to move back to roadmap",
        "Clique para mover de volta para Próximos Passos": "Click to move back to Next Steps",
        "Excluir este item": "Delete this item",
        "+ Adicionar marco concluído...": "+ Add completed milestone...",
        "Adicionar": "Add",
        "Ações imediatas": "Immediate actions",
        "Nenhum próximo passo pendente. Parabéns! Adicione novos abaixo.": "No pending next steps. Well done! Add new ones below.",
        "Concluir passo (move para 'O que já foi definido')": "Complete step (moves to 'Defined & Completed')",
        "✓ Concluir": "✓ Complete",
        "Excluir passo": "Delete step",
        "Digite uma nova meta / próximo passo e pressione Enter...": "Type a new goal / next step and press Enter...",
        "+ Adicionar Passo": "+ Add Step",

        // 3. Tab 2: Research Lab & Modals (#researchModal, #promptVivoModal, #decomposeModal)
        "Carregando laboratório de conhecimento e inteligência...": "Loading knowledge and intelligence lab...",
        "🔬 LABORATÓRIO DE CONHECIMENTO": "🔬 KNOWLEDGE LAB",
        "Laboratório de Pesquisa Autônoma": "Autonomous Research Lab",
        "<span>Laboratório de Pesquisa Autônoma</span>": "<span>Autonomous Research Lab</span>",
        "Nova Pesquisa no Lab": "New Lab Research",
        "Pesquisas Ativas": "Active Researches",
        "Docs em knowledge/": "Docs in knowledge/",
        "Specs em actionable/": "Specs in actionable/",
        "Nenhum laboratório criado para este projeto ainda": "No research lab created for this project yet",
        "Crie pesquisas autônomas para mapear tecnologias, arquiteturas, padrões de projeto ou regras de negócio complexas. A IA gerará a documentação estruturada diretamente no disco.": "Create autonomous research labs to map technologies, architectures, design patterns, or complex business rules. AI will generate structured documentation directly on disk.",
        "💡 Ideias rápidas para começar agora": "💡 Quick ideas to start right now",
        "⚡ Arquitetura Event-Driven & Filas": "⚡ Event-Driven Architecture & Queues",
        "🛡️ Autenticação Segura & Tokens": "🛡️ Secure Authentication & Tokens",
        "🚀 Caching Distribuído & Redis": "🚀 Distributed Caching & Redis",
        "✨ Criar Primeira Pesquisa com IA": "✨ Create First AI Research",
        "Erro ao carregar o Research Lab": "Error loading Research Lab",
        "Tentar Novamente": "Try Again",
        "🔄 Tentar Novamente": "🔄 Try Again",
        "Sem definição cadastrada.": "No definition provided.",
        "✓ Concluído": "✓ Completed",
        "⚡ Sintetizando...": "⚡ Synthesizing...",
        "Excluir este laboratório de pesquisa e seus arquivos": "Delete this research lab and its files",
        "✨ Prompt Vivo": "✨ Live Prompt",
        "✏️ Ajustar": "✏️ Adjust",
        "Total de documentos técnicos gerados no disco": "Total technical documents generated on disk",
        "Tamanho total em disco": "Total size on disk",
        "Todos os arquivos foram compilados e estão prontos no disco": "All files have been compiled and are ready on disk",
        "✨ 100% Indexado": "✨ 100% Indexed",
        "<span>🔄</span> Recalcular / Atualizar": "<span>🔄</span> Recalculate / Update",
        "<span>▶️</span> Pesquisar Agora": "<span>▶️</span> Research Now",
        "Recalcular / Atualizar": "Recalculate / Update",
        "Pesquisar Agora": "Research Now",
        "Ver estrutura detalhada de subtópicos e arquivos": "View detailed subtopic and file structure",
        "<span>🧩</span> Subtópicos & Arquivos": "<span>🧩</span> Subtopics & Files",
        "Subtópicos & Arquivos": "Subtopics & Files",
        "Abrir documento mestre OVERVIEW.md": "Open master OVERVIEW.md document",
        "Visualizar este laboratório orbitando o projeto no Grafo Neural 3D": "Visualize this lab orbiting the project in the 3D Neural Graph",
        "<span>🔮</span> Grafo Neural": "<span>🔮</span> Neural Graph",
        "Abrir pasta física da pesquisa no Windows Explorer": "Open physical research folder in File Explorer",
        "<span>📂</span> Abrir Pasta": "<span>📂</span> Open Folder",
        "<span>📂</span> Abrir Pasta no Explorer": "<span>📂</span> Open Folder in Explorer",
        "Visão executiva e mapa neural consolidado dos tópicos deste laboratório.": "Executive overview and consolidated neural map of this lab's topics.",
        "👆 Clique para abrir no Editor Markdown": "👆 Click to open in Markdown Editor",
        "🔬 RESEARCH LAB · IA MOTOR": "🔬 RESEARCH LAB · AI ENGINE",
        "Novo Laboratório de Pesquisa": "New Research Lab",
        "A IA contextualizará sua pesquisa com os contratos e arquitetura do projeto.": "AI will contextualize your research with the project's contracts and architecture.",
        "Tema / Título da Pesquisa <span class=\"req\">*</span>": "Research Topic / Title <span class=\"req\">*</span>",
        "Ex: Sistema de Matchmaking e Ranking ELO, Caching Distribuído com Redis...": "E.g., ELO Ranking & Matchmaking System, Distributed Caching with Redis...",
        "💡 Sugestões rápidas:": "💡 Quick suggestions:",
        "Sua Intenção / O que você quer pesquisar e aprender? <span class=\"req\">*</span>": "Your Intent / What do you want to research and learn? <span class=\"req\">*</span>",
        "Melhorar com IA": "Enhance with AI",
        "Escreva livremente o que deseja descobrir. Ex: Quero saber quais são os padrões mais usados no mercado para filas resilientes, como lidar com mensagens duplicadas, e como estruturar os schemas no nosso banco...": "Write freely what you want to discover. E.g., I want to know the industry patterns for resilient queues, how to handle duplicate messages, and how to structure schemas in our database...",
        "O <strong>Prompt Vivo</strong> pode ser alterado a qualquer momento para enriquecer ou refocar a pesquisa.": "The <strong>Live Prompt</strong> can be modified anytime to enrich or refocus the research.",
        "<span class=\"pulse-dot\"></span> Sugestão Refinada pela IA (Contexto do Projeto Aplicado)": "<span class=\"pulse-dot\"></span> AI-Refined Suggestion (Project Context Applied)",
        "✓ Aplicar ao Briefing": "✓ Apply to Briefing",
        "✏️ Aplicar e Editar": "✏️ Apply & Edit",
        "✕ Descartar": "✕ Discard",
        "Sua Ideia Original": "Your Original Idea",
        "Briefing Estruturado & Contextualizado": "Structured & Contextualized Briefing",
        "🔮 Subtópicos & Estrutura das Camadas": "🔮 Subtopics & Layer Structure",
        "A IA pode decompor o tema em camadas de <strong>Conhecimento Teórico</strong> e <strong>Ações Práticas</strong>.": "AI can decompose the topic into <strong>Theoretical Knowledge</strong> and <strong>Actionable Specs</strong> layers.",
        "🔮 Pré-visualizar Subtópicos": "🔮 Preview Subtopics",
        "Decompondo com IA...": "Decomposing with AI...",
        "Nenhum subtópico gerado.": "No subtopics generated.",
        "<span class=\"status-dot snapshot\"></span> Pronto para criar laboratório": "<span class=\"status-dot snapshot\"></span> Ready to create lab",
        "🚀 Inicializar Laboratório": "🚀 Initialize Lab",
        "Criando no Disco...": "Creating on Disk...",
        "✏️ PROMPT VIVO · VERSIONAMENTO": "✏️ LIVE PROMPT · VERSIONING",
        "Evolução do Prompt da Pesquisa": "Research Prompt Evolution",
        "Altere o briefing a qualquer momento. Versões anteriores são preservadas no histórico.": "Update the briefing anytime. Previous versions are preserved in history.",
        "Definição Atual do Laboratório": "Current Lab Definition",
        "Refinar com IA": "Refine with AI",
        "Refinando...": "Refining...",
        "📜 Histórico de Definições Desta Pesquisa": "📜 Definition History for This Research",
        "Esta pesquisa ainda está na versão inicial (v1).": "This research is still at its initial version (v1).",
        "<span class=\"status-dot snapshot\"></span> Pronto para salvar nova versão": "<span class=\"status-dot snapshot\"></span> Ready to save new version",
        "💾 Salvar Nova Versão (Prompt Vivo)": "💾 Save New Version (Live Prompt)",
        "🔮 TAXONOMIA · SUBTÓPICOS": "🔮 TAXONOMY · SUBTOPICS",
        "Decomposição Temática do Laboratório": "Lab Thematic Decomposition",
        "Estrutura de conhecimento planejada pela IA para esta pesquisa.": "Knowledge structure planned by AI for this research.",
        "<span>🗑️</span> Excluir Todos os Arquivos": "<span>🗑️</span> Delete All Files",
        "Excluir todos os arquivos gerados desta pesquisa": "Delete all generated files for this research",
        "🛠️ Actionable — Especificação prática e código adaptado à stack": "🛠️ Actionable — Practical specification and stack-adapted code",
        "📘 Knowledge — Conhecimento teórico e conceitual": "📘 Knowledge — Theoretical and conceptual knowledge",
        "Clique para ler ou editar este documento": "Click to read or edit this document",
        "Excluir arquivo do disco": "Delete file from disk",
        "Documento catalogado pela pesquisa autônoma.": "Document cataloged by autonomous research.",
        "<span>🔄 Re-decompor com IA</span>": "<span>🔄 Re-decompose with AI</span>",
        "Pede à IA para gerar uma nova divisão temática de subtópicos": "Ask AI to generate a new thematic subtopic breakdown",
        "Executar pesquisa e gerar arquivos físicos no disco com acompanhamento ao vivo": "Run research and generate physical files on disk with live progress",
        "O motor neural está sintetizando e catalogando os documentos no disco. Acompanhe o progresso de cada tópico ao vivo.": "The neural engine is synthesizing and cataloging documents on disk. Follow each topic's progress live.",
        "⏳ Na Fila": "⏳ Queued",
        "Aguardando mapeamento de subtópicos pela IA...": "Awaiting AI subtopic mapping...",
        "Inicializando motor de pesquisa com IA...": "Initializing AI research engine...",
        "Conectando ao modelo neural e preparando a síntese no disco...": "Connecting to neural model and preparing disk synthesis...",
        "Mapeando árvore de subtópicos com IA...": "Mapping subtopic tree with AI...",
        "🎉 <span>Síntese Concluída com Sucesso!</span>": "🎉 <span>Synthesis Successfully Completed!</span>",
        "100% Concluído": "100% Completed",
        "<span>📄</span> Ver OVERVIEW.md": "<span>📄</span> View OVERVIEW.md",
        "<span>✓</span> Ver Catálogo Completo &amp; Gerenciar": "<span>✓</span> View Full Catalog &amp; Manage",
        "Consultando IA para mapear subtópicos estruturados...": "Querying AI to map structured subtopics...",
        "<span>↩️</span> Manter Anterior": "<span>↩️</span> Keep Previous",
        "<span>🔄</span> Gerar Nova Proposta": "<span>🔄</span> Generate New Proposal",
        "<span>✅</span> Aplicar Proposta": "<span>✅</span> Apply Proposal",

        // 4. Tab 3: Memory & Health & Session Capture Modal (#sessionCaptureModal)
        "Memória & Governança Total": "Total Memory & Governance",
        "Sessões Ativas em MEMORY/": "Active Sessions in MEMORY/",
        "Sessões Arquivadas (.archive)": "Archived Sessions (.archive)",
        "Decisões Arquiteturais": "Architectural Decisions",
        "🧠 Registrar Sessão com IA": "🧠 Record Session with AI",
        "✨ IA": "✨ AI",
        "Terminou de trabalhar? A IA lê seus commits, os arquivos alterados e suas notas e propõe o registro da sessão, as atualizações do roadmap e as lições aprendidas. Você revisa item a item antes de gravar.": "Finished working? AI reads your commits, modified files, and notes to propose the session log, roadmap updates, and lessons learned. You review item by item before saving.",
        "Memória sem esforço manual": "Effortless session memory",
        "Gera <code>MEMORY/sessions/</code>, atualiza o <code>CURRENT_STATE.md</code> e sugere entradas para <code>LESSONS_LEARNED.md</code>. Nada é gravado sem sua confirmação.": "Generates <code>MEMORY/sessions/</code>, updates <code>CURRENT_STATE.md</code>, and suggests entries for <code>LESSONS_LEARNED.md</code>. Nothing is written without your confirmation.",
        "🧠 Registrar Sessão": "🧠 Record Session",
        "🧹 Otimização & Limpeza de Memória": "🧹 Memory Optimization & Cleanup",
        "À medida que você trabalha com as IAs (LLMs), o histórico de sessões anteriores cresce. Para economizar tokens de contexto sem perder nada, você pode arquivar sessões antigas com 1 clique.": "As you work with AI agents (LLMs), past session history grows. To save context tokens without losing anything, you can archive older sessions with 1 click.",
        "Arquivar Sessões Antigas com Segurança": "Safely Archive Older Sessions",
        "Move as sessões de <code>MEMORY/sessions/</code> para <code>MEMORY/.archive/</code> com timestamp e registra no <code>CURRENT_STATE.md</code>.": "Moves sessions from <code>MEMORY/sessions/</code> to <code>MEMORY/.archive/</code> with a timestamp and logs it in <code>CURRENT_STATE.md</code>.",
        "🕒 Histórico de Sessões Recentes": "🕒 Recent Session History",
        "Nenhuma sessão de trabalho registrada ainda em <code>MEMORY/sessions/</code>.": "No work sessions recorded in <code>MEMORY/sessions/</code> yet.",
        "⚖️ Decisões Registradas (DECISIONS/)": "⚖️ Recorded Decisions (DECISIONS/)",
        "Nenhuma decisão registrada ainda em <code>DECISIONS/</code>. Use o template de Decisões para adicionar.": "No decisions recorded in <code>DECISIONS/</code> yet. Use the Decisions button to add one.",
        "🧠 MEMÓRIA · IA ESCRIBA": "🧠 MEMORY · AI SCRIBE",
        "A IA lê seus commits, arquivos alterados e notas e propõe o registro da sessão.": "AI reads your commits, changed files, and notes and proposes the session record.",
        "A IA está lendo o contexto do projeto…": "AI is reading the project context…",
        "Revise e ajuste o rascunho. Nada é gravado em disco até você confirmar.": "Review and adjust the draft. Nothing is written to disk until you confirm.",
        "<strong>Git do projeto</strong><span>Commits desde a última sessão, arquivos alterados e diffstat. O conteúdo do código nunca é enviado.</span>": "<strong>Project Git</strong><span>Commits since last session, modified files, and diffstat. Raw source code is never sent.</span>",
        "<strong>Suas notas</strong><span>Cole o resumo do chat com o agente ou escreva livremente (opcional se houver commits).</span>": "<strong>Your notes</strong><span>Paste your agent chat summary or write freely (optional if there are commits).</span>",
        "Notas da sessão <span class=\"rl-hint\" style=\"display:inline;margin-left:6px;\">(opcional)</span>": "Session notes <span class=\"rl-hint\" style=\"display:inline;margin-left:6px;\">(optional)</span>",
        "Ex.: Implementei o login com JWT. Decidimos usar refresh token em cookie httpOnly. Falta cobrir expiração com testes.": "E.g.: Implemented JWT login. Decided to store refresh tokens in httpOnly cookies. Still need expiration tests.",
        "A IA usa apenas o que estiver aqui, nos commits e nos contratos — nada é inventado. Você revisa tudo antes de gravar.": "AI only uses what is here, in your commits, and in contracts — nothing is fabricated. You review everything before saving.",
        "Escrevendo a memória da sessão…": "Writing session memory…",
        "🔍 Lendo commits e arquivos alterados no Git...": "🔍 Reading Git commits and modified files...",
        "📄 Cruzando com contratos (PROJECT.md, CURRENT_STATE.md)...": "📄 Cross-referencing contracts (PROJECT.md, CURRENT_STATE.md)...",
        "⚖️ Consultando lições aprendidas e ADRs existentes...": "⚖️ Checking lessons learned and existing ADRs...",
        "✨ Sintetizando resumo de governança com IA para sua revisão...": "✨ Synthesizing AI governance summary for your review...",
        "Lendo histórico Git e arquivos modificados": "Reading Git history and modified files",
        "Cruzando com contratos (PROJECT.md, CURRENT_STATE.md)": "Cross-referencing contracts (PROJECT.md, CURRENT_STATE.md)",
        "Consultando lições aprendidas e ADRs existentes": "Checking lessons learned and existing ADRs",
        "Sintetizando resumo de governança com IA para sua revisão": "Synthesizing AI governance summary for your review",
        "🔄 Regenerar": "🔄 Regenerate",
        "✨ Gerar rascunho": "✨ Generate draft",
        "💾 Gravar na memória": "💾 Save to memory",
        "Gravando…": "Saving…",
        "⚠️ Git indisponível — baseado apenas nas suas notas": "⚠️ Git unavailable — based on your notes only",
        "Título da sessão": "Session title",
        "Registro da sessão <span class=\"rl-hint\" style=\"display:inline;margin-left:6px;\">(Markdown · editável) → <code>MEMORY/sessions/</code></span>": "Session log <span class=\"rl-hint\" style=\"display:inline;margin-left:6px;\">(Markdown · editable) → <code>MEMORY/sessions/</code></span>",
        "✅ Próximos passos concluídos": "✅ Completed next steps",
        "Nenhum próximo passo concluído com evidência nesta sessão.": "No next steps completed with evidence in this session.",
        "📌 Novos itens “Já definido”": "📌 New “Defined & Completed” items",
        "Nenhum item novo.": "No new items.",
        "🎯 Novos próximos passos <span class=\"sc-badge\">somente pendências citadas</span>": "🎯 New next steps <span class=\"sc-badge\">explicitly cited pending items only</span>",
        "Nenhuma pendência nova identificada.": "No new pending items identified.",
        "📚 Lições aprendidas <span class=\"sc-badge\">→ LESSONS_LEARNED.md</span>": "📚 Lessons learned <span class=\"sc-badge\">→ LESSONS_LEARNED.md</span>",
        "Nenhuma lição não óbvia identificada.": "No non-obvious lessons identified.",
        "⚖️ Possíveis decisões arquiteturais <span class=\"sc-badge\">sugestão</span>": "⚖️ Potential architectural decisions <span class=\"sc-badge\">suggestion</span>",
        "Registre-as depois em <code>DECISIONS/</code> pelo botão de decisão arquitetural do projeto.": "Record them later in <code>DECISIONS/</code> using the project's architectural decision button.",

        // 5. Tab 4: Neural Graph (#pwPaneGraph), Tab 5: Backup & Export, Tab 6: Manage & Unlink
        "🪐 Em Órbita": "🪐 Orbiting",
        "🌍 3D Planeta": "🌍 3D Planet",
        "✨ Sol Central: Projeto": "✨ Central Sun: Project",
        "Pesquisar documento no projeto...": "Search document in project...",
        "Camadas": "Layers",
        "Filtrado": "Filtered",
        "Todos os Documentos": "All Documents",
        "Clique para trocar a cor desta camada": "Click to change this layer's color",
        "⚡ Duplo-clique para abrir": "⚡ Double-click to open",
        "📦 Gerar & Exportar Dossiê de Governança": "📦 Generate & Export Governance Dossier",
        "● Sincronizando com o Disco...": "● Syncing with Disk...",
        "● Gravado Fisicamente no Disco": "● Physically Saved on Disk",
        "Exporte todo o conhecimento, decisões, arquitetura e estado atual do projeto em formatos padronizados para backup ou compartilhamento com outras IAs.": "Export all project knowledge, decisions, architecture, and current state in standardized formats for backup or sharing with other AIs.",
        "<span class=\"status-dot snapshot\" style=\"margin-right: 8px;\"></span> Gravando arquivos na pasta BACKUPS...": "<span class=\"status-dot snapshot\" style=\"margin-right: 8px;\"></span> Writing files to BACKUPS folder...",
        "📄 Pré-visualização do Dossiê Consolidado": "📄 Consolidated Dossier Preview",
        "Gerando dados...": "Generating data...",
        "Carregando prévia do dossiê...": "Loading dossier preview...",
        "📁 Pasta de Destino no Computador:": "📁 Destination Folder on Computer:",
        "📂 Abrir Pasta no Windows Explorer": "📂 Open Folder in File Explorer",
        "Abrir pasta no Windows Explorer": "Open folder in File Explorer",
        "📄 Dossiê Consolidado (.md)": "📄 Consolidated Dossier (.md)",
        "📦 Pacote Completo (.json)": "📦 Full Package (.json)",
        "📥 Baixar para Downloads": "📥 Save to Downloads",
        "📄 Abrir Arquivo": "📄 Open File",
        "Abrir arquivo no computador": "Open file on computer",
        "📋 Copiar caminho do arquivo .md": "📋 Copy .md file path",
        "📋 Copiar caminho do arquivo .json": "📋 Copy .json file path",
        "⚙️ Propriedades do Repositório": "⚙️ Repository Properties",
        "Nome do Projeto:": "Project Name:",
        "Tipo de Integração:": "Integration Type:",
        "Brownfield 🔗 (Junção NTFS)": "Brownfield 🔗 (NTFS Junction)",
        "Greenfield 🚀 (Pasta Nativa)": "Greenfield 🚀 (Native Folder)",
        "Caminho Original:": "Original Path:",
        "Stack Declarada:": "Declared Stack:",
        "⚠️ Zona de Gerenciamento & Desvinculação": "⚠️ Management & Unlink Zone",
        "Este projeto está conectado via Junção NTFS. Desvincular irá apenas desconectar o projeto do AI Second Brain. <strong>Nenhum arquivo ou linha de código da sua pasta original será apagado.</strong>": "This project is connected via NTFS Junction. Unlinking will only disconnect the project from AI Second Brain. <strong>No files or lines of code in your original folder will be deleted.</strong>",
        "Este projeto foi criado na pasta local do Segundo Cérebro. Desvincular irá movê-lo com segurança para a lixeira (.trash/).": "This project was created in the local Second Brain folder. Unlinking will safely move it to the trash (.trash/).",
        "🔗 Desfazer Vínculo do Projeto": "🔗 Unlink Project",
        "Desvincular Projeto": "Unlink Project",
        "Confirmar Desvinculação": "Confirm Unlink",

        // 6. All Toasts, Alerts, Custom Confirms & Dynamic AI Buttons across Project Journey
        "Por favor, digite uma ideia ou intenção inicial no campo abaixo antes de pedir ajuda à IA.": "Please enter an initial idea or intent in the field below before asking AI for help.",
        "Preencha o tema e a intenção da pesquisa antes de visualizar a decomposição.": "Please fill in the research topic and intent before previewing the decomposition.",
        "Preencha todos os campos obrigatórios.": "Please fill in all required fields.",
        "Pesquisa não encontrada.": "Research not found.",
        "A definição não pode ficar vazia.": "The definition cannot be empty.",
        "Projeto não selecionado.": "No project selected.",
        "Por favor, informe o nome do projeto para prosseguir.": "Please enter the project name to proceed.",
        "Por favor, digite um nome para o projeto.": "Please enter a name for the project.",
        "Por favor, digite o que você gostaria de melhorar nos contratos.": "Please enter what you would like to improve in the contracts.",
        "Por favor, informe o nome e a pasta de origem.": "Please enter the project name and source folder.",
        "🎨 Cores restauradas para o padrão original!": "🎨 Colors restored to default!",
        "✓ Especificação atualizada com sucesso!": "✓ Specification updated successfully!",
        "✓ Descrição atualizada com sucesso!": "✓ Description updated successfully!",
        "Criando projeto (Express)...": "Creating project (Express)...",
        "↺ Ajuste da IA desfeito com sucesso!": "↺ AI adjustment undone successfully!",
        "⚠️ Limite de 8 perguntas atingido. Prossiga para a geração dos contratos.": "⚠️ Limit of 8 questions reached. Proceed to contract generation.",
        "⚡ Consultando IA para formalização dos 4 contratos de governança...": "⚡ Querying AI to formalize the 4 governance contracts...",
        "✓ Sugestão recomendada aplicada à resposta!": "✓ Recommended suggestion applied to answer!",
        "<span class=\"btn-spinner\" style=\"display:inline-block\"></span> Criando no disco...": "<span class=\"btn-spinner\" style=\"display:inline-block\"></span> Creating on disk...",
        "✨ Prompt de início para o agente copiado para a área de transferência!": "✨ Agent session start prompt copied to clipboard!",
        "Iniciando geração do download...": "Starting download generation...",
        "📂 Solicitando abertura no Windows Explorer...": "📂 Requesting folder open in File Explorer...",
        "✓ Pasta aberta com sucesso no Windows Explorer!": "✓ Folder opened in File Explorer!",
        "📄 Abrindo arquivo no computador...": "📄 Opening file on computer...",
        "✓ Arquivo aberto no aplicativo padrão do Windows!": "✓ File opened in default application!",
        "✓ Caminho copiado para a área de transferência!": "✓ Path copied to clipboard!",
        "Nome digitado não confere. Desvinculação cancelada.": "Entered name does not match. Unlink cancelled.",
        "Projeto desvinculado com sucesso.": "Project unlinked successfully.",
        "↩️ Proposta descartada. Plano anterior preservado.": "↩️ Proposal discarded. Previous plan preserved.",
        "<span class=\"pulse-dot\"></span> Consultando a IA…": "<span class=\"pulse-dot\"></span> Querying AI…",
        "Consultando a IA…": "Querying AI…",
        "Resposta copiada!": "Answer copied!",
        "Citação copiada!": "Citation copied!",
        "Não foi possível copiar.": "Could not copy.",
        "📋 Resposta copiada para a área de transferência!": "📋 Answer copied to clipboard!",
        "⚖️ Decisão arquitetural registrada com sucesso no disco!": "⚖️ Architectural decision recorded to disk!",
        "✨ Visão Geral e Status atualizados com sucesso no disco!": "✨ Overview and Status updated on disk!",
        "💾 Estado Atual atualizado no disco!": "💾 Current State updated on disk!",
        "🎯 Novo próximo passo adicionado ao Roadmap!": "🎯 New next step added to Roadmap!",
        "🎉 Passo concluído e movido para \"O que já foi definido\"!": "🎉 Step completed and moved to \"Defined & Completed\"!",
        "🗑️ Próximo passo removido.": "🗑️ Next step removed.",
        "↩️ Item retornado para Próximos Passos.": "↩️ Item moved back to Next Steps.",
        "🗑️ Item definido removido.": "🗑️ Defined item removed.",
        "✓ Marco adicionado aos itens definidos!": "✓ Milestone added to defined items!",
        "✨ Briefing enriquecido pela IA com base nos contratos do projeto!": "✨ Briefing enriched by AI based on project contracts!",
        "✓ Sugestão da IA aplicada com sucesso ao Prompt Vivo!": "✓ AI suggestion applied to Live Prompt!",
        "✨ Definição refinada pela IA com sucesso!": "✨ Definition refined by AI!",
        "🎉 Pesquisa concluída! Arquivos salvos e prontos para navegação.": "🎉 Research completed! Files saved and ready to browse.",
        "✅ Nova estrutura de subtópicos salva no contrato da pesquisa!": "✅ New subtopic structure saved to research contract!",
        "Aviso do Sistema": "System Notice",
        "INFORMAÇÃO": "INFORMATION",
        "Stack Tecnológica Obrigatória": "Tech Stack Required",
        "PREENCHIMENTO REQUERIDO": "INPUT REQUIRED",
        "Descartar respostas e refazer sabatina?": "Discard answers and redo interview?",
        "Formular novas perguntas com IA?": "Formulate new questions with AI?",
        "Descartar e Refazer": "Discard & Redo",
        "Sim, Formular Novas": "Yes, Formulate New",
        "Manter Atuais": "Keep Current",
        "Excluir Próximo Passo": "Delete Next Step",
        "🎯 ROADMAP · EXCLUSÃO": "🎯 ROADMAP · DELETE",
        "Excluir Passo": "Delete Step",
        "Excluir Item Definido": "Delete Defined Item",
        "✓ CHECKLIST · EXCLUSÃO": "✓ CHECKLIST · DELETE",
        "Excluir Item": "Delete Item",
        "Arquivar Memórias do Projeto": "Archive Project Memories",
        "📦 SESSÕES DE MEMÓRIA": "📦 MEMORY SESSIONS",
        "Sim, Arquivar Sessões": "Yes, Archive Sessions",
        "Arquivando...": "Archiving...",
        "Copiar Caminho": "Copy Path",
        "ÁREA DE TRANSFERÊNCIA": "CLIPBOARD",
        "Não foi possível copiar automaticamente. Selecione e copie o caminho abaixo:": "Could not copy automatically. Select and copy the path below:",
        "⚠️ AÇÃO CRÍTICA · DESVINCULAR": "⚠️ CRITICAL ACTION · UNLINK",
        "Excluir Documento": "Delete Document",
        "🗑️ EXCLUSÃO PERMANENTE": "🗑️ PERMANENT DELETION",
        "Excluir Laboratório de Pesquisa": "Delete Research Lab",
        "⚠️ ATENÇÃO · EXCLUSÃO TOTAL": "⚠️ WARNING · FULL DELETION",
        "Excluir Laboratório e Arquivos": "Delete Lab & Files",
        "Excluir Todos os Arquivos": "Delete All Files",
        "⚠️ EXCLUSÃO EM MASSA": "⚠️ BULK DELETION",
        "Descartar rascunho da sessão?": "Discard session draft?",
        "🧠 SESSÃO": "🧠 SESSION",
        "Descartar": "Discard",
        "Continuar revisando": "Keep reviewing",
        "O rascunho gerado pela IA ainda não foi gravado em disco. Deseja fechar sem salvar?": "The AI-generated draft has not been saved to disk yet. Close without saving?",
        "Arquitetura de Microsserviços e Event-Driven com Filas": "Microservices & Event-Driven Architecture with Queues",
        "Segurança, JWT com Refresh Tokens e OAuth2": "Security, JWT with Refresh Tokens & OAuth2",
        "Estratégias de Caching Distribuído e Resiliência": "Distributed Caching & Resilience Strategies",
        "Design System Acessível e Animações Fluidas": "Accessible Design System & Fluid Animations",
        "Quero mapear os melhores padrões para mensageria resiliente, filas RabbitMQ/Kafka, idempotência e dead-letter queues adaptadas para nossa stack.": "I want to map the best patterns for resilient messaging, RabbitMQ/Kafka queues, idempotency, and dead-letter queues adapted to our stack.",
        "Pesquise sobre as melhores práticas de autenticação segura, rotação de chaves JWT, prevenção de replay attacks e proteção contra vazamento.": "Research best practices for secure authentication, JWT key rotation, replay attack prevention, and token leakage protection.",
        "Quero entender padrões de caching distribuído (Cache-Aside, Write-Through), estratégias de invalidação, controle de concorrência e Redis.": "I want to understand distributed caching patterns (Cache-Aside, Write-Through), invalidation strategies, concurrency control, and Redis.",

        // 7. Neural Graph Layers & Colors Menu (graph-hierarchy.js), Tooltips (neuron-graph.js) & HUD Hints
        "Sol central / Projeto": "Central Sun / Project",
        "Contratos e Raiz": "Contracts & Root",
        "Subpastas": "Subfolders",
        "Projetos": "Projects",
        "Acionável (actionable)": "Actionable (actionable)",
        "Conhecimento (knowledge)": "Knowledge (knowledge)",
        "Memória": "Memory",
        "Decisões": "Decisions",
        "Regras": "Rules",
        "Agentes / Plugins": "Agents / Plugins",
        "Documentação": "Documentation",
        "🚀 Sol central / Projeto": "🚀 Central Sun / Project",
        "📄 Contratos e Raiz": "📄 Contracts & Root",
        "📂 Subpastas": "📂 Subfolders",
        "📁 Projetos": "📁 Projects",
        "🎯 Acionável (actionable)": "🎯 Actionable (actionable)",
        "📚 Conhecimento (knowledge)": "📚 Knowledge (knowledge)",
        "🧮 Memória": "🧮 Memory",
        "⚖️ Decisões": "⚖️ Decisions",
        "📏 Regras": "📏 Rules",
        "🤖 Agentes / Plugins": "🤖 Agents / Plugins",
        "📖 Documentação": "📖 Documentation",
        "☀️ SOL DO PROJETO": "☀️ PROJECT SUN",
        "📄 DOCUMENTO": "📄 DOCUMENT",
        "🌟 Núcleo orbital": "🌟 Orbital Core",
        "⚡ Clique para destacar rota da pasta": "⚡ Click to highlight folder route",
        "⚡ Duplo-clique para abrir documento": "⚡ Double-click to open document",
        "<kbd>Girar Planeta</kbd> Arrastar botão esquerdo": "<kbd>Rotate Planet</kbd> Left-click drag",
        "<kbd>Puxar Nó</kbd> Arrastar esfera 3D": "<kbd>Drag Node</kbd> Drag 3D sphere",
        "<kbd>Zoom</kbd> Scroll roda do mouse": "<kbd>Zoom</kbd> Mouse wheel scroll",
        "<kbd>Mover</kbd> Shift + Arrastar": "<kbd>Pan</kbd> Shift + Drag",
        "<kbd>Clique</kbd> Destacar rota pasta / arquivo": "<kbd>Click</kbd> Highlight folder / file route",
        "<kbd>N</kbd> Alternar Esferas / Neurônios": "<kbd>N</kbd> Toggle Spheres / Neurons",
        "Puxar Nó": "Drag Node",
        "Arrastar esfera 3D": "Drag 3D sphere",
        "Scroll roda do mouse": "Mouse wheel scroll",
        "Mover": "Pan",
        "Shift + Arrastar": "Shift + Drag",
        "Destacar rota pasta / arquivo": "Highlight folder / file route",
        "✏️ Editar este Arquivo": "✏️ Edit this File",
        "Arquivos Markdown descobertos dinamicamente nesta seção:": "Markdown files dynamically discovered in this section:",
        "Varrendo sinapses do cérebro...": "Scanning brain synapses...",
        "Recuperando contratos, ADRs e regras determinísticas": "Retrieving contracts, ADRs, and deterministic rules",
        "Calculando relevância semântica...": "Calculating semantic relevance...",
        "Ranqueando lições aprendidas e estado dos projetos": "Ranking lessons learned and project states",
        "Sintetizando com Zero Fabricação...": "Synthesizing with Zero Fabrication...",
        "Verificando citação estrita das fontes encontradas": "Verifying strict citation of discovered sources",
        "Formatando resposta executiva...": "Formatting executive answer...",
        "Organizando links clicáveis para navegação no vault": "Organizing clickable links for vault navigation",
        "✓ Copiada!": "✓ Copied!",
        "📋 Resposta copiada para a área de transferência!": "📋 Answer copied to clipboard!",
        "Resposta copiada!": "Answer copied!",
        "Citação copiada!": "Citation copied!",
        "Não foi possível copiar.": "Could not copy.",
        "🔼 Recolher fontes adicionais": "🔼 Collapse additional sources",
        "Nenhum documento relevante encontrado para os filtros selecionados.": "No relevant documents found for the selected filters.",
        "⚠️ Falha na consulta cognitiva:": "⚠️ Cognitive query failed:",
        "PROJETO CONECTADO": "CONNECTED PROJECT",
        "DECISÃO ARQUITETURAL": "ARCHITECTURAL DECISION",
        "REGRA DETERMINÍSTICA": "DETERMINISTIC RULE",
        "MEMÓRIA & LIÇÕES": "MEMORY & LESSONS",
        "CONTRATO PRINCIPAL": "CORE CONTRACT",
        "Fonte Adicional": "Additional Source",
        "Documento relevante encontrado no ranking geral do cofre": "Relevant document found in the overall vault ranking",
        "Citada na Síntese": "Cited in Synthesis",
        "Documento utilizado diretamente no contexto da síntese da IA": "Document used directly in the AI synthesis context",
        "Abrir documento no leitor": "Open document in reader",
        "Abrir Doc": "Open Doc",
        "Localizar e focar este nó no Grafo 3D": "Locate and focus this node in the 3D Graph",
        "No Grafo": "In Graph",
        "Copiar citação Markdown [Título](caminho)": "Copy Markdown citation [Title](path)",
        "Expandir Trecho Completo": "Expand Full Snippet",
        "Recolher Trecho": "Collapse Snippet"
    };

    const norm = s => (s || '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

    // Build normalized lookup table (ignoring any self-identical entries)
    const DICT_EN = Object.create(null);
    for (const [k, v] of Object.entries(RAW_DICT_EN)) {
        const nk = norm(k);
        if (nk && norm(v) !== nk) {
            DICT_EN[nk] = v;
        }
    }

    // Dynamic Regex Pattern Replacers (for strings with dynamic numbers/names)
    const DYNAMIC_PATTERNS_EN = [
        [/^Projeto:\s*(.+)$/i, 'Project: $1'],
        [/^🎯\s*Projeto:\s*(.+)$/i, '🎯 Project: $1'],
        [/^🎯\s*Categoria:\s*(.+)$/i, '🎯 Category: $1'],
        [/^📄\s*(\d+)\s*citadas\s*\((\d+)\s*no cofre\)$/i, '📄 $1 cited ($2 in vault)'],
        [/^📄\s*(\d+)\s*fontes consultadas$/i, '📄 $1 sources consulted'],
        [/^\((\d+)\s*citadas na síntese\s*•\s*(\d+)\s*adicionais\)$/i, '($1 cited in synthesis • $2 additional)'],
        [/^\((\d+)\s*citações encontradas\)$/i, '($1 citations found)'],
        [/^Abrir no Cockpit:\s*(.+)$/i, 'Open in Cockpit: $1'],
        [/^📄\s*Ver mais\s+(\d+)\s+fontes encontradas no cofre$/i, '📄 View $1 more sources found in vault'],
        [/^Relevância:\s*(\d+)\s*pts$/i, 'Relevance: $1 pts'],
        [/^~(\d+)\s*caracteres$/i, '~$1 characters'],
        [/^Total de <strong>(\d+)<\/strong> projetos conectados$/i, 'Total of <strong>$1</strong> connected projects'],
        [/^Exibindo <strong>(\d+)<\/strong> de <strong>(\d+)<\/strong> projetos$/i, 'Showing <strong>$1</strong> of <strong>$2</strong> projects'],
        [/^Todas as Stacks \((\d+)\)$/i, 'All Stacks ($1)'],
        [/^(\d+)% Conforme$/i, '$1% Compliant'],
        [/^<span>🛡️<\/span>\s*<strong>(\d+\/\d+)<\/strong>\s*contratos$/i, '<span>🛡️</span> <strong>$1</strong> contracts'],
        [/^(\d+)\s+nós no grafo$/i, '$1 nodes in graph'],
        [/^(\d+)\s+nós$/i, '$1 nodes'],
        [/^nós$/i, 'nodes'],
        [/^nós no grafo$/i, 'nodes in graph'],
        [/^🚀 MEUS PROJETOS\s*(<span[^>]*>\d+<\/span>)$/i, '🚀 MY PROJECTS $1'],
        [/^📄\s*(\d+)\s*fontes relevantes$/i, '📄 $1 relevant sources'],
        [/^📄\s*Ver mais\s+(\d+)\s+fontes encontradas\s*\(\+(\d+)\)$/i, '📄 View $1 more sources found (+$2)'],
        [/^(\d+)\s+de\s+(\d+)\s+respondidas$/i, '$1 of $2 answered'],
        [/^(\d+)\s+de\s+(\d+)\s+decisões tomadas\s*\((\d+)%\)$/i, '$1 of $2 decisions made ($3%)'],
        [/^✓\s*Todas as\s+(\d+)\s+decisões tomadas!\s*\(100%\)$/i, '✓ All $1 decisions made! (100%)'],
        [/^Até\s+\+(\d+)$/i, 'Up to +$1'],
        [/^<strong>Projeto:<\/strong>\s*(.+)$/i, '<strong>Project:</strong> $1'],
        [/^<strong>Foco:<\/strong>\s*(.+)$/i, '<strong>Focus:</strong> $1'],
        [/^✓\s*Pasta válida\s*\((\d+)\s*itens\)(.*)$/i, '✓ Valid folder ($1 items)$2'],
        [/^Descrição:\s*(.+)$/i, 'Description: $1'],
        [/^Documento de Especificação:\s*(.+)$/i, 'Specification Document: $1'],
        [/^Contrato de Governança:\s*(.+)$/i, 'Governance Contract: $1'],
        [/^Projeto\s+'([^']+)'\s+Conectado!$/i, "Project '$1' Connected!"],
        [/^([\d.]+)\s*KB gerados$/i, '$1 KB generated'],
        [/^Etapa\s+(\d+)\s+de\s+(\d+)$/i, 'Step $1 of $2'],
        [/^1\s+arquivo$/i, '1 file'],
        [/^(\d+)\s+arquivos$/i, '$1 files'],
        [/^(\d+)\s+sessões$/i, '$1 sessions'],
        [/^(\d+)\s+sessão$/i, '$1 session'],
        [/^(\d+)\s+pesquisas$/i, '$1 researches'],
        [/^(\d+)\s+pesquisa$/i, '$1 research'],
        [/^(\d+)\s+ADRs?$/i, '$1 ADRs'],
        [/^(\d+)\s+contratos?$/i, '$1 contracts'],
        [/^<span>↺<\/span>\s*Limpar Filtros e Ver Todos \((\d+)\)$/i, '<span>↺</span> Clear Filters & View All ($1)'],
        [/^🟢\s*Conectado$/i, '🟢 Connected'],
        [/^Conectado$/i, 'Connected'],
        [/^Ao Vivo \(Disco\)$/i, 'Live (Disk)'],
        [/^Ao Vivo$/i, 'Live'],
        [/^🌐\s*Modo Demo\s*\((\d+)\s*docs\)$/i, '🌐 Demo Mode ($1 docs)'],
        [/^(<span[^>]*><\/span>)\s*🌐\s*Modo Demo\s*\((\d+)\s*docs\)$/i, '$1 🌐 Demo Mode ($2 docs)'],
        [/^(<span[^>]*><\/span>)\s*Ao Vivo \(Disco\)$/i, '$1 Live (Disk)'],
        [/^🟢\s*Ativo$/i, '🟢 Active'],
        [/^🟡\s*Em Planejamento$/i, '🟡 Planning'],
        [/^🟡\s*Planejamento$/i, '🟡 Planning'],
        [/^Contratos de Governança \((\d+)\)$/i, 'Governance Contracts ($1)'],
        [/^Decisões Arquiteturais \/ ADRs \((\d+)\)$/i, 'Architectural Decisions / ADRs ($1)'],
        [/^✓ O que já foi definido \((\d+)\)$/i, '✓ Defined & Completed ($1)'],
        [/^🎯 Próximos Passos \((\d+)\)$/i, '🎯 Next Steps ($1)'],
        [/^Histórico de Sessões \((\d+)\)$/i, 'Session History ($1)'],
        [/^Pesquisas do Projeto \((\d+)\)$/i, 'Project Research ($1)'],
        [/^⚡ Gerar Ponte \((.+)\)$/i, '⚡ Generate Bridge ($1)'],
        [/^🔄 Atualizar Ponte \((.+)\)$/i, '🔄 Update Bridge ($1)'],
        [/^Abrir Workspace de (.+)$/i, 'Open Workspace for $1'],
        [/^Expandir\/Recolher (.+)$/i, 'Expand/Collapse $1'],
        [/^Pergunta (\d+) de (\d+)$/i, 'Question $1 of $2'],
        // Project Journey Dynamic Patterns
        [/^Governança de (.+)$/i, 'Governance of $1'],
        [/^Composição do Score \((\d+)% Conforme\):$/i, 'Score Breakdown ($1% Compliant):'],
        [/^💡\s*<em>Dica: As decisões são salvas em <code>projects\/([^<]+)\/DECISIONS\/<\/code> como Architecture Decision Records \(ADRs\)\.<\/em>$/i, '💡 <em>Tip: Decisions are saved in <code>projects/$1/DECISIONS/</code> as Architecture Decision Records (ADRs).</em>'],
        [/^Ponte ativa! Clique para visualizar (.+)$/i, 'Active bridge! Click to view $1'],
        [/^Clique para gerar ponte para (.+)$/i, 'Click to generate bridge for $1'],
        [/^🧹 Arquivar (\d+) Sessões$/i, '🧹 Archive $1 Sessions'],
        [/^(\d+) arquivos de governança empacotados$/i, '$1 governance files packaged'],
        [/^Desvincular '([^']+)' do Segundo Cérebro$/i, "Unlink '$1' from Second Brain"],
        [/^Remove a junção e o monitoramento em tempo real\. Seus arquivos em <code>([^<]+)<\/code> permanecem intactos\.$/i, 'Removes the junction and real-time monitoring. Your files in <code>$1</code> remain intact.'],
        [/^Move a pasta do projeto de <code>([^<]+)<\/code> para <code>\.trash\/<\/code>\.$/i, 'Moves the project folder from <code>$1</code> to <code>.trash/</code>.'],
        [/^Pesquise temas profundos, consulte a IA conectada para refinar briefings com o contexto real de <strong>([^<]+)<\/strong> e decomponha o conhecimento em documentação teórica \(<code>knowledge\/<\/code>\) e especificações práticas \(<code>actionable\/<\/code>\)\.$/i, 'Research deep topics, query connected AI to refine briefings with the real context of <strong>$1</strong>, and decompose knowledge into theoretical docs (<code>knowledge/</code>) and actionable specs (<code>actionable/</code>).'],
        [/^A IA contextualizará sua pesquisa com os contratos e arquitetura de <strong>([^<]+)<\/strong>\.$/i, 'AI will contextualize your research with the contracts and architecture of <strong>$1</strong>.'],
        [/^Latência de Inferência \((.+)\)$/i, 'Inference Latency ($1)'],
        [/^<strong>(\d+)<\/strong> arquivo\(s\) gerado\(s\)$/i, '<strong>$1</strong> file(s) generated'],
        [/^Subtópicos & Arquivos:\s*(.+)$/i, 'Subtopics & Files: $1'],
        [/^<strong>(\d+) documentos catalogados<\/strong> no disco\. Clique em qualquer card para abrir e editar no Cockpit\.$/i, '<strong>$1 cataloged documents</strong> on disk. Click any card to open and edit in the Cockpit.'],
        [/^Planejamento de <strong>(\d+) subtópicos<\/strong> cadastrados\. Clique em <strong>"Pesquisar Agora"<\/strong> para gerar os documentos físicos\.$/i, 'Planning of <strong>$1 subtopics</strong> registered. Click <strong>"Research Now"</strong> to generate physical documents.'],
        [/^Síntese em Tempo Real:\s*(.+)$/i, 'Real-Time Synthesis: $1'],
        [/^(\d+)\s*\/\s*(\d+)\s*concluídos\s*\((\d+)%\)$/i, '$1 / $2 completed ($3%)'],
        [/^Evolução:\s*(.+)$/i, 'Evolution: $1'],
        [/^Versão\s+(\d+)$/i, 'Version $1'],
        [/^📦\s*(\d+)\s*commits?\s*·\s*(\d+)\s*arquivos? alterados?\s*(.*)$/i, '📦 $1 commit(s) · $2 modified file(s) $3'],
        [/^(\d+)\s+de\s+(\d+)\s+docs$/i, '$1 of $2 docs'],
        [/^(\d+)\s+docs$/i, '$1 docs'],
        [/^Editando:\s*(.+)$/i, 'Editing: $1'],
        [/^Visualizando:\s*(.+)$/i, 'Viewing: $1'],
        [/^(<span[^>]*><\/span>)\s*✓\s*Salvo no disco às\s*(.+)$/i, '$1 ✓ Saved to disk at $2'],
        [/^✓\s*Salvo no disco às\s*(.+)$/i, '✓ Saved to disk at $1'],
        [/^(<span[^>]*><\/span>)\s*Erro ao salvar:\s*(.+)$/i, '$1 Error saving: $2'],
        [/^Erro ao salvar:\s*(.+)$/i, 'Error saving: $1'],
        [/^(<span[^>]*><\/span>)\s*Erro:\s*(.+)$/i, '$1 Error: $2'],
        [/^Erro:\s*(.+)$/i, 'Error: $1'],
        [/^(<span[^>]*><\/span>)\s*Sugestão da IA pronta em\s*(.+)$/i, '$1 AI suggestion ready in $2'],
        [/^Sugestão da IA pronta em\s*(.+)$/i, 'AI suggestion ready in $1'],
        [/^(<span[^>]*><\/span>)\s*Rascunho pronto em\s*(.+)$/i, '$1 Draft ready in $2'],
        [/^Rascunho pronto em\s*(.+)$/i, 'Draft ready in $1'],
        [/^Pesquise temas profundos, consulte a IA conectada para refinar briefings com o contexto real de <strong>([^<]+)<\/strong>, decomponha em subtópicos e catalogue tudo em arquivos <code>\.md<\/code> de conhecimento e ação\.$/i, 'Research deep topics, query connected AI to refine briefings with the real context of <strong>$1</strong>, decompose into subtopics, and catalog everything into knowledge and actionable <code>.md</code> files.'],
        [/^(<span[^>]*><\/span>)\s*(.+)\s+Conectado\s+\((.+)\)\s*(<span[^>]*>⚙️<\/span>)$/i, '$1 $2 Connected ($3) $4'],
        [/^IA Conectada:\s*(.+)\.\s*Clique para alternar ou configurar\.$/i, 'AI Connected: $1. Click to switch or configure.'],
        [/^Chave\s+(.+)\s+ausente no \.env\.\s*Clique para configurar\.$/i, '$1 key missing in .env. Click to configure.'],
        [/^(<span[^>]*><\/span>)\s*Chave\s+(.+)\s+Ausente\s*\(\.env\)\s*(<span[^>]*>⚙️<\/span>)$/i, '$1 $2 Key Missing (.env) $3'],
        [/^Melhorar com IA\s*\((.+)\)$/i, 'Enhance with AI ($1)'],
        [/^Consultando\s+(.+)\.\.\.$/i, 'Querying $1...'],
        [/^Consultando o modelo neural\s+(.+)\s+para taxonomia de conhecimento\.\.\.$/i, 'Querying neural model $1 for knowledge taxonomy...'],
        [/^Pesquisando fundamentos, boas práticas e gerando documentação técnica em\s+(.+)\/\.\.\.$/i, 'Researching fundamentals, best practices, and generating technical docs in $1/...'],
        [/^🔮\s*(\d+)\s*subtópicos mapeados em duas camadas!$/i, '🔮 $1 subtopics mapped across two layers!'],
        [/^🚀\s*Laboratório\s+"([^"]+)"\s+criado com sucesso no disco!$/i, '🚀 Lab "$1" created on disk!'],
        [/^✨\s*Prompt Vivo atualizado para versão\s*(.+)!$/i, '✨ Live Prompt updated to version $1!'],
        [/^🗑️\s*Documento\s+"([^"]+)"\s+excluído do disco com sucesso!$/i, '🗑️ Document "$1" deleted from disk!'],
        [/^🗑️\s*Laboratório\s+"([^"]+)"\s+excluído com sucesso!$/i, '🗑️ Lab "$1" deleted!'],
        [/^🗑️\s*Todos os arquivos da pesquisa\s+"([^"]+)"\s+foram excluídos do disco!$/i, '🗑️ All files for research "$1" have been deleted from disk!'],
        [/^✨\s*\+(\d+)\s*perguntas adicionadas à sabatina!$/i, '✨ +$1 questions added to the interview!'],
        [/^💻\s*Projeto aberto no\s+(.+)!$/i, '💻 Project opened in $1!'],
        [/^✓\s*Sucesso!\s*(\d+)\s*sessões foram arquivadas em \.archive\/\.$/i, '✓ Success! $1 sessions were archived in .archive/.'],
        [/^✓\s*Download de\s+'([^']+)'\s+iniciado!\s*Verifique a pasta Downloads\.$/i, "✓ Download of '$1' started! Check your Downloads folder."],
        [/^⚡\s*Cérebro Digital Conectado:\s*(.+)\s+ativado com sucesso!$/i, '⚡ Digital Brain Connected: $1 activated!'],
        [/^🌐\s*Todas as pontes de IA foram geradas com sucesso para\s*<strong>([^<]+)<\/strong>!$/i, '🌐 All AI bridges generated for <strong>$1</strong>!'],
        [/^✨\s*Ponte para\s*<strong>([^<]+)<\/strong>\s*\(([^)]+)\)\s*gerada em\s*(.+)!$/i, '✨ Bridge for <strong>$1</strong> ($2) generated in $3!'],
        [/^✨\s*(.+)\s+inicializado com sucesso no disco!$/i, '✨ $1 initialized on disk!'],
        [/^🟢\s*Status alterado para:\s*(.+)$/i, '🟢 Status changed to: $1'],
        [/^🧠\s*Memória atualizada:\s*(.+)$/i, '🧠 Memory updated: $1'],
        [/^📋\s*Citação copiada:\s*(.+)$/i, '📋 Citation copied: $1'],
        [/^Digite\s+"([^"]+)"\s+para confirmar$/i, 'Type "$1" to confirm'],
        [/^Tem certeza que deseja remover este próximo passo do roadmap\?<br><br><em>"(.+)"<\/em>$/i, 'Are you sure you want to remove this next step from the roadmap?<br><br><em>"$1"</em>'],
        [/^Tem certeza que deseja remover este item concluído\?<br><br><em>"(.+)"<\/em>$/i, 'Are you sure you want to remove this completed item?<br><br><em>"$1"</em>'],
        [/^Deseja arquivar as sessões de memória do projeto\s*<strong>'([^']+)'<\/strong>\?<br><br>Todas as sessões serão salvas com segurança em\s*<code>MEMORY\/\.archive\/<\/code>\s*com carimbo de data\/hora\.$/i, "Do you want to archive memory sessions for project <strong>'$1'</strong>?<br><br>All sessions will be safely stored in <code>MEMORY/.archive/</code> with a timestamp."],
        [/^Esta ação desvinculará o projeto\s*<strong>([^<]+)<\/strong>\s*deste cérebro\.\s*Seus arquivos locais no disco permanecerão intactos\.<br><br>Para confirmar, digite exatamente o nome do projeto\s*\(<strong>([^<]+)<\/strong>\)\s*abaixo:$/i, 'This action will unlink project <strong>$1</strong> from this brain. Your local files on disk will remain intact.<br><br>To confirm, type the exact project name (<strong>$2</strong>) below:'],
        [/^Tem certeza que deseja excluir o documento\s*<strong>"(.+)"<\/strong>\?<br><br>(<span[^>]*>.+<\/span>)<br><br>Esta ação removerá o arquivo físico do disco e atualizará o índice\s*<code>OVERVIEW\.md<\/code>\.$/i, 'Are you sure you want to delete document <strong>"$1"</strong>?<br><br>$2<br><br>This action will remove the physical file from disk and update the <code>OVERVIEW.md</code> index.'],
        [/^Tem certeza que deseja excluir permanentemente o laboratório\s*<strong>"(.+)"<\/strong>\?<br><br>Todos os arquivos em\s*<code>knowledge\/<\/code>\s*e\s*<code>actionable\/<\/code>\s*desta pesquisa serão apagados do disco\.$/i, 'Are you sure you want to permanently delete the lab <strong>"$1"</strong>?<br><br>All files in <code>knowledge/</code> and <code>actionable/</code> for this research will be deleted from disk.'],
        [/^Tem certeza que deseja excluir\s*<strong>TODOS os arquivos<\/strong>\s*do laboratório\s*<strong>"(.+)"<\/strong>\?<br><br>Todos os documentos gerados em\s*<code>knowledge\/<\/code>\s*e\s*<code>actionable\/<\/code>\s*serão permanentemente excluídos do disco\.<br><br><em>A definição, prompt vivo e histórico de versões serão preservados\.<\/em>$/i, 'Are you sure you want to delete <strong>ALL files</strong> from lab <strong>"$1"</strong>?<br><br>All generated documents in <code>knowledge/</code> and <code>actionable/</code> will be permanently deleted from disk.<br><br><em>The definition, live prompt, and version history will be preserved.</em>'],
        [/^Erro ao (refinar com IA|decompor tópicos|criar pesquisa|salvar nova versão|executar pesquisa|aplicar proposta|excluir|excluir laboratório|excluir arquivos|sincronizar backup|arquivar memória|baixar backup|desvincular|atualizar|criar contrato|salvar no disco|gerar ponte de IA|conectar com servidor local|salvar configuração de IA):\s*(.+)$/i, 'Error: $2'],
        [/^Falha ao (comunicar com o servidor|abrir pasta|abrir arquivo):\s*(.+)$/i, 'Failed: $2'],
        [/^📂\s*PASTA\s*•\s*(\d+)\s*arquivos$/i, '📂 FOLDER • $1 files'],
        [/^🎯\s*(.+)\s*\(duplo-clique para abrir\)$/i, '🎯 $1 (double-click to open)'],
        [/^📊\s*(\d+)\s*arquivos nesta pasta$/i, '📊 $1 files in this folder'],
        [/^(\d+)\s+de\s+(\d+)$/i, '$1 of $2'],
        [/^([\d.]+\s*(?:B|KB|MB))?\s*•\s*editado\s+agora há pouco(.*)$/i, '$1 • edited just now$2'],
        [/^([\d.]+\s*(?:B|KB|MB))?\s*•\s*editado\s+há\s+(\d+)\s*h(.*)$/i, '$1 • edited $2h ago$3'],
        [/^([\d.]+\s*(?:B|KB|MB))?\s*•\s*editado\s+há\s+(\d+)\s*dias?\s*•\s*🔗\s*(\d+)\s*ligações$/i, '$1 • edited $2d ago • 🔗 $3 links'],
        [/^([\d.]+\s*(?:B|KB|MB))?\s*•\s*editado\s+há\s+(\d+)\s*dias?$/i, '$1 • edited $2d ago'],
        [/^([\d.]+\s*(?:B|KB|MB))?\s*•\s*editado\s+há\s+(\d+)\s*meses\s*•\s*🔗\s*(\d+)\s*ligações$/i, '$1 • edited $2mo ago • 🔗 $3 links'],
        [/^([\d.]+\s*(?:B|KB|MB))?\s*•\s*editado\s+há\s+(\d+)\s*meses$/i, '$1 • edited $2mo ago']
    ];

    const isInlineChild = c => INLINE_TAGS.has(c.tagName.toUpperCase()) && !c.classList.contains('btn') && !c.classList.contains('pw-tab');
    const isLeafElement = el => {
        const children = [...el.children];
        if (children.length === 0) return true;
        return children.every(isInlineChild);
    };

    const origText = new WeakMap();
    const lastEnText = new WeakMap();
    const origHtml = new WeakMap();
    const lastEnHtml = new WeakMap();

    let currentLang = 'pt';
    let isMutating = false;
    let domObserver = null;

    function translateStringToEn(str) {
        const k = norm(str);
        if (!k) return null;
        if (DICT_EN[k]) return DICT_EN[k];
        for (const [regex, replacement] of DYNAMIC_PATTERNS_EN) {
            if (regex.test(k)) {
                const res = k.replace(regex, replacement);
                return norm(res) !== k ? res : null;
            }
        }
        return null;
    }

    const DIAGRAM_SRC_RE = /^(.*assets\/diagrams\/(?:hub-satellites-architecture|ai-decision-routing|research-two-layers|session-lifecycle-loop))(-eng)?(\.svg(?:\?.*)?)$/i;

    function translateDiagramImgSrc(el, toEn) {
        if (!el || el.nodeType !== 1 || el.tagName.toUpperCase() !== 'IMG') return;
        const src = el.getAttribute('src');
        if (!src) return;
        const m = src.match(DIAGRAM_SRC_RE);
        if (!m) return;
        if (toEn) {
            if (!m[2]) {
                el.setAttribute('data-orig-src', src);
                el.setAttribute('src', `${m[1]}-eng${m[3]}`);
            }
        } else {
            if (el.hasAttribute('data-orig-src')) {
                el.setAttribute('src', el.getAttribute('data-orig-src'));
                el.removeAttribute('data-orig-src');
            } else if (m[2]) {
                el.setAttribute('src', `${m[1]}${m[3]}`);
            }
        }
    }

    function shouldSkipElement(el) {
        if (!el || el.nodeType !== 1) return true;
        if (SKIP_TAGS.has(el.tagName.toUpperCase())) return true;
        if (el.hasAttribute('data-no-i18n')) return true;
        if (el.classList && (
            el.classList.contains('doc-markdown-body') ||
            el.classList.contains('pw-path-code') ||
            el.classList.contains('proj-card-path') ||
            el.classList.contains('editor-file-path')
        )) return true;
        return false;
    }

    function translateAttributes(el, toEn) {
        if (!el || el.nodeType !== 1) return;
        translateDiagramImgSrc(el, toEn);
        for (const attr of ['title', 'placeholder', 'aria-label', 'alt', 'label']) {
            if (el.hasAttribute(attr)) {
                const backupAttr = 'data-orig-' + attr;
                if (toEn) {
                    const rawVal = el.getAttribute(attr);
                    const translated = translateStringToEn(rawVal);
                    if (translated) {
                        const cleanEn = translated.replace(/<[^>]+>/g, '');
                        if (cleanEn !== rawVal) {
                            el.setAttribute(backupAttr, rawVal);
                            el.setAttribute(attr, cleanEn);
                        }
                    }
                } else if (el.hasAttribute(backupAttr)) {
                    el.setAttribute(attr, el.getAttribute(backupAttr));
                    el.removeAttribute(backupAttr);
                }
            }
        }
    }

    function translateTextNode(node, toEn) {
        const currentVal = node.nodeValue;
        if (toEn) {
            if (lastEnText.has(node) && lastEnText.get(node) === currentVal) return;
            const translated = translateStringToEn(currentVal);
            if (translated) {
                const cleanEn = translated.replace(/<[^>]+>/g, '');
                const lead = (currentVal.match(/^\s*/) || [''])[0];
                const trail = (currentVal.match(/\s*$/) || [''])[0];
                const finalVal = lead + cleanEn + trail;
                if (finalVal !== currentVal) {
                    origText.set(node, currentVal);
                    lastEnText.set(node, finalVal);
                    node.nodeValue = finalVal;
                }
            }
        } else {
            if (origText.has(node)) {
                node.nodeValue = origText.get(node);
                origText.delete(node);
                lastEnText.delete(node);
            }
        }
    }

    function walkChildren(el, toEn) {
        for (const child of el.childNodes) {
            if (child.nodeType === 3) {
                translateTextNode(child, toEn);
            } else if (child.nodeType === 1) {
                walkElement(child, toEn);
            }
        }
    }

    function walkElement(el, toEn) {
        if (el && el.nodeType === 1 && el.classList && el.classList.contains('doc-markdown-body')) {
            el.querySelectorAll('img[src*="assets/diagrams/"]').forEach(img => translateDiagramImgSrc(img, toEn));
            return;
        }
        if (shouldSkipElement(el)) return;

        translateAttributes(el, toEn);

        const tag = el.tagName.toUpperCase();
        if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'IMG') return;

        if (el.children.length > 0 && !isLeafElement(el)) {
            walkChildren(el, toEn);
            return;
        }

        // Leaf element (or inline-children container)
        const currentHtml = el.innerHTML;
        if (toEn) {
            if (lastEnHtml.has(el) && lastEnHtml.get(el) === currentHtml) return;
            const translated = translateStringToEn(currentHtml) || (el.children.length === 0 ? translateStringToEn(el.textContent) : null);
            if (translated) {
                origHtml.set(el, currentHtml);
                el.innerHTML = translated;
                // Store canonical browser-serialized innerHTML (e.g. &amp;) so subsequent checks match 100%
                lastEnHtml.set(el, el.innerHTML);
            } else {
                origHtml.delete(el);
                lastEnHtml.delete(el);
                if (el.children.length > 0) {
                    walkChildren(el, true);
                }
            }
        } else {
            if (origHtml.has(el)) {
                el.innerHTML = origHtml.get(el);
                origHtml.delete(el);
                lastEnHtml.delete(el);
            } else if (el.children.length > 0) {
                walkChildren(el, false);
            }
        }
    }

    function updateToggleUi(lang) {
        const btn = document.getElementById('btnCockpitLang');
        if (!btn) return;
        const ptOpt = btn.querySelector('[data-lang-opt="pt"]');
        const enOpt = btn.querySelector('[data-lang-opt="en"]');
        if (ptOpt && enOpt) {
            ptOpt.classList.toggle('active', lang === 'pt');
            enOpt.classList.toggle('active', lang === 'en');
        }
        btn.setAttribute('data-active-lang', lang);
    }

    function runWithMutationGuard(fn) {
        isMutating = true;
        try {
            fn();
        } finally {
            // Drain any self-induced DOM mutation records before releasing guard
            if (domObserver) {
                try { domObserver.takeRecords(); } catch (_) {}
            }
            isMutating = false;
        }
    }

    function applyLanguage(lang, options = {}) {
        const target = lang === 'en' ? 'en' : 'pt';
        const toEn = target === 'en';
        currentLang = target;

        try {
            localStorage.setItem(STORAGE_KEY, target);
        } catch (_) {}

        document.documentElement.lang = toEn ? 'en' : 'pt-BR';

        runWithMutationGuard(() => {
            if (document.body) {
                walkElement(document.body, toEn);
            }
            updateToggleUi(target);
        });

        // If static/snapshot mode, swap in-memory markdown documents from window.VAULT_LOCALES
        if (window.VAULT && window.VAULT.mode !== 'live' && typeof window.VAULT.applyLocales === 'function') {
            window.VAULT.applyLocales(target);
            if (typeof window.refreshApp === 'function') {
                try { window.refreshApp(); } catch (_) {}
            }
            if (typeof currentPath !== 'undefined' && currentPath && typeof navigateTo === 'function') {
                try { navigateTo(currentPath); } catch (_) {}
            }
        }

        // Sync with backend server (brain.config.json) when user toggles or when requested
        if (options.syncServer) {
            fetch('/api/config/language', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: target })
            })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                // If customized files were found, prompt the user with the WOW Protection Modal!
                if (data.swapResult && data.swapResult.customizedCount > 0) {
                    if (typeof window.showLocaleProtectionModal === 'function') {
                        window.showLocaleProtectionModal(data.swapResult, target, data.aiStatus);
                    }
                }
                // If live mode, refresh the vault and reload the open document
                if (window.VAULT && window.VAULT.mode === 'live') {
                    window.VAULT.refresh().then(() => {
                        if (typeof window.refreshApp === 'function') {
                            try { window.refreshApp(); } catch (_) {}
                        }
                        if (typeof currentPath !== 'undefined' && currentPath && typeof navigateTo === 'function') {
                            try { navigateTo(currentPath); } catch (_) {}
                        }
                    }).catch(() => {});
                }
            })
            .catch(() => {});
        }

        window.dispatchEvent(new CustomEvent('cockpit:langchange', { detail: { language: target } }));
    }

    function detectInitialLanguage() {
        // 1. URL query param (?lang=en or ?lang=pt)
        try {
            const urlLang = new URLSearchParams(window.location.search).get('lang');
            if (urlLang === 'en' || urlLang === 'pt') return urlLang;
        } catch (_) {}

        // 2. Saved preference in localStorage
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'en' || saved === 'pt') return saved;
        } catch (_) {}

        // 3. Machine / OS / Browser language auto-detection
        const navLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        return navLang.startsWith('pt') ? 'pt' : 'en';
    }

    function initCockpitI18n() {
        const initial = detectInitialLanguage();
        applyLanguage(initial, { syncServer: false });

        // Observe dynamic DOM changes rendered by app.js & vault.js
        domObserver = new MutationObserver((mutations) => {
            if (isMutating || currentLang !== 'en') return;
            runWithMutationGuard(() => {
                for (const m of mutations) {
                    if (m.type === 'childList') {
                        if (m.target && m.target.nodeType === 1) {
                            translateAttributes(m.target, true);
                            if (isLeafElement(m.target)) {
                                walkElement(m.target, true);
                                continue;
                            }
                        }
                        m.addedNodes.forEach(node => {
                            if (node.nodeType === 1) walkElement(node, true);
                            else if (node.nodeType === 3) translateTextNode(node, true);
                        });
                    } else if (m.type === 'characterData' && m.target) {
                        translateTextNode(m.target, true);
                    } else if (m.type === 'attributes' && m.target && m.target.nodeType === 1) {
                        translateAttributes(m.target, true);
                    }
                }
            });
        });

        if (document.body) {
            domObserver.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
                attributeFilter: ['placeholder', 'title', 'aria-label', 'label']
            });
        }

        if (typeof window.applyTopicPreset === 'function') {
            const origApplyTopicPreset = window.applyTopicPreset;
            window.applyTopicPreset = function(topicText) {
                const text = currentLang === 'en' ? (translateStringToEn(topicText) || topicText) : topicText;
                return origApplyTopicPreset(text);
            };
        }
        if (typeof window.startQuickResearch === 'function') {
            const origStartQuickResearch = window.startQuickResearch;
            window.startQuickResearch = function(topic, definition) {
                const t = currentLang === 'en' ? (translateStringToEn(topic) || topic) : topic;
                const d = currentLang === 'en' ? (translateStringToEn(definition) || definition) : definition;
                return origStartQuickResearch(t, d);
            };
        }

        // Check backend language preference in brain.config.json (e.g. set via `npm run lang:en`)
        fetch('/api/config/language')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                if (data.explicitLanguage === 'en' || data.explicitLanguage === 'pt') {
                    if (data.explicitLanguage !== currentLang) {
                        applyLanguage(data.explicitLanguage, { syncServer: false });
                    }
                    return;
                }
                let hasLocalChoice = false;
                try { hasLocalChoice = !!localStorage.getItem('asb-lang-manual'); } catch (_) {}
                if (!hasLocalChoice && (data.language === 'en' || data.language === 'pt') && data.language !== currentLang) {
                    applyLanguage(data.language, { syncServer: false });
                }
            })
            .catch(() => {});
    }

    // ═══════════════════════════════════════════════════════════
    // BILINGUAL GOVERNANCE PROTECTION & NEURAL TRANSLATION MODAL
    // ═══════════════════════════════════════════════════════════
    let localeModalState = null;

    function formatBytes(bytes) {
        if (!bytes || bytes <= 0) return '0 B';
        const k = 1024;
        const dm = 1;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function getLayerTag(filePath) {
        const p = filePath.toLowerCase();
        if (p.includes('.agents/rules')) return 'rules';
        if (p.includes('.agents/skills')) return 'skills';
        if (p.includes('memory/')) return 'memory';
        if (p.includes('decisions/')) return 'decisions';
        if (p.includes('knowledge/')) return 'knowledge';
        return 'doc';
    }

    window.showLocaleProtectionModal = function(swapResult, targetLang, aiStatus) {
        const modal = document.getElementById('localeProtectionModal');
        if (!modal) return;

        const files = (swapResult && swapResult.customizedFiles) || [];
        if (files.length === 0) return;

        const isTargetEn = targetLang === 'en';
        localeModalState = {
            swapResult,
            targetLang,
            aiStatus: aiStatus || {},
            selectedAction: 'keep',
            selectedFiles: new Set(files.map(f => f.file))
        };

        // Header and labels
        const titleEl = document.getElementById('localeProtectionTitle');
        const subEl = document.getElementById('localeProtectionSubtitle');
        if (titleEl) {
            titleEl.textContent = isTargetEn
                ? 'Governance & Customization Protection'
                : 'Governança & Proteção de Customizações';
        }
        if (subEl) {
            const swapped = swapResult.swappedCount || 56;
            subEl.textContent = isTargetEn
                ? `${swapped} factory documents synchronized in English. Your custom modifications were detected and protected.`
                : `${swapped} arquivos de fábrica sincronizados em Português. Suas customizações foram detectadas e protegidas contra perda.`;
        }

        // Metrics strip
        const swappedCountEl = document.getElementById('localeMetricSwappedCount');
        const swappedLabelEl = document.getElementById('localeMetricSwappedLabel');
        if (swappedCountEl) swappedCountEl.textContent = swapResult.swappedCount || 56;
        if (swappedLabelEl) swappedLabelEl.textContent = isTargetEn ? 'factory docs synced (0ms)' : 'de fábrica sincronizados (0ms)';

        const customCountEl = document.getElementById('localeMetricCustomCount');
        const customLabelEl = document.getElementById('localeMetricCustomLabel');
        if (customCountEl) customCountEl.textContent = files.length;
        if (customLabelEl) customLabelEl.textContent = isTargetEn ? 'custom files safeguarded' : 'customizações detectadas';

        // AI Provider badge
        const aiBadge = document.getElementById('localeAiProviderBadge');
        const aiText = document.getElementById('localeAiProviderText');
        const aiConfigured = !!(aiStatus && aiStatus.isConfigured);
        if (aiText) {
            if (aiConfigured) {
                const prov = aiStatus.providerName || aiStatus.activeProvider || 'Universal Gateway';
                const mod = aiStatus.model ? ` (${aiStatus.model})` : '';
                aiText.textContent = `🟢 BYOK: ${prov}${mod}`;
            } else {
                aiText.innerHTML = isTargetEn
                    ? '⚠️ AI Gateway Not Configured <span style="text-decoration:underline;">(Click to setup)</span>'
                    : '⚠️ IA Não Configurada <span style="text-decoration:underline;">(Clique para configurar)</span>';
            }
        }
        if (aiBadge) {
            aiBadge.onclick = () => {
                if (typeof window.openAiSettingsModal === 'function') {
                    window.openAiSettingsModal();
                }
            };
        }

        // Banner text
        const bannerTitle = document.getElementById('localeBannerTitle');
        const bannerDesc = document.getElementById('localeBannerDesc');
        if (bannerTitle) {
            bannerTitle.textContent = isTargetEn
                ? `${files.length} customized file(s) identified with local modifications`
                : `${files.length} arquivo(s) com regras personalizadas identificados`;
        }
        if (bannerDesc) {
            bannerDesc.textContent = isTargetEn
                ? 'To preserve your business rules and prevent accidental loss, choose how to handle them in the target language:'
                : 'Identificamos que você editou os arquivos listados abaixo. Para preservar suas regras de negócio e evitar sobreescrita acidental, escolha o que deseja fazer:';
        }

        // Populate Files List
        const listEl = document.getElementById('localeCustomFilesList');
        if (listEl) {
            listEl.innerHTML = files.map((f) => {
                const tag = getLayerTag(f.file);
                const sizeStr = formatBytes(f.size);
                return `
                    <div class="locale-file-row">
                        <label class="locale-file-left" style="cursor:pointer;">
                            <input type="checkbox" class="locale-file-checkbox" checked
                                onchange="onLocaleFileToggle('${escapeHtml(f.file)}', this.checked)">
                            <span class="locale-file-tag">${tag}</span>
                            <span class="locale-file-path" title="${escapeHtml(f.file)}">${escapeHtml(f.file)}</span>
                        </label>
                        <span class="locale-file-size">${sizeStr}</span>
                    </div>
                `;
            }).join('');
        }

        // Reset Card Selection to 'keep'
        window.selectLocaleAction('keep');

        // Hide progress and error
        const prog = document.getElementById('localeProgressWrap');
        if (prog) prog.style.display = 'none';
        const err = document.getElementById('localeErrorBox');
        if (err) err.style.display = 'none';

        // Show modal
        modal.style.display = 'flex';
    };

    window.closeLocaleProtectionModal = function() {
        const modal = document.getElementById('localeProtectionModal');
        if (modal) modal.style.display = 'none';
        localeModalState = null;
    };

    window.onLocaleFileToggle = function(filePath, checked) {
        if (!localeModalState) return;
        if (checked) {
            localeModalState.selectedFiles.add(filePath);
        } else {
            localeModalState.selectedFiles.delete(filePath);
        }
        updateConfirmButtonState();
    };

    window.toggleAllLocaleFiles = function(checked) {
        if (!localeModalState) return;
        const listEl = document.getElementById('localeCustomFilesList');
        if (!listEl) return;
        const boxes = listEl.querySelectorAll('.locale-file-checkbox');
        boxes.forEach(b => {
            b.checked = checked;
        });
        if (checked) {
            localeModalState.swapResult.customizedFiles.forEach(f => localeModalState.selectedFiles.add(f.file));
        } else {
            localeModalState.selectedFiles.clear();
        }
        updateConfirmButtonState();
    };

    function updateConfirmButtonState() {
        if (!localeModalState) return;
        const btn = document.getElementById('btnLocaleConfirm');
        const icon = document.getElementById('btnLocaleConfirmIcon');
        const text = document.getElementById('btnLocaleConfirmText');
        if (!btn || !text) return;

        const isTargetEn = localeModalState.targetLang === 'en';
        const count = localeModalState.selectedFiles.size;

        if (localeModalState.selectedAction === 'keep') {
            if (icon) icon.textContent = '🛡️';
            text.textContent = isTargetEn ? 'Keep Customizations Intact' : 'Manter Customizações Intactas';
            btn.disabled = false;
        } else if (localeModalState.selectedAction === 'translate') {
            if (icon) icon.textContent = '✨';
            text.textContent = isTargetEn
                ? `Translate ${count} Custom File(s) with AI`
                : `Traduzir ${count} Arquivo(s) com IA`;
            btn.disabled = count === 0;
        } else if (localeModalState.selectedAction === 'overwrite') {
            if (icon) icon.textContent = '🔄';
            text.textContent = isTargetEn
                ? `Restore Factory Default (${count} file(s))`
                : `Restaurar Padrão de Fábrica (${count} arquivo(s))`;
            btn.disabled = count === 0;
        }
    }

    window.selectLocaleAction = function(action) {
        if (!localeModalState) return;
        localeModalState.selectedAction = action;

        const cards = ['keep', 'translate', 'overwrite'];
        cards.forEach(c => {
            const el = document.getElementById(`localeCard${c.charAt(0).toUpperCase() + c.slice(1)}`);
            if (el) {
                el.classList.toggle('selected', c === action);
                const r = el.querySelector('input[type="radio"]');
                if (r) r.checked = (c === action);
            }
        });

        // AI status hint check
        const aiHint = document.getElementById('localeCardAiHint');
        if (aiHint) {
            if (action === 'translate' && (!localeModalState.aiStatus || !localeModalState.aiStatus.isConfigured)) {
                aiHint.style.display = 'block';
                aiHint.innerHTML = localeModalState.targetLang === 'en'
                    ? '⚠️ No API key configured. Click here to configure an AI provider in AI Gateway.'
                    : '⚠️ Nenhuma chave de IA configurada. Clique aqui para conectar seu provedor no AI Gateway.';
                aiHint.onclick = (e) => {
                    e.stopPropagation();
                    if (typeof window.openAiSettingsModal === 'function') window.openAiSettingsModal();
                };
            } else {
                aiHint.style.display = 'none';
            }
        }

        updateConfirmButtonState();
    };

    window.handleLocaleTranslateProgress = function(p) {
        const wrap = document.getElementById('localeProgressWrap');
        if (!wrap) return;
        wrap.style.display = 'block';

        const stepEl = document.getElementById('localeProgressStepText');
        const pctEl = document.getElementById('localeProgressPercentText');
        const fillEl = document.getElementById('localeProgressBarFill');
        const filesEl = document.getElementById('localeProgressFilesList');

        if (pctEl) pctEl.textContent = `${p.percent || 0}%`;
        if (fillEl) fillEl.style.width = `${p.percent || 0}%`;

        const isTargetEn = localeModalState && localeModalState.targetLang === 'en';

        if (p.step === 'translating-file') {
            if (stepEl) {
                stepEl.textContent = isTargetEn
                    ? `Translating (${p.current}/${p.total}): ${p.file}...`
                    : `Traduzindo (${p.current}/${p.total}): ${p.file}...`;
            }
            if (filesEl) {
                filesEl.innerHTML = `<div style="color:#a5b4fc;">⚡ [${p.current}/${p.total}] ${escapeHtml(p.file)} &middot; ${p.model || 'AI'}</div>`;
            }
        } else if (p.step === 'file-completed') {
            if (filesEl) {
                filesEl.innerHTML = `<div style="color:#6ee7b7;">✅ [${p.current}/${p.total}] ${escapeHtml(p.file)} &middot; OK</div>`;
            }
        } else if (p.step === 'file-failed') {
            if (filesEl) {
                filesEl.innerHTML = `<div style="color:#f87171;">⚠️ [${p.current}/${p.total}] ${escapeHtml(p.file)}: ${escapeHtml(p.error)} (Original Seguro)</div>`;
            }
        }
    };

    window.executeLocaleResolution = async function() {
        if (!localeModalState) return;
        const { selectedAction, targetLang, selectedFiles, aiStatus } = localeModalState;
        const isTargetEn = targetLang === 'en';

        if (selectedAction === 'keep') {
            window.closeLocaleProtectionModal();
            if (typeof window.showToast === 'function') {
                window.showToast(isTargetEn ? 'Customizations kept intact.' : 'Customizações mantidas intactas.', 'success');
            }
            return;
        }

        if (selectedFiles.size === 0) {
            alert(isTargetEn ? 'Please select at least one file.' : 'Por favor, selecione ao menos um arquivo.');
            return;
        }

        if (selectedAction === 'translate' && (!aiStatus || !aiStatus.isConfigured)) {
            if (typeof window.openAiSettingsModal === 'function') {
                window.openAiSettingsModal();
            } else {
                alert(isTargetEn ? 'Please configure an AI API key first.' : 'Por favor, configure sua chave de IA primeiro.');
            }
            return;
        }

        const btn = document.getElementById('btnLocaleConfirm');
        const progWrap = document.getElementById('localeProgressWrap');
        const errBox = document.getElementById('localeErrorBox');
        if (btn) btn.disabled = true;
        if (progWrap) progWrap.style.display = 'block';
        if (errBox) errBox.style.display = 'none';

        try {
            const res = await fetch('/api/locales/resolve-custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetLang,
                    action: selectedAction,
                    files: Array.from(selectedFiles)
                })
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Falha ao resolver customizações.');
            }

            // Success feedback
            if (typeof window.showToast === 'function') {
                const msg = selectedAction === 'translate'
                    ? (isTargetEn ? '✨ Customizations translated with AI and cached!' : '✨ Customizações traduzidas com IA e gravadas no cache!')
                    : (isTargetEn ? '🔄 Factory templates restored. Backup saved in .locales/backups/' : '🔄 Versão de fábrica restaurada. Backup salvo em .locales/backups/');
                window.showToast(msg, 'success');
            }

            // Refresh live vault & re-open active document if open
            if (window.VAULT) {
                await window.VAULT.refresh();
            }
            if (typeof window.refreshApp === 'function') {
                window.refreshApp();
            }
            if (typeof currentPath !== 'undefined' && currentPath && typeof navigateTo === 'function') {
                navigateTo(currentPath);
            }

            setTimeout(() => {
                window.closeLocaleProtectionModal();
            }, 800);

        } catch (err) {
            if (btn) btn.disabled = false;
            if (errBox) {
                errBox.style.display = 'flex';
                const content = document.getElementById('localeErrorContent');
                if (content) {
                    content.innerHTML = `
                        <strong>${isTargetEn ? 'Operation Exception' : 'Exceção na Operação'}</strong>
                        <p style="margin:2px 0 0;">${escapeHtml(err.message)}</p>
                        <p style="margin:4px 0 0; font-size:11px; color:#cbd5e1;">
                            ${isTargetEn ? 'Safety Rollback: Your original files were left 100% intact.' : 'Garantia de Integridade: Seus arquivos originais permaneceram 100% intactos.'}
                        </p>
                    `;
                }
            }
        }
    };

    window.COCKPIT_I18N = {
        get lang() { return currentLang; },
        set(lang, options = {}) {
            const syncServer = options.syncServer !== undefined ? options.syncServer : true;
            if (syncServer) {
                try { localStorage.setItem('asb-lang-manual', '1'); } catch (_) {}
            }
            applyLanguage(lang, { syncServer });
        },
        toggle() {
            const next = currentLang === 'en' ? 'pt' : 'en';
            this.set(next);
        },
        t(ptText, enText) {
            return currentLang === 'en' ? enText : ptText;
        },
        translate(str) {
            if (currentLang !== 'en' || !str) return str;
            return translateStringToEn(str) || str;
        },
        translateElement(el) {
            if (!el) return;
            runWithMutationGuard(() => {
                walkElement(el, currentLang === 'en');
            });
        },
        refresh() {
            if (document.body) {
                runWithMutationGuard(() => {
                    walkElement(document.body, currentLang === 'en');
                });
            }
            updateToggleUi(currentLang);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCockpitI18n);
    } else {
        initCockpitI18n();
    }
})();
