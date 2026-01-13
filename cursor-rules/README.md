# 🎯 Cursor Rules — AI-Assisted Development Workflow

A structured, Toyota Production System (TPS)-inspired workflow for AI-assisted development in [Cursor](https://cursor.sh). Transform chaotic AI coding sessions into systematic, high-quality software delivery.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 What This Is

This is a complete **rules system** for Cursor IDE that enforces:

- **Structured workflows** — Init → Ask → Plan → Agent → Commit → PR
- **Human gates** — 4 checkpoints requiring explicit approval
- **Quality enforcement** — Automated linting, type checking, and verification
- **Reuse-first culture** — Always search before creating new code
- **Decision capture** — Record why decisions were made (patine)
- **Jidoka** — Auto-escalation when stuck (3 failures = human intervention)

```
┌─────────────────────────────────────────────────────────────┐
│  VALUE ANALYSIS (Ask Mode)                                  │
│  "WHAT to build"                                            │
│  Skills: problem-framing, competitor-scan, qa-planning      │
│  Gates: Wireframe approval, Phasing approval                │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  VALUE ENGINEERING (Plan Mode)                              │
│  "HOW to build"                                             │
│  Skills: tech-divergence, reuse-inventory                   │
│  Gate: Technical approach (for complex decisions)           │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  VALUE DELIVERY (Agent Mode)                                │
│  "BUILD and verify"                                         │
│  Skills: pr-review, qa-commit, debug                        │
│  Gate: PR review                                            │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Automatic Installation

```bash
# Clone this repo
gh repo clone WellApp-ai/Well
cd Well/cursor-rules

# Run installer
./scripts/install.sh /path/to/your/project
```

### Option 2: Manual Installation

1. Copy the `.cursor/rules` folder to your project root:

```bash
cp -r cursor-rules/rules /path/to/your/project/.cursor/rules
```

2. Customize `00-hard-rules.mdc` for your tech stack
3. Remove skills you don't need from `skills/`
4. Update `04-mcp-tools.mdc` with your MCP servers

## 📁 Structure

```
.cursor/rules/
├── 00-hard-rules.mdc      # 🔒 Inviolable constraints (customize this)
├── 01-web.mdc             # Frontend patterns (Next.js example)
├── 02-api.mdc             # Backend patterns (Express example)
├── 03-shared.mdc          # Vocabulary & workflow definitions
├── 04-mcp-tools.mdc       # MCP server configuration
├── 05-skills.mdc          # Skill registry
├── 06-communication.mdc   # Output format standards
│
├── modes/                 # Workflow states
│   ├── init.mdc           # Start feature
│   ├── ask.mdc            # Value Analysis (WHAT)
│   ├── plan.mdc           # Value Engineering (HOW)
│   ├── agent.mdc          # Value Delivery (BUILD)
│   ├── commit.mdc         # Atomic commits
│   └── push-pr.mdc        # PR creation
│
└── skills/                # Reusable capabilities (28 total)
    ├── problem-framing/   # JTBD, HMW questions
    ├── competitor-scan/   # Research best-in-class
    ├── qa-planning/       # Generate QA Contract
    ├── debug/             # Systematic debugging
    └── ...
```

## 🔧 How It Works

### 1. Trigger Keywords

Say these to activate modes:

| Keyword | Mode | Purpose |
|---------|------|---------|
| `init [task]` | Init | Start new feature |
| `explore` / `ask` | Ask | Explore requirements |
| `plan` | Plan | Design implementation |
| `agent` | Agent | Start building |
| `commit` | Commit | Make atomic commit |
| `push PR` | Push-PR | Create pull request |

### 2. Skills

Invoke reusable capabilities:

```
"use debug skill"
"use competitor-scan skill"
"use qa-planning skill"
```

Skills are auto-invoked by modes when appropriate (e.g., `qa-commit` auto-invokes `debug` on failure).

### 3. Gates (Human Checkpoints)

| Gate | When | Decision |
|------|------|----------|
| Gate 1 | After wireframes | OK / KO / DIG per wireframe |
| Gate 2 | After phasing | OK / REORDER / SPLIT / MERGE |
| Gate 3 | Complex tech decision | A / B / C (options) |
| Gate 4 | PR ready | Approve / Request changes |

### 4. QA Contract

The central artifact linking requirements to code:

```
QA Contract = G#1-N (Gherkin scenarios) + AC#1-N (Acceptance criteria)
```

- Generated during Ask Mode
- Each commit maps to `Satisfies: G#1, AC#2, ...`
- Verified before every commit

## ⚙️ Customization

### Hard Rules (`00-hard-rules.mdc`)

Customize for your stack:

```markdown
## TypeScript
- Strict mode enabled
- NO `any` type

## Styling
- Tailwind utilities ONLY
- NO arbitrary values (`px-[13px]`)

## Component Size
- Max 200 lines per component
```

### Tech Stack Rules

- `01-web.mdc` — Frontend (Next.js, React, etc.)
- `02-api.mdc` — Backend (Express, Nest, etc.)

Replace with your framework-specific patterns.

### MCP Tools (`04-mcp-tools.mdc`)

Configure your MCP servers:

```markdown
## Context7 MCP
Use for library documentation lookup.

## Notion MCP
Use for task management integration.

## Browser MCP
Use for UI testing and competitor research.
```

### Skills

Remove skills you don't need:

```bash
# Example: remove Notion-specific skills
rm -rf skills/notion-sync/
rm -rf skills/team-routing/
```

## 📖 Key Concepts

### Progressive Disclosure

| Level | Trigger | Content |
|-------|---------|---------|
| **L1** | Default | Summary table, 3-5 bullets |
| **L2** | "DIG" | Rationale, trade-offs |
| **L3** | "full detail" | Complete analysis |

### BLUF (Bottom Line Up Front)

First sentence = answer, decision, or status. No preamble.

### Patine (Decision Wisdom)

Record **why** decisions were made:
- Captured at Gates when KO
- Prevents re-proposing rejected approaches

### Jidoka (Auto-Escalation)

```
qa-commit RED → debug → retry → 3 failures → ESCALATE to human
```

## 🗺️ Workflow Example

```
1. "init feature from [Notion URL]"
   └── Creates branch, fetches context

2. "explore"
   └── DIVERGE: Dream wireframes
   └── GATE 1: OK/KO/DIG per wireframe
   └── CONVERGE: QA Contract, Timeline
   └── GATE 2: Approve phasing

3. "plan"
   └── Reuse inventory
   └── Tech decisions (GATE 3 if complex)
   └── Commit plan with Satisfies mapping

4. "agent"
   └── Per commit: implement → pr-review → qa-commit → threshold check
   └── On failure: auto-debug loop

5. "push PR"
   └── Create PR → GATE 4
```

## 🧩 Available Skills (28)

### Analysis
- `problem-framing` — JTBD job stories, HMW questions
- `competitor-scan` — Research best-in-class products
- `design-context` — Refresh UI context from design system
- `qa-planning` — Generate QA Contract (G#N, AC#N)
- `dependency-mapping` — DSM matrix, risk scoring
- `state-machine` — Document UI component states

### Engineering
- `tech-divergence` — Evaluate technical options
- `phasing` — Group slices into phases
- `gtm-alignment` — Align with go-to-market strategy

### Delivery
- `pr-review` — Lint, typecheck before commit
- `qa-commit` — Verify against QA Contract
- `debug` — Systematic debugging with MCP
- `test-hardening` — Convert criteria to tests
- `pr-threshold` — Auto-trigger PR on threshold

### Meta
- `session-status` — Breadcrumb headers, takt tracking
- `autonomous-loop` — "ralph mode" — iterate until done
- `decision-capture` — Record patine at gates
- `skill-creator` — Create new skills

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT — See [LICENSE](../LICENSE)

---

Built with ❤️ by [Well](https://wellapp.ai) for the AI-assisted development community.
