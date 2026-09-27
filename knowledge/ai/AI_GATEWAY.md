# AI Gateway Pattern

## Conceito

O AI Gateway é uma abstração que desacopla seus projetos de provedores
específicos de IA. Todo acesso a IA passa por uma interface unificada.

## Arquitetura

```
┌──────────────────────────────────────────────────┐
│                   APPLICATION                     │
├──────────────────────────────────────────────────┤
│                   AI GATEWAY                      │
│                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │  Decision    │  │  Generative  │  │ Embed   │ │
│  │  Provider    │  │  Provider    │  │ Provider│ │
│  └──────┬──────┘  └──────┬───────┘  └────┬────┘ │
│         │                │               │       │
│  ┌──────┴──────┐  ┌──────┴───────┐  ┌────┴────┐ │
│  │ AIJev       │  │ OpenAI       │  │ OpenAI  │ │
│  │ Rules       │  │ Azure OpenAI │  │ Local   │ │
│  │ Deterministic│  │ Groq         │  │         │ │
│  │ Mock        │  │ Google AI    │  │         │ │
│  │             │  │ Local        │  │         │ │
│  └─────────────┘  └──────────────┘  └─────────┘ │
├──────────────────────────────────────────────────┤
│                  CROSS-CUTTING                    │
│  ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ │
│  │ Logging │ │ Retry  │ │ Cache  │ │ Metrics  │ │
│  └─────────┘ └────────┘ └────────┘ └──────────┘ │
└──────────────────────────────────────────────────┘
```

## Benefícios

1. **Desacoplamento** — Troque de provider sem mudar código do app.
2. **Fallback** — Se um provider falhar, use outro.
3. **Observabilidade** — Métricas centralizadas de uso de IA.
4. **Custo** — Controle e roteamento por custo/qualidade.
5. **Segurança** — Ponto único para aplicar regras de dados.

## Implementação Base

```csharp
// Program.cs / DI Registration
services.AddAIGateway(options =>
{
    options.DefaultDecisionProvider = "rules";
    options.DefaultGenerativeProvider = "openai";
    
    options.AddDecisionProvider<RulesDecisionProvider>("rules");
    options.AddDecisionProvider<JevDecisionProvider>("jev");
    
    options.AddGenerativeProvider<OpenAIProvider>("openai");
    options.AddGenerativeProvider<GroqProvider>("groq");
    
    options.EnableFallback = true;
    options.EnableRetry = true;
    options.EnableMetrics = true;
});
```
