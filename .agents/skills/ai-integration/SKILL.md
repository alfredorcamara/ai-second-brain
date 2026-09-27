---
name: ai-integration
description: >-
  Guia para integrar IA (AIJev, LLM, ou modelos locais) em projetos.
  Use quando o usuário quiser adicionar capacidades de IA a um projeto,
  avaliar provedores de IA, ou implementar o AI Gateway pattern.
---

# AI Integration

## AI Gateway Pattern

Todos os projetos devem usar uma abstração unificada para acessar IA:

```
┌──────────────────┐
│   APPLICATION    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   AI GATEWAY     │
└────────┬─────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
 RULES AIJEV  LLM
    │    │    │
    └────┼────┘
         ▼
     VALIDATION
         │
         ▼
      RESULT
```

## Implementação em .NET

### Interface de Decisão

```csharp
public interface IDecisionProvider
{
    Task<DecisionResult> DecideAsync(
        DecisionRequest request,
        CancellationToken ct);
}

public record DecisionRequest(
    string Context,
    string Question,
    Dictionary<string, object> State,
    string[] Options);

public record DecisionResult(
    string Decision,
    double Confidence,
    string Reasoning,
    Dictionary<string, object> Metadata);
```

### Interface Generativa

```csharp
public interface IGenerativeAIProvider
{
    Task<GenerationResult> GenerateAsync(
        GenerationRequest request,
        CancellationToken ct);
}
```

### Implementações

```
IDecisionProvider
├── JevDecisionProvider       → API AIJev
├── RulesDecisionProvider     → Regras determinísticas
├── DeterministicProvider     → Lookup tables
└── MockDecisionProvider      → Testes

IGenerativeAIProvider
├── OpenAIProvider
├── AzureOpenAIProvider
├── GroqProvider
├── GoogleAIProvider
└── LocalModelProvider
```

## Checklist de Integração

1. [ ] Decision Gate avaliado (qual tipo de IA?)
2. [ ] Interface abstrata implementada
3. [ ] Provider específico implementado
4. [ ] Fallback configurado
5. [ ] Validação de output
6. [ ] Rate limiting
7. [ ] Retry com backoff
8. [ ] Logging estruturado
9. [ ] Métricas/observabilidade
10. [ ] Testes unitários com mock
11. [ ] Testes de integração
12. [ ] Documentação atualizada

## Segurança

- Consulte `.agents/rules/03-security.md`
- Nunca envie dados sensíveis para IA externa
- Use data classification antes de enviar dados
