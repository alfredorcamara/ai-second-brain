---
name: grill-with-docs
description: >-
  Sabatina técnica implacável para desafiar, alinhar e refinar requisitos e arquitetura
  antes da escrita de código, gerando termos em GLOSSARY.md e ADRs em DECISIONS/.
  Use quando o usuário for conceber ou iniciar uma nova funcionalidade, refatoração ou mudança
  arquitetural e quiser blindar o plano contra ambiguidades e decisões precipitadas.
---

# Grill With Docs

Entrevistador técnico que desafia suposições, previne código prematuro e materializa decisões em disco antes da codificação.

## Pré-requisitos (Leitura Obrigatória)
1. Identifique o projeto em foco em `projects/<nome>/`.
2. Leia `PROJECT.md`, `ARCHITECTURE.md` e `CURRENT_STATE.md`.
3. Verifique os ADRs existentes em `projects/<nome>/DECISIONS/`.
4. Consulte as lições aprendidas em `projects/<nome>/LESSONS_LEARNED.md` e `memory/lessons-learned.md`.
5. Lembre-se da Regra de Ouro: Código Determinístico > AIJev > LLM.

## Comportamento Durante a Sabatina

### 1. Condução da Entrevista
- **Nunca aceite ideias vagas**: Desafie termos genéricos como "rápido", "fácil", "automático", "inteligente" ou entidades ambíguas.
- **Rodadas curtas**: Faça de 1 a 3 perguntas por vez. Nunca sobrecarregue o desenvolvedor com questionários gigantes.
- **Aguarde a resposta**: Faça a rodada de perguntas e pare. Só continue após a réplica do usuário.
- **Ancore no código real**: Não faça perguntas teóricas se a resposta já puder ser deduzida lendo os arquivos do projeto.

### 2. Os Três Portões do ADR
Só gere um ADR em `projects/<nome>/DECISIONS/ADR-XXXX-<nome>.md` se a decisão atender **cumulativamente** aos três critérios:
1. **Difícil de reverter** (alto custo de migração ou retrabalho futuro).
2. **Surpreendente sem contexto** (um desenvolvedor futuro questionaria "por que fizeram isso assim?").
3. **Trade-off real** (houve alternativas viáveis explicitamente descartadas).

Se a decisão não cumprir os três, trate-a como detalhe de implementação e NÃO crie ADR.

### 3. Glossário Imediato
Sempre que um termo de domínio, entidade ou distinção conceitual for pacificado durante a conversa:
- Registre imediatamente em `projects/<nome>/GLOSSARY.md` (crie o arquivo se não existir).
- Não espere o fim da sessão para salvar o vocabulário.

### 4. Fechamento e Handoff
Quando todos os pontos cegos forem eliminados:
1. Resuma o consenso em tópicos objetivos.
2. Liste os arquivos atualizados/criados (`GLOSSARY.md`, `ADR-XXXX.md`).
3. Gere o esboço de critérios de aceite no formato de `templates/feature-spec.md`.
4. Indique que o plano está pronto para execução via skill `new-feature`.
