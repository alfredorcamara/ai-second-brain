# Architecture Patterns

## Clean Architecture

```
Presentation (API/UI)
    │
    ▼
Application (Use Cases, CQRS)
    │
    ▼
Domain (Entities, Value Objects, Interfaces)
    │
    ▼
Infrastructure (ORM, External APIs, AI)
```

## Common Patterns

| Pattern | When to Use |
|---------|-------------|
| **CQRS** | Read/write separation |
| **Repository** | Data access abstraction |
| **Unit of Work** | Consistent transactions |
| **Result Pattern** | Explicit error handling without exceptions |
| **Options Pattern** | Strongly-typed configuration |
| **Mediator** | Decoupling request handlers |
| **Strategy** | Interchangeable algorithms |
| **Factory** | Complex object creation |
| **Observer** | Domain events and notifications |
| **Circuit Breaker** | Resilience for external API calls |

## Pattern Selection Checklist

Before choosing a pattern, ask:
1. Does the project already use this pattern? (consistency)
2. Is the complexity justified? (YAGNI)
3. Does it make testing easier? (testability)
4. Would another developer immediately understand it? (maintainability)
