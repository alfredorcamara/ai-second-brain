/**
 * AI Second Brain — Modal de Detalhamento Técnico das Funcionalidades
 * Apresenta informações 100% factuais, reais e estruturadas sobre o projeto.
 * Suporta navegação por teclado (Setas, ESC, Enter), bilíngue (PT/EN) e histórico.
 */
(() => {
  'use strict';

  const FEATURES_DATA = [
    {
      id: 'memoria-persistente',
      color: '#38bdf8',
      hasHeaderVideo: true,
      headerVideoSrc: 'assets/video/synapse-modal.mp4',
      headerVideoPoster: 'assets/video/synapse-poster.jpg',
      iconHtml: '<svg viewBox="20 20 80 80" width="46" height="46" class="hero-brain-svg"><defs><filter id="hbglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#hbglow)" stroke="#38bdf8" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M63.2 26.4 C59.1 23.3 53.8 24.4 51.1 27.9 C45.9 26.5 40.9 29.8 40.2 34.3 C35.2 35.7 32.9 40.1 34.4 44.1 C29.5 47.1 28.2 52.6 30.8 56.8 C28.5 62.1 31.1 68.1 36.4 69.8 C39.4 74.5 45.2 75.4 50.1 73.5 C52.2 78.4 57.8 80.5 63.5 79.4 C66.8 82.4 70.6 85.4 70.5 91.1 L76.8 91.1 L76.5 85.8 C76.4 83.2 75.5 81.2 73.5 78.9 C81.2 79.3 86.6 74.2 87.1 68.4 C92.4 65.5 93.4 59.2 90.1 54.6 C91.7 49.4 89.1 44.4 85.2 42.4 C85.4 36.9 81.2 32.9 76.2 33.3 C74.4 28.7 69.6 26.5 64.9 28.2 C64.4 27.5 63.8 26.9 63.2 26.4 Z"/><path d="M51.1 27.9 C52.7 30.2 52.6 32.4 51.2 35.2 C49.7 38.1 50.4 41.3 53.3 43.2"/><path d="M40.2 34.3 C43.2 35.8 44.4 38.1 43.2 41.2 C42.1 44.2 44.3 46.2 47.3 46.4"/><path d="M34.4 44.1 C37.6 43.5 39.2 45.2 39.6 48.1 C40 51.1 42.1 52.3 44.6 52.3"/><path d="M30.8 56.8 C34.3 54.8 36.3 56.1 38.6 58.4 L38.3 63.1"/><path d="M47.3 46.4 C49.4 48.1 49.4 51.1 48.2 53.3 C46.8 55.7 47.3 59.2 50.2 60.4"/><path d="M53.3 43.2 C57.2 40.4 61.3 41.7 63.7 45.3 C66.2 49 64.5 52.3 61.7 54.1"/><path d="M64.9 28.2 C67.1 31.2 66.7 34.6 64.8 37.6 C62.7 41 63.4 43.7 65.5 46"/><path d="M76.2 33.3 C75.3 37.1 72.9 39.2 70.1 39.7 C67.2 40.2 66.1 43.2 67.4 46"/><path d="M76.7 47.2 C73.5 43.5 69.4 44.1 67.4 46"/><path d="M85.2 42.4 C81.6 43.2 80.1 46.2 80.7 49.1"/><path d="M61.7 54.1 C58.7 56.3 58.7 60.4 61.2 62.8 C63.4 65 62.5 68.2 59.5 69.5"/></g></svg>',
      badge: {
        pt: 'Memória Neural & Continuidade',
        en: 'Neural Memory & Continuity'
      },
      title: {
        pt: 'Memória Persistente Real (Sem Amnésia)',
        en: 'Real Persistent Memory (No Amnesia)'
      },
      tagline: {
        pt: 'Contexto vital do projeto gravado em Markdown versionado que sobrevive a fechamentos de abas, trocas de LLM e reinicializações de IDE.',
        en: 'Vital project context recorded in versioned Markdown that survives closed tabs, LLM swaps, and IDE restarts.'
      },
      whatItIs: {
        pt: 'Diferente de chats isolados onde o agente sofre de amnésia a cada nova janela ou limite de contexto, o AI Second Brain mantém um histórico contínuo em duas instâncias: global (`memory/`) e contextual de cada projeto (`projects/<nome>/MEMORY/`).',
        en: 'Unlike isolated chats where the agent forgets everything with each new window or context overflow, AI Second Brain maintains continuous memory across two scopes: global (`memory/`) and project-specific (`projects/<name>/MEMORY/`).'
      },
      howItWorks: [
        {
          title: { pt: 'Contrato de Inicialização Mandatório', en: 'Mandatory Startup Contract' },
          desc: {
            pt: 'Antes de gerar qualquer código, a governança obriga o agente a inspecionar `CURRENT_STATE.md` (o que está rodando, pendências e última versão) e `memory/lessons-learned.md` (erros do passado para nunca repetir).',
            en: 'Before generating code, governance requires the agent to inspect `CURRENT_STATE.md` (active features, pending items, latest build) and `memory/lessons-learned.md` (past mistakes to never repeat).'
          }
        },
        {
          title: { pt: 'Histórico de Sessões Cronológico', en: 'Chronological Session History' },
          desc: {
            pt: 'Ao concluir uma etapa de trabalho, é gerado um log em `MEMORY/sessions/YYYY-MM-DD.md` registrando entregas, arquivos modificados, decisões tomadas e eventuais débitos técnicos.',
            en: 'Upon completing a work cycle, a log in `MEMORY/sessions/YYYY-MM-DD.md` records deliverables, modified files, architectural decisions, and technical debt.'
          }
        },
        {
          title: { pt: 'Consolidação Automática de Estado', en: 'Automatic State Consolidation' },
          desc: {
            pt: 'O estado ativo do projeto é sincronizado no `CURRENT_STATE.md`, permitindo que o próximo agente retome o trabalho em menos de 10 segundos sem precisar reler o repositório inteiro.',
            en: 'Active project state is synced to `CURRENT_STATE.md`, allowing the next agent to resume in under 10 seconds without having to re-read the entire codebase.'
          }
        }
      ],
      realFiles: [
        {
          path: 'projects/<projeto>/CURRENT_STATE.md',
          desc: { pt: 'Estado consolidado atual, tarefas em andamento e marcos de versão.', en: 'Consolidated active state, in-progress tasks, and release milestones.' }
        },
        {
          path: 'projects/<projeto>/MEMORY/sessions/',
          desc: { pt: 'Registros cronológicos detalhados de cada sessão de desenvolvimento.', en: 'Detailed chronological logs for each development session.' }
        },
        {
          path: 'memory/lessons-learned.md',
          desc: { pt: 'Base viva de lições aprendidas e bugs evitados em todos os projetos.', en: 'Living knowledge base of lessons learned and bugs prevented across projects.' }
        },
        {
          path: '.agents/skills/session-memory/SKILL.md',
          desc: { pt: 'Skill oficial de governança que rege o ciclo de leitura e gravação da memória.', en: 'Official governance skill governing memory read/write cycles.' }
        }
      ],
      metrics: [
        {
          label: { pt: 'Zero Amnésia', en: 'Zero Amnesia' },
          val: { pt: 'Alterne entre Claude, Gemini e GPT-4 sem perda de contexto.', en: 'Switch between Claude, Gemini, and GPT-4 without losing context.' }
        },
        {
          label: { pt: 'Economia de Tokens', en: 'Token Economy' },
          val: { pt: 'Apenas 2KB a 5KB de estado inicial pré-aquecem o agente.', en: 'Only 2KB to 5KB of initial state pre-warms the agent.' }
        },
        {
          label: { pt: '100% Auditável', en: '100% Auditable' },
          val: { pt: 'Toda a evolução do pensamento fica versionada no Git.', en: 'The entire evolution of AI reasoning is tracked in Git.' }
        }
      ],
      codeBadge: { pt: 'Project State (Git)', en: 'Project State (Git)' },
      codeSnippet: {
        pt: '# 1. Estado Vivo do Projeto (projects/MEU_APP/CURRENT_STATE.md)\nStatus: Sprint 04 — Motor de Decisão Local e RAG Ativo\nÚltima Sessão: 2026-10-18 (Entregas com validação humana)\nDecisões Aplicadas: ADR-001 (Zero Lock-in), ADR-003 (Motor JEV)\nPróximo Passo: Refatorar telemetria de tokens no server.js',
        en: '# 1. Live Project State (projects/MY_APP/CURRENT_STATE.md)\nStatus: Sprint 04 — Local Decision Engine and RAG Active\nLast Session: 2026-10-18 (Deliveries with human-in-the-loop)\nDecisions Applied: ADR-001 (Zero Lock-in), ADR-003 (JEV Engine)\nNext Step: Refactor token telemetry in server.js'
      }
    },
    {
      id: 'session-capture',
      color: '#10b981',
      hasHeaderVideo: true,
      headerVideoSrc: 'assets/video/session-capture-modal.mp4',
      headerVideoPoster: 'assets/video/session-capture-poster.jpg',
      iconHtml: '<i>🧠</i>',
      badge: {
        pt: 'Automação & Fechamento de Ciclo',
        en: 'Closure Automation & Flow'
      },
      title: {
        pt: 'Session Capture com IA & Revisão Humana',
        en: 'AI Session Capture & Human-in-the-Loop'
      },
      tagline: {
        pt: 'Feche o ciclo de desenvolvimento em 30 segundos com síntese inteligente de commits e revisão humana mandatória.',
        en: 'Close the development loop in 30 seconds with intelligent commit synthesis and mandatory human review.'
      },
      whatItIs: {
        pt: 'O fluxo automatizado que transforma o trabalho do dia em memória neural duradoura, eliminando a dor e a preguiça do desenvolvedor de documentar manualmente o que foi codificado.',
        en: 'The automated flow that turns the day\'s work into durable neural memory, eliminating developer friction and laziness in manually documenting what was built.'
      },
      howItWorks: [
        {
          title: { pt: 'Inspeção de Git Diff e Status', en: 'Git Diff & Status Inspection' },
          desc: {
            pt: 'O backend inspeciona o `git status`, a árvore de arquivos modificados e os commits recentes do projeto selecionado.',
            en: 'The backend inspects `git status`, modified files, and recent commits for the selected project.'
          }
        },
        {
          title: { pt: 'Síntese Estruturada por IA', en: 'Structured AI Synthesis' },
          desc: {
            pt: 'Uma chamada leve a um modelo LLM (usando sua chave configurada) sintetiza o trabalho em 4 blocos padronizados: Resumo, O Que Foi Feito, Arquivos Alterados e Pendências/Próximos Passos.',
            en: 'A lightweight LLM call (using your configured key) synthesizes the work into 4 standardized blocks: Summary, Deliverables, Modified Files, and Next Steps.'
          }
        },
        {
          title: { pt: 'Revisão Humana Obrigatória', en: 'Mandatory Human Review' },
          desc: {
            pt: 'A interface exibe o rascunho em um formulário interativo. O humano pode editar, complementar ou descartar antes de salvar no disco.',
            en: 'The UI displays the draft in an interactive form. The human can edit, refine, or discard before saving to disk.'
          }
        },
        {
          title: { pt: 'Persistência no Git', en: 'Git Persistence' },
          desc: {
            pt: 'Ao aprovar, o sistema grava o arquivo `MEMORY/sessions/YYYY-MM-DD.md` e atualiza o `CURRENT_STATE.md` deterministicamente.',
            en: 'Upon approval, the system writes `MEMORY/sessions/YYYY-MM-DD.md` and updates `CURRENT_STATE.md` deterministically.'
          }
        }
      ],
      realFiles: [
        {
          path: 'server.js',
          desc: { pt: 'Rotas da API: POST /api/session-capture e POST /api/projects/:name/session.', en: 'API routes: POST /api/session-capture and POST /api/projects/:name/session.' }
        },
        {
          path: 'docs/brain-ui/app.js',
          desc: { pt: 'Modal de Session Capture com preview e formulário de validação humana.', en: 'Session Capture modal with preview and human validation form.' }
        },
        {
          path: '.agents/skills/session-memory/SKILL.md',
          desc: { pt: 'Protocolo formal que define o formato das sessões e integridade de dados.', en: 'Formal protocol defining session format and data integrity.' }
        }
      ],
      metrics: [
        {
          label: { pt: 'Fechamento Rápido', en: 'Quick Closure' },
          val: { pt: 'Menos de 30 segundos entre terminar o código e ter a memória gravada.', en: 'Under 30 seconds from code completion to persisted memory.' }
        },
        {
          label: { pt: 'Controle Humano', en: 'Human Control' },
          val: { pt: 'Nenhuma IA grava memória sem aprovação explícita do desenvolvedor.', en: 'No AI writes memory without explicit developer approval.' }
        },
        {
          label: { pt: 'Onboarding Imediato', en: 'Instant Onboarding' },
          val: { pt: 'O próximo agente ou colega sabe exatamente onde a tarefa parou.', en: 'The next agent or peer knows exactly where the task left off.' }
        }
      ],
      codeBadge: { pt: 'CLI & Session Capture', en: 'CLI & Session Capture' },
      codeSnippet: {
        pt: '# 1. Ciclo de encerramento rápido pelo terminal:\n$ git commit -m "feat(auth): shield against secret leakage"\n$ ai-brain session-capture --project MEU_APP\n\n# 2. Síntese com Human-in-the-Loop antes de gravar:\n[DIFF] 3 arquivos modificados (server.js, .env, auth.ts)\n[RESUMO] 3 entregas consolidadas, 1 pendência de telemetria\n[GRAVADO] projects/MEU_APP/MEMORY/sessions/2026-10-18.md',
        en: '# 1. Fast closure cycle via terminal:\n$ git commit -m "feat(auth): shield against secret leakage"\n$ ai-brain session-capture --project MY_APP\n\n# 2. Human-in-the-Loop synthesis before saving:\n[DIFF] 3 files modified (server.js, .env, auth.ts)\n[SUMMARY] 3 consolidated deliveries, 1 telemetry pending\n[SAVED] projects/MY_APP/MEMORY/sessions/2026-10-18.md'
      }
    },
    {
      id: 'decision-gate',
      color: '#a3e635',
      hasHeaderVideo: true,
      headerVideoSrc: 'assets/video/decision-gate-modal.mp4',
      headerVideoPoster: 'assets/video/decision-gate-poster.jpg',
      iconHtml: '<i>⚡</i>',
      badge: {
        pt: 'Roteamento & Otimização de Tokens',
        en: 'Routing & Token Optimization'
      },
      title: {
        pt: 'AI Decision Gate & Motor JEV',
        en: 'AI Decision Gate & JEV Engine'
      },
      tagline: {
        pt: 'O motor de decisão local `RulesDecisionProvider` (0ms / custo zero) classifica tarefas antes de chamar LLMs, economizando milhares de tokens.',
        en: 'The local `RulesDecisionProvider` decision engine (0ms / zero cost) classifies tasks before calling LLMs, saving thousands of tokens.'
      },
      whatItIs: {
        pt: 'Uma barreira arquitetural de triagem inspirada no framework AIJev/JEV que impede o desperdício financeiro de tokens em LLMs quando lógica determinística e regras locais resolvem a demanda perfeitamente.',
        en: 'An architectural triage gate inspired by the AIJev/JEV framework that prevents token waste on LLMs when deterministic logic and local rules solve the task cleanly.'
      },
      howItWorks: [
        {
          title: { pt: 'Classificação Prévia de Tarefas', en: 'Pre-Task Classification' },
          desc: {
            pt: 'Cada tarefa é classificada em 7 categorias: Determinística (A), Classificação (B), Decisão (C), Geração (D), Raciocínio Aberto (E), Execução (F) e Investigação (G).',
            en: 'Each task is classified into 7 categories: Deterministic (A), Classification (B), Decision (C), Generation (D), Open Reasoning (E), Execution (F), and Investigation (G).'
          }
        },
        {
          title: { pt: 'Prioridade Determinística', en: 'Deterministic Priority' },
          desc: {
            pt: 'Tarefas de lógica clara, compilação, scripts e queries são resolvidas diretamente por código determinístico com custo zero e latência de 0ms.',
            en: 'Tasks with clear logic, compilation, scripts, and queries are solved directly by deterministic code with zero cost and 0ms latency.'
          }
        },
        {
          title: { pt: 'Roteamento para LLM Somente Quando Necessário', en: 'LLM Routing Only When Necessary' },
          desc: {
            pt: 'Modelos generativos caros são acionados apenas para síntese aberta, redação criativa ou raciocínio exploratório (Tipo D/E).',
            en: 'Expensive generative models are only triggered for open synthesis, creative writing, or exploratory reasoning (Type D/E).'
          }
        }
      ],
      realFiles: [
        {
          path: '.agents/skills/ai-decision-gate/SKILL.md',
          desc: { pt: 'Skill oficial com o algoritmo de decisão e fluxo de triagem.', en: 'Official skill with the decision algorithm and triage workflow.' }
        },
        {
          path: 'knowledge/ai/AIJEV.md',
          desc: { pt: 'Documento de especificação do padrão AIJev e regras de roteamento.', en: 'AIJev pattern specification and routing rules document.' }
        },
        {
          path: 'knowledge/ai/MODEL_SELECTION.md',
          desc: { pt: 'Matriz comparativa para escolha do modelo correto (custo x latência x janela).', en: 'Comparative matrix for picking the right model (cost vs latency vs context window).' }
        },
        {
          path: 'AGENTS.md & GEMINI.md',
          desc: { pt: 'Regra absoluta universal: NUNCA utilize LLM quando código determinístico resolver.', en: 'Universal rule: NEVER use LLMs when deterministic code suffices.' }
        }
      ],
      metrics: [
        {
          label: { pt: 'Até 70% Menos Custos', en: 'Up to 70% Less Cost' },
          val: { pt: 'Evita chamadas redundantes a APIs da OpenAI, Anthropic e Google.', en: 'Prevents redundant calls to OpenAI, Anthropic, and Google APIs.' }
        },
        {
          label: { pt: 'Latência 0ms', en: '0ms Latency' },
          val: { pt: 'Decisões e regras de negócio resolvidas localmente no computador.', en: 'Decisions and business rules evaluated locally on your machine.' }
        },
        {
          label: { pt: 'Confiabilidade Máxima', en: 'Maximum Reliability' },
          val: { pt: 'Código determinístico não alucina nem altera comportamento arbitrariamente.', en: 'Deterministic code does not hallucinate or change behavior arbitrarily.' }
        }
      ],
      codeBadge: { pt: 'Decision Gate (0ms)', en: 'Decision Gate (0ms)' },
      codeSnippet: 'TAREFA -> É DETERMINÍSTICA?\n  [SIM] -> Código / Regra Direta (0 tokens, 0ms, R$ 0,00)\n  [NÃO] -> É DECISÃO/CLASSIFICAÇÃO?\n           [SIM] -> AIJev / RulesDecisionProvider\n           [NÃO] -> Precisa Gerar? [SIM] -> LLM Especializado'
    },
    {
      id: 'prompt-bootstrap',
      color: '#6366f1',
      hasHeaderVideo: true,
      headerVideoSrc: 'assets/video/prompt-bootstrap-modal.mp4',
      headerVideoPoster: 'assets/video/prompt-bootstrap-poster.jpg',
      iconHtml: '<i>🚀</i>',
      badge: {
        pt: 'Ergonomia & Inicialização Rápida',
        en: 'Ergonomics & Fast Startup'
      },
      title: {
        pt: 'Prompt Bootstrap & Acesso Rápido ao Workspace',
        en: 'Prompt Bootstrap & Fast Workspace Access'
      },
      tagline: {
        pt: 'Copie em 1 clique o prompt pré-aquecido com regras e contratos para qualquer agente de IA, e acerte o caminho físico no Explorador sem atrito.',
        en: '1-click copy pre-warmed prompt with rules and contracts for any AI agent, and access the physical folder in Explorer without friction.'
      },
      whatItIs: {
        pt: 'A ponte cirúrgica entre o Cockpit Visual do Second Brain e o seu fluxo diário de desenvolvimento. Elimina a amnésia de contexto em novos chats de IA e conecta a navegação visual ao sistema de arquivos local de forma limpa, direta e agnóstica.',
        en: 'The surgical bridge between the Second Brain Visual Cockpit and your daily workflow. Eliminates context amnesia in new AI chats and links visual navigation directly to the local filesystem in a clean, direct, and agnostic way.'
      },
      howItWorks: [
        {
          title: { pt: 'Compilação Instantânea no Cliente', en: 'Instant Client-Side Compilation' },
          desc: {
            pt: 'A Brain UI compila em menos de 50ms um payload cirúrgico contendo nome do projeto, caminho físico absoluto, stack tecnológica e ponteiros mandatórios para `PROJECT.md`, `CURRENT_STATE.md`, `DECISIONS/` e `LESSONS_LEARNED.md`.',
            en: 'Brain UI compiles in under 50ms a surgical payload containing project name, absolute physical path, tech stack, and mandatory pointers to `PROJECT.md`, `CURRENT_STATE.md`, `DECISIONS/`, and `LESSONS_LEARNED.md`.'
          }
        },
        {
          title: { pt: '100% Agnóstico a Qualquer Chat de IA', en: '100% Agnostic to Any AI Chat' },
          desc: {
            pt: 'O texto copiado para a área de transferência está pronto para ser colado em qualquer assistente ou IDE (Claude Code, Cursor Chat, Google Antigravity, ChatGPT, DeepSeek ou Windsurf), garantindo que o agente inicie com governança e sem amnésia.',
            en: 'The text copied to the clipboard is ready to paste into any assistant or IDE (Claude Code, Cursor Chat, Google Antigravity, ChatGPT, DeepSeek, or Windsurf), ensuring the agent starts with governance and zero amnesia.'
          }
        },
        {
          title: { pt: 'Abertura Nativa & Cópia de Caminho', en: 'Native Launch & Path Copy' },
          desc: {
            pt: 'Um clique no caminho (`📂 [caminho]`) aciona o endpoint seguro local (`POST /api/system/open-ide` com `explorer`), abrindo a pasta no Explorador de Arquivos do SO, enquanto o botão `📋 Copiar Caminho` agiliza o terminal.',
            en: 'Clicking the path (`📂 [path]`) calls the secure local endpoint (`POST /api/system/open-ide` with `explorer`), opening the folder in the OS File Explorer, while the `📋 Copy Path` button speeds up terminal usage.'
          }
        }
      ],
      realFiles: [
        {
          path: 'docs/brain-ui/app.js',
          desc: { pt: 'Função copySessionStartPrompt() que compila o payload cirúrgico e copia para a área de transferência.', en: 'copySessionStartPrompt() compiling the surgical payload and copying to system clipboard.' }
        },
        {
          path: 'server.js',
          desc: { pt: 'Endpoint POST /api/system/open-ide que abre a pasta do projeto no Explorador do SO nativamente.', en: 'POST /api/system/open-ide endpoint natively launching the project folder in OS Explorer.' }
        },
        {
          path: 'templates/project.md',
          desc: { pt: 'Template estruturado que serve de base para o bootstrap de contexto de cada projeto.', en: 'Structured template serving as the baseline for every project bootstrap context.' }
        }
      ],
      metrics: [
        {
          label: { pt: '1 Clique & 0 Tokens Desperdiçados', en: '1 Click & 0 Wasted Tokens' },
          val: { pt: 'Gera o contexto cirúrgico exato na área de transferência em menos de 50ms, eliminando prompts manuais repetitivos.', en: 'Generates the exact surgical context in clipboard under 50ms, eliminating repetitive manual prompts.' }
        },
        {
          label: { pt: '100% Agnóstico de Ferramenta', en: '100% Tool Agnostic' },
          val: { pt: 'Funciona com qualquer agente ou IDE (Cursor, Claude, Antigravity, VS Code, Windsurf) sem lock-in.', en: 'Works with any agent or IDE (Cursor, Claude, Antigravity, VS Code, Windsurf) with zero lock-in.' }
        },
        {
          label: { pt: 'Zero Amnésia & Governança Imediata', en: 'Zero Amnesia & Instant Governance' },
          val: { pt: 'O agente inicia sabendo as decisões prévias (ADRs), lições aprendidas e estado atual do roadmap.', en: 'The agent starts knowing prior decisions (ADRs), lessons learned, and the active roadmap.' }
        }
      ],
      codeBadge: { pt: 'Context Injection', en: 'Context Injection' },
      codeSnippet: '// 1. Payload cirúrgico gerado no Clipboard (docs/brain-ui/app.js)\nVocê está atuando no projeto **MeuProjeto**, governado pelo AI Second Brain.\nStack Principal: Node.js / TypeScript | Diretório: C:\\\\Projetos\\\\MeuProjeto\n\nANTES DE EXECUTAR QUALQUER TAREFA:\n1. Consulte a visão geral e arquitetura em: `PROJECT.md`\n2. Consulte o estado atual e tarefas ativas em: `CURRENT_STATE.md`\n3. Consulte as decisões consolidadas em: `DECISIONS/`\n4. Consulte lições aprendidas em: `memory/lessons-learned.md` e `LESSONS_LEARNED.md`\n5. REGRAS ABSOLUTAS:\n   - Prioridade Determinística: Código puro antes de LLM.\n   - Zero Fabricação: NUNCA invente contexto ou especificações inexistentes.\n   - Catálogos 100% Dinâmicos: NUNCA crie listas fixas de modelos.\n   - Respeito a Decisões: Não altere arquitetura sem novo ADR em `DECISIONS/`.\n\nMe apresente onde o projeto parou e qual é o próximo passo recomendado.\n\n// 2. Abertura Nativa no Explorador (server.js via POST /api/system/open-ide)\n// Clique em "📂 [caminho]" -> Abre explorer.exe diretamente na pasta do projeto.'
    },
    {
      id: 'governanca-owasp',
      color: 'rgb(113, 175, 255)',
      hasHeaderVideo: true,
      headerVideoSrc: 'assets/video/governanca-owasp-modal.mp4',
      headerVideoPoster: 'assets/video/governanca-owasp-poster.jpg',
      iconHtml: '<i>🛡️</i>',
      badge: {
        pt: 'Segurança & Blindagem',
        en: 'Security & Hardening'
      },
      title: {
        pt: 'Governança Técnica & OWASP Top 10 for LLMs',
        en: 'Technical Governance & OWASP Top 10 for LLMs'
      },
      tagline: {
        pt: 'Proteção ativa contra vazamento de segredos, injeção de prompt e fabricação de código tratadas como regras inegociáveis.',
        en: 'Active protection against secret leaks, prompt injection, and code fabrication treated as non-negotiable rules.'
      },
      whatItIs: {
        pt: 'Um framework de regras de engenharia vivas e universais que qualquer agente operando no workspace é obrigado a seguir por design, prevenindo riscos de segurança e código especulativo.',
        en: 'A framework of living, universal engineering rules that any agent operating in the workspace is forced to follow by design, preventing security risks and speculative code.'
      },
      howItWorks: [
        {
          title: { pt: 'Regra Fundamental de Zero Fabricação', en: 'Zero Fabrication Ground Rule' },
          desc: {
            pt: 'O agente é terminantemente proibido de inventar bibliotecas que não constem no projeto, telas que não existam ou regras de negócio especulativas.',
            en: 'The agent is strictly forbidden from inventing libraries that do not exist in package.json/requirements, speculative screens, or undocumented business logic.'
          }
        },
        {
          title: { pt: 'Blindagem Contra Vazamento de Segredos', en: 'Secret Leakage Hardening' },
          desc: {
            pt: 'Regras explícitas em `.agents/rules/03-security.md` proíbem o hardcoding de chaves de API, tokens e senhas, exigindo `.env` sanitizado e exclusão estrita no `.gitignore`.',
            en: 'Explicit rules in `.agents/rules/03-security.md` forbid hardcoding API keys, tokens, and credentials, requiring sanitized `.env` and strict `.gitignore` exclusions.'
          }
        },
        {
          title: { pt: 'Proteção OWASP Top 10 for LLMs', en: 'OWASP Top 10 for LLMs Protection' },
          desc: {
            pt: 'Mitigação de vulnerabilidades comuns: injeção de prompt indireta, consumo desmedido de recursos e validação mandatória de saídas de código antes de gravar no disco.',
            en: 'Mitigation of common vulnerabilities: indirect prompt injection, runaway resource consumption, and mandatory code output validation before saving to disk.'
          }
        }
      ],
      realFiles: [
        {
          path: '.agents/rules/03-security.md',
          desc: { pt: 'Diretrizes de segurança para variáveis de ambiente, dados confidenciais e credenciais.', en: 'Security guidelines for environment variables, confidential data, and credentials.' }
        },
        {
          path: '.agents/rules/01-coding-standards.md',
          desc: { pt: 'Padrões de clean code, contratos determinísticos e arquitetura.', en: 'Clean code standards, deterministic contracts, and architecture.' }
        },
        {
          path: 'AGENTS.md & GEMINI.md',
          desc: { pt: 'Constituição universal de governança para qualquer agente (Cursor, Claude, Gemini, Copilot).', en: 'Universal governance constitution for any agent (Cursor, Claude, Gemini, Copilot).' }
        }
      ],
      metrics: [
        {
          label: { pt: 'Zero Vazamento', en: 'Zero Leaks' },
          val: { pt: 'Proteção ativa contra inclusão de segredos ou API keys no Git.', en: 'Active defense against committing secrets or API keys to Git.' }
        },
        {
          label: { pt: 'Sem Pacotes Fantasmas', en: 'No Phantom Packages' },
          val: { pt: 'Elimina alucinações de bibliotecas inexistentes (Package Hallucination).', en: 'Eliminates hallucinations of non-existent libraries (Package Hallucination).' }
        },
        {
          label: { pt: 'Governança Aberta', en: 'Open Governance' },
          val: { pt: 'Qualquer novo agente respeita os mesmos limites de segurança.', en: 'Any new agent automatically adheres to the same security boundaries.' }
        }
      ],
      codeBadge: { pt: 'OWASP Security Gate', en: 'OWASP Security Gate' },
      codeSnippet: '// Checklist de Governança Ativa (.agents/rules/03-security.md):\n[PASS] Zero Fabricação: Todas as bibliotecas validadas no package.json\n[PASS] Anti-Leak: Nenhuma API Key ou secret hardcoded (.env sanitizado)\n[PASS] OWASP LLM-01: Sanitização de injeção de prompt em inputs externos\n[PASS] Respeito a Decisões: Nenhuma mudança arquitetural sem novo ADR'
    },
    {
      id: 'agnostico-stack',
      color: '#ffc76b',
      hasHeaderVideo: true,
      headerVideoSrc: 'assets/video/agnostico-stack-modal.mp4',
      headerVideoPoster: 'assets/video/agnostico-stack-poster.jpg',
      iconHtml: '<i>🧩</i>',
      badge: {
        pt: 'Interoperabilidade Universal',
        en: 'Universal Interoperability'
      },
      title: {
        pt: '100% Agnóstico de Stack Tecnológica',
        en: '100% Stack Agnostic'
      },
      tagline: {
        pt: 'Node, Python, Go, C#, Rust, Flutter, React ou SQL: o Segundo Cérebro opera sobre o raciocínio e a engenharia, não a sintaxe.',
        en: 'Node, Python, Go, C#, Rust, Flutter, React, or SQL: the Second Brain operates on reasoning and engineering, not syntax.'
      },
      whatItIs: {
        pt: 'Uma infraestrutura de desenvolvimento que opera no nível do sistema de arquivos e da semântica de engenharia, funcionando com qualquer linguagem, framework ou banco de dados.',
        en: 'A development infrastructure that operates at the filesystem and software engineering semantic level, compatible with any language, framework, or database.'
      },
      howItWorks: [
        {
          title: { pt: 'Conexão Nativa ou por Directory Junctions', en: 'Native or Directory Junction Connections' },
          desc: {
            pt: 'Seus projetos podem residir diretamente dentro de `projects/<nome>` ou ficar nas suas pastas de trabalho habituais, conectados ao cérebro via Directory Junction (`mklink /J` no Windows ou `ln -s` no Linux/macOS).',
            en: 'Your projects can live directly inside `projects/<name>` or remain in their regular workspace folders, connected via Directory Junction (`mklink /J` on Windows or `ln -s` on Linux/macOS).'
          }
        },
        {
          title: { pt: 'Contratos em Markdown Neutro', en: 'Contracts in Neutral Markdown' },
          desc: {
            pt: 'Decisões arquiteturais (ADRs), lições aprendidas e estado são expressos em Markdown, a linguagem universal que qualquer LLM interpreta com máxima acurácia.',
            en: 'Architectural decisions (ADRs), lessons learned, and state are expressed in Markdown, the universal language that every LLM understands with highest fidelity.'
          }
        },
        {
          title: { pt: 'Isolamento de Contexto Multi-Projeto', en: 'Multi-Project Context Isolation' },
          desc: {
            pt: 'Alterne entre um backend em C#/.NET, um microsserviço em Go, scripts em Python e um front em React sem contaminação cruzada de regras ou estado.',
            en: 'Switch between a C#/.NET backend, a Go microservice, Python scripts, and a React frontend without cross-contamination of rules or state.'
          }
        }
      ],
      realFiles: [
        {
          path: 'projects/',
          desc: { pt: 'Diretório raiz que acolhe múltiplos projetos independentes ou monorepos.', en: 'Root directory hosting multiple independent projects or monorepos.' }
        },
        {
          path: 'docs/COMO_UTILIZAR_O_PROJETO.md',
          desc: { pt: 'Manual oficial de conexão de repositórios externos via junções no SO.', en: 'Official guide for connecting external repos via OS junctions.' }
        },
        {
          path: 'templates/project.md',
          desc: { pt: 'Template de especificação arquitetural compatível com qualquer stack.', en: 'Architectural specification template compatible with any tech stack.' }
        }
      ],
      metrics: [
        {
          label: { pt: 'Qualquer Linguagem', en: 'Any Language' },
          val: { pt: 'TypeScript, Python, C#, Rust, Go, Java, PHP, Dart e SQL.', en: 'TypeScript, Python, C#, Rust, Go, Java, PHP, Dart, and SQL.' }
        },
        {
          label: { pt: 'Zero Modificação', en: 'Zero Changes' },
          val: { pt: 'Não requer alterar scripts de build ou dependências do seu app.', en: 'Requires no alterations to your app\'s build scripts or dependencies.' }
        },
        {
          label: { pt: 'Monorepo Ready', en: 'Monorepo Ready' },
          val: { pt: 'Conecte múltiplos serviços e compartilhe lições aprendidas globais.', en: 'Connect multiple services and share global lessons learned.' }
        }
      ],
      codeBadge: { pt: 'Filesystem Junctions', en: 'Filesystem Junctions' },
      codeSnippet: '# Conectar projeto existente sem duplicar pastas:\n# Windows (Directory Junction):\ncmd /c mklink /J "projects\\MEU_SAAS" "D:\\Workspace\\Rust\\meu-saas"\n\n# Linux / macOS (Symlink nativo):\nln -s "/workspace/go/meu-servico" "projects/meu-servico"'
    },
    {
      id: 'zero-lock-in',
      color: '#22d3ee',
      hasHeaderVideo: true,
      headerVideoSrc: 'assets/video/zero-lock-in-modal.mp4',
      headerVideoPoster: 'assets/video/zero-lock-in-poster.jpg',
      iconHtml: '<i>📝</i>',
      badge: {
        pt: 'Soberania de Dados & Git',
        en: 'Data Sovereignty & Git'
      },
      title: {
        pt: 'Zero Lock-In: 100% Puro Markdown Versionado',
        en: 'Zero Lock-In: 100% Pure Versioned Markdown'
      },
      tagline: {
        pt: 'Sem bancos de dados proprietários na nuvem. Seus arquivos pertencem a você, versionados no Git e legíveis por qualquer IA de hoje ou do futuro.',
        en: 'No proprietary cloud databases. Your files belong to you, versioned in Git and readable by any AI today or in the future.'
      },
      whatItIs: {
        pt: 'A garantia definitiva de que todo o conhecimento acumulado na sua carreira e empresa está em arquivos de texto plano acessíveis, portáteis e sob seu controle soberano.',
        en: 'The ultimate guarantee that all knowledge accumulated in your career and company sits in plain text files that are accessible, portable, and under your sovereign control.'
      },
      howItWorks: [
        {
          title: { pt: 'Padrão Aberto Markdown (GFM)', en: 'Open Markdown Standard (GFM)' },
          desc: {
            pt: 'Todas as regras, decisões (ADRs), sessões e documentações usam formatação padrão GitHub Flavored Markdown.',
            en: 'All rules, decisions (ADRs), sessions, and docs use standard GitHub Flavored Markdown formatting.'
          }
        },
        {
          title: { pt: 'Versionamento Completo no Git', en: 'Full Git Versioning' },
          desc: {
            pt: 'Cada alteração de regras ou lição aprendida vira um commit no repositório local, preservando o histórico completo de autoria e diffs.',
            en: 'Every rule change or lesson learned becomes a commit in your local repo, preserving full diffs and authorship history.'
          }
        },
        {
          title: { pt: 'Imunidade a Mudanças de Mercado', en: 'Immunity to Market Shifts' },
          desc: {
            pt: 'Se uma ferramenta de IA aumentar o preço ou fechar, seus arquivos continuam legíveis no VS Code, Obsidian, Cursor ou qualquer CLI sem necessidade de migração.',
            en: 'If an AI tool hikes prices or shuts down, your files remain readable in VS Code, Obsidian, Cursor, or any CLI without migration.'
          }
        }
      ],
      realFiles: [
        {
          path: 'decisions/',
          desc: { pt: 'Architectural Decision Records (ADRs) imutáveis e auditáveis.', en: 'Immutable and auditable Architectural Decision Records (ADRs).' }
        },
        {
          path: 'knowledge/',
          desc: { pt: 'Artigos técnicos, padrões de integração e guias de modelagem.', en: 'Technical articles, integration patterns, and modeling guides.' }
        },
        {
          path: 'memory/',
          desc: { pt: 'Memória persistente global e lições aprendidas em texto puro.', en: 'Global persistent memory and lessons learned in plain text.' }
        }
      ],
      metrics: [
        {
          label: { pt: 'Soberania Total', en: 'Full Sovereignty' },
          val: { pt: 'Seus dados e segredos nunca ficam reféns de um SaaS fechado.', en: 'Your data and secrets are never hostage to a closed SaaS platform.' }
        },
        {
          label: { pt: 'Longevidade', en: 'Longevity' },
          val: { pt: 'Textos em Markdown continuam legíveis em 2030, 2040 e além.', en: 'Markdown text will still be readable in 2030, 2040, and beyond.' }
        },
        {
          label: { pt: 'Auditabilidade Git', en: 'Git Auditability' },
          val: { pt: 'Veja exatamente quem alterou cada regra com `git log` e `git diff`.', en: 'Inspect exactly who changed each rule with `git log` and `git diff`.' }
        }
      ],
      codeBadge: { pt: 'Git Auditability', en: 'Git Auditability' },
      codeSnippet: '# Total soberania e rastreabilidade pelo Git terminal:\n$ git log -p -1 DECISIONS/ADR-004-arquitetura-rag.md\n+ Status: Aceito em 2026-10-18\n+ Decisão: Busca híbrida BM25 ponderada sem banco vetorial proprietário\n+ Autoria: 100% legível por humanos e qualquer IA hoje ou em 2035'
    },
    {
      id: 'grafo-3d',
      color: '#c084fc',
      hasHeaderVideo: true,
      headerVideoSrc: 'assets/video/grafo-3d-modal.mp4',
      headerVideoPoster: 'assets/video/grafo-3d-poster.jpg',
      iconHtml: '<i>🌐</i>',
      badge: {
        pt: 'Visualização Neural & Cartografia',
        en: 'Neural Visualization & Cartography'
      },
      title: {
        pt: 'Grafo Espacial 3D Neural Interativo',
        en: 'Interactive 3D Neural Spatial Graph'
      },
      tagline: {
        pt: 'Visualize seu ecossistema técnico como neurônios conectados em tempo real com Three.js e force-directed layout.',
        en: 'Visualize your technical ecosystem as connected neurons in real time with Three.js and force-directed layout.'
      },
      whatItIs: {
        pt: 'Uma interface tridimensional de cartografia de conhecimento que transforma pastas, arquivos e referências cruzadas em uma constelação neural viva.',
        en: 'A 3D knowledge cartography interface that turns folders, files, and cross-references into a living neural constellation.'
      },
      howItWorks: [
        {
          title: { pt: 'Crawler e Indexação de Conexões', en: 'Crawler & Connection Indexing' },
          desc: {
            pt: 'O backend lê o sistema de arquivos local e extrai links wiki no formato `[[documento]]`, conectando nós conceituais de projetos diferentes.',
            en: 'The backend parses the local filesystem and extracts wiki links like `[[document]]`, creating edges between cross-project concepts.'
          }
        },
        {
          title: { pt: 'Renderização em Three.js & Shaders', en: 'Three.js & Shader Rendering' },
          desc: {
            pt: 'O motor gráfico renderiza esferas ou neurônios com pulsação bioluminescente, física de atração gravitacional e modos de visualização alternáveis.',
            en: 'The graphics engine renders spheres or organic neurons with bioluminescent pulsing, gravitational physics, and toggleable view styles.'
          }
        },
        {
          title: { pt: 'Leitor Lateral Integrado', en: 'Integrated Side Reader' },
          desc: {
            pt: 'Clicar em qualquer neurônio acende as sinapses conectadas e abre o documento renderizado no painel lateral com links internos clicáveis.',
            en: 'Clicking any neuron lights up its connected synapses and opens the rendered document in the side panel with clickable wiki links.'
          }
        }
      ],
      realFiles: [
        {
          path: 'docs/brain-ui/landing/js/vendor/neuron-graph.js',
          desc: { pt: 'Motor Three.js customizado com física de partículas e pulso sináptico.', en: 'Custom Three.js engine with particle physics and synaptic pulse.' }
        },
        {
          path: 'server.js',
          desc: { pt: 'Endpoint /api/graph que mapeia diretórios, arquivos e sinapses em tempo real.', en: 'Endpoint /api/graph mapping directories, files, and synapses in real time.' }
        },
        {
          path: 'docs/brain-ui/landing/index.html',
          desc: { pt: 'Canvas 3D WebGL integrado ao palco de navegação e leitor #reader.', en: 'WebGL 3D canvas integrated with navigation stage and #reader panel.' }
        }
      ],
      metrics: [
        {
          label: { pt: 'Cartografia Viva', en: 'Living Map' },
          val: { pt: 'Identifique nós órfãos, densidade de regras e dependências cruzadas.', en: 'Spot orphaned nodes, rule density, and cross-dependencies instantly.' }
        },
        {
          label: { pt: 'Imersão 3D', en: '3D Immersion' },
          val: { pt: 'Alternância entre modo orgânico (neurônios) e esferas de dados.', en: 'Switch between organic neuron mode and data spheres.' }
        },
        {
          label: { pt: 'Zero Lag', en: 'Zero Lag' },
          val: { pt: 'WebGL acelerado por hardware rodando a 60 FPS com Three.js.', en: 'Hardware-accelerated WebGL running at 60 FPS with Three.js.' }
        }
      ],
      codeBadge: { pt: 'Three.js / WebGL', en: 'Three.js / WebGL' },
      codeSnippet: '// Renderização em tempo real do Grafo Neural 3D (Three.js):\nconst vault = await fetch(\'/api/graph\').then(r => r.json());\n// 142 documentos, 28 neurônios (pastas), 384 sinapses [[wiki-links]]\nconst graph = new BrainGraph({ canvas, container: \'#graph-stage\' });\ngraph.render(vault.nodes, vault.edges, { pulseSpeed: 1.2, bloom: 0.85 });'
    },
    {
      id: 'pergunte-cerebro',
      color: 'rgb(72, 102, 236)',
      hasHeaderVideo: true,
      headerVideoSrc: 'assets/video/pergunte-cerebro-modal.mp4',
      headerVideoPoster: 'assets/video/pergunte-cerebro-poster.jpg',
      iconHtml: '<i>✨</i>',
      badge: {
        pt: 'Busca Semântica & RAG Local',
        en: 'Semantic Search & Local RAG'
      },
      title: {
        pt: 'Pergunte ao Cérebro (Ctrl+K) com Citações Auditáveis',
        en: 'Ask the Brain (Ctrl+K) with Auditable Citations'
      },
      tagline: {
        pt: 'Busca semântica determinística (TF-IDF/BM25) com multiplicadores de governança e síntese por IA (BYOK) com Zero Fabricação.',
        en: 'Deterministic semantic search (TF-IDF/BM25) with governance multipliers and AI synthesis (BYOK) with Zero Fabrication.'
      },
      whatItIs: {
        pt: 'A central de busca e consulta inteligente local que responde dúvidas arquiteturais e operacionais em segundos, citando os arquivos fontes exatos sem alucinações.',
        en: 'The local intelligent search and query hub that answers architectural and operational questions in seconds, citing exact source files without hallucination.'
      },
      howItWorks: [
        {
          title: { pt: 'Índice Invertido Local (BM25/TF-IDF)', en: 'Local Inverted Index (BM25/TF-IDF)' },
          desc: {
            pt: 'O backend constrói em memória um índice léxico dos arquivos Markdown, respondendo buscas em milissegundos sem depender de serviços externos ou vetores na nuvem.',
            en: 'The backend builds an in-memory lexical index of Markdown files, answering queries in milliseconds without cloud vector databases.'
          }
        },
        {
          title: { pt: 'Ponderação por Governança', en: 'Governance Weighting' },
          desc: {
            pt: 'Resultados encontrados em ADRs (`decisions/`) e regras de segurança (`.agents/rules/`) recebem multiplicadores de relevância maiores que notas casuais.',
            en: 'Matches in ADRs (`decisions/`) and security rules (`.agents/rules/`) receive higher relevance multipliers than casual notes.'
          }
        },
        {
          title: { pt: 'Síntese BYOK com Zero Fabricação', en: 'BYOK Synthesis with Zero Fabrication' },
          desc: {
            pt: 'O desenvolvedor pode usar sua própria chave de API (OpenAI, Gemini ou Claude) para sintetizar uma resposta estritamente ancorada nos documentos citados.',
            en: 'The developer can plug their own API key (OpenAI, Gemini, or Claude) to synthesize an answer strictly grounded in the cited documents.'
          }
        }
      ],
      realFiles: [
        {
          path: 'server.js',
          desc: { pt: 'Endpoints /api/search (busca local BM25) e /api/ask (síntese por LLM com RAG).', en: 'Endpoints /api/search (local BM25 search) and /api/ask (LLM synthesis with RAG).' }
        },
        {
          path: 'docs/brain-ui/app.js',
          desc: { pt: 'Interface de busca instantânea acionável via atalho global Ctrl + K.', en: 'Instant search interface triggered via global shortcut Ctrl + K.' }
        },
        {
          path: '.agents/rules/02-architecture.md',
          desc: { pt: 'Critérios de documentação que garantem indexação e relevância precisa.', en: 'Documentation standards ensuring high indexing and search precision.' }
        }
      ],
      metrics: [
        {
          label: { pt: 'Respostas em 1s', en: '1s Answers' },
          val: { pt: 'Localize decisões arquiteturais e lições sem vasculhar pastas.', en: 'Locate architectural decisions and lessons without digging through folders.' }
        },
        {
          label: { pt: 'Zero Alucinação', en: 'Zero Hallucination' },
          val: { pt: 'A IA responde estritamente o que está escrito nos seus documentos.', en: 'The AI answers strictly based on what is written in your documents.' }
        },
        {
          label: { pt: 'Links Auditáveis', en: 'Auditable Links' },
          val: { pt: 'Cada resposta acompanha os caminhos dos arquivos fontes para conferência.', en: 'Every answer provides clickable source file paths for verification.' }
        }
      ],
      codeBadge: {
        pt: 'Ctrl+K RAG Console',
        en: 'Ctrl+K RAG Console'
      },
      codeSnippet: {
        pt: '// 1. Pergunta em linguagem natural no Cockpit (Ctrl+K):\n> "Qual a regra para uso de IA versus código determinístico?"\n\n// 2. Busca BM25 com Pesos de Governança (server.js):\n[RANK 1] AGENTS.md:L23 (Regras Universais)          -> Score: 9.8 ★★★\n[RANK 2] DECISIONS/ADR-003-motor-jev.md             -> Score: 9.1 ★★★\n[RANK 3] .agents/rules/02-architecture.md           -> Score: 8.4 ★★☆\n\n// 3. Síntese Local RAG com Citações Auditáveis (Zero Fabricação):\n"NUNCA utilize LLM quando código determinístico ou regras resolverem.\nLLMs são reservados estritamente para geração de conteúdo e raciocínio aberto."\nFontes Auditadas: `AGENTS.md:L23` | `DECISIONS/ADR-003.md:L12`',
        en: '// 1. Natural language query in Cockpit (Ctrl+K):\n> "What is the rule for using LLM vs deterministic code?"\n\n// 2. BM25 Search with Governance Multipliers (server.js):\n[RANK 1] AGENTS.md:L23 (Universal Rules)            -> Score: 9.8 ★★★\n[RANK 2] DECISIONS/ADR-003-motor-jev.md             -> Score: 9.1 ★★★\n[RANK 3] .agents/rules/02-architecture.md           -> Score: 8.4 ★★☆\n\n// 3. Local RAG Synthesis with Audited Citations (Zero Fabrication):\n"NEVER use an LLM when deterministic code or rules resolve it.\nLLMs are reserved strictly for content generation and open reasoning."\nAudited Sources: `AGENTS.md:L23` | `DECISIONS/ADR-003.md:L12`'
      }
    }
  ];

  const QUICKSTART_DATA = [
    {
      id: 'qs-entrada-dual',
      color: '#a3e635',
      hasHeaderVideo: false,
      iconHtml: '<svg viewBox="0 0 48 48" width="46" height="46" fill="none" stroke="#a3e635" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M26 6C26 6 38 8 40 20C40 20 42 32 30 32C26 32 24 30 22 28L16 34L14 32L20 26C18 24 16 22 16 18C16 6 26 6 26 6Z"/><path d="M12 36L6 42"/><path d="M10 24L6 28"/><path d="M24 38L20 42"/><circle cx="30" cy="18" r="3" fill="#a3e635" opacity="0.4"/></svg>',
      badge: {
        pt: 'Quickstart Studio · Passo 1',
        en: 'Quickstart Studio · Step 1'
      },
      title: {
        pt: 'Entrada Dual: Greenfield vs. Brownfield (Zero Duplicação)',
        en: 'Dual Entry: Greenfield vs. Brownfield (Zero Duplication)'
      },
      tagline: {
        pt: 'Inicie uma ideia nova do zero ou plugue um repositório Git existente via Symlink NTFS sem duplicar nenhum byte.',
        en: 'Start a clean idea from scratch or connect an existing Git repo via native NTFS Symlinks without duplicating a single byte.'
      },
      whatItIs: {
        pt: 'O Quickstart Studio resolve o maior atrito de adoção em ferramentas de governança: o receio de ter que migrar pastas ou alterar a estrutura de repositórios consolidados. Com a Entrada Dual, você tem dois caminhos autênticos: Criar do Zero (Greenfield) com git init automático e .gitignore sanitizado contra segredos, ou Vincular Repositório Existente (Brownfield) via junção NTFS / Symlink nativo, mantendo o seu código 100% no local original e injetando a camada de memória persistente e regras multi-agente.',
        en: 'Quickstart Studio eliminates the major friction when adopting governance tools: the fear of migrating folders or disrupting established repositories. With Dual Entry, you have two native paths: Greenfield creation with automatic git init and secret-sanitized .gitignore, or Brownfield linking via native NTFS Junction / Symlink, keeping code 100% in its original directory while injecting persistent memory and multi-agent governance.'
      },
      howItWorks: [
        {
          title: { pt: 'Junção NTFS / Symlink Nativo Instantâneo', en: 'Instant Native NTFS Junction / Symlink' },
          desc: {
            pt: 'Em repositórios existentes, o AI Second Brain cria um ponteiro de sistema de arquivos em `projects/<nome>/`. Nenhuma pasta de código é copiada ou movida, garantindo compatibilidade total com git branch, commits, hooks e pipelines de CI/CD.',
            en: 'For existing repositories, AI Second Brain creates an OS-level filesystem junction under `projects/<name>/`. Zero code is copied or moved, maintaining complete git branch and CI/CD integrity.'
          }
        },
        {
          title: { pt: 'Sanitização Automática Anti-Vazamento (.gitignore)', en: 'Automatic Secret Sanitization (.gitignore)' },
          desc: {
            pt: 'Em projetos novos, o gerador cria regras blindadas de `.gitignore` que impedem o commit acidental de arquivos `.env`, chaves de API, credenciais e caches de dependências pesadas (`node_modules/`, `venv/`, `bin/`, `obj/`).',
            en: 'For new projects, the engine writes fortified `.gitignore` rules preventing accidental leaks of `.env` files, API keys, credentials, and dependency caches.'
          }
        },
        {
          title: { pt: 'Dual-Mode: Express (50ms) vs. Sabatina Grill', en: 'Dual-Mode: Express (50ms) vs. Grill Studio' },
          desc: {
            pt: 'Você escolhe a velocidade: o Modo Express cria instantaneamente contratos limpos (0 tokens gastos), enquanto o Modo Assistido (Grill Studio) convoca o Arquiteto de IA para validar a stack e eliminar ambiguidades.',
            en: 'You pick the speed: Express Mode creates clean template contracts instantly (0 tokens spent), while Assisted Mode (Grill) invokes the AI Architect to challenge your stack and eliminate ambiguity.'
          }
        }
      ],
      realFiles: [
        {
          path: 'scripts/create-project.js',
          desc: { pt: 'Script de inicialização determinística de projetos do zero com git init.', en: 'Deterministic greenfield project initialization script with git init.' }
        },
        {
          path: 'scripts/link-project.js',
          desc: { pt: 'Motor de junção NTFS e verificação de integridade de links simbólicos.', en: 'NTFS junction engine and symlink integrity verification.' }
        },
        {
          path: 'templates/project.md',
          desc: { pt: 'Template de governança mandatório injetado no projeto.', en: 'Mandatory governance template injected into project.' }
        },
        {
          path: 'server.js',
          desc: { pt: 'Endpoints REST `/api/projects/create` e `/api/projects/link`.', en: 'REST endpoints for project creation and linking.' }
        }
      ],
      metrics: [
        {
          label: { pt: '0 Bytes Duplicados', en: '0 Bytes Duplicated' },
          val: { pt: 'Seu código permanece intacto no caminho original.', en: 'Your code remains 100% untouched in its original path.' }
        },
        {
          label: { pt: '50ms no Modo Express', en: '50ms in Express Mode' },
          val: { pt: 'Geração instantânea e determinística sem custo de API.', en: 'Instant deterministic generation with zero API cost.' }
        },
        {
          label: { pt: 'Multi-Stack Nativo', en: 'Native Multi-Stack' },
          val: { pt: 'Compatível com Node, .NET, Python, Go, Rust, Java e Mobile.', en: 'Compatible with Node, .NET, Python, Go, Rust, Java, and Mobile.' }
        }
      ],
      codeBadge: {
        pt: 'Simulação da Criação via Cockpit',
        en: 'Cockpit Creation Simulation'
      },
      codeSnippet: {
        pt: '// 1. Vincular repositório existente sem duplicar arquivos:\nPOST /api/projects/link\nBody: { "name": "meu-ecommerce", "targetPath": "C:\\\\Projetos\\\\meu-ecommerce" }\n\n// 2. Criação da Junção NTFS no Windows (0ms):\ncmd.exe /c mklink /J "c:\\\\AI_SECOND_BRAIN\\\\projects\\\\meu-ecommerce\\\\src" "C:\\\\Projetos\\\\meu-ecommerce"\n\n// 3. Resultado de Governança:\n✔ Junção NTFS ativa: C:\\\\Projetos\\\\meu-ecommerce <==> projects/meu-ecommerce/\n✔ Pontes de IA multi-agente criadas (.agents/rules/)\n✔ Estado inicial registrado em projects/meu-ecommerce/CURRENT_STATE.md',
        en: '// 1. Link existing repository without duplicating files:\nPOST /api/projects/link\nBody: { "name": "my-ecommerce", "targetPath": "C:\\\\Projects\\\\my-ecommerce" }\n\n// 2. NTFS Junction creation on Windows (0ms):\ncmd.exe /c mklink /J "c:\\\\AI_SECOND_BRAIN\\\\projects\\\\my-ecommerce\\\\src" "C:\\\\Projects\\\\my-ecommerce"\n\n// 3. Governance result:\n✔ NTFS Junction active: C:\\\\Projects\\\\my-ecommerce <==> projects/my-ecommerce/\n✔ Multi-agent IA bridges created (.agents/rules/)\n✔ Active state initialized in projects/my-ecommerce/CURRENT_STATE.md'
      }
    },
    {
      id: 'qs-sabatina-grill',
      color: '#38bdf8',
      hasHeaderVideo: false,
      iconHtml: '<svg viewBox="0 0 48 48" width="46" height="46" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="3" fill="#38bdf8"/><path d="M24 4V8"/><path d="M24 40V44"/><path d="M4 24H8"/><path d="M40 24H44"/></svg>',
      badge: {
        pt: 'Quickstart Studio · Passo 2',
        en: 'Quickstart Studio · Step 2'
      },
      title: {
        pt: 'Sabatina Técnica de IA (Grill Studio)',
        en: 'AI Technical Grill (Grill Studio)'
      },
      tagline: {
        pt: 'Um Arquiteto de IA formula de 3 a 4 perguntas cirúrgicas iniciais, permitindo aprofundar com até +4 complementares (máximo de 8 no total) em accordion focado antes de gerar código.',
        en: 'An AI Architect asks 3 to 4 initial surgical questions, expandable by up to +4 complementary questions (maximum 8 in total) in a focused accordion before writing code.'
      },
      whatItIs: {
        pt: 'A maioria dos assistentes de código comete erros graves porque inicia a geração a partir de prompts vagos. O Grill Studio inverte essa dinâmica: o Arquiteto de IA analisa a stack e sabatina o desenvolvedor com 3 a 4 perguntas técnicas profundas em accordion inteligente. Caso deseje aprofundar tópicos como observabilidade, logs, circuit breakers, cache ou CI/CD, é possível solicitar rodadas adicionais de até +4 perguntas, atingindo o teto calibrado de 8 decisões arquiteturais consolidadas antes de gerar qualquer arquivo.',
        en: 'Most coding agents fail because they start from ambiguous prompts. Grill Studio reverses this dynamic: the AI Architect inspects your stack and questions the developer with 3 to 4 deep technical questions in a smart accordion. If you want to deepen topics like observability, logs, circuit breakers, cache, or CI/CD, you can request additional rounds of up to +4 questions, reaching a calibrated ceiling of 8 architectural decisions before generating files.'
      },
      howItWorks: [
        {
          title: { pt: 'Rodada Inicial Cirúrgica (3 a 4 Perguntas)', en: 'Initial Surgical Round (3 to 4 Questions)' },
          desc: {
            pt: 'O motor em `scripts/quickstart-grill.js` detecta a stack e formula as primeiras decisões capitais: persistência (SQL vs NoSQL), autenticação (JWT vs Session/OAuth) e contratos de API.',
            en: 'The engine in `scripts/quickstart-grill.js` detects the stack and asks foundational questions: persistence (SQL vs NoSQL), auth (JWT vs OAuth/Session), and API contracts.'
          }
        },
        {
          title: { pt: 'Aprofundamento Sob Demanda (Até +4, Máximo 8)', en: 'On-Demand Deepening (Up to +4, Maximum 8)' },
          desc: {
            pt: 'Na barra de ações do Grill Studio, a caixa "Aprofundar Sabatina" permite gerar até mais 4 perguntas complementares sobre resiliência (Circuit Breakers, DLQs), observabilidade (OpenTelemetry, Winston) e deploy (Docker, CI/CD), travando no teto de 8 decisões para evitar sobrecarga.',
            en: 'In Grill Studio action cards, the "Deepen Grill" box requests up to 4 complementary questions on resilience (Circuit Breakers), observability, and CI/CD, capping at 8 decisions to prevent cognitive fatigue.'
          }
        },
        {
          title: { pt: 'Accordion Inteligente com Auditoria Semântica', en: 'Smart Accordion with Semantic Coherence Audit' },
          desc: {
            pt: 'Apenas 1 pergunta permanece aberta por vez com chips de 1 clique. Se você digitar respostas contraditórias, o validador semântico em tempo real alerta o conflito e sugere correções antes de sintetizar os contratos.',
            en: 'Only 1 question remains open at a time with 1-click chips. If contradictory answers are typed, the real-time semantic validator flags the conflict and suggests fixes before contract synthesis.'
          }
        }
      ],
      realFiles: [
        {
          path: 'scripts/quickstart-grill.js',
          desc: { pt: 'Motor de geração de perguntas da sabatina e auditoria semântica.', en: 'Grill questions generation engine and semantic coherence validator.' }
        },
        {
          path: 'scripts/decision-provider.js',
          desc: { pt: 'Regras locais determinísticas para prevenção de alucinação e ambiguidade.', en: 'Local deterministic rules preventing ambiguity and hallucinations.' }
        },
        {
          path: 'docs/brain-ui/app.js',
          desc: { pt: 'Interface do Accordion Focado e barra de progresso da sabatina.', en: 'Focused Accordion UI and live progress bar implementation.' }
        }
      ],
      metrics: [
        {
          label: { pt: '3 a 8 Perguntas', en: '3 to 8 Questions' },
          val: { pt: '3 a 4 iniciais + até 4 complementares (teto de 8).', en: '3 to 4 initial + up to 4 complementary (max 8).' }
        },
        {
          label: { pt: '1 por Vez (Accordion)', en: '1 at a Time (Accordion)' },
          val: { pt: 'Zero fadiga mental e avanço automático suave.', en: 'Zero cognitive fatigue with smooth auto-advance.' }
        },
        {
          label: { pt: 'Auditoria em Tempo Real', en: 'Real-Time Audit' },
          val: { pt: 'Detecção imediata de respostas incoerentes ou vagas.', en: 'Immediate detection of incoherent or vague answers.' }
        }
      ],
      codeBadge: {
        pt: 'Exemplo Real da Sabatina Técnica',
        en: 'Real Technical Grill Example'
      },
      codeSnippet: {
        pt: '// 1. Rodada Inicial (3 a 4 Perguntas):\nPOST /api/projects/quickstart/questions\nPayload: { "name": "gateway-pagamentos", "stack": "Node.js / TypeScript" }\n-> Resposta: [q1: Persistência, q2: Autenticação, q3: Tolerância a Falhas]\n\n// 2. Aprofundamento Sob Demanda (Até +4, Máximo de 8):\nPOST /api/projects/quickstart/questions\nPayload: { "name": "gateway-pagamentos", "stack": "...", "existingQuestions": [q1, q2, q3] }\n-> Resposta Complementar: [q4: Resiliência/Circuit Breaker, q5: Observabilidade/Pino, q6: DLQ/RabbitMQ]\n\n// 3. Trava do Motor (docs/brain-ui/app.js:4240):\nif (currentGrillQuestions.length >= 8) {\n  badgeMore.textContent = "Máx 8";\n  textMore.textContent = "✓ Sabatina completa (8 perguntas)";\n}',
        en: '// 1. Initial Round (3 to 4 Questions):\nPOST /api/projects/quickstart/questions\nPayload: { "name": "payments-gateway", "stack": "Node.js / TypeScript" }\n-> Response: [q1: Persistence, q2: Authentication, q3: Fault Tolerance]\n\n// 2. On-Demand Deepening (Up to +4, Maximum 8):\nPOST /api/projects/quickstart/questions\nPayload: { "name": "payments-gateway", "stack": "...", "existingQuestions": [q1, q2, q3] }\n-> Complementary Response: [q4: Resilience/Circuit Breaker, q5: Observability/Pino, q6: DLQ/RabbitMQ]\n\n// 3. Engine Cap (docs/brain-ui/app.js:4240):\nif (currentGrillQuestions.length >= 8) {\n  badgeMore.textContent = "Max 8";\n  textMore.textContent = "✓ Complete grill (8 questions)";\n}'
      }
    },
    {
      id: 'qs-contratos-jev',
      color: '#c084fc',
      hasHeaderVideo: false,
      iconHtml: '<svg viewBox="0 0 48 48" width="46" height="46" fill="none" stroke="#c084fc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 8C10 6.89543 10.8954 6 12 6H28L38 16V40C38 41.1046 37.1046 42 36 42H12C10.8954 42 10 41.1046 10 40V8Z"/><path d="M28 6V16H38"/><path d="M22 22L16 30H24L20 38L30 28H22L26 22H22Z" fill="#c084fc" opacity="0.3"/></svg>',
      badge: {
        pt: 'Quickstart Studio · Passo 3',
        en: 'Quickstart Studio · Step 3'
      },
      title: {
        pt: '4 Contratos Vivos & Prompt Vivo (Motor JEV)',
        en: '4 Living Contracts & Living Prompt (JEV Engine)'
      },
      tagline: {
        pt: 'Síntese atômica de PROJECT.md, ARCHITECTURE.md, CURRENT_STATE.md e ADR-0001 com refinamento cirúrgico isolado e botão Desfazer.',
        en: 'Atomic synthesis of PROJECT.md, ARCHITECTURE.md, CURRENT_STATE.md, and ADR-0001 with surgical isolated refinement and Undo button.'
      },
      whatItIs: {
        pt: 'Com a sabatina concluída, o sistema sintetiza atomicamente os 4 pilares de governança. O grande trunfo é o Prompt Vivo governado pelo motor local JEV: ao solicitar um ajuste (ex: "adicione autenticação JWT"), a alteração é aplicada estritamente em ARCHITECTURE.md, sem contaminar ou corromper os outros 3 arquivos. E se não gostar do resultado, o desenvolvedor reverte na hora pelo botão ↺ Desfazer.',
        en: 'Once the grill is completed, the system synthesizes all 4 governance pillars atomically. The crown jewel is the Living Prompt powered by the local JEV engine: when requesting an adjustment (e.g. "add JWT auth"), the change applies strictly to ARCHITECTURE.md, without contaminating the other 3 files. If you dislike the result, revert instantly with the ↺ Undo button.'
      },
      howItWorks: [
        {
          title: { pt: 'Cockpit de Síntese Neural em Tempo Real (Zero Tela Congelada)', en: 'Live Neural Synthesis Cockpit (Zero Frozen Screen)' },
          desc: {
            pt: 'Durante a geração dos contratos, o sistema exibe uma esteira interativa de 4 cards com streaming de telemetria técnica via Server-Sent Events (SSE). O dev acompanha a extração de requisitos, escopo, arquitetura e decisões com cronômetro decorrido e status em tempo real.',
            en: 'During contract generation, an interactive 4-card pipeline streams real-time technical telemetry via Server-Sent Events (SSE). Track requirement extraction, scope, architecture, and decisions live with an elapsed timer and status updates.'
          }
        },
        {
          title: { pt: 'Síntese Atômica dos 4 Contratos', en: 'Atomic Synthesis of 4 Contracts' },
          desc: {
            pt: 'Gera simultaneamente: `PROJECT.md` (visão executiva e regras), `ARCHITECTURE.md` (diagramas e componentes), `CURRENT_STATE.md` (roadmap em 3 marcos) e `DECISIONS/ADR-0001` (primeiro registro formal de decisão).',
            en: 'Simultaneously generates: `PROJECT.md` (scope and rules), `ARCHITECTURE.md` (diagrams and components), `CURRENT_STATE.md` (3-phase roadmap), and `DECISIONS/ADR-0001` (first formal ADR).'
          }
        },
        {
          title: { pt: 'Isolamento Cirúrgico com Motor JEV (Zero Poluição)', en: 'Surgical Isolation with JEV Engine (Zero Cross-Pollution)' },
          desc: {
            pt: 'Diferente de IAs convencionais que reescrevem tudo desnecessariamente provocando regressões, o motor JEV identifica o contrato exato que precisa mudar. Regras de negócio não vazam para diagramas técnicos e vice-versa.',
            en: 'Unlike conventional AIs that rewrite everything and cause regressions, JEV targets strictly the relevant contract. Business rules do not leak into technical schemas.'
          }
        },
        {
          title: { pt: 'Guarda Anti-Descarte Acidental & Confirmação de Saída', en: 'Accidental Exit Guard & Safe Confirmation' },
          desc: {
            pt: 'Protege o desenvolvedor contra saídas acidentais no meio do processo. Cliques fora do modal, botão ✕ ou tecla Escape acionam confirmação inteligente, impedindo a perda de respostas e rascunhos antes da aprovação final.',
            en: 'Protects against accidental exits during setup. Backdrop clicks, close button, or Escape key trigger a smart confirmation dialog, ensuring answers and drafts are never lost prior to final approval.'
          }
        },
        {
          title: { pt: 'Aprovação Humana & Zero Fabricação', en: 'Human Approval & Zero Fabrication' },
          desc: {
            pt: 'Nenhum arquivo é gravado no disco até que o desenvolvedor clique em `💾 Aprovar e Criar Projeto`. O sistema cria a estrutura física atômica pronta para abrir imediatamente em qualquer IDE ou editor da sua preferência (VS Code, Cursor, Windsurf, Antigravity, Neovim, JetBrains ou terminal).',
            en: 'Zero files are written to disk until the developer clicks `💾 Approve and Create Project`. The system sets up the atomic physical structure ready to open in any IDE or editor of your choice (VS Code, Cursor, Windsurf, Antigravity, Neovim, JetBrains, or terminal).'
          }
        }
      ],
      realFiles: [
        {
          path: 'projects/<projeto>/PROJECT.md',
          desc: { pt: 'Visão executiva, stack homologada e regras de negócio do sistema.', en: 'Executive scope, approved stack, and core business rules.' }
        },
        {
          path: 'projects/<projeto>/ARCHITECTURE.md',
          desc: { pt: 'Diagrama de componentes, fluxos de dados e contratos de API.', en: 'Component diagrams, data flows, and API contracts.' }
        },
        {
          path: 'projects/<projeto>/CURRENT_STATE.md',
          desc: { pt: 'Estado consolidado e roadmap calibrado em 3 marcos objetivos.', en: 'Consolidated state and roadmap calibrated in 3 milestones.' }
        },
        {
          path: 'projects/<projeto>/DECISIONS/ADR-0001-stack-inicial.md',
          desc: { pt: 'Primeiro Registro de Decisão Arquitetural formalizado.', en: 'First formalized Architectural Decision Record.' }
        }
      ],
      metrics: [
        {
          label: { pt: '4 Contratos Vivos', en: '4 Living Contracts' },
          val: { pt: 'Governança completa e auditável em puro Markdown.', en: 'Complete auditable governance in pure Markdown.' }
        },
        {
          label: { pt: '0ms no Motor JEV', en: '0ms in JEV Engine' },
          val: { pt: 'Decisões e isolamento de contratos 100% determinísticos.', en: '100% deterministic decision routing and contract isolation.' }
        },
        {
          label: { pt: '1 Clique: Undo', en: '1-Click Undo' },
          val: { pt: 'Reversão instantânea de qualquer instrução do Prompt Vivo.', en: 'Instant rollback of any Living Prompt refinement instruction.' }
        }
      ],
      codeBadge: {
        pt: 'Exemplo de Refinamento com Prompt Vivo',
        en: 'Living Prompt Refinement Example'
      },
      codeSnippet: {
        pt: '// Instrução no Prompt Vivo:\n> "Troque o banco de dados para PostgreSQL e adicione refresh token JWT"\n\n// Ação do Motor Local JEV (scripts/decision-provider.js):\n[JEV ROUTING] Contexto: \'quickstart-refine\' | Alvo: ARCHITECTURE.md\n[ISOLAMENTO] Ignorando PROJECT.md e CURRENT_STATE.md (Sem poluição cruzada)\n\n// Resultado Atualizado em Tempo Real:\n✔ ARCHITECTURE.md atualizado: Schema PostgreSQL + Prisma Client\n✔ ADR-0001 atualizado: Justificativa de troca para PostgreSQL\n✔ Botão [↺ Desfazer] ativado para rollback em 1 clique',
        en: '// Instruction in Living Prompt:\n> "Switch database to PostgreSQL and add JWT refresh token"\n\n// Local JEV Engine Action (scripts/decision-provider.js):\n[JEV ROUTING] Context: \'quickstart-refine\' | Target: ARCHITECTURE.md\n[ISOLATION] Skipping PROJECT.md and CURRENT_STATE.md (Zero cross-pollution)\n\n// Real-Time Updated Result:\n✔ ARCHITECTURE.md updated: PostgreSQL Schema + Prisma Client\n✔ ADR-0001 updated: Rationale for PostgreSQL adoption\n✔ Button [↺ Undo] enabled for instant 1-click rollback'
      }
    }
  ];

  // Elementos do DOM
  const modal = document.getElementById('feature-modal');
  if (!modal) return;

  const backdrop = document.getElementById('feature-modal-backdrop');
  const closeBtn = document.getElementById('feature-modal-close');
  const actionBtn = document.getElementById('feature-modal-action-btn');
  const prevBtn = document.getElementById('feature-modal-prev');
  const nextBtn = document.getElementById('feature-modal-next');
  const counterEl = document.getElementById('feature-modal-counter');
  const headerEl = document.getElementById('feature-modal-header');
  const headerVideoBg = document.getElementById('feature-modal-header-video-bg');
  const headerVideo = document.getElementById('feature-modal-header-video');
  const iconWrap = document.getElementById('feature-modal-icon');
  const badgeEl = document.getElementById('feature-modal-badge');
  const titleEl = document.getElementById('feature-modal-title');
  const taglineEl = document.getElementById('feature-modal-tagline');
  const bodyEl = document.getElementById('feature-modal-body');

  let activeList = FEATURES_DATA;
  let currentIndex = 0;
  let lastActiveElement = null;

  const getLang = () => (window.I18N && window.I18N.lang === 'en') ? 'en' : 'pt';

  const t = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const lang = getLang();
    return obj[lang] || obj.pt || '';
  };

  const highlightSnippet = (rawText, cardColor) => {
    if (!rawText) return '';
    const lines = rawText.split('\n');
    return lines.map(line => {
      let escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const trimmed = line.trim();

      // Comentários: // ou #
      if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
        return `<span class="tok-comment">${escaped}</span>`;
      }

      // Prompts / Perguntas: > ou $ ou +
      if (trimmed.startsWith('&gt;') || trimmed.startsWith('$') || trimmed.startsWith('+')) {
        return `<span class="tok-prompt">${escaped}</span>`;
      }

      // Tokens entre colchetes: [RANK 1], [PASS], [DIFF], [SIM], [NÃO], etc.
      escaped = escaped.replace(/(\[[^\]]+\])/g, `<span class="tok-tag" style="--c:${cardColor}">$1</span>`);

      // Código inline entre crases `codigo`
      escaped = escaped.replace(/(`[^`]+`)/g, `<span class="tok-code">$1</span>`);

      // Strings entre aspas "..."
      escaped = escaped.replace(/(&quot;[^&]+&quot;|"[^"]*")/g, `<span class="tok-string">$1</span>`);

      return escaped;
    }).join('\n');
  };

  function renderFeature(index) {
    if (index < 0 || index >= activeList.length) return;
    currentIndex = index;
    const f = activeList[index];
    const lang = getLang();

    // Ícone e cabeçalho dinâmico com iluminação temática
    if (headerEl) {
      headerEl.style.setProperty('--c', f.color);
    }
    if (iconWrap) {
      iconWrap.style.setProperty('--c', f.color);
      iconWrap.innerHTML = f.iconHtml;
    }
    const glowEl = modal.querySelector('.feature-modal-icon-glow');
    if (glowEl) {
      glowEl.style.background = f.color;
    }
    const dotEl = modal.querySelector('.feature-badge-dot');
    if (dotEl) {
      dotEl.style.background = f.color;
      dotEl.style.boxShadow = `0 0 10px ${f.color}`;
    }

    if (badgeEl) badgeEl.textContent = t(f.badge);
    if (titleEl) titleEl.textContent = t(f.title);
    if (taglineEl) taglineEl.textContent = t(f.tagline);

    // Vídeo de fundo no cabeçalho do modal (se a feature possuir vídeo cinemático)
    if (headerVideoBg && headerVideo) {
      if (f.hasHeaderVideo) {
        headerVideoBg.style.display = 'block';
        if (headerEl) headerEl.classList.add('has-video');
        const targetSrc = f.headerVideoSrc || 'assets/video/synapse-modal.mp4';
        const targetPoster = f.headerVideoPoster || 'assets/video/synapse-poster.jpg';
        const sourceEl = headerVideo.querySelector('source');
        if (sourceEl && sourceEl.getAttribute('src') !== targetSrc) {
          sourceEl.setAttribute('src', targetSrc);
          headerVideo.setAttribute('poster', targetPoster);
          headerVideo.load();
        }
        headerVideo.currentTime = 0;
        headerVideo.play().catch(() => { });
      } else {
        headerVideoBg.style.display = 'none';
        if (headerEl) headerEl.classList.remove('has-video');
        headerVideo.pause();
      }
    }

    // Navegação e contador
    if (counterEl) {
      counterEl.textContent = `${currentIndex + 1} / ${activeList.length}`;
    }
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === activeList.length - 1;

    // Rótulos de internacionalização
    const labels = {
      what: lang === 'en' ? 'What it is in practice' : 'O que é na prática',
      how: lang === 'en' ? 'How it works under the hood' : 'Como funciona por baixo dos panos',
      files: lang === 'en' ? 'Real Files & Architecture' : 'Arquivos & Estrutura Real',
      metrics: lang === 'en' ? 'Measurable Impact & Gains' : 'Impacto & Ganhos Reais',
      code: lang === 'en' ? 'Example in Action' : 'Exemplo no dia a dia',
      closeBtnText: lang === 'en' ? 'Understood' : 'Entendi'
    };

    if (actionBtn) actionBtn.textContent = labels.closeBtnText;

    // Montagem do corpo com seções ricas
    let html = '';

    // 1. Visão Geral
    html += `
      <div class="fm-section">
        <h4 class="fm-section-title"><i>✦</i> ${labels.what}</h4>
        <div class="fm-desc-box">${t(f.whatItIs)}</div>
      </div>
    `;

    // 2. Como Funciona Passo a Passo
    if (f.howItWorks && f.howItWorks.length) {
      html += `
        <div class="fm-section">
          <h4 class="fm-section-title"><i>⚙</i> ${labels.how}</h4>
          <ul class="fm-steps-list">
            ${f.howItWorks.map((st, i) => `
              <li class="fm-step-item">
                <span class="fm-step-num">${i + 1}</span>
                <div class="fm-step-content">
                  <strong>${t(st.title)}</strong> — ${t(st.desc)}
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // 3. Arquivos Reais
    if (f.realFiles && f.realFiles.length) {
      html += `
        <div class="fm-section">
          <h4 class="fm-section-title"><i>📁</i> ${labels.files}</h4>
          <div class="fm-files-grid">
            ${f.realFiles.map(rf => `
              <div class="fm-file-card">
                <span class="fm-file-path">${rf.path}</span>
                <p class="fm-file-desc">${t(rf.desc)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 4. Métricas & Ganhos
    if (f.metrics && f.metrics.length) {
      html += `
        <div class="fm-section">
          <h4 class="fm-section-title"><i>🚀</i> ${labels.metrics}</h4>
          <div class="fm-metrics-row">
            ${f.metrics.map(m => `
              <div class="fm-metric-card">
                <div class="fm-metric-label">${t(m.label)}</div>
                <p class="fm-metric-val">${t(m.val)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 5. Bloco de Código / Exemplo
    if (f.codeSnippet) {
      const rawCode = typeof f.codeSnippet === 'object' ? (f.codeSnippet[lang] || f.codeSnippet.pt || '') : f.codeSnippet;
      const highlighted = highlightSnippet(rawCode, f.color);
      const badgeText = t(f.codeBadge) || (lang === 'en' ? 'Interactive Terminal' : 'Terminal Interativo');
      const copyLabel = lang === 'en' ? 'Copy' : 'Copiar';

      html += `
        <div class="fm-section fm-code-section">
          <h4 class="fm-section-title"><i>⚡</i> ${labels.code}</h4>
          <div class="fm-code-container" style="--c: ${f.color}">
            <div class="fm-code-header">
              <div class="fm-code-dots">
                <span class="fm-code-dot red"></span>
                <span class="fm-code-dot yellow"></span>
                <span class="fm-code-dot green"></span>
              </div>
              <div class="fm-code-title">
                <span class="fm-code-badge">${badgeText}</span>
              </div>
              <button class="fm-code-copy-btn" type="button" aria-label="${copyLabel}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span class="fm-copy-text">${copyLabel}</span>
              </button>
            </div>
            <div class="fm-code-box"><code>${highlighted}</code></div>
          </div>
        </div>
      `;
    }

    if (bodyEl) {
      bodyEl.innerHTML = html;
      bodyEl.scrollTop = 0;

      // Ativar botão de copiar do exemplo
      const copyBtn = bodyEl.querySelector('.fm-code-copy-btn');
      if (copyBtn && f.codeSnippet) {
        copyBtn.addEventListener('click', () => {
          const rawCode = typeof f.codeSnippet === 'object' ? (f.codeSnippet[lang] || f.codeSnippet.pt || '') : f.codeSnippet;
          navigator.clipboard.writeText(rawCode).then(() => {
            const txt = copyBtn.querySelector('.fm-copy-text');
            if (txt) txt.textContent = lang === 'en' ? 'Copied!' : 'Copiado!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
              if (txt) txt.textContent = lang === 'en' ? 'Copy' : 'Copiar';
              copyBtn.classList.remove('copied');
            }, 2000);
          }).catch(() => {});
        });
      }
    }
  }

  function openModal(featureId) {
    let list = FEATURES_DATA;
    let idx = list.findIndex(f => f.id === featureId);
    if (idx === -1) {
      list = QUICKSTART_DATA;
      idx = list.findIndex(f => f.id === featureId);
    }
    activeList = list;
    currentIndex = idx >= 0 ? idx : 0;
    lastActiveElement = document.activeElement;

    // Pausa Three.js e vídeos dos cards para liberar 100% da CPU/GPU para renderizar o modal sem latência (INP)
    const bg = window.__brain && window.__brain.g;
    if (bg && typeof bg.stop === 'function') bg.stop();
    if (typeof window.__pauseCardVideos === 'function') window.__pauseCardVideos();

    renderFeature(currentIndex);

    modal.removeAttribute('inert');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Foco no botão de fechar para acessibilidade
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal.classList.contains('active')) return;

    // Retorna foco para o elemento original ANTES de setar aria-hidden="true" (WAI-ARIA)
    if (lastActiveElement && typeof lastActiveElement.focus === 'function' && !modal.contains(lastActiveElement)) {
      lastActiveElement.focus();
    } else if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    document.body.style.overflow = '';

    if (headerVideo) {
      headerVideo.pause();
    }

    // Retoma o grafo Three.js e vídeos visíveis no viewport
    const bg = window.__brain && window.__brain.g;
    if (bg && typeof bg.start === 'function') bg.start();
    if (typeof window.__resumeCardVideos === 'function') window.__resumeCardVideos();
  }

  // Event Listeners
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (actionBtn) actionBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) renderFeature(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < activeList.length - 1) renderFeature(currentIndex + 1);
    });
  }

  // Teclado: ESC para fechar, Setas Esquerda/Direita para navegar
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      if (currentIndex > 0) {
        e.preventDefault();
        renderFeature(currentIndex - 1);
      }
    } else if (e.key === 'ArrowRight') {
      if (currentIndex < activeList.length - 1) {
        e.preventDefault();
        renderFeature(currentIndex + 1);
      }
    }
  });

  // Re-renderizar se o idioma mudar enquanto o modal estiver aberto
  window.addEventListener('langchange', () => {
    if (modal.classList.contains('active')) {
      renderFeature(currentIndex);
    }
  });

  // Vincular clique e tecla Enter/Espaço nos cards (#vantagens .card e #projeto .qs-journey-card)
  function initCards() {
    const cards = document.querySelectorAll('#vantagens .card, #projeto .qs-journey-card');
    cards.forEach((card, idx) => {
      const featId = card.dataset.feature || (FEATURES_DATA[idx] ? FEATURES_DATA[idx].id : null);
      if (!featId) return;

      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-haspopup', 'dialog');

      const clickHandler = (e) => {
        // Evita abrir modal de arquitetura se o clique veio do botão de vídeo 9:16 ou outro controle interno
        if (e.target.closest('.card-video-9x16-btn, [data-prevent-feature-modal]')) return;
        openModal(featId);
      };

      card.addEventListener('click', clickHandler);

      card.addEventListener('keydown', (e) => {
        if (e.target.closest('.card-video-9x16-btn, [data-prevent-feature-modal]')) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(featId);
        }
      });
    });
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCards);
  } else {
    initCards();
  }

  // Expor API global para debug ou chamadas programáticas
  window.AISecondBrainFeaturesModal = {
    open: openModal,
    close: closeModal,
    render: renderFeature,
    data: FEATURES_DATA,
    quickstartData: QUICKSTART_DATA
  };
})();
