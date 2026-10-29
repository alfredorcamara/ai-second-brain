# AI Second Brain — Official Solution Documentation

> **The Operating System for Governance, Persistent Memory, and Autonomous Research in AI-Assisted Software Development.**

---

## 1. Overview & The Real Problem

The biggest bottleneck in modern AI-assisted development (Google Antigravity, Cursor, Claude Code, Copilot, Windsurf) is not code generation speed — it is **context amnesia and the lack of long-term architectural governance**.

- **Context Amnesia**: Every new chat window resets the model's working memory. Without an external brain, the agent forgets why architectural choices were made.
- **Context Drift**: Without centralized rules and living contracts, each session introduces conflicting patterns and silent regressions.
- **Token Waste**: Calling expensive frontier LLMs for tasks that deterministic code or symbolic rules solve in 0ms.

---

## 2. Solution Architecture: Central Hub & Satellite Repositories

**AI Second Brain** adopts a **Central Governance Hub & Physical Satellite Repositories** pattern:

![Interactive Architectural Diagram](brain-ui/assets/diagrams/hub-satellites-architecture.svg)

- **Central Hub**: Stores global rules (`.agents/rules/`), reusable skills (`.agents/skills/`), cross-project knowledge (`knowledge/`), global lessons learned (`memory/lessons-learned.md`), and the interactive 3D Cockpit (`docs/brain-ui/`).
- **Satellite Repositories (`projects/*`)**: Connected via zero-duplication NTFS Junctions or symlinks, each project carries its own living contracts (`PROJECT.md`, `CURRENT_STATE.md`, `ARCHITECTURE.md`, `LESSONS_LEARNED.md`, `DECISIONS/`, `RESEARCH/`, `MEMORY/`).

---

## 3. Governance & Intelligent Routing (AI Decision Gate)

Every task is filtered through the **AI Decision Gate** ([01-ai-decision.md](../.agents/rules/01-ai-decision.md)):

![AI Decision Routing Tree](brain-ui/assets/diagrams/ai-decision-routing.svg)

1. **Track A — Deterministic Code**: Math, validation, parsing, CRUD → Pure code (`0ms`, `$0`, `100%` reliability).
2. **Track B — Symbolic Rules / AIJev**: Structured classification and routing → Symbolic rules / SLMs (`~1ms`, full auditability).
3. **Track C — Generative AI (Universal AI Gateway)**: Open synthesis, documentation, and complex reasoning → Connected LLM with programmatic validation.

---

## 4. Autonomous Research Lab

The **Research Lab** synthesizes deep domain knowledge contextualized with your project's `PROJECT.md` and `ARCHITECTURE.md` across a **Two-Layer Taxonomy**:

![Research Lab Two-Layer Taxonomy](brain-ui/assets/diagrams/research-two-layers.svg)

1. **📘 `knowledge/` Layer (Theoretical Foundations)**: Conceptual foundations, trade-offs, mathematical/domain models, and industry patterns.
2. **🛠️ `actionable/` Layer (Executable Specifications)**: Production-ready schemas, TypeScript/C#/Python/SQL implementations, and test suites.

---

## 5. Session Lifecycle & Hands-On Loop

![Session Lifecycle Loop](brain-ui/assets/diagrams/session-lifecycle-loop.svg)

1. **Session Start**: Instant context restoration via `CURRENT_STATE.md` and `LESSONS_LEARNED.md`.
2. **Governed Execution**: Code changes guided by `.agents/rules/` and `ARCHITECTURE.md`.
3. **Validation**: Automated verification via `npm run doctor`.
4. **Pre-Close Gate**: Session capture into `MEMORY/sessions/` and roadmap synchronization.
