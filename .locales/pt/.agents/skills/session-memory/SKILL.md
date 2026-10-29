---
name: session-memory
description: >-
  Gerencia a memória persistente entre sessões de trabalho. Use ao final de
  uma sessão de trabalho para registrar o que foi feito, decisões tomadas,
  e próximos passos. Também use no início de uma sessão para carregar
  o contexto da sessão anterior.
---

# Session Memory

## Ao Iniciar uma Sessão

1. Leia `memory/current-state.md` para o estado global.
2. Leia `projects/<projeto>/CURRENT_STATE.md` para o projeto em foco.
3. Leia `projects/<projeto>/MEMORY/` para sessões anteriores.
4. Leia `memory/lessons-learned.md` para lições relevantes.

## Ao Finalizar uma Sessão

### 1. Atualizar Estado Global

Edite `memory/current-state.md` com mudanças relevantes.

### 2. Criar Registro de Sessão

Crie arquivo em `projects/<projeto>/MEMORY/sessions/`:

Nome: `YYYY-MM-DD-descricao-curta.md`

Conteúdo:

```markdown
# Sessão: YYYY-MM-DD — Descrição Curta

## Contexto
O que motivou esta sessão de trabalho.

## O que foi feito
- [ ] Item 1
- [ ] Item 2

## Decisões tomadas
- Decisão 1: Motivo

## Problemas encontrados
- Problema 1: Como foi resolvido

## Próximos passos
1. Passo 1
2. Passo 2

## Aprendizados
- Lição 1
```

### 3. Atualizar CURRENT_STATE.md do projeto

Reflita as mudanças no estado atual do projeto.

### 4. Atualizar Lessons Learned (se aplicável)

Se houve aprendizados significativos, adicione em `memory/lessons-learned.md`.

## Regras

- Seja conciso mas completo.
- Registre decisões com o motivo.
- Não omita problemas encontrados.
- Próximos passos devem ser acionáveis.
