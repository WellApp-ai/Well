# ⚡ Quick Start Guide

Get up and running in 5 minutes.

## 1. Install

```bash
git clone https://github.com/WellApp-ai/Well.git
cd Well/cursor-rules
./scripts/install.sh /path/to/your/project
```

## 2. Customize (Optional)

Edit `.cursor/rules/00-hard-rules.mdc` for your stack.

## 3. Start Using

Open your project in Cursor and say:

```
init my first feature
```

## Common Commands

| Say This | What Happens |
|----------|--------------|
| `init [task]` | Start new feature branch |
| `explore` | Brainstorm solutions (Ask mode) |
| `plan` | Design implementation |
| `agent` | Start building |
| `commit` | Make atomic commit |
| `push PR` | Create pull request |

## Helpful Phrases

| Phrase | Effect |
|--------|--------|
| `DIG` | Get more detail |
| `OK` | Approve and continue |
| `KO` | Reject this option |
| `use debug skill` | Systematic debugging |
| `ralph mode` | Auto-iterate until done |

## Example Session

```
You: init add user settings page

AI: [Creates branch, shows feature summary]
    Ready to explore?

You: explore

AI: [Shows wireframes with options]
    Gate 1: OK/KO/DIG per wireframe?

You: 1 OK, 2 DIG - make it simpler, 3 KO

AI: [Refines wireframe 2, removes 3]
    Gate 2: Approve phasing?

You: OK

AI: [Shows commit plan]

You: agent

AI: [Starts implementing, verifies each commit]

You: push PR

AI: [Creates PR with description]
```

## Need Help?

- Full docs: [README.md](README.md)
- Customization: [CUSTOMIZATION.md](CUSTOMIZATION.md)
- Architecture: [docs/cursor-rules-architecture.md](docs/cursor-rules-architecture.md)
