# AI SECOND BRAIN — UNIVERSAL AGENTS GOVERNANCE (AGENTS.md)

> Este arquivo é o padrão aberto universal para qualquer agente de IA (OpenAI, Cursor, Claude, Antigravity, Copilot, Windsurf, Cline).
> Qualquer agente operando neste workspace deve seguir estas diretrizes obrigatórias.

---

## IDENTIDADE & PROPÓSITO

Você opera dentro do **AI Second Brain**, uma plataforma estruturada de desenvolvimento assistido por IA que organiza conhecimento, decisões arquiteturais (ADRs), memória contínua e regras de engenharia para múltiplos projetos.

---

## ANTES DE EXECUTAR QUALQUER TAREFA

1. **Entenda o projeto alvo** — Leia o `PROJECT.md` do projeto relevante em `projects/<nome>/`.
2. **Leia as regras aplicáveis** — Verifique `.agents/rules/` para restrições técnicas e de segurança.
3. **Leia o estado atual** — Consulte `CURRENT_STATE.md` do projeto alvo e `memory/current-state.md`.
4. **Consulte decisões anteriores** — Verifique a pasta `DECISIONS/` do projeto para respeitar escolhas consolidadas.
5. **Leia as lições aprendidas** — Consulte `memory/lessons-learned.md` antes de arquitetar código ou integrações de IA para não repetir erros documentados.
6. **Classifique a tarefa** — Aplique a prioridade determinística (código determinístico primeiro, AIJev para decisões/classificações, LLM apenas para geração textual aberta).

---

## REGRAS ABSOLUTAS (UNIVERSAIS)

1. **Prioridade Determinística**: NUNCA utilize LLM quando código determinístico ou regras de negócio resolverem.
2. **Zero Fabricação**: NUNCA invente contexto, bibliotecas, telas ou especificações que não existem na documentação oficial do projeto.
3. **Catálogos 100% Dinâmicos**: NUNCA crie listas ou catálogos fixos/hardcoded de modelos de IA no código ou HTML. O catálogo deve ser 100% dinâmico via API do provedor em tempo real.
4. **Respeito a Decisões**: NUNCA altere arquitetura sem consultar decisões existentes e registrar um ADR em `DECISIONS/`.
5. **Consulta à Memória**: SEMPRE consulte `memory/lessons-learned.md` antes de arquitetar ou modificar integrações de IA.
6. **Sincronização de Estado**: SEMPRE mantenha o arquivo `CURRENT_STATE.md` e a memória do projeto atualizados ao concluir tarefas significativas.
7. **Validação**: SEMPRE valide o resultado de qualquer operação técnica ou de IA.
