# AI SECOND BRAIN — INSTRUÇÕES PARA GITHUB COPILOT

> Este repositório é o cérebro central e cofre de governança para desenvolvimento assistido por IA.
> **Fonte Única de Verdade (SSOT):** Esta ponte define o roteamento e as regras inegociáveis do workspace. Consulte sempre os contratos vivos do projeto alvo antes de propor ou alterar código.

## 1. Contratos de Leitura Obrigatória (nesta ordem)
1. `projects/<nome>/PROJECT.md` — visão do produto, stack oficial e regras de negócio
2. `projects/<nome>/ARCHITECTURE.md` — desenho de componentes, fluxos de dados e padrões
3. `projects/<nome>/CURRENT_STATE.md` — estado atual, o que está pronto, em andamento e bloqueado
4. `projects/<nome>/DECISIONS/` — decisões arquiteturais imutáveis (ADRs) vigentes
5. `projects/<nome>/LESSONS_LEARNED.md` — erros e incidentes locais que não podem ser repetidos
6. `memory/lessons-learned.md` e `.agents/rules/` — lições e regras globais do framework

## 2. Regras Absolutas de Governança
- **Bloqueio de leitura:** NUNCA assuma a stack, proponha código ou altere a arquitetura sem antes ler `PROJECT.md`, `ARCHITECTURE.md` e `CURRENT_STATE.md` do projeto alvo.
- **Zero fabricação:** NUNCA invente bibliotecas, telas, endpoints, tabelas ou regras de negócio que não estejam nos contratos ou no pedido explícito do desenvolvedor.
- **Transparência sobre lacunas:** Se uma informação não estiver documentada nos contratos, diga explicitamente: *"não consta nos contratos"* e pergunte antes de assumir.
- **Proteção de stack e arquitetura:** NUNCA proponha tecnologia fora da stack oficial nem altere a arquitetura sem antes sugerir o registro de um novo ADR em `DECISIONS/`.
- **Código determinístico primeiro (AI Decision Gate):** Prefira regras e código determinístico a chamadas de IA/LLM quando uma solução direta resolver.
- **Segurança:** NUNCA grave segredos, chaves de API, tokens ou senhas em código, logs ou documentação.
- **Catálogos dinâmicos:** NUNCA crie listas fixas (hardcoded) de modelos de IA no código ou HTML; catálogos de modelos devem ser 100% dinâmicos via API em tempo real.

## 3. Ciclo de Atualização da Memória (ao concluir uma tarefa)
1. Proponha a atualização de `projects/<nome>/CURRENT_STATE.md` (itens concluídos, próximos passos e bloqueios).
2. Se houve decisão técnica ou escolha de biblioteca/padrão, proponha um novo ADR em `projects/<nome>/DECISIONS/`.
3. Se foi corrigido um bug ou incidente relevante, proponha o registro em `projects/<nome>/LESSONS_LEARNED.md`.
4. **Humano no controle:** Nunca grave alterações nos contratos sem a confirmação do desenvolvedor.
