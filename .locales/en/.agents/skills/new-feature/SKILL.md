---
name: new-feature
description: >-
  Structured workflow to plan, specify, and implement a new feature.
  Use when adding new functionality to an existing governed project.
---

# New Feature Workflow

## Before Starting

1. Read `PROJECT.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md`, and `LESSONS_LEARNED.md`.
2. Check `DECISIONS/` for relevant ADRs.

## Process

1. **Specify**: Use `templates/feature-spec.md` (What, Why, How, Acceptance Criteria).
2. **Evaluate Impact**:
   - Affects architecture? → Check `ARCHITECTURE.md`
   - Involves AI? → Run `ai-decision-gate`
   - Affects security? → Check `.agents/rules/03-security.md`
3. **Implement & Test**: Write clean, idiomatic code with unit/integration tests.
4. **Document & Persist Memory**: Update `CURRENT_STATE.md` and record a session summary in `MEMORY/sessions/`.
