---
name: project-onboarding
description: >-
  Onboard para um novo projeto existente ou criação de novo projeto no AI Second Brain.
  Use quando o usuário quiser adicionar um novo projeto ao sistema, configurar a estrutura
  inicial de um projeto, ou quando precisar entender um projeto existente pela primeira vez.
---

# Project Onboarding

## Para Novo Projeto

### 1. Criar estrutura do projeto

```
projects/<nome-do-projeto>/
├── PROJECT.md            ← Visão geral, objetivos, stack
├── ARCHITECTURE.md       ← Arquitetura técnica
├── CURRENT_STATE.md      ← Estado atual do projeto
├── DECISIONS/            ← Decisões arquiteturais (ADRs)
├── AI/                   ← Configurações de IA do projeto
│   ├── AI_ARCHITECTURE.md
│   ├── AI_USE_CASES.md
│   └── AI_EVALUATION.md
├── DATABASE/             ← Esquema e documentação do banco
├── API/                  ← Documentação de APIs
├── TESTS/                ← Estratégia e cobertura de testes
└── MEMORY/               ← Memória específica do projeto
    └── sessions/
```

### 2. Preencher PROJECT.md

Use o template em `templates/project.md`.

### 3. Documentar estado atual

Preencha `CURRENT_STATE.md` com:
- O que está funcionando
- O que está em desenvolvimento
- Bloqueios atuais
- Próximos passos planejados

### 4. Registrar decisões existentes

Para cada decisão arquitetural já tomada, crie um ADR em `DECISIONS/`.

### 5. Avaliar necessidades de IA

Se o projeto utiliza ou pode utilizar IA:
1. Leia `.agents/rules/01-ai-decision.md`
2. Preencha `AI/AI_USE_CASES.md`
3. Avalie se AIJev é aplicável

### 6. Atualizar índice

Adicione o projeto ao `README.md` raiz e ao `GEMINI.md`.

## Para Projeto Existente

1. Leia o `PROJECT.md` existente.
2. Leia o `CURRENT_STATE.md`.
3. Leia decisões em `DECISIONS/`.
4. Leia memória em `MEMORY/`.
5. Agora você tem contexto suficiente para trabalhar.
