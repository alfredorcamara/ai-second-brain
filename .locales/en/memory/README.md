# Memory Architecture — AI Second Brain

> **Memory Governance Guide:** How AI Second Brain organizes, isolates, and persists knowledge.

---

## 1. The Two-Tier Memory Model

To prevent context bleed and ensure multiple projects co-exist cleanly within the same Second Brain, the framework operates strictly across **two distinct memory tiers**:

```
AI_SECOND_BRAIN/
│
├── memory/                              ← TIER 1: Platform Memory (The Central Framework)
│   ├── current-state.md                 # Framework engine state: Live Server, SSE, viewer, tooling
│   ├── lessons-learned.md               # Cross-cutting engineering and AI lessons learned
│   └── README.md                        # This guide
│
└── projects/                            ← TIER 2: Developer Project Memory (Isolated per project)
    ├── ProjectA/
    │   ├── CURRENT_STATE.md             ← Project A roadmap and active memory
    │   ├── PROJECT.md                   ← Project A contract, rules, and stack
    │   ├── ARCHITECTURE.md              ← Project A architecture decisions
    │   ├── DECISIONS/                   ← Project A ADRs
    │   └── MEMORY/sessions/             ← Project A daily session logs
    │
    └── ProjectB/
        ├── CURRENT_STATE.md             ← Project B roadmap and active memory
        └── ...
```

---

## 2. Comparing the Two Tiers

| Attribute | Tier 1: Platform Memory (`memory/`) | Tier 2: Project Memory (`projects/<name>/`) |
| :--- | :--- | :--- |
| **Scope** | AI Second Brain as a tool and ecosystem | The specific software built by the developer (SaaS, API, App) |
| **Core Files** | `current-state.md`, `lessons-learned.md` | `CURRENT_STATE.md`, `MEMORY/sessions/`, `DECISIONS/` |
| **Consumer** | AI agent when maintaining or evolving the framework | AI agent when building features and debugging the developer's project |
| **Content Examples** | UTF-8 support in `.bat`, SSE auto-reconnect, Research Lab | Prisma schema migration, JWT auth rules, matchmaking ELO formula |

---

## 3. Frequently Asked Questions (FAQ)

### Q: I cloned this repository from Git to govern my projects. Where does my project's memory live?
**A:** Exclusively inside `projects/<your-project>/`. When using Quickstart or running `npm run project:new my-project`, the system creates a dedicated directory with `CURRENT_STATE.md` and `MEMORY/sessions/` isolated for your project.

### Q: Will updates inside `memory/current-state.md` interfere with my software?
**A:** Never. `memory/current-state.md` tracks the state of the central governance hub itself (the UI visualizer, server, and AI gateway tooling). Your project has its own isolated `projects/<your-project>/CURRENT_STATE.md`.
