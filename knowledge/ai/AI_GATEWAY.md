# AI Gateway Pattern

## Conceito

O AI Gateway é uma abstração arquitetural que desacopla sua aplicação de provedores específicos de inteligência artificial. Todo acesso a modelos ou motores de decisão passa por interfaces unificadas.

Isso se aplica a qualquer stack: **Node.js/TypeScript, Python, Go, C#/.NET, Rust, Java, etc.**

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
│  │ Deterministic│  │ Anthropic    │  │ Local   │ │
│  │ Custom Rules│  │ Google Gemini│  │ Ollama  │ │
│  │ Mock/Test   │  │ Ollama/Local │  │         │ │
│  └─────────────┘  └──────────────┘  └─────────┘ │
├──────────────────────────────────────────────────┤
│                  CROSS-CUTTING                    │
│  ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ │
│  │ Logging │ │ Retry  │ │ Cache  │ │ Metrics  │ │
│  └─────────┘ └────────┘ └────────┘ └──────────┘ │
└──────────────────────────────────────────────────┘
```

## Benefícios Fundamentais

1. **Desacoplamento**: Troque de OpenAI para Claude, Gemini ou modelo local sem alterar regras de negócio.
2. **Resiliência e Fallback**: Se uma API externa oscilar ou sofrer rate limit, o gateway recorre automaticamente a um provedor secundário ou regras determinísticas locais.
3. **Observabilidade Centralizada**: Auditoria de tokens, custos financeiros e latência em um único ponto.
4. **Governança de Privacidade**: Sanitização obrigatória de dados sensíveis antes do envio para qualquer API de terceiro.

## Contratos Agnósticos de Exemplo

```typescript
// Contrato de Decisão Estruturada (AIJev / Regras)
// Implementação nativa no workspace: scripts/decision-provider.js
interface IDecisionProvider {
  decide(request: DecisionRequest): Promise<DecisionResult>;
}

// Contrato de Geração Livre / Raciocínio (LLM)
// Implementação nativa no workspace: scripts/ai-gateway.js
interface IGenerativeProvider {
  generate(prompt: string, options?: GenerationOptions): Promise<string>;
}
```

> 💡 **Implementação no AI Second Brain**:
> - Decisão e Classificação (JEV): [`scripts/decision-provider.js`](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/scripts/decision-provider.js) (`RulesDecisionProvider`).
> - Geração e Chat (BYOK): [`scripts/ai-gateway.js`](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/scripts/ai-gateway.js) (`AIGatewayClient`).

