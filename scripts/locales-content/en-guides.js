/**
 * AI SECOND BRAIN — English Translations for Guides & Strategy Documents
 */

module.exports = {
    'docs/GUIA_PRATICO.md': `# AI Second Brain Practical Guide

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
   - Read \`projects/[ProjectName]/PROJECT.md\`
   - Read \`projects/[ProjectName]/CURRENT_STATE.md\`
   - Read decisions in \`DECISIONS/\`
   - Read previous session memories
   - Provide an updated status summary

### Scenario 2: Implementing a new feature with AI

1. Say: "I want to add smart classification to [ProjectName]."
2. The agent triggers the \`ai-decision-gate\` skill automatically.
3. Classifies the task:
   - Is it deterministic? → Pure code / Business rule
   - Is it classification or decision? → Evaluate AIJev / Decision tree
   - Is it open reasoning or generation? → LLM via AI Gateway
4. Proposes architecture before writing code.
5. After implementation and validation, updates memory and documentation.

### Scenario 3: Investigating a bug or incident

1. Say: "Module X is failing with error Y."
2. The agent triggers the \`bug-investigation\` skill.
3. Follows structured investigation (hypothesis → test → root cause).
4. Records resolution and updates \`memory/lessons-learned.md\`.

### Scenario 4: Onboarding a new project

1. Say: "I want to start a new project called MyNewApp."
2. The agent triggers the \`project-onboarding\` skill.
3. Scaffolds standardized structure in \`projects/MyNewApp/\`.
4. Populates governance templates with the specifications you provide.

### Scenario 5: Architecture review

1. Say: "Review the architecture of [ProjectName]."
2. The agent triggers the \`architecture-review\` skill.
3. Verifies architectural quality checklist (decoupling, security, resilience).
4. Records findings and recommendations in a new ADR.

## Work Session Lifecycle

\`\`\`
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
\`\`\`

## Second Brain Maintenance

### Daily
- Update \`CURRENT_STATE.md\` of active projects.
- Record session in \`MEMORY/sessions/\`.

### Weekly
- Review global \`memory/current-state.md\`.
- Verify lessons learned have been recorded.

### Per Sprint
- Update project roadmap.
- Review pending decisions.
- Evaluate whether knowledge base needs updates.

### Per Quarter
- Review project architecture.
- Check if skills require tuning.
- Clean up obsolete memory.
`,

    'docs/RESEARCH_LAB.md': `# Research Lab — Autonomous Knowledge Laboratory

> **Autonomous Topic Research and Continuous Cataloging Subsystem of AI Second Brain**  
> Architectural and Operational Reference Document

---

## 1. Overview

The **Research Lab** is an AI Second Brain subsystem that enables each project to create **Thematic Research Laboratories**.

Rather than relying on ephemeral chat prompts or generic web searches, the Research Lab operates autonomously and in deep context:
1. The developer freely defines a topic or technological question for their project.
2. The AI reads existing project contracts (\`PROJECT.md\`, \`ARCHITECTURE.md\`) and refines the briefing, ensuring the research aligns with the project's actual constraints and objectives.
3. The topic is decomposed into sub-topics with clear taxonomy.
4. The engine catalogs all knowledge into structured \`.md\` files versioned on disk under the project folder.
5. Generated files feed the project's 3D Neural Planet and long-term memory.

---

## 2. The Two Knowledge Layers

Each research lab organizes findings into two complementary layers:

\`\`\`
projects/<project-name>/RESEARCH/<research-slug>/
├── _meta.json                # Metadata, status, and definition history (Live Prompt)
├── OVERVIEW.md               # Executive overview and neural map of topics
├── knowledge/                # LAYER 1: THEORETICAL & CONCEPTUAL KNOWLEDGE
│   ├── fundamental_rules.md
│   ├── state_of_the_art.md
│   └── comparative_analysis.md
└── actionable/               # LAYER 2: APPLICABLE PROJECT SPECIFICATIONS
    ├── proposed_architecture.md
    ├── suggested_schema.md
    └── business_rules.md
\`\`\`

- **Layer 1 (\`knowledge/\`)**: The "what" and the "why". Principles, state of the art, industry benchmarks, and conceptual foundations.
- **Layer 2 (\`actionable/\`)**: The "how to apply to the project". Technical specifications, pseudocode, schema decisions, and rules tailored to the project's real tech stack.

---

## 3. The "Live Prompt" Concept

Research definitions are never static. In AI Second Brain, we adopt the **Live Prompt** model:
- The developer can rewrite intent or shift focus at any time.
- The AI can suggest enhancements ("✨ Refine with AI") based on current governance status.
- Each new definition version is saved in \`definitionHistory\` inside \`_meta.json\`.
- Future research runs compare history to detect contradictions, new discoveries, or needed additions without erasing previous context.

---

## 4. Technical Architecture & Stack

- **Inference Engine**: Universal AI Gateway (BYOK — *Bring Your Own Key*)
  - **Supported Providers**: Google Gemini, OpenAI, Anthropic Claude, Groq Cloud, Local Ollama, and OpenRouter
  - **Configuration**: Keys and providers managed locally in \`.env\` and dynamically configurable via the web UI
- **Zero Dependencies**: Native client implemented in \`scripts/ai-gateway.js\` using Node.js built-in modules (\`https\`, \`http\`, \`fs\`, \`path\`).
- **Output Sanitization**: Defensive markdown fence handling (\`\`\`json\`) and resilient JSON extraction.

---

## 5. REST API Endpoints (\`server.js\`)

| Method | Route | Description |
|---|---|---|
| \`GET\` | \`/api/ai/status\` | Returns configuration status of active connected AI (provider, model, key mask) |
| \`POST\` | \`/api/ai/refine-prompt\` | Refines raw user intent using context from \`PROJECT.md\` and \`ARCHITECTURE.md\` |
| \`POST\` | \`/api/ai/decompose\` | Decomposes topic into sub-topics categorized into \`knowledge\` or \`actionable\` |
| \`GET\` | \`/api/projects/:name/research\` | Lists all research labs created for the given project |
| \`POST\` | \`/api/projects/:name/research\` | Scaffolds physical disk structure for a new lab (\`_meta.json\`, \`OVERVIEW.md\`, folders) |
| \`POST\` | \`/api/projects/:name/research/:slug/definition\` | Updates lab definition with versioned history (Live Prompt) |
| \`POST\` | \`/api/projects/:name/research/:slug/run\` | Triggers autonomous technical synthesis and writes \`.md\` files to disk |
| \`GET\` | \`/api/projects/:name/research/:slug/status\` | Returns whether autonomous research is currently in progress |

---

## 6. Implementation Roadmap

- [x] **Stage 1: Backend & Connected AI Engine** (Completed 2026-10-02 / Expanded in ADR-G006)
  - Native \`scripts/ai-gateway.js\` client with multi-provider BYOK support
  - REST endpoints in \`server.js\`
  - Environment variable protection in \`.env\` and \`.gitignore\`
  - Integration tests verified successfully
- [x] **Stage 2: Visual Interface (Brain UI - Premium UX/UI)** (Completed 2026-10-02)
  - Dedicated \`🔬 Research Lab\` tab in Project Workspace with badge counter
  - Spatial hero banner with glassmorphism, connected AI status pulse, and metrics
  - Interactive creation modal with \`✨ Refine with AI\` magic button
  - Side-by-side "Before vs After" comparison view with 1-click accept/edit
  - Decomposed topic preview with category badges (\`knowledge\` vs \`actionable\`)
  - 3D lab cards with Live Prompt container, counters, and quick actions
  - Live Prompt modal with version history timeline (\`definitionHistory\`)
  - Native Windows File Explorer launcher for physical research folders
  - Geometric layout fix preventing title collision with \`🟢 Active\` badge
- [x] **Stage 3: Autonomous Execution Engine & Knowledge Synthesis** (Completed 2026-10-02)
  - Autonomous research worker in \`scripts/research-engine.js\`
  - In-depth technical article synthesis with architecture, code examples, schemas, and trade-offs
  - Two-layer taxonomy: physical writes to \`knowledge/\` and \`actionable/\`
  - Resilient auto-retry and rate limit handling on active AI provider
  - Smart resume: pre-existing files are preserved without redundant synthesis
  - Automatic consolidation in \`OVERVIEW.md\` with relative navigable links
  - 3D Neural Planet integration (\`scripts/scan-vault.js\`) with layer-specific icons
`,

    'docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md': `# Strategic Analysis: Real Utility and Relevance of AI Second Brain

> **Critical Evaluation, Technical Feasibility & Market Reception Document**  
> **Date:** September 2026  
> **Author/Context:** Alfredo AI OS / AI Second Brain Architecture Review

---

## 1. Context & Original Question

This document formalizes the critical assessment of feasibility, practical utility, and market potential of the **AI Second Brain** strategy (Second Brain for AI-Assisted Software Engineering).

Below is the literal question raised by the project creator:

> **Question:**  
> *"Directly and objectively, without making things up: is this project and 'second brain' strategy truly useful for projects built with AI? Is it relevant to other developers, and would they find it compelling?"*

---

## 2. Original Executive Response in Full

Being completely direct, objective, and realistic: **yes, the strategy is real and extraordinarily useful**, but **not in the same way for every developer**.

Below is the candid analysis of why it works, where its core strengths lie, the valid critiques other engineers would raise, and who finds it indispensable.

### 2.1. Why is it truly useful for projects built with AI?
The primary bottleneck in modern agentic coding (Google Antigravity, Cursor, Claude Code, Windsurf) is not the model's ability to emit syntax, but rather:

1. **Amnesia & Context Loss:** Every new session or context window wipes the agent clean. Without external scaffolding, it forgets *why* a library was chosen, which edge-case bugs were resolved, and what architectural decisions were made.
2. **"Context Drift" & Redundant Code:** Lacking centralized rules and history, agents reinvent the wheel on every prompt, introducing duplicate classes, violating patterns, and reverting prior fixes.
3. **Lack of AI Governance:** Developers tend to route all tasks to expensive, slow LLMs (inviting hallucination, latency, and cost) when a deterministic rule or decision engine (like AIJev) would solve it with zero latency and zero cost.

Adopting this platform structure (\`CURRENT_STATE.md\`, ADRs, task classification, and specialized skills) eliminates the single largest pain point in AI programming: **long-term architectural consistency**.

### 2.2. Would other developers find it relevant?
Market reception depends fundamentally on developer **persona**:

#### A. Who finds it EXTRAORDINARILY relevant (Core Audience):
* **Indie Hackers & Solo Founders:** Engineers running 3, 5, or more micro-SaaS products alone. Context switching across projects is brutal. Having a "second brain" that tracks exactly where you left off, current blockers, and rules per project is an immense productivity multiplier.
* **Tech Leads & Senior Engineers:** Professionals who recognize that *"vibe coding"* (prompting without documentation or planning) spawns unmaintainable spaghetti within weeks. They value ADRs, behavioral linters, and token cost governance.
* **Consultants & Agencies:** Those juggling multiple client codebases who must enforce uniform quality and security standards across dozens of distinct repositories.

#### B. Who might push back or consider it bureaucratic:
* **"Vibe Coders" & Beginners:** Those using AI purely for disposable prototypes or weekend toys will find formal structure "heavy" or unnecessary.
* **Single Monorepo Teams:** Developers locked into a single large product often ask: *"Why not put these folders (\`.agents\`, \`docs/decisions\`) directly inside our single code repo?"*

### 2.3. Real Critiques & Engineering Challenges (No Illusions)
When presenting this strategy to the technical community, two primary points of friction must be addressed transparently:

1. **The Risk of "Document Rot":**
   * The system delivers value only if \`CURRENT_STATE.md\` and memory files are maintained with discipline. If developers or agents fail to update them, the AI will make decisions based on stale premises. *(Automated skills like \`session-memory\` mitigate this, but require the habit of running at session close).*
2. **Central Hub vs. In-Repo Friction:**
   * Many AI developers currently favor placing \`AGENTS.md\`, \`.cursorrules\`, or \`CLAUDE.md\` **directly in the root of each individual repo**.
   * A **Central Hub** shines when managing a *portfolio* of projects with shared standards, but feels like an extra layer for someone with only one repository.

### 2.4. Executive Verdict Table

| Question | Objective Answer |
| :--- | :--- |
| **Is the strategy useful?** | **Yes.** Reduces session kickoff time from 15 minutes of manual re-explanation to 1 command, while preventing architectural regressions. |
| **Does it hold value for others?** | **Yes.** The market is transitioning from "look what AI generated in 5 minutes" to the engineering hangover: "how do I keep this codebase alive for 6 months?" This architecture answers the latter. |
| **What makes your approach unique?** | The explicit coupling of **cost/governance decisions** (do not call an LLM when deterministic code/AIJev solves it) with **persistent active memory**. Most setups only write static prompt rules without managing dynamic session state. |

---

## 3. Deep Technical Landscape

To understand why this strategy aligns with state-of-the-art software engineering, examine the industry's trajectory with LLMs and autonomous agents:

\`\`\`mermaid
timeline
    title The Evolution of AI-Assisted Software Engineering
    2022 - 2023 : Phase 1: Isolated Chat : ChatGPT & Copilot Inline : Fragmented snippets : Zero context retention
    2023 - 2024 : Phase 2: Vibe Coding : Cursor, Windsurf & Claude Code : Prompt-driven coding : Rapid technical debt without rules
    2024 - 2025 : Phase 3: Local Rules : .cursorrules and AGENTS.md : Initial efforts to contain entropy
    2025 - 2026 : Phase 4: Agentic OS & Memory : Knowledge Hubs, ADRs & Governance : Persistent memory with cost controls
\`\`\`

### 3.1. The "Technical Hangover" of Vibe Coding

In 2023 and 2024, the euphoria of *"vibe coding"* (freely chatting with AI without documentation or planning) peaked. Working prototypes materialized in hours.

However, in projects with authentic lifecycles (> 3 to 6 months), vibe coding collapses under three forces:

1. **AI-Accelerated Entropy:**
   Human engineers accumulate technical debt at human typing speed. An autonomous agent with multi-file edit tools can inject thousands of lines of technical debt in minutes—duplicating helper classes, swapping auth libraries mid-flight, or ignoring error handling.
2. **The Illusion of Massive Context Windows (1M+ Tokens):**
   Even with frontier models supporting million-token windows, the *Lost in the Middle* phenomenon and inference costs make dumping 500k tokens of code on every small edit completely unviable. **Curated, surgical context beats massive context in 100% of practical engineering benchmarks.**
3. **The Amnesia of "Why":**
   Git reveals *what* changed (\`diff\`). Git does not clearly explain *why* the agent replaced LINQ with Dapper three weeks ago. Without ADRs (\`DECISIONS/\`), the next agent reverts the optimization thinking it is "cleaning up code".

---

## 4. The 5 Value Pillars of AI Second Brain

The **AI Second Brain** operates as an abstraction layer between volatile model intelligence and the stability demanded by production software:

\`\`\`mermaid
graph TD
    subgraph Chaos ["❌ Unstructured AI Development"]
        C1["Volatile Chat"] --> C2["Lost Decisions"]
        C2 --> C3["Architectural Hallucination"]
        C3 --> C4["High LLM Costs for Everything"]
        C4 --> C5["Uncontrolled Technical Debt"]
    end

    subgraph Order ["✅ With AI Second Brain"]
        S1["Central Hub / GEMINI.md"] --> S2["Memory & CURRENT_STATE.md"]
        S2 --> S3["Immutable ADRs (DECISIONS/)"]
        S3 --> S4["Routing: Deterministic vs AIJev vs LLM"]
        S4 --> S5["Sustainable & Reproducible Code"]
    end
\`\`\`

### 1. Cross-Session State Persistence (\`CURRENT_STATE.md\`)
* **Problem:** Monday morning starts with 15 minutes spent briefing the agent: *"we were refactoring RabbitMQ, the SQL bug was patched, tests for the controller are still missing..."*.
* **Second Brain Solution:** \`CURRENT_STATE.md\` stores active tasks, completed items, and blockers. Reading this file is the agent's first action. Context recovery drops from 15 minutes to **5 seconds**.

### 2. AI Governance & Routing (AIJev First)
* **Problem:** Developers invoke LLMs for tasks easily solved with deterministic code or decision rules. This introduces 1-3 seconds of latency per request, high API bills, and hallucination risks.
* **Second Brain Solution:** The decision tree forces the agent to assess:
  1. *Is it deterministic?* → Pure code / Regex / Business rule.
  2. *Is it tabular decision/classification?* → Evaluate **AIJev/Jev** (deterministic, fast, zero token cost).
  3. *Does it need open reasoning or natural language?* → Generative LLM with mandatory validation and fallback.

### 3. Immutable Architectural Traceability (ADRs)
* **Problem:** Architectural regressions caused by agents proposing refactorings that violate contractual constraints or prior choices.
* **Second Brain Solution:** The \`DECISIONS/\` folder in each project stores numbered ADRs. Before altering patterns, core rules require consulting existing decisions.

### 4. Cross-Cutting Reuse of Rules and Skills
* **Problem:** Developers reconfigure \`.cursorrules\` or prompts across every new repository, re-specifying SQL Server, Entity Framework, dependency injection, and security practices.
* **Second Brain Solution:** Rules in \`.agents/rules/\` and skills in \`.agents/skills/\` are centralized and inherited across all satellite projects.

### 5. Cognitive Shielding for Solo Developers
* **Problem:** Solo developers experience severe decision fatigue switching across multiple domains (e.g., C# backend, MAUI mobile, game logic).
* **Second Brain Solution:** The central brain acts as a "technical co-founder" keeping specifications organized so the developer switches contexts seamlessly.

---

## 5. Community and Developer Reception

When presenting this project to communities like GitHub, Hacker News, Reddit (r/LocalLlama, r/Cursor), YouTube, or LinkedIn, reception breaks down across well-defined segments:

### Persona Reception Matrix

| Developer Persona | Interest Level | Main Attraction | Primary Objection | Recommended Response |
| :--- | :---: | :--- | :--- | :--- |
| **Indie Hacker / Solo Founder** | 🔥 **Very High (9/10)** | Manage 3-10 micro-SaaS projects without losing context. | *"Maintaining state files takes manual effort."* | *"Demonstrate that skills automate end-of-session logging via a single prompt."* |
| **Tech Lead / Staff Engineer** | 🔥 **Very High (9/10)** | Governance, hallucination reduction, ADRs, and LLM cost control. | *"We already use Notion/Jira."* | *"Notion and Jira are not natively consumed by coding agents inside the IDE."* |
| **Consultant / Agency** | 🚀 **High (8/10)** | Enforce identical quality and security standards across multiple clients. | *"Each client has a separate, private Git repo."* | *"The satellite architecture was explicitly designed to keep client code decoupled from the hub."* |
| **Single Product Dev (Monorepo)** | ⚖️ **Moderate (5/10)** | Likes rules and memory, but prefers everything in-repo. | *"I prefer putting \`.agents/\` right in my repo."* | *"Fully supported: Second Brain can serve as an export hub or portable template."* |
| **Vibe Coder / Hobbyist** | ❄️ **Low (2/10)** | Dislikes bureaucracy, prefers rapid hacking and discarding code. | *"Documenting before coding kills AI creativity."* | *"Focus here is not weekend toys, but software meant to bill revenue and run for years."* |

---

## 6. Architectural Trade-off: Central Hub vs. In-Repo

A core debate among senior engineers is **Central Hub** (this approach) versus **In-Repo** (\`.cursorrules\` or \`CLAUDE.md\` directly in code root):

\`\`\`mermaid
graph LR
    subgraph Approach_InRepo ["Approach 1: In-Repo (.cursorrules in root)"]
        R1["Repo A (.rules)"]
        R2["Repo B (duplicated rules)"]
        R3["Repo C (outdated rules)"]
    end

    subgraph Approach_Hub ["Approach 2: Central Hub (AI Second Brain)"]
        H["AI_SECOND_BRAIN<br/>(Rules, Memory, Decisions, Knowledge)"]
        H --> PA["Project A"]
        H --> PB["Project B"]
        H --> PC["Project C"]
    end
\`\`\`

### Pros and Cons

| Criterion | In-Repo (Inside Code Repo) | Central Hub (AI Second Brain) |
| :--- | :--- | :--- |
| **Rule Portability** | Low: Rules must be copied and pasted across dozens of repositories. | **High:** Global rules (security, SQL, C#) live in a single source. |
| **Code Versioning** | **Perfect:** Project Git captures exact code and rules history together. | Requires synchronization between satellite commit and hub state update. |
| **Portfolio View (Multi-SaaS)** | Nonexistent: No consolidated status across different projects. | **Excellent:** 3D dashboard and \`projects/\` folder provide total portfolio visibility. |
| **Secret / IP Isolation** | Risk of leaking proprietary business notes in public repositories. | **Secure:** Business notes reside safely in your private Second Brain. |

> **Technical Conclusion:**  
> The **Central Hub** approach is superior for developers managing an **ecosystem of products**. The **In-Repo** approach is superior for large single-product teams. AI Second Brain is designed specifically for the former.

---

## 7. Preventing "Document Rot"

The only real risk that degrades AI Second Brain's utility is **Document Rot** (code evolves while \`CURRENT_STATE.md\` and \`DECISIONS/\` lag behind, turning the brain into an obsolete archive).

Three automated defenses prevent this:

1. **The \`session-memory\` Skill:** Automatically summarizes and commits daily progress via single command or end-of-session trigger.
2. **The \`project-onboarding\` Skill:** Scaffolds complete governance structure for new projects via standardized prompt.
3. **The Root Governance Rule (\`GEMINI.md\`):** Requires any agent opening the workspace to read state before proposing code and update state after significant work.

---

## 8. Conclusion & Recommendations

### Is it worth investing in this project?
**Without a doubt.** AI Second Brain addresses the defining transition in modern software: moving from *disposable AI coding toys* to *disciplined, auditable, and sustainable AI-powered engineering*.

### Recommendations for Community Sharing:
1. **Provide an Open-Source Starter:** Maintain a clean version on GitHub (e.g. \`ai-second-brain\`) for devs to clone.
2. **Publish an Engineering Essay:** Suggested title: *"Why Vibe Coding Collapses at 3 Months: Structuring a Second Brain for AI Coding Agents"*.
3. **Highlight the AI Gateway / AIJev Pattern:** Cost-aware routing (knowing when NOT to use an LLM) is one of the highest-demand topics in 2026 software engineering.
`
};

