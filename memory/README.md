# Arquitetura de Memória — AI Second Brain

> **Guia de Governança de Memória:** Como o AI Second Brain organiza, isola e persiste conhecimento.

---

## 1. O Modelo de Dois Níveis de Memória

Para evitar confusão e garantir que múltiplos projetos convivam no mesmo Segundo Cérebro sem poluição de contexto, o sistema opera estritamente em **dois níveis de memória**:

```
AI_SECOND_BRAIN/
│
├── memory/                              ← NÍVEL 1: Memória da Plataforma (O Framework Central)
│   ├── current-state.md                 # Estado do motor: Live Server, SSE, visualizador, ferramentas
│   ├── lessons-learned.md               # Lições gerais de engenharia e IA aprendidas no desenvolvimento
│   └── README.md                        # Este guia
│
└── projects/                            ← NÍVEL 2: Memória dos Projetos dos Desenvolvedores (Isolados)
    ├── MeuProjetoA/
    │   ├── CURRENT_STATE.md             ← Memória e roadmap exclusivos do Projeto A
    │   ├── PROJECT.md                   ← Contrato, regras e stack do Projeto A
    │   ├── ARCHITECTURE.md              ← Decisões arquiteturais do Projeto A
    │   ├── DECISIONS/                   ← ADRs exclusivas do Projeto A
    │   └── MEMORY/sessions/             ← Histórico de sessões diárias do Projeto A
    │
    └── MeuProjetoB/
        ├── CURRENT_STATE.md             ← Memória e roadmap exclusivos do Projeto B
        └── ...
```

---

## 2. Diferença Entre os Níveis

| Atributo | Nível 1: Memória da Plataforma (`memory/`) | Nível 2: Memória do Projeto (`projects/<nome>/`) |
| :--- | :--- | :--- |
| **Escopo** | O AI Second Brain como ferramenta e ecossistema | O software específico desenvolvido pelo dev (SaaS, API, App) |
| **Arquivos Principais** | `current-state.md`, `lessons-learned.md` | `CURRENT_STATE.md`, `MEMORY/sessions/`, `DECISIONS/` |
| **Quem consome?** | O agente ao manter, diagnosticar ou evoluir o framework | O agente ao implementar features, regras e bugs do projeto do dev |
| **Exemplo de Conteúdo** | Suporte a UTF-8 no `.bat`, auto-reconexão SSE, Research Lab | Migração de schema Prisma, regras de autenticação JWT, cálculo de ELO |

---

## 3. Perguntas Frequentes (FAQ)

### P: Baixei este repositório do Git para gerenciar meus projetos. Onde fica a memória do meu projeto?
**R:** Fica exclusivamente dentro de `projects/<seu-projeto>/`. Quando você utiliza o assistente web ou roda `npm run project:new meu-projeto`, o sistema cria a pasta dedicada com o `CURRENT_STATE.md` e a pasta `MEMORY/sessions/` isoladas para o seu projeto.

### P: As alterações registradas em `memory/current-state.md` vão interferir no meu projeto?
**R:** **Não.** O agente de IA consulta as regras de governança e lê prioritariamente o arquivo `projects/<seu-projeto>/PROJECT.md` e `CURRENT_STATE.md` do projeto em que você está trabalhando. A memória da pasta raiz serve como histórico de versão e maturidade do próprio AI Second Brain, funcionando como uma garantia de que o motor está estável e atualizado.

### P: Posso limpar os projetos de teste que vieram no repositório?
**R:** Sim. A pasta `projects/` foi projetada para conter apenas os seus projetos. Pastas de exemplo ou testes (como `teste_alfredo_22`) podem ser removidas ou substituídas pelos seus próprios projetos greenfield ou repositórios vinculados (brownfield).
