# Regras de Integração AIJev/Jev

> Define como e quando utilizar AIJev/Jev para decisões estruturadas.
> Referência: https://aijev.org/pt/

## O que é AIJev

AIJev/Jev é uma camada de decisão estruturada onde:
- O software fornece um **estado** e **perguntas predefinidas**.
- Recebe **decisões tipadas** com probabilidades.
- É fundamentalmente diferente de um LLM generativo.

## Quando usar AIJev

✅ **Use AIJev quando**:
- A tarefa requer classificação com regras definidas.
- A decisão pode ser modelada como pergunta → resposta tipada.
- Precisa de rastreabilidade e auditoria da decisão.
- O resultado deve ser determinístico ou semi-determinístico.
- A latência é crítica (decisões rápidas).

❌ **NÃO use AIJev quando**:
- A tarefa é puramente determinística (use código).
- Precisa gerar texto livre ou conteúdo criativo.
- A tarefa exige raciocínio aberto ou exploratório.

## Padrão de Integração

```
EVENTO
  │
  ▼
NORMALIZAÇÃO (dados estruturados)
  │
  ▼
REGRAS DETERMINÍSTICAS (filtros e regras simples)
  │
  ▼
AIJEV / DECISION GATE
  │
  ├── decisão A → ação A
  ├── decisão B → ação B
  ├── decisão C → escalar para humano
  └── decisão D → necessita LLM
              │
              ▼
            LLM (geração)
              │
              ▼
          VALIDAÇÃO
              │
              ▼
           RESULTADO
```

## Padrão AIJev: Identificar → Gerar → Validar

1. **Identificar**: O que está acontecendo? (estado + contexto)
2. **Gerar**: Qual a decisão? (AIJev processa e retorna)
3. **Validar**: A decisão é coerente? (validação programática)

## API e Disponibilidade

> ⚠️ **IMPORTANTE**: A API pública do AIJev pode não estar disponível.
> Sempre implemente com adapter/fallback:

```csharp
public interface IDecisionProvider
{
    Task<DecisionResult> DecideAsync(
        DecisionRequest request,
        CancellationToken ct);
}

// Implementações
// ├── JevDecisionProvider      → API real do AIJev
// ├── RulesDecisionProvider    → Regras determinísticas (fallback)
// ├── MockDecisionProvider     → Para testes
// └── FutureDecisionProvider   → Futuras alternativas
```

## Registro de Decisões

Toda decisão via AIJev deve ser registrada com:
- Timestamp
- Contexto/Estado de entrada
- Decisão retornada
- Confiança/Probabilidade
- Ação tomada
- Resultado observado
