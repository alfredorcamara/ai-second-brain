# AI Second Brain — Alfredo AI OS

> Sistema de segundo cérebro para desenvolvimento com IA, agnóstico a qualquer IDE ou ferramenta (Cursor, Claude Code, Antigravity, Windsurf, Copilot, Cline).

## O que é

O AI Second Brain é uma estrutura de conhecimento, decisões, memória e governança
que transforma o agente de IA de um chatbot genérico em um parceiro de desenvolvimento
que entende o contexto, respeita regras e acumula conhecimento ao longo do tempo.

## 🚀 Comece em 3 Minutos

```bash
# 1. Clone o repositório
git clone https://github.com/alfredorcamara/ai-second-brain.git
cd ai-second-brain

# 2. Inicie o Cockpit Visual (Grafo 3D, Quickstart Studio & Dashboard)
npm start

# 3. No navegador (ou via terminal):
#    - Crie um novo projeto guiado com git init automático e stack aberta
#    - Ou vincule um projeto existente via junção sem duplicar arquivos
#    - Abra direto no VS Code / Cursor em 1 clique
#    - Copie o Prompt Bootstrap pré-aquecido para seu agente
#    - Feche sessões com o Session Capture assistido por IA (Draft & Commit)
npm run project:new meu-saas          # Via terminal: cria templates em projects/
# OU
npm run project:link meu-repo "C:\Projetos\MeuRepo" # Conecta via junção
```

## Estrutura

```
AI_SECOND_BRAIN/
│
├── GEMINI.md                    ← Ponte para Antigravity / Gemini
├── .cursorrules                 ← Ponte para Cursor AI
├── CLAUDE.md                    ← Ponte para Claude Code
├── .windsurfrules               ← Ponte para Windsurf
├── README.md                    ← Este arquivo
│
├── .agents/                     ← Regras e workflows reutilizáveis
│   ├── rules/                   ← Regras persistentes
│   ├── skills/                  ← Workflows reutilizáveis
│   └── plugins/                 ← Plugins do ecossistema
│
├── knowledge/                   ← Base de conhecimento universal
│   ├── global/                  ← Conhecimento transversal e índice
│   ├── ai/                      ← IA, modelos, roteamento, AIJev
│   ├── architecture/            ← Padrões universais de arquitetura
│   └── security/                ← Segurança com IA, OWASP, privacidade
│
├── projects/                    ← Seus projetos (APIs, SaaS, Mobile, Jogos)
│
├── decisions/                   ← Decisões arquiteturais globais
├── memory/                      ← Memória persistente
├── templates/                   ← Templates reutilizáveis
└── docs/                        ← Documentação do sistema
    └── brain-ui/                ← Interface de visualização
```

## Como usar

> 📘 **Manual Prático Completo:**  
> Veja o passo a passo detalhado para criar novos projetos ou plugar projetos existentes em: **[docs/COMO_UTILIZAR_O_PROJETO.md](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/docs/COMO_UTILIZAR_O_PROJETO.md)**.  
>  
>  
> 🧠 **Análise Crítica & Relevância de Mercado:**  
> Entenda por que esta estratégia é essencial para projetos construídos com IA e como ela é percebida pela comunidade em: **[docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md)**.
>  
> 🔬 **Research Lab (Laboratório de Conhecimento Autônomo):**  
> Veja como funciona a pesquisa contínua e catalogação automática com IA (Groq Cloud) e Prompt Vivo em: **[docs/RESEARCH_LAB.md](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/docs/RESEARCH_LAB.md)**.


### 1. Abra este workspace na sua IDE ou agente de IA favorito (Modo Cockpit)
Recomendamos abrir a pasta raiz `AI_SECOND_BRAIN` na sua IDE para gerenciar todos os projetos a partir daqui com 100% dos poderes e regras ativas. O sistema possui pontes nativas e automáticas para:
- **Cursor AI** (lê `.cursorrules`)
- **Claude Code** (lê `CLAUDE.md`)
- **Google Antigravity** (lê `GEMINI.md`)
- **Windsurf** (lê `.windsurfrules`)
- **GitHub Copilot** (lê `.github/copilot-instructions.md`)
- **Roo Code / Cline** (lê `.clinerules`)

*(Caso prefira abrir a pasta física de um projeto de forma isolada em outra janela, consulte o passo a passo de configuração da ponte em [docs/COMO_UTILIZAR_O_PROJETO.md](docs/COMO_UTILIZAR_O_PROJETO.md#passo-4-onde-abrir-a-ide-cockpit-central-vs-repositório-isolado-ponto-de-atenção-crucial)).*

### 2. As regras são aplicadas automaticamente
Quando você trabalhar em qualquer arquivo, as diretrizes de governança serão descobertas e aplicadas conforme o contexto.

### 3. Skills são ativadas sob demanda
O agente identifica automaticamente quando uma skill é relevante e a ativa.
Você também pode invocar manualmente.

### 4. Projetos têm contexto e memória 100% isolados
Cada projeto em `projects/<nome>/` possui seus próprios contratos (`PROJECT.md`, `ARCHITECTURE.md`), histórico de decisões (`DECISIONS/`) e memória viva de sessões (`CURRENT_STATE.md` e `MEMORY/sessions/`). Seus projetos nunca se misturam.

### 5. Memória persistente em dois níveis
- **Memória dos Seus Projetos**: Ao final de cada sessão de trabalho em um software específico, o agente atualiza o `CURRENT_STATE.md` e a pasta de sessões do respectivo projeto.
- **Memória da Plataforma**: A pasta raiz `memory/` registra a governança, estabilidade e maturidade do próprio AI Second Brain como ferramenta de desenvolvimento.

## Comandos Operacionais

| Comando | Descrição |
|---|---|
| `npm run project:new <nome>` | Cria um novo projeto em `projects/<nome>/` com contratos e templates prontos |
| `npm run project:link <nome> <caminho>` | Vincula um repositório Git externo existente via junção NTFS / symlink |
| `npm start` *(ou `start-brain.bat`)* | Inicia o Live Vault Server (SSE) e abre o Visualizador 3D no navegador |
| `npm run doctor` *(ou `npm run check`)* | Executa o linter de integridade: valida links quebrados, contratos de projetos e knowledge |
| `npm run scan` | Atualiza o snapshot JSON estático do cofre para o visualizador offline |

## Filosofia

```
AI SECOND BRAIN
       │
  ┌────┴────────────────────────┐
  │                             │
AI AGENTS (Cursor/Claude/etc)  KNOWLEDGE VAULT
  │                             │
  ┌────┼────┐           ┌───────┼───────┐
  │    │    │           │       │       │
RULES SKILLS PROMPTS  GLOBAL  PROJECT  MEMORY
  │    │    │           │       │       │
  └────┴────┴───────────┴───────┴───────┘
           │
       AI GATEWAY
           │
    ┌──────┼──────┐
    │      │      │
  AIJEV   LLM  LOCAL AI
    │      │      │
    └──────┼──────┘
           │
     SEUS PROJETOS
           │
  ┌────────┼────────┐
  ▼        ▼        ▼
APIs/Backend  SaaS/Web    Jogos/Apps
```

## Autor & Licença

Idealizado e mantido por **Alfredo R. Câmara** ([@alfredorcamara](https://github.com/alfredorcamara)).  
Distribuído sob licença MIT. 100% Open Source.

