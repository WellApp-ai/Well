---
name: session-status
description: Generate breadcrumb headers/footers with takt time tracking and muda metrics
---

# Session Status Skill

Generate consistent navigation breadcrumbs showing current position, takt time, and session metrics.

## When to Use

- At START of every Ask/Agent/Plan mode response
- At END of every Ask/Agent/Plan mode response
- When session metrics are needed for Session Journal sync

## Phase 1: Gather State

Collect current session state:

| Data | Source |
|------|--------|
| Feature name | From init context or branch name |
| Current phase | DIVERGE / CONVERGE / DEFINE / AGENT |
| Loop count | Incremented on each user feedback cycle |
| Progress | Validated items / total items |
| Duration | Time since phase started |
| Status | G (flow) / Y (waiting) / R (stopped) |

## Phase 2: Calculate Takt

Compare duration against targets from `03-shared.mdc`:

| Phase | Target | Warning | Stop |
|-------|--------|---------|------|
| DIVERGE (per loop) | 15min | 30min | 60min |
| CONVERGE | 20min | 40min | 90min |
| DEFINE | 10min | 20min | 45min |
| Commit (each) | 10min | 20min | 30min |

Determine suffix:
- Under target: (none)
- Warning exceeded: `!`
- Stop exceeded: `!!`

## Phase 3: Format Header

Generate single-line breadcrumb:

**Format:** `[STATUS] | [Feature] | [PHASE_PROGRESS] | L[N] | [X]/[Y] | [TIME]`

**Examples by phase:**
- DIVERGE: `G | Collaboration | DIVERGE ###....... | L3 | 5/9 | 18m`
- CONVERGE: `G | Collaboration | DIVERGE OK | CONVERGE ##.... | L1 | 22m`
- DEFINE: `G | Collaboration | DIVERGE OK | CONVERGE OK | DEFINE ###.. | L2 | 35m`
- AGENT: `G | Collaboration | AGENT | C2/5 | 45m`
- Warning: `Y | Collaboration | DIVERGE ###....... | L3 | 5/9 | 32m!`
- Stopped: `R | Collaboration | AGENT | JIDOKA STOP`

**Progress bar:** 10 chars, `#` filled, `.` empty, proportional to completion.

## Phase 4: Format Footer

Generate context-specific footer:

```
---
Next: [action prompt]
```

**Dynamic prompts by context:**

| Context | Footer Prompt |
|---------|---------------|
| DIVERGE with DIG | `Provide OK/KO/DIG for: #4, #6, #7` |
| Gate 1 passed | `All validated. Say "converge" to proceed.` |
| Gate 2 | `Choose option: A / B / C` |
| Gate 3 | `Approve phasing: OK / REORDER / SPLIT` |
| AGENT | `Commit 2/5 in progress...` |
| Jidoka stop | `Reply with A, B, C, or D` |
| Autonomous | `Iteration 3/5...` |

## Phase 5: Track Muda (Silent)

Update session metrics in memory:

| Metric | Tracking Rule |
|--------|---------------|
| Loop count | Increment on user feedback |
| Waiting time | Time between user responses |
| Rework | Items DIG'd 3+ times |
| RED count | qa-commit failures |
| Escalations | Jidoka Tier 2/3 events |

## Output Format

```markdown
## Session Status

**Header:** [formatted header string]
**Footer:** [formatted footer string]

### Metrics (Silent)
- Duration: [N]min
- Loops: [N]
- Rework: [N]
- Waiting: [N]min
- RED count: [N]
```

## Header/Footer Examples

### Ask Mode - DIVERGE L3

**Header:**
```
G | Collaboration | DIVERGE ###....... | L3 | 5/9 | 18m
```

**Footer:**
```
---
Next: Provide OK/KO/DIG for: #4, #6, #7
```

### Ask Mode - Gate 1 Passed

**Header:**
```
G | Collaboration | DIVERGE OK | CONVERGE #......... | L1 | 22m
```

**Footer:**
```
---
Next: All wireframes validated. Say "converge" to proceed.
```

### Agent Mode - Commit in Progress

**Header:**
```
G | Collaboration | AGENT | C2/5 | 45m
```

**Footer:**
```
---
Next: Implementing Commit 2: Add workspace membership entity...
```

### Jidoka Stop

**Header:**
```
R | Collaboration | AGENT | JIDOKA STOP
```

**Footer:**
```
---
Next: Reply with A (different approach), B (skip), C (pause), or D (abort)
```

## Integration

This skill is invoked by:
- `ask.mdc` - At start and end of every response
- `agent.mdc` - At start and end of every response
- `plan.mdc` - At start and end of every response
- `push-pr.mdc` - Collects final metrics for session-journal sync

## Invocation

Auto-invoked by modes. Manual trigger: "show session status"

## Tools Used

| Tool | Purpose |
|------|---------|
| (none) | Pure calculation, no external tools |
