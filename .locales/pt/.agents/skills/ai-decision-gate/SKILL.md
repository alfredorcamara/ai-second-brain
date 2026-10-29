---
name: ai-decision-gate
description: >-
  Avalia tarefas que envolvem decisão ou classificação e determina se devem usar
  regras determinísticas, AIJev/Jev ou um modelo generativo (LLM). Use quando o
  usuário pedir para implementar uma funcionalidade que pode envolver IA, ou quando
  precisar decidir qual abordagem de IA utilizar para uma tarefa específica.
---

# AI Decision Gate

## Fluxo de Avaliação

Quando uma tarefa chegar que pode envolver IA, siga este processo:

### Passo 1: A tarefa é determinística?

**Pergunte**: "O resultado pode ser calculado/derivado de regras fixas?"

- **SIM** → Use código/regras. **Pare aqui.**
- **NÃO** → Continue para Passo 2.

### Passo 2: É decisão ou classificação?

**Pergunte**: "A tarefa envolve categorizar, priorizar ou escolher entre alternativas?"

- **SIM** → Avalie AIJev (Passo 3).
- **NÃO** → Continue para Passo 4.

### Passo 3: Avaliar AIJev

Verifique se AIJev é adequado:

| Critério | AIJev é adequado? |
|----------|-------------------|
| Entrada pode ser estruturada? | Sim → ✅ |
| Saída é tipada/categórica? | Sim → ✅ |
| Precisa de rastreabilidade? | Sim → ✅ |
| Latência crítica? | Sim → ✅ |
| Precisa de texto livre? | Sim → ❌ Use LLM |
| É puramente criativo? | Sim → ❌ Use LLM |

Se AIJev for adequado:
1. Modele a decisão como `DecisionRequest`.
2. Implemente com `IDecisionProvider`.
3. Configure fallback para `RulesDecisionProvider`.
4. Registre a decisão para auditoria.

### Passo 4: Precisa gerar conteúdo?

**Pergunte**: "Precisa criar texto, explicação, ou conteúdo?"

- **SIM** → Use LLM com:
  - Prompt estruturado
  - Temperatura adequada
  - Validação do output
  - Fallback definido
- **NÃO** → Execute ação diretamente.

### Passo 5: Registrar decisão

Documente em `DECISIONS/` qual abordagem foi escolhida e por quê.

## Resumo Visual

```
TAREFA
  │
  ├─ Determinística? ──── SIM ──→ CÓDIGO
  │
  ├─ Decisão? ──── SIM ──→ AIJEV
  │                              │
  │                         Precisa gerar?
  │                              │
  │                         SIM ──→ LLM
  │
  └─ Geração? ──── SIM ──→ LLM
                              │
                          VALIDAÇÃO
                              │
                           RESULTADO
```
