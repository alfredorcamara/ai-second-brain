# AIJev/Jev Integration Rules

> Defines how and when to use AIJev/Jev for structured decisions.
> Reference: https://aijev.org/

## What is AIJev

AIJev/Jev is a structured decision layer where:
- The software provides a **state** and **predefined questions**.
- It receives **typed decisions** with probabilities.
- It is fundamentally different from a generative LLM.

## When to use AIJev

✅ **Use AIJev when**:
- The task requires classification with defined rules.
- The decision can be modeled as question → typed answer.
- You need decision traceability and auditability.
- The result must be deterministic or semi-deterministic.
- Latency is critical (fast decisions).

❌ **DO NOT use AIJev when**:
- The task is purely deterministic (use code).
- You need free-form text or creative content generation.
- The task requires open-ended or exploratory reasoning.

## Integration Pattern

```
EVENT
  │
  ▼
NORMALIZATION (structured data)
  │
  ▼
DETERMINISTIC RULES (filters and simple rules)
  │
  ▼
AIJEV / DECISION GATE
  │
  ├── decision A → action A
  ├── decision B → action B
  ├── decision C → escalate to human
  └── decision D → requires LLM
              │
              ▼
            LLM (generation)
              │
              ▼
          VALIDATION
              │
              ▼
           RESULT
```

## AIJev Pattern: Identify → Generate → Validate

1. **Identify**: What is happening? (state + context)
2. **Generate**: What is the decision? (AIJev processes and returns)
3. **Validate**: Is the decision coherent? (programmatic validation)

## API & Availability

> ⚠️ **IMPORTANT**: The public AIJev API may not be reachable in all environments.
> Always implement with an adapter/fallback pattern:

```csharp
public interface IDecisionProvider
{
    Task<DecisionResult> DecideAsync(
        DecisionRequest request,
        CancellationToken ct);
}

// Implementations
// ├── JevDecisionProvider      → Real AIJev API
// ├── RulesDecisionProvider    → Deterministic rules (fallback)
// ├── MockDecisionProvider     → For unit/integration tests
// └── FutureDecisionProvider   → Future alternatives
```

## Decision Logging

Every decision via AIJev must be logged with:
- Timestamp
- Input Context / State
- Returned Decision
- Confidence / Probability
- Action Taken
- Observed Outcome
