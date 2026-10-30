<p align="center">
  <img src="docs/brain-ui/assets/Banner%20futurista%20do%20AI%20Second%20Brain.webp" alt="AI Second Brain Banner" width="100%" />
</p>

# AI Second Brain

<p align="center">
  <a href="https://github.com/alfredorcamara/ai-second-brain/stargazers"><img src="https://img.shields.io/github/stars/alfredorcamara/ai-second-brain?style=for-the-badge&logo=github&color=38bdf8&logoColor=white&label=Deixar%20uma%20Estrela%20%E2%AD%90" alt="GitHub Stars" /></a>
  <a href="https://github.com/alfredorcamara/ai-second-brain/releases"><img src="https://img.shields.io/github/v/release/alfredorcamara/ai-second-brain?style=for-the-badge&color=8b5cf6" alt="Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/licen%C3%A7a-MIT-10b981?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  🌐 <b>Português</b> &nbsp;|&nbsp; <a href=".locales/en/README.md">English</a>
</p>

> **O Sistema Operacional de Memória Viva e Governança para Agentes de IA.**  
> 100% Markdown · Agnóstico a qualquer ferramenta ou IDE (Cursor, Claude Code, Antigravity, Windsurf, Copilot, Cline, Roo Code) · Zero Lock-in.

---

## 🌐 Conheça a Landing Page & Demo Online

- 🚀 **Landing Page Oficial com Grafo 3D**: [https://alfredorcamara.github.io/ai-second-brain-site/](https://alfredorcamara.github.io/ai-second-brain-site/)  
  *(Acesse a apresentação visual interativa, explore o grafo neural 3D em tempo real e teste a demo pública).*
- 💻 **Acesso Local Offline**: Abra diretamente no navegador o arquivo [`docs/brain-ui/index.html`](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN_CENTRAL/AI_SECOND_BRAIN/docs/brain-ui/index.html).

---

## ⚡ Como Iniciar o Cockpit do Cérebro

A forma mais simples, rápida e recomendada para inicializar o **AI Second Brain** no seu computador é:

> ### 🟢 Dê 2 cliques no arquivo `start-brain.bat`
> 
> Ele faz tudo automaticamente em segundo plano:
> 1. Inicia o servidor local de alta performance com suporte a Live Reload (SSE);
> 2. Sincroniza o cofre neural e valida os contratos de governança;
> 3. Abre instantaneamente o Cockpit Visual no seu navegador padrão em `http://localhost:3333`.

*(Se você prefere o terminal: basta executar `npm start`).*

> 🌟 **Gostou da proposta?** Deixe uma **[Star no repositório](https://github.com/alfredorcamara/ai-second-brain)**! Leva 2 segundos e ajuda muito o projeto a alcançar mais pessoas.

---

## 💡 O que é o AI Second Brain?

Desenvolver software com agentes de IA (Cursor AI, Claude Code, Antigravity, Windsurf) costuma esbarrar sempre nos mesmos problemas: **amnésia entre sessões**, **repetição diária de prompts**, **alucinações arquiteturais** e **decisões técnicas perdidas em chats efêmeros**.

O **AI Second Brain** resolve isso transformando o seu agente de IA em um verdadeiro parceiro sênior:
- **Regras, Decisões (ADRs) e Lições Aprendidas** viram um **Grafo Neural 3D vivo** que qualquer agente lê automaticamente a cada nova sessão;
- **Projetos Isolados**: Cada projeto conectado (`projects/<nome>/`) possui seus próprios contratos de governança sem nunca misturar escopos;
- **Zero Fabricação**: O sistema governa o agente com regras estritas para nunca inventar bibliotecas, telas ou mecânicas especulativas.

---

## 🎯 Criação Guiada com Sabatina Técnica de IA (Grill Studio)

Ao criar um novo projeto no Cockpit (botão **`+ Novo Projeto`** ou via `npm run project:new`), o desenvolvedor conta com o **Quickstart Dual-Mode**:

| Modo | Como Funciona | Quando Usar |
|---|---|---|
| **⚡ Modo Express (50ms)** | Criação instantânea e 100% determinística de pastas e contratos limpos. | Para projetos triviais ou quando você já tem todas as decisões arquiteturais fechadas na cabeça. |
| **🎯 Modo Assistido com IA (Grill Studio)** | Uma **sabatina técnica interativa conduzida pela IA** que blinda a arquitetura antes de gerar qualquer código. | Para novas ideias, SaaS, APIs e projetos onde você quer validar requisitos e eliminar ambiguidades. |

### 🧠 Como a Sabatina Técnica Ajuda o Desenvolvedor:

```
Nome do Projeto ──► [Sabatina com IA] ──► [Auditoria & JEV] ──► [Cockpit de Síntese em Tempo Real (4 Cards & SSE)] ──► [Aprovação Humana]
```

1. **Perguntas Cirúrgicas e Contextualizadas**:
   - A IA formula de **3 a 4 perguntas técnicas profundas adaptadas à stack e ao domínio do projeto** (ex: estratégia de persistência e banco de dados, modelo de autenticação, tolerância a falhas, concorrência, contratos de API).
2. **Ergonomia do Modo Focado (Accordion Inteligente)**:
   - Apenas **1 pergunta permanece expandida por vez**, com cards colapsados em formato de checklist quando respondidas. Sem rolagem excessiva de tela e com barra de progresso visual em tempo real.
   - O dev pode escolher entre **chips de resposta rápida em 1 clique** ou digitar livremente no campo de texto, com avanço automático fluído.
3. **Auditoria de Respostas Incoerentes**:
   - Se o dev digitar respostas desconexas ou vagas, o motor de auditoria analisa a coerência arquitetural, aponta o diagnóstico e oferece **sugestões práticas em 1 clique** para blindar a especificação.
4. **Cockpit de Síntese Neural em Tempo Real (Zero Tela Congelada & SSE)**:
   - Ao iniciar a geração, o sistema abre uma **esteira interativa em tempo real com 4 cards de governança** (`📑 Extração de Requisitos`, `📄 PROJECT.md`, `🏗️ ARCHITECTURE.md` e `⚖️ CURRENT_STATE.md & ADR-0001`).
   - Acompanhamento com spinners ativos, transição automática para concluído (`✓`), cronômetro decorrido e **Console de Telemetria Técnica** transmitido via Server-Sent Events diretamente da inferência de IA.
5. **Síntese Automática dos 4 Contratos Vivos**:
   - Com as respostas consolidadas, a IA sintetiza atomicamente os 4 pilares de governança:
     - `PROJECT.md`: Visão executiva, stack homologada e regras de negócio;
     - `ARCHITECTURE.md`: Diagrama de componentes, fluxos de dados e integrações;
     - `CURRENT_STATE.md`: Estado atual e roadmap calibrado em 3 marcos objetivos;
     - `DECISIONS/ADR-0001-stack-inicial.md`: O primeiro registro de decisão arquitetural formalizado.
6. **Barra de Refinamento Iterativo ("Prompt Vivo Cirúrgico com Motor JEV")**:
   - Governado pelo motor local **`RulesDecisionProvider`** (0ms de latência e zero tokens gastos antes da decisão).
   - **Isolamento Cirúrgico**: Alterações de tabelas/dados afetam **estritamente** `ARCHITECTURE.md`, sem poluir `PROJECT.md` ou `CURRENT_STATE.md`.
   - **Clarificação Humana (*Human-in-the-Loop*)**: Ao detectar instruções vagas (pagamentos, mensageria, autenticação ou deploy vagos), o sistema abre modal de dúvida técnica com opções de resposta rápida em chips de 1 clique.
   - **Auto-Switch & Undo**: Alterna suavemente para a aba do documento modificado com animação de destaque e permite reverter instantaneamente pelo botão `↺ Desfazer`.
7. **Guarda Anti-Fechamento Involuntário**:
   - Proteção inteligente contra cliques acidentais fora do modal ou tecla `Escape` durante as etapas de preenchimento. Um diálogo de confirmação impede que seu trabalho seja perdido antes da gravação.
8. **Aprovação Humana Obrigatória**:
   - **Zero Fabricação**: Nada é gravado fisicamente em disco até que o desenvolvedor clique expressamente em `💾 Aprovar e Criar Projeto no Disco`. Ao gravar com sucesso, o modal transiciona para o Passo 3 e pode ser concluído imediatamente.

---

## ✨ Principais Capacidades do Cockpit

Além do Quickstart Studio, o portal web do AI Second Brain oferece uma suíte completa de engenharia assistida por IA:

- **🪐 Grafo Neural 3D Interativo (Three.js)**: Visualize sinapses, dependências e conexões entre regras, skills, decisões e projetos orbitando no espaço com física de forças orgânicas.
- **⚡ Synaptic Boot HUD (0ms Pre-Render)**: Abertura cinematográfica com telemetria viva (`Cofre Ativo`, `Contratos Vivos`, `AI Gateways`) e renderização imediata sem telas brancas.
- **🔍 Toolbar de Governança Executiva**: Barra com Omnisearch em tempo real (atalho `/`), filtros dinâmicos por Stack Tecnológica, Status Operacional unificado (SSOT) e Conformidade de Contratos.
- **✨ Pergunte ao Cérebro (Global Q&A — `Ctrl+K`)**: Motor de busca híbrida com citação explícita de trechos de ADRs, lições e contratos, abrindo diretamente no leitor ou focando nos neurônios do Grafo 3D.
- **🧠 Session Capture Assistido por IA**: Registre a sessão do dia a partir dos commits reais do Git com higienização mandatória de segredos (`.env`, tokens). A IA gera o rascunho (Draft) e você aprova a gravação atômica (Commit) no `CURRENT_STATE.md` e `LESSONS_LEARNED.md`.
- **🔌 AI Gateway Multi-Provedor (BYOK - Bring Your Own Key)**: Alterne livremente entre **Groq Cloud** (ultra veloz), **OpenAI**, **Anthropic Claude**, **OpenRouter** e **Ollama Local** (100% offline), com credenciais salvas de forma segura no `.env` da sua máquina.
- **💻 Conexão Nativa com IDEs & Prompt Bootstrap**: Abra projetos diretamente no VS Code, Cursor ou Explorador do Windows em 1 clique, e copie o **Prompt Bootstrap pré-aquecido** para iniciar sessões em novas janelas de chat sem amnésia.

---

## 📁 Estrutura do Workspace

```
AI_SECOND_BRAIN/
│
├── start-brain.bat              ← 🟢 Inicializador rápido em 1 clique (Recomendado)
├── server.js                    ← Servidor local com SSE e Live Reload
├── README.md                    ← Documentação principal
│
├── AGENTS.md                    ← Padrão universal para agentes de IA
├── GEMINI.md                    ← Ponte nativa para Google Antigravity
├── .cursorrules                 ← Ponte nativa para Cursor AI
├── CLAUDE.md                    ← Ponte nativa para Claude Code
├── .windsurfrules               ← Ponte nativa para Windsurf
├── .github/copilot-instructions ← Ponte nativa para GitHub Copilot
├── .clinerules                  ← Ponte nativa para Cline / Roo Code
│
├── .agents/                     ← Governança ativa
│   ├── rules/                   ← Regras determinísticas e de segurança
│   ├── skills/                  ← Workflows executáveis sob demanda
│   └── plugins/                 ← Extensões do ecossistema
│
├── knowledge/                   ← Base de conhecimento universal e perene
│   ├── global/                  ← Índice transversal e glossário
│   ├── ai/                      ← Decision Gate, AIJev, AI Gateway e Seleção de Modelos
│   ├── architecture/            ← Padrões arquiteturais e boas práticas
│   └── security/                ← OWASP, higienização e segurança com IA
│
├── projects/                    ← Seus projetos reais (APIs, SaaS, Mobile, Jogos)
│   └── <seu-projeto>/           ← Cada projeto com seus próprios contratos vivos
│       ├── PROJECT.md           ← Visão e stack oficial
│       ├── ARCHITECTURE.md      ← Desenho técnico e decisões
│       ├── CURRENT_STATE.md     ← Roadmap ativo e progresso
│       ├── LESSONS_LEARNED.md   ← Erros e aprendizados locais que não devem se repetir
│       ├── DECISIONS/           ← ADRs sequenciais daquele projeto
│       └── MEMORY/sessions/     ← Histórico detalhado de sessões de trabalho
│
├── decisions/                   ← Decisões arquiteturais globais do framework
├── memory/                      ← Memória de estabilidade e lições universais
├── templates/                   ← Modelos padronizados de projetos, ADRs e especificações
└── docs/
    └── brain-ui/                ← Portal web moderno do Cockpit e Landing Page
```

---

## 🛠️ Comandos Operacionais

| Comando | Descrição |
|---|---|
| `start-brain.bat` *(ou `npm start`)* | **Forma mais rápida:** Sincroniza o cofre, inicia o servidor e abre o Cockpit no navegador |
| `npm run project:new <nome>` | Cria um novo projeto assistido por IA com contratos de governança |
| `npm run project:link <nome> <caminho>` | Vincula um repositório Git existente no seu PC via junção NTFS sem duplicar arquivos |
| `npm run doctor` *(ou `npm run check`)* | Executa o linter de integridade: valida links Markdown, contratos de projetos e **sintaxe de 100% dos scripts JS** |
| `npm run version:sync` | Sincroniza automaticamente a versão do `package.json` em todas as interfaces HTML, apps e dicionários |
| `npm run scan` | Força a re-varredura do cofre e atualiza o snapshot estático para visualização offline |
| `npm run build:demo` | Reconstrói o cofre ilustrativo curado para a demonstração pública da web |

---

## 📖 Documentação Aprofundada

- 📘 **[Manual de Uso Completo (docs/COMO_UTILIZAR_O_PROJETO.md)](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN_CENTRAL/AI_SECOND_BRAIN/docs/COMO_UTILIZAR_O_PROJETO.md)**: Guia passo a passo com fluxo visual e conversacional para o dia a dia.
- 🧠 **[Análise de Mercado e Valor (docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md)](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN_CENTRAL/AI_SECOND_BRAIN/docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md)**: Por que a governança de contexto é o diferencial competitivo em times assistidos por IA.
- 🔬 **[Motor de Pesquisa do Research Lab (docs/RESEARCH_LAB.md)](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN_CENTRAL/AI_SECOND_BRAIN/docs/RESEARCH_LAB.md)**: Arquitetura de pesquisa autônoma, decomposição de temas e refinamento contínuo com IA.

---

## 🏛️ Filosofia de Governança

```
                      AI SECOND BRAIN
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   AGENTES DE IA (Multi-IDE)          COFRE DE CONHECIMENTO
   Cursor · Claude · Antigravity      Markdown · Git · Zero Lock-in
            │                                 │
     ┌──────┴──────┐                   ┌──────┴──────┐
     ▼             ▼                   ▼             ▼
  REGRAS        SKILLS              DECISÕES      MEMÓRIA
 (Diretrizes)  (Workflows)           (ADRs)      (Contínua)
     │             │                   │             │
     └──────┬──────┘                   └──────┬──────┘
            │                                 │
            └───────────────┬─────────────────┘
                            ▼
                        AI GATEWAY
             Groq · OpenAI · Claude · Ollama
                            │
                            ▼
                      SEUS PROJETOS
              SaaS · Web · APIs · Mobile · Games
```

---

## Autor & Licença

Criado e mantido com paixão por **Alfredo R. Câmara** ([@alfredorcamara](https://github.com/alfredorcamara)).  
Distribuído sob licença **[FSL-1.1-MIT](LICENSE)** (*Functional Source License — Source-Available / Fair-Code*).  
Livre e gratuito para uso pessoal, pesquisa, estudo e uso produtivo interno. Para uso comercial concorrente ou parcerias, consulte o [LICENSE](LICENSE) e o [CLA](CLA.md).

<br>

<p align="center">
  <img src="docs/brain-ui/assets/ai-second-brain-logo-animado.svg" alt="AI Second Brain Logo" width="220" />
</p>

<p align="center">
  <em>Transformando agentes de IA em engenheiros de software sêniores com memória viva e governança contínua.</em>
</p>

<p align="center">
  <a href="https://cursor.com"><img src="https://img.shields.io/badge/Cursor-Compatível-000000?style=flat-square&logo=cursor&logoColor=white" alt="Cursor"></a>
  <a href="https://claude.ai"><img src="https://img.shields.io/badge/Claude%20Code-Compatível-D97706?style=flat-square&logo=anthropic&logoColor=white" alt="Claude"></a>
  <a href="#"><img src="https://img.shields.io/badge/Google%20Antigravity-Nativo-4285F4?style=flat-square&logo=google&logoColor=white" alt="Antigravity"></a>
  <a href="https://codeium.com/windsurf"><img src="https://img.shields.io/badge/Windsurf-Compatível-0ea5e9?style=flat-square&logo=windsurf&logoColor=white" alt="Windsurf"></a>
  <a href="https://github.com/features/copilot"><img src="https://img.shields.io/badge/GitHub%20Copilot-Compatível-181717?style=flat-square&logo=githubcopilot&logoColor=white" alt="Copilot"></a>
</p>

<p align="center">
  <a href="https://alfredorcamara.github.io/ai-second-brain-site/">🌐 Landing Page</a> ·
  <a href="https://github.com/alfredorcamara/ai-second-brain/issues">🐛 Reportar Problema</a> ·
  <a href="https://github.com/alfredorcamara/ai-second-brain/discussions">💡 Discussões</a> ·
  <a href="#ai-second-brain">⬆ Voltar ao Topo</a>
</p>