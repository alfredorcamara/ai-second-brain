# Research Lab — Autonomous Knowledge Laboratory

> **Autonomous Topic Research and Continuous Cataloging Subsystem of AI Second Brain**  
> Architectural and Operational Reference Document

---

## 1. Overview

The **Research Lab** is an AI Second Brain subsystem that enables each project to create **Thematic Research Laboratories**.

Rather than relying on ephemeral chat prompts or generic web searches, the Research Lab operates autonomously and in deep context:
1. The developer freely defines a topic or technological question for their project.
2. The AI reads existing project contracts (`PROJECT.md`, `ARCHITECTURE.md`) and refines the briefing, ensuring the research aligns with the project's actual constraints and objectives.
3. The topic is decomposed into sub-topics with clear taxonomy.
4. The engine catalogs all knowledge into structured `.md` files versioned on disk under the project folder.
5. Generated files feed the project's 3D Neural Planet and long-term memory.

---

## 2. The Two Knowledge Layers

Each research lab organizes findings into two complementary layers:

```
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
```

- **Layer 1 (`knowledge/`)**: The "what" and the "why". Principles, state of the art, industry benchmarks, and conceptual foundations.
- **Layer 2 (`actionable/`)**: The "how to apply to the project". Technical specifications, pseudocode, schema decisions, and rules tailored to the project's real tech stack.

---

## 3. The "Live Prompt" Concept

Research definitions are never static. In AI Second Brain, we adopt the **Live Prompt** model:
- The developer can rewrite intent or shift focus at any time.
- The AI can suggest enhancements ("✨ Refine with AI") based on current governance status.
- Each new definition version is saved in `definitionHistory` inside `_meta.json`.
- Future research runs compare history to detect contradictions, new discoveries, or needed additions without erasing previous context.

---

## 4. Technical Architecture & Stack

- **Inference Engine**: Universal AI Gateway (BYOK — *Bring Your Own Key*)
  - **Supported Providers**: Google Gemini, OpenAI, Anthropic Claude, Groq Cloud, Local Ollama, and OpenRouter
  - **Configuration**: Keys and providers managed locally in `.env` and dynamically configurable via the web UI
- **Zero Dependencies**: Native client implemented in `scripts/ai-gateway.js` using Node.js built-in modules (`https`, `http`, `fs`, `path`).
- **Output Sanitization**: Defensive markdown fence handling (```json`) and resilient JSON extraction.

---

## 5. REST API Endpoints (`server.js`)

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/ai/status` | Returns configuration status of active connected AI (provider, model, key mask) |
| `POST` | `/api/ai/refine-prompt` | Refines raw user intent using context from `PROJECT.md` and `ARCHITECTURE.md` |
| `POST` | `/api/ai/decompose` | Decomposes topic into sub-topics categorized into `knowledge` or `actionable` |
| `GET` | `/api/projects/:name/research` | Lists all research labs created for the given project |
| `POST` | `/api/projects/:name/research` | Scaffolds physical disk structure for a new lab (`_meta.json`, `OVERVIEW.md`, folders) |
| `POST` | `/api/projects/:name/research/:slug/definition` | Updates lab definition with versioned history (Live Prompt) |
| `POST` | `/api/projects/:name/research/:slug/run` | Triggers autonomous technical synthesis and writes `.md` files to disk |
| `GET` | `/api/projects/:name/research/:slug/status` | Returns whether autonomous research is currently in progress |

---

## 6. Implementation Roadmap

- [x] **Stage 1: Backend & Connected AI Engine** (Completed 2026-10-02 / Expanded in ADR-G006)
  - Native `scripts/ai-gateway.js` client with multi-provider BYOK support
  - REST endpoints in `server.js`
  - Environment variable protection in `.env` and `.gitignore`
  - Integration tests verified successfully
- [x] **Stage 2: Visual Interface (Brain UI - Premium UX/UI)** (Completed 2026-10-02)
  - Dedicated `🔬 Research Lab` tab in Project Workspace with badge counter
  - Spatial hero banner with glassmorphism, connected AI status pulse, and metrics
  - Interactive creation modal with `✨ Refine with AI` magic button
  - Side-by-side "Before vs After" comparison view with 1-click accept/edit
  - Decomposed topic preview with category badges (`knowledge` vs `actionable`)
  - 3D lab cards with Live Prompt container, counters, and quick actions
  - Live Prompt modal with version history timeline (`definitionHistory`)
  - Native Windows File Explorer launcher for physical research folders
  - Geometric layout fix preventing title collision with `🟢 Active` badge
- [x] **Stage 3: Autonomous Execution Engine & Knowledge Synthesis** (Completed 2026-10-02)
  - Autonomous research worker in `scripts/research-engine.js`
  - In-depth technical article synthesis with architecture, code examples, schemas, and trade-offs
  - Two-layer taxonomy: physical writes to `knowledge/` and `actionable/`
  - Resilient auto-retry and rate limit handling on active AI provider
  - Smart resume: pre-existing files are preserved without redundant synthesis
  - Automatic consolidation in `OVERVIEW.md` with relative navigable links
  - 3D Neural Planet integration (`scripts/scan-vault.js`) with layer-specific icons
