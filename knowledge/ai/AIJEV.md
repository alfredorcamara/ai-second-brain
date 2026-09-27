# AIJev / Jev — Referência

> Fonte: https://aijev.org/pt/

## O que é

AIJev/Jev é uma **camada de decisão estruturada** para software:
- O software fornece um **estado** e **perguntas predefinidas**.
- Recebe **decisões tipadas** com probabilidades.
- Diferente de um LLM que gera texto livre.

## Quando usar

| Cenário | Use AIJev? | Alternativa |
|---------|-----------|-------------|
| Classificar evento | ✅ Sim | - |
| Priorizar alerta | ✅ Sim | - |
| Decidir ação | ✅ Sim | - |
| Gerar texto | ❌ Não | LLM |
| Responder pergunta | ❌ Não | LLM |
| Cálculo determinístico | ❌ Não | Código |

## Padrão: Identificar → Gerar → Validar

1. **Identificar**: O que está acontecendo? (estado + contexto)
2. **Gerar**: Qual a decisão? (AIJev processa)
3. **Validar**: A decisão é coerente? (validação programática)

## Integração com .NET

```csharp
// Abstração
public interface IDecisionProvider
{
    Task<DecisionResult> DecideAsync(
        DecisionRequest request,
        CancellationToken ct);
}

// Uso
var request = new DecisionRequest(
    Context: "SQL Job 'BackupProd' falhou",
    Question: "Qual a ação adequada?",
    State: new() { ["errorCode"] = 1234, ["retries"] = 3 },
    Options: ["retry", "alert", "escalate", "explain"]
);

var result = await _decisionProvider.DecideAsync(request, ct);
```

## Disponibilidade

> ⚠️ A API pública do AIJev direciona para solicitação de acesso.
> Sempre implemente com fallback para `RulesDecisionProvider`.
