# AI Gateway Pattern & Universal BYOK

> Unified abstraction layer for connecting any LLM or SLM provider without vendor lock-in.

## 1. Why an AI Gateway?

Hardcoding a single AI provider or model directly inside business logic creates fragile dependencies, rate-limit outages, and vendor lock-in. The **AI Gateway Pattern** centralizes:
- **Multi-Provider Routing (BYOK)**: Groq Cloud, OpenAI, Anthropic Claude, Google Gemini, OpenRouter, DeepSeek, Mistral, or local models via **Ollama / LM Studio / vLLM**.
- **Dynamic Model Discovery**: Real-time model catalog discovery via provider APIs (`/v1/models`) — zero hardcoded model lists.
- **Resilience & Rate-Limit Recovery**: Automatic retry with exponential backoff and header-aware cooldowns (`retry-after`).
- **Response Caching & Telemetry**: Token usage tracking, latency measurement, and local caching.

## 2. Implementation in AI Second Brain

The central implementation lives in `scripts/ai-gateway.js` and exposes:
- Live connection testing and dynamic model enumeration.
- Contextual prompt refinement and topic decomposition for the **Research Lab**.
- Interactive technical interviewing for the **Quickstart Grill Studio**.
- Semantic synthesis with strict citation enforcement for **Ask the Brain**.
