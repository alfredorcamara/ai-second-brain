# JobSentinel — Arquitetura

## Visão Geral

```
┌─────────────────────────────────────────────────┐
│                SQL SERVER                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Job A   │  │  Job B   │  │  Job N   │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       └──────────────┼──────────────┘            │
│                      │                           │
│              msdb.dbo.sysjobhistory              │
└──────────────────────┼───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│              JOBSENTINEL API                      │
│                                                   │
│  ┌──────────────┐                                │
│  │  Collector    │  ← Polling ou Event            │
│  └──────┬───────┘                                │
│         ▼                                         │
│  ┌──────────────┐                                │
│  │  Normalizer   │  ← Dados estruturados          │
│  └──────┬───────┘                                │
│         ▼                                         │
│  ┌──────────────┐                                │
│  │  Rule Engine  │  ← Regras determinísticas      │
│  └──────┬───────┘                                │
│         ▼                                         │
│  ┌──────────────┐                                │
│  │  AI Gateway   │  ← Decision Gate               │
│  │  ├─ AIJev     │                                │
│  │  ├─ Rules     │                                │
│  │  └─ LLM      │                                │
│  └──────┬───────┘                                │
│         ▼                                         │
│  ┌──────────────┐                                │
│  │  Action Eng.  │  ← Executa decisão             │
│  └──────┬───────┘                                │
│         ▼                                         │
│  ┌──────────────┐                                │
│  │  Notifier     │  ← Alertas e notificações      │
│  └──────────────┘                                │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│                   PORTAL                          │
│  Dashboard │ Jobs │ Incidentes │ Explicações      │
└──────────────────────────────────────────────────┘
```

## Camadas

| Camada | Responsabilidade |
|--------|-----------------|
| **Collector** | Coletar dados do SQL Agent |
| **Normalizer** | Estruturar e enriquecer dados |
| **Rule Engine** | Aplicar regras determinísticas |
| **AI Gateway** | Decisões inteligentes (AIJev/LLM) |
| **Action Engine** | Executar ações decididas |
| **Notifier** | Notificações e alertas |
| **Portal** | Visualização para humanos |

## Tecnologias

- ASP.NET Core 8 Web API
- Entity Framework Core
- SQL Server (fonte + storage)
- Serilog (logging)
- SignalR (real-time no portal)
- Health Checks
