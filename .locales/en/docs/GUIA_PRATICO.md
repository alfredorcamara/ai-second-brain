# AI Second Brain Practical Guide

> 📖 **For the detailed step-by-step manual for new and legacy projects:**  
> Consult the full official document at: **[COMO_UTILIZAR_O_PROJETO.md](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN_CENTRAL/AI_SECOND_BRAIN/docs/COMO_UTILIZAR_O_PROJETO.md)**

## What is the Second Brain?

The "second brain" concept comes from the idea of **externalizing knowledge
from your head** into an organized, searchable system. Instead of relying on
human memory to remember decisions, contexts, patterns, and lessons learned,
you document everything in a format that:

1. **Persists** — Never gets lost between sessions.
2. **Is Searchable** — Quickly find what you need.
3. **Is Actionable** — The AI agent uses the knowledge to deliver higher quality code.
4. **Evolves** — Accumulates knowledge continuously over time.

## How to Use in Practice

### Scenario 1: Starting work on a project

1. Open the AI_SECOND_BRAIN workspace in Antigravity.
2. Say: "I want to work on [ProjectName]. Give me the current context."
3. The agent will:
   - Read `projects/[ProjectName]/PROJECT.md`
   - Read `projects/[ProjectName]/CURRENT_STATE.md`
   - Read decisions in `DECISIONS/`
   - Read previous session memories
   - Provide an updated status summary

### Scenario 2: Implementing a new feature with AI

1. Say: "I want to add smart classification to [ProjectName]."
2. The agent triggers the `ai-decision-gate` skill automatically.
3. Classifies the task:
   - Is it deterministic? → Pure code / Business rule
   - Is it classification or decision? → Evaluate AIJev / Decision tree
   - Is it open reasoning or generation? → LLM via AI Gateway
4. Proposes architecture before writing code.
5. After implementation and validation, updates memory and documentation.

### Scenario 3: Investigating a bug or incident

1. Say: "Module X is failing with error Y."
2. The agent triggers the `bug-investigation` skill.
3. Follows structured investigation (hypothesis → test → root cause).
4. Records resolution and updates `memory/lessons-learned.md`.

### Scenario 4: Onboarding a new project

1. Say: "I want to start a new project called MyNewApp."
2. The agent triggers the `project-onboarding` skill.
3. Scaffolds standardized structure in `projects/MyNewApp/`.
4. Populates governance templates with the specifications you provide.

### Scenario 5: Architecture review

1. Say: "Review the architecture of [ProjectName]."
2. The agent triggers the `architecture-review` skill.
3. Verifies architectural quality checklist (decoupling, security, resilience).
4. Records findings and recommendations in a new ADR.

## Work Session Lifecycle

```
SESSION START
      │
      ▼
   CONTEXT (read current state, memory, decisions)
      │
      ▼
    WORK (implement, debug, review)
      │
      ▼
   RECORD (update memory, documentation)
      │
      ▼
 SESSION END
```

## Second Brain Maintenance

### Daily
- Update `CURRENT_STATE.md` of active projects.
- Record session in `MEMORY/sessions/`.

### Weekly
- Review global `memory/current-state.md`.
- Verify lessons learned have been recorded.

### Per Sprint
- Update project roadmap.
- Review pending decisions.
- Evaluate whether knowledge base needs updates.

### Per Quarter
- Review project architecture.
- Check if skills require tuning.
- Clean up obsolete memory.
