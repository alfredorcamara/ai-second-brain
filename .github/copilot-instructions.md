# AI SECOND BRAIN — INSTRUÇÕES PARA GITHUB COPILOT

> Diretrizes de geração de código para GitHub Copilot dentro do AI Second Brain.

## REGRAS OBRIGATÓRIAS
1. Sempre consulte o contexto do projeto em `projects/<nome>/PROJECT.md` e `CURRENT_STATE.md`.
2. Respeite as decisões arquiteturais registradas em `projects/<nome>/DECISIONS/`.
3. NUNCA crie catálogos ou listas fixas/hardcoded de modelos de IA no código ou HTML (obrigatório 100% dinâmico via API em tempo real).
4. Consulte o `LESSONS_LEARNED.md` do projeto e `memory/lessons-learned.md` para evitar repetir erros de integração de IA ou arquitetura já documentados.
5. Prefira código determinístico a invocações desnecessárias de IA.
