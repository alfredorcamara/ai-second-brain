# Template: Caso de Uso de IA

## Informações

| Campo | Valor |
|-------|-------|
| **Projeto** | |
| **Caso de Uso** | |
| **Tipo** | Classificação / Decisão / Geração / Análise |
| **Abordagem** | AIJev / LLM / Regras / Composta |
| **Data** | |

## Decision Gate

### A tarefa é determinística?
- [ ] Sim → Use código. Não precisa de IA.
- [ ] Não → Continue.

### É classificação/decisão?
- [ ] Sim → Avalie AIJev.
- [ ] Não → Continue.

### Precisa gerar conteúdo?
- [ ] Sim → Use LLM.
- [ ] Não → Execute ação diretamente.

## Especificação

### Input
Descreva o que entra no sistema de IA.

### Output esperado
Descreva o que deve sair.

### Validação
Como validar que o output está correto?

### Fallback
O que acontece se a IA falhar?

## Avaliação

| Critério | Valor |
|----------|-------|
| **Modelo recomendado** | |
| **Custo estimado** | |
| **Latência máxima** | |
| **Taxa de erro aceitável** | |
| **Dados sensíveis envolvidos?** | Sim / Não |
| **Fallback implementado?** | Sim / Não |

## Implementação

```csharp
// Interface a utilizar:
// IDecisionProvider para classificação/decisão
// IGenerativeAIProvider para geração
```
