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
      codeSnippet: 'projects/MEU_APP/MEMORY/sessions/2026-10-16.md\n# Sessão 2026-10-16 — Implementação de Gateway\n- Entregas: Adicionado RulesDecisionProvider\n- Arquivos: server.js, index.html\n- Pendências: Validação de telemetria'
    },
    {
      id: 'session-capture',
      color: '#10b981',
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
          path: 'docs/brain-ui/js/app.js',
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
      codeSnippet: 'POST /api/session-capture\nBody: { project: "MEU_APP" }\n-> Analisa `git diff` -> Gera rascunho -> Human-in-the-loop -> Salva MEMORY/'
    },
    {
      id: 'decision-gate',
      color: '#a3e635',
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
      codeSnippet: 'TAREFA -> É DETERMINÍSTICA?\n  [SIM] -> Código / Regra Direta (0 tokens, 0ms, R$ 0,00)\n  [NÃO] -> É DECISÃO/CLASSIFICAÇÃO?\n           [SIM] -> AIJev / RulesDecisionProvider\n           [NÃO] -> Precisa Gerar? [SIM] -> LLM Especializado'
    },
    {
      id: 'prompt-bootstrap',
      color: '#6366f1',
      iconHtml: '<i>🚀</i>',
      badge: {
        pt: 'Ergonomia & Inicialização Rápida',
        en: 'Ergonomics & Fast Startup'
      },
      title: {
        pt: 'Prompt Bootstrap & Deep Links para IDEs',
        en: 'Prompt Bootstrap & IDE Deep Links'
      },
      tagline: {
        pt: 'Copie em 1 clique o prompt pré-aquecido com regras e contratos para qualquer agente, e abra o projeto diretamente no VS Code ou Cursor.',
        en: '1-click copy pre-warmed prompt with rules and contracts for any agent, and open the project directly in VS Code or Cursor.'
      },
      whatItIs: {
        pt: 'A ponte de alta velocidade entre a interface visual do cérebro (Brain UI) e o seu fluxo diário no editor de código e ferramentas de IA de terceiros.',
        en: 'The high-speed bridge between the visual brain interface (Brain UI) and your daily workflow in code editors and third-party AI tools.'
      },
      howItWorks: [
        {
          title: { pt: 'Geração Instantânea de Bootstrap', en: 'Instant Bootstrap Generation' },
          desc: {
            pt: 'A Brain UI compila em milissegundos um payload compacto contendo: caminho absoluto do projeto, resumo arquitetural de `PROJECT.md`, governança universal e ponteiro para o `CURRENT_STATE.md`.',
            en: 'Brain UI compiles in milliseconds a compact payload containing: absolute path, architectural summary from `PROJECT.md`, governance rules, and pointer to `CURRENT_STATE.md`.'
          }
        },
        {
          title: { pt: 'Pronto para Qualquer Chat de IA', en: 'Ready for Any AI Chat' },
          desc: {
            pt: 'O texto é copiado para a área de transferência formatado para colar diretamente no Claude, ChatGPT, DeepSeek ou Cursor Chat.',
            en: 'The text is copied to clipboard formatted to paste directly into Claude, ChatGPT, DeepSeek, or Cursor Chat.'
          }
        },
        {
          title: { pt: 'Deep Links Nativos do Sistema Operacional', en: 'Native OS Deep Links' },
          desc: {
            pt: 'Botões dedicados abrem a pasta do projeto diretamente no VS Code (`vscode://file/...`) ou Cursor (`cursor://file/...`) sem navegação manual de pastas.',
            en: 'Dedicated buttons open the project directory directly in VS Code (`vscode://file/...`) or Cursor (`cursor://file/...`) without folder browsing.'
          }
        }
      ],
      realFiles: [
        {
          path: 'server.js',
          desc: { pt: 'Endpoint /api/projects/:name/bootstrap que monta o prompt cirúrgico.', en: 'Endpoint /api/projects/:name/bootstrap assembling the surgical prompt.' }
        },
        {
          path: 'docs/brain-ui/js/app.js',
          desc: { pt: 'Manipulador de clipboard e disparadores de deep links via protocolo do SO.', en: 'Clipboard handler and OS protocol deep link triggers.' }
        },
        {
          path: 'templates/project.md',
          desc: { pt: 'Template estruturado que serve de base para o bootstrap de cada projeto.', en: 'Structured template serving as the baseline for every project bootstrap.' }
        }
      ],
      metrics: [
        {
          label: { pt: '1 Clique', en: '1 Click' },
          val: { pt: 'Prompt completo pré-aquecido na sua área de transferência.', en: 'Complete pre-warmed prompt in your clipboard.' }
        },
        {
          label: { pt: 'Abertura Direta', en: 'Direct Launch' },
          val: { pt: 'Abre no Cursor ou VS Code na pasta exata do projeto.', en: 'Launches in Cursor or VS Code at the exact project folder.' }
        },
        {
          label: { pt: 'Zero Configuração', en: 'Zero Config' },
          val: { pt: 'Funciona imediatamente sem necessidade de plugins ou extensões proprietárias.', en: 'Works out-of-the-box without proprietary plugins or extensions.' }
        }
      ],
      codeSnippet: '// Deep Link do Sistema Operacional\nwindow.location.href = `vscode://file/${encodeURI(projectPath)}`;\nwindow.location.href = `cursor://file/${encodeURI(projectPath)}`;'
    },
    {
      id: 'governanca-owasp',
      color: '#f87171',
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
      codeSnippet: '// REGRA DE GOVERNANÇA (AGENTS.md)\n1. Prioridade Determinística: NUNCA utilize LLM quando código resolver.\n2. Zero Fabricação: NUNCA invente bibliotecas ou telas especulativas.\n3. Catálogos Dinâmicos: NUNCA crie listas fixas de modelos no código.'
    },
    {
      id: 'agnostico-stack',
      color: '#ffc76b',
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
      codeSnippet: '# Conectar projeto existente no Windows sem mover pastas:\ncmd /c mklink /J "projects\\MEU_SISTEMA" "C:\\MeusRepos\\MEU_SISTEMA"'
    },
    {
      id: 'zero-lock-in',
      color: '#facc15',
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
      codeSnippet: '# Inspecionar o histórico de qualquer decisão no terminal:\ngit log -p decisions/ADR-001.md'
    },
    {
      id: 'grafo-3d',
      color: '#c084fc',
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
      codeSnippet: '// Inicialização do Grafo Neural no Canvas\nconst g = new BrainGraph(canvas, tooltip);\ng.loadData(nodes, edges, categoryColors);\ng.start();'
    },
    {
      id: 'pergunte-cerebro',
      color: '#ec4899',
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
          path: 'docs/brain-ui/js/app.js',
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
      codeSnippet: '// Busca Ponderada por Governança:\nconst score = bm25Score * (isADR ? 1.8 : isRule ? 1.5 : 1.0);\n// Resposta com citação obrigatória dos arquivos auditados'
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
  const iconWrap = document.getElementById('feature-modal-icon');
  const badgeEl = document.getElementById('feature-modal-badge');
  const titleEl = document.getElementById('feature-modal-title');
  const taglineEl = document.getElementById('feature-modal-tagline');
  const bodyEl = document.getElementById('feature-modal-body');

  let currentIndex = 0;
  let lastActiveElement = null;

  const getLang = () => (window.I18N && window.I18N.lang === 'en') ? 'en' : 'pt';

  const t = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const lang = getLang();
    return obj[lang] || obj.pt || '';
  };

  function renderFeature(index) {
    if (index < 0 || index >= FEATURES_DATA.length) return;
    currentIndex = index;
    const f = FEATURES_DATA[index];
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

    // Navegação e contador
    if (counterEl) {
      counterEl.textContent = `${currentIndex + 1} / ${FEATURES_DATA.length}`;
    }
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === FEATURES_DATA.length - 1;

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
      html += `
        <div class="fm-section">
          <h4 class="fm-section-title"><i>⚡</i> ${labels.code}</h4>
          <div class="fm-code-box">${f.codeSnippet}</div>
        </div>
      `;
    }

    if (bodyEl) {
      bodyEl.innerHTML = html;
      bodyEl.scrollTop = 0;
    }
  }

  function openModal(featureId) {
    const idx = FEATURES_DATA.findIndex(f => f.id === featureId);
    currentIndex = idx >= 0 ? idx : 0;
    lastActiveElement = document.activeElement;

    renderFeature(currentIndex);

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Foco no botão de fechar para acessibilidade
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal.classList.contains('active')) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
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
      if (currentIndex < FEATURES_DATA.length - 1) renderFeature(currentIndex + 1);
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
      if (currentIndex < FEATURES_DATA.length - 1) {
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

  // Vincular clique e tecla Enter/Espaço nos cards da seção de superpoderes (#vantagens .card)
  function initCards() {
    const cards = document.querySelectorAll('#vantagens .card');
    cards.forEach((card, idx) => {
      const featId = card.dataset.feature || (FEATURES_DATA[idx] ? FEATURES_DATA[idx].id : null);
      if (!featId) return;

      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-haspopup', 'dialog');

      const clickHandler = (e) => {
        // Evita clique redundante se clicou em outro elemento interativo interno
        openModal(featId);
      };

      card.addEventListener('click', clickHandler);

      card.addEventListener('keydown', (e) => {
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
    data: FEATURES_DATA
  };
})();
