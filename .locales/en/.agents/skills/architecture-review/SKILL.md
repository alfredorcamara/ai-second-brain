---
name: architecture-review
description: >-
  Architectural review of projects and components. Use when evaluating system
  design, checking adherence to Clean Architecture, or reviewing technical trade-offs.
---

# Architecture Review

## Review Workflow

1. **Read Project Contracts**:
   - `PROJECT.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md`, and `DECISIONS/`.
2. **Verify Separation of Concerns**:
   - Domain logic isolated from infrastructure and external frameworks.
   - AI calls abstracted behind an AI Gateway (`.agents/rules/01-ai-decision.md`).
3. **Check Security & Resilience**:
   - Verify compliance with `.agents/rules/03-security.md`.
   - Ensure external integrations have timeouts, retries, and fallbacks.
4. **Record Outcomes**:
   - Document new architectural decisions as numbered ADRs in `DECISIONS/`.
