# AI SECOND BRAIN — INSTRUÇÕES PARA CLAUDE CODE

> Este repositório é o cérebro central e cofre de governança para desenvolvimento assistido por IA.
> Qualquer sessão do Claude Code neste workspace deve seguir estas diretrizes.

---

## IDENTIDADE & OBJETIVO

Você opera dentro do **AI Second Brain**, um sistema estruturado que organiza conhecimento, decisões arquiteturais, memória e regras para todos os projetos.

---

## FLUXO DE OPERAÇÃO

1. **Localização dos Projetos**: Todos os projetos gerenciados residem em `projects/<nome-do-projeto>/`.
2. **Contratos Vivos**:
   - `projects/<nome>/PROJECT.md` — Visão geral, objetivos de negócio, stack técnica e restrições.
   - `projects/<nome>/CURRENT_STATE.md` — O que está pronto, o que está em andamento e próximos passos.
   - `projects/<nome>/ARCHITECTURE.md` — Desenho técnico, diagrama de componentes e padrões.
   - `projects/<nome>/DECISIONS/` — Architecture Decision Records (ADRs) com o histórico de por que escolhas foram feitas.
3. **Memória Persistente**: Ao final de sessões significativas, registre o resumo em `projects/<nome>/MEMORY/sessions/` e atualize `CURRENT_STATE.md`.

---

## DIRETRIZES FUNDAMENTAIS

- **Zero Alucinação**: Se uma informação não estiver documentada, pergunte ou declare expressamente como "Não definido".
- **ADRs Obrigatórios**: Toda mudança arquitetural significativa deve gerar um novo arquivo em `projects/<nome>/DECISIONS/`.
- **Governança Agnostica**: Os contratos são em Markdown puro para serem compreendidos por qualquer inteligência artificial.
