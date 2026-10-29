---
name: ai-decision-gate
description: >-
  Evaluates tasks involving decision-making or classification and determines whether
  to use deterministic rules, AIJev/Jev, or a generative model (LLM). Use when the
  user asks to implement a feature that may involve AI, or when deciding which AI
  approach to use for a specific task.
---

# AI Decision Gate

## Evaluation Workflow

When a task arrives that may involve AI, follow this process:

### Step 1: Is the task deterministic?

**Ask**: "Can the result be calculated or derived from fixed rules?"

- **YES** → Use deterministic code/rules. **Stop here.**
- **NO** → Continue to Step 2.

### Step 2: Is it a decision or classification?

**Ask**: "Does the task involve categorizing, prioritizing, or choosing among finite alternatives?"

- **YES** → Evaluate AIJev / Symbolic Rules (Step 3).
- **NO** → Continue to Step 4.

### Step 3: Evaluate AIJev / Symbolic Rules

| Criterion | Suitable for AIJev? |
|-----------|---------------------|
| Can input be structured? | Yes → ✅ |
| Is output typed/categorical? | Yes → ✅ |
| Requires auditability? | Yes → ✅ |
| Is latency critical? | Yes → ✅ |
| Requires free-form text? | Yes → ❌ Use LLM |
| Purely creative generation? | Yes → ❌ Use LLM |

### Step 4: Does it need open content generation?

**Ask**: "Does it need to generate prose, explanations, or open-ended content?"

- **YES** → Use LLM via the AI Gateway with structured prompt, output validation, and fallback.
- **NO** → Execute deterministic action directly.

### Step 5: Record the decision

Document in `DECISIONS/` which approach was chosen and why.
