# AI Second Brain — Alfredo AI OS

> Sistema de segundo cérebro para desenvolvimento com IA, otimizado para Google Antigravity Pro.

## O que é

O AI Second Brain é uma estrutura de conhecimento, decisões, memória e governança
que transforma o agente de IA de um chatbot genérico em um parceiro de desenvolvimento
que entende o contexto, respeita regras e acumula conhecimento ao longo do tempo.

## Estrutura

```
AI_SECOND_BRAIN/
│
├── GEMINI.md                    ← Cérebro central
├── README.md                    ← Este arquivo
│
├── .agents/                     ← Customizações Antigravity
│   ├── rules/                   ← Regras persistentes
│   ├── skills/                  ← Workflows reutilizáveis
│   └── plugins/                 ← Plugin do AI OS
│
├── knowledge/                   ← Base de conhecimento
│   ├── global/                  ← Conhecimento transversal
│   ├── ai/                      ← IA, modelos, AIJev
│   ├── architecture/            ← Padrões e decisões
│   ├── dotnet/                  ← .NET, C#, Entity Framework
│   ├── sql-server/              ← SQL Server, Jobs, Performance
│   └── security/                ← Segurança, LGPD, OWASP
│
├── projects/                    ← Projetos ativos
│   ├── JobSentinel/
│   ├── Sabor-em-Conflito/
│   └── Assistente-Mobile/
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
> 🧠 **Análise Crítica & Relevância de Mercado:**  
> Entenda por que esta estratégia é essencial para projetos construídos com IA e como ela é percebida pela comunidade em: **[docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md)**.

### 1. Abra este workspace no Antigravity
O `GEMINI.md` será carregado automaticamente como regra raiz.

### 2. As regras são aplicadas automaticamente
Quando você trabalhar em qualquer arquivo, as regras de `.agents/rules/` serão
descobertas e aplicadas conforme o contexto.

### 3. Skills são ativadas sob demanda
O agente identifica automaticamente quando uma skill é relevante e a ativa.
Você também pode invocar manualmente.

### 4. Projetos têm contexto próprio
Cada projeto em `projects/` tem seu `PROJECT.md`, estado atual, decisões e memória.

### 5. A memória persiste entre sessões
Após cada sessão significativa, o agente atualiza `memory/` com o estado atual.

## Filosofia

```
ALFREDO AI OS
       │
  ┌────┴─────────────────┐
  │                      │
ANTIGRAVITY         KNOWLEDGE
  │                      │
  ┌────┼────┐    ┌────┼────┐
  │    │    │    │    │    │
RULES SKILLS AGENTS GLOBAL PROJECT MEMORY
  │    │    │    │    │    │
  └────┴────┴────┴────┴────┘
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
JobSentinel  Sabor  Assistente
```
