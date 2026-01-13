---
name: pr-threshold
description: Track commit accumulation and trigger PR when thresholds crossed
---

# PR Threshold Skill

Monitor accumulated commits and metrics to determine when a PR should be pushed for human review. Prevents PRs from becoming too large or complex for effective review.

## When to Use

- After each successful git commit
- During Agent Mode commit-level workflow
- Manually with "use pr-threshold skill"

## Thresholds

| Metric | Trigger Value | Rationale |
|--------|---------------|-----------|
| Lines of Code | > 300 | Human cognitive limit |
| Files Changed | > 10 | Context switching cost |
| Commits | > 5 | Review complexity |
| Risk Score | HIGH | Needs careful review |
| Scope Completion | 100% | Feature complete |

## Phase 1: Gather Metrics

### 1.1 Lines of Code

```bash
git diff origin/develop --stat | tail -1
```

Extract: insertions + deletions

### 1.2 Files Changed

```bash
git diff origin/develop --name-only | wc -l
```

### 1.3 Commit Count

```bash
git rev-list origin/develop..HEAD --count
```

### 1.4 Risk Score

Sum of risk from pr-review across all commits:
- LOW = 1
- MEDIUM = 2
- HIGH = 3

### 1.5 Scope Completion

From Commit Plan:
- Total commits planned: N
- Commits completed: M
- Completion: M/N * 100%

## Phase 2: Evaluate Thresholds

```markdown
## PR Threshold Check

| Metric | Current | Threshold | Status |
|--------|---------|-----------|--------|
| Lines of Code | [N] | 300 | OK/CROSSED |
| Files Changed | [N] | 10 | OK/CROSSED |
| Commits | [N] | 5 | OK/CROSSED |
| Risk Score | [N] | HIGH | OK/CROSSED |
| Scope Completion | [N]% | 100% | OK/CROSSED |
```

## Phase 3: Determine Action

### CONTINUE (No threshold crossed)

```markdown
## Verdict: CONTINUE

No thresholds crossed. Proceeding to next commit.

### Current Accumulation:
- LOC: [N]/300
- Files: [N]/10
- Commits: [N]/5
- Scope: [N]%

### Next Commit:
[Name of next commit from plan]
```

### TRIGGER_PR (Threshold crossed)

```markdown
## Verdict: TRIGGER_PR

**Threshold crossed:** [Which metric(s)]

### Recommendation:
Push PR now for human review before continuing.

### PR Scope:
- Commits: [List of commit names]
- Total LOC: [N]
- Files: [N]
- Risk: [LOW/MEDIUM/HIGH]

### Remaining Work:
- Commits left: [N]
- Features incomplete: [List]

**Proceed to push-pr mode?** (Yes / Continue anyway)
```

### BLOCK (Threshold crossed, no override)

If threshold crossed and user has NOT provided explicit override:

```markdown
## Verdict: BLOCK

**Threshold crossed:** [Which metric(s)]

IMPLEMENTATION PAUSED - User decision required.

| Option | Action |
|--------|--------|
| A | Push PR now (recommended) |
| B | Continue anyway (override logged) |

Reply with A or B to proceed.
```

Do NOT continue until user responds. This is a hard stop per `00-hard-rules.mdc`.

## Phase 4: Handle Decision

### If TRIGGER_PR

1. Present metrics summary
2. Recommend push-pr mode
3. If user approves: Switch to push-pr mode
4. If user continues: Log override, proceed

### If CONTINUE

1. Proceed to next commit in plan
2. Update accumulated metrics

## Threshold Overrides

User can override thresholds with explicit confirmation:

```markdown
**Warning:** LOC threshold exceeded (350/300).

Continuing without PR may make review harder.

**Override and continue?** (Yes / Push PR now)
```

Log overrides for later review.

## Integration

This skill is invoked by:
- `agent.mdc` - After each successful commit
- `commit.mdc` - After commit completes

## Metrics Storage

Track across commits:

```
Accumulated Metrics:
- Total LOC: [running sum]
- Total Files: [unique count]
- Commit Count: [N]
- Highest Risk: [LOW/MEDIUM/HIGH]
- Started: [timestamp]
```

Reset after successful PR push.

## Output Format

```markdown
## PR Threshold Status

**Verdict:** [CONTINUE / TRIGGER_PR]

| Metric | Value | Threshold | % |
|--------|-------|-----------|---|
| LOC | [N] | 300 | [N]% |
| Files | [N] | 10 | [N]% |
| Commits | [N] | 5 | [N]% |
| Scope | [N]% | 100% | [N]% |

[Action recommendation]
```

## Invocation

Invoked automatically after each commit, or manually with "use pr-threshold skill".
