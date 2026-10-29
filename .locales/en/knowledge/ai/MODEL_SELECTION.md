# AI Model Selection Guide

> How to select the right intelligence tier for each engineering task.

## Selection Matrix

| Task Type | Recommended Tier | Examples | Cost / Latency |
|-----------|------------------|----------|----------------|
| **Validation, Parsing, Math, CRUD** | **Deterministic Code (No AI)** | Regex, SQL, JSON Schema, TypeScript/C# logic | $0 / <1ms |
| **Classification, Triage, Routing** | **AIJev / Symbolic Rules / Small Fast Model (SLM)** | Intent routing, alert severity, tag classification | Minimal / <100ms |
| **Technical Synthesis & Documentation** | **Fast High-Throughput LLM** | Research Lab synthesis, session summaries | Low / 1s–3s |
| **Complex Architecture & Deep Debugging** | **Frontier Reasoning LLM** | Multi-service ADR design, root-cause analysis | Moderate / 3s–10s |

> **Golden Principle**: Always start with the simplest, most deterministic layer that solves the problem. Escalate to larger models only when strictly necessary.
