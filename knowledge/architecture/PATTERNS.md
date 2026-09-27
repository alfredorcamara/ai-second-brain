# Padrões de Arquitetura

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
Infrastructure (EF, APIs externas, IA)
```

## Padrões Frequentes

| Padrão | Quando usar |
|--------|------------|
| **CQRS** | Separação de leitura/escrita |
| **Repository** | Abstração de acesso a dados |
| **Unit of Work** | Transações consistentes |
| **Result Pattern** | Retorno sem exceções |
| **Options Pattern** | Configuração tipada |
| **Mediator** | Desacoplamento de handlers |
| **Strategy** | Algoritmos intercambiáveis |
| **Factory** | Criação complexa de objetos |
| **Observer** | Eventos e notificações |
| **Circuit Breaker** | Resiliência em chamadas externas |

## Decisão de Padrão

Antes de escolher um padrão, pergunte:
1. O projeto já usa este padrão? (consistência)
2. A complexidade é justificada? (YAGNI)
3. Facilita testes? (testabilidade)
4. Outro dev entenderia? (manutenibilidade)
