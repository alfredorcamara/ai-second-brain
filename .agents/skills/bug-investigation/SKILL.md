---
name: bug-investigation
description: >-
  Investigação estruturada de bugs e problemas técnicos. Use quando o usuário
  reportar um bug, erro, comportamento inesperado, falha de performance, ou
  qualquer problema técnico que precise ser investigado e resolvido.
---

# Bug Investigation

## Processo de Investigação

### 1. Coletar Informações

- **O que aconteceu?** Descrição do sintoma.
- **Quando aconteceu?** Primeira ocorrência, frequência.
- **Onde aconteceu?** Ambiente, componente, endpoint.
- **Como reproduzir?** Passos para reprodução.
- **O que deveria acontecer?** Comportamento esperado.

### 2. Classificar Severidade

| Severidade | Descrição | SLA |
|-----------|-----------|-----|
| **Crítica** | Sistema fora do ar | Imediato |
| **Alta** | Funcionalidade quebrada | 4 horas |
| **Média** | Funcionalidade degradada | 24 horas |
| **Baixa** | Cosmético/menor | Sprint atual |

### 3. Investigar

```
SINTOMA
  │
  ▼
LOGS (verificar mensagens de erro)
  │
  ▼
REPRODUÇÃO (consegue reproduzir?)
  │
  ├── SIM → debug direto
  └── NÃO → ampliar coleta de dados
  │
  ▼
HIPÓTESE (o que pode estar causando?)
  │
  ▼
VALIDAÇÃO (confirmar hipótese)
  │
  ▼
FIX (implementar correção)
  │
  ▼
TESTE (verificar que fix funciona)
  │
  ▼
REGRESSÃO (verificar que nada quebrou)
```

### 4. Corrigir

- Implemente o fix seguindo as regras do projeto.
- Adicione testes que cobrem o cenário do bug.
- Verifique regressão.

### 5. Post-mortem

Para bugs críticos ou recorrentes:
- Documente causa raiz.
- Registre em `memory/lessons-learned.md`.
- Avalie se regras ou testes devem ser adicionados para prevenir recorrência.

### 6. Atualizar

- `CURRENT_STATE.md` do projeto.
- `MEMORY/` com o que foi aprendido.
- Adicione à base de conhecimento se relevante.
