# Documentation Rules

> Standards for documentation across all projects.

## Principles

1. **Documentation is code** — Lives in the repository, versioned with Git.
2. **Updated or deleted** — Outdated documentation is worse than no documentation.
3. **For the next developer & AI agent** — Write for someone who has zero prior context.
4. **Recorded decisions** — Every architectural decision generates an ADR.
5. **Zero context fabrication** — NEVER create speculative documentation, fictional requirements, or placeholders to simulate progress. If a project does not yet define a stack, architecture, or scope, keep only factual data provided by the user.
6. **Strict Document Taxonomy** — ALWAYS verify and respect where each document belongs before creating it:
   - `docs/` (root): **Reserved exclusively for official guides and user manuals** (e.g. `COMO_UTILIZAR_O_PROJETO.md`, `GUIA_PRATICO.md`, `SOLUCAO_AI_SECOND_BRAIN.md`). NEVER place internal test reports, sprint plans, or construction drafts here.
   - `docs/internals/`: **Internal tool construction artifacts, usability studies (Dev Journey), sprint plans, drafts, and engineering debates** between Alfredo and AI. This folder is ignored by `scan-vault.js` and `doctor.js` to keep the Cockpit 100% clean for external developers.
   - `decisions/GLOBAL_DECISIONS.md`: Consolidated official registry of global architectural decisions (ADRs).
   - `memory/`: Platform continuity memory (clean starter files; lengthy historical logs go to `memory/sessions/` and `memory/archive/`).
   - `projects/<name>/`: Isolated documentation for developer projects.

## Mandatory Documentation per Project

Every project in `projects/<name>/` must maintain:

| File | Content | Update Frequency |
|------|---------|------------------|
| `PROJECT.md` | Overview, goals, stack, status | On creation and scope changes |
| `ARCHITECTURE.md` | Technical architecture, components, flows | When architecture changes |
| `CURRENT_STATE.md` | What is ready, in progress, and next steps | Every work session |
| `LESSONS_LEARNED.md` | Technical pitfalls and validated fixes | Whenever a relevant bug/lesson occurs |
| `DECISIONS/` | Numbered ADRs (`001-...`, `002-...`) | On every architectural decision |

## ADR Format (Architecture Decision Record)

```markdown
# ADR-NNN: Decision Title

## Status
Accepted | Superseded | Deprecated

## Date
YYYY-MM-DD

## Context
What motivated this decision? What problem are we solving?

## Decision
What did we decide to do?

## Alternatives Considered
1. **Alternative A** — Pros / Cons / Why it was rejected
2. **Alternative B** — Pros / Cons / Why it was rejected

## Consequences
- Positive: ...
- Negative / Trade-offs: ...
```
