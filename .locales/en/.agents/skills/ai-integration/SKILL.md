---
name: ai-integration
description: >-
  Guide for integrating AI (AIJev, LLM, or local models) into projects.
  Use when the user wants to add AI capabilities to a project, evaluate AI
  providers, or implement the AI Gateway pattern.
---

# AI Integration

## AI Gateway Pattern

All projects must use a unified abstraction to access AI:

```
APPLICATION → AI GATEWAY → [ RULES | AIJEV | LLM ] → VALIDATION → RESULT
```

## Integration Checklist

1. [ ] AI Decision Gate evaluated (which intelligence tier?)
2. [ ] Abstract interface implemented (no vendor lock-in)
3. [ ] Dynamic model discovery (zero hardcoded model catalogs)
4. [ ] Fallback and timeout configured
5. [ ] Output schema validation
6. [ ] Rate limiting & retry with backoff
7. [ ] Structured logging (zero PII or secrets in logs)
8. [ ] Unit tests with deterministic mocks
