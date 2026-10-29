# AI Decision Rules

> Defines when and how to use different types of AI across tasks.

## Mandatory Classification

Before using any AI resource, classify the task:

### Level 1: Deterministic
- **When**: The answer can be calculated or derived from deterministic rules.
- **Action**: Use code, SQL queries, or business rules.
- **Examples**: Data validation, calculations, formatting, CRUD.

### Level 2: Classification / Decision
- **When**: You need to categorize, prioritize, or decide among alternatives.
- **Action**: Evaluate AIJev/Jev or symbolic rules before using an LLM.
- **Examples**: Classifying incident severity, prioritizing alerts, routing actions.

### Level 3: Generation
- **When**: You need to create content, explain something, or perform open-ended reasoning.
- **Action**: Use an LLM with a structured prompt and output validation.
- **Examples**: Explaining failures, generating reports, suggesting improvements.

### Level 4: Composite
- **When**: The task combines structured decision + generation.
- **Action**: AIJev/Rules to decide → LLM to generate → Programmatic validation.
- **Examples**: Analyzing a failed Job and generating a contextualized explanation.

## Golden Rule

```
IF it can be solved with code → CODE
IF it needs to decide/classify → AIJEV / SYMBOLIC RULES first
IF it needs to generate/explain → LLM
ALWAYS → VALIDATE result
```

## Prohibitions

- ❌ Using an LLM for deterministic tasks
- ❌ Calling generative AI on every raw event/Job without filtering
- ❌ Ignoring AIJev/rules when the task is a structured decision
- ❌ Accepting AI output without programmatic validation
- ❌ Hardcoding an AI provider (use abstractions / AI Gateway)
- ❌ Hardcoding lists or catalogs of AI models (catalog must be 100% dynamic via API)
