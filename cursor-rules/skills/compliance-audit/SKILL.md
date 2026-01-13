---
name: compliance-audit
description: Audit Value Delivery compliance after PR push
---

# Compliance Audit Skill

Run after PR push to verify Value Delivery rules were followed during the session.

## When to Use

- After PR is pushed (invoke from push-pr mode)
- Manually with "use compliance-audit skill"
- When reviewing session quality

## Phase 1: Gather Session Data

Collect data from the current session:

| Data Point | Source |
|------------|--------|
| Commit count | `git rev-list origin/develop..HEAD --count` |
| Files changed | `git diff origin/develop --name-only \| wc -l` |
| Lines of code | `git diff origin/develop --stat \| tail -1` |
| console.log presence | Grep in changed files |

## Phase 2: Check Compliance Requirements

### 2.1 PR Threshold Check

| Metric | Current | Threshold | Status |
|--------|---------|-----------|--------|
| Lines of Code | [N] | 300 | OK/CROSSED ([X]x) |
| Files Changed | [N] | 10 | OK/CROSSED ([X]x) |
| Commits | [N] | 5 | OK/CROSSED ([X]x) |
| console.log | [N] | 0 | OK/CROSSED |

**Verdict:** [PASSED / TRIGGER_PR - Should have pushed earlier PRs]

### 2.2 Gaps Identified

| Requirement | Expected | Actual | Status |
|-------------|----------|--------|--------|
| Session Headers/Footers | Every response | [Count] | Done/Missing |
| pr-review skill format | Full report | [Format] | Done/Partial/Missing |
| qa-commit skill format | Full criteria table | [Format] | Done/Partial/Missing |
| pr-threshold checks | After each commit | [Count] | Done/Partial/Missing |
| Risk Assessment | Calculate score | [Done/Not] | Done/Missing |
| Storybook stories | For new components | [Count] | Done/Missing |
| Design system check | Before new patterns | [Done/Not] | Done/Partial/Missing |
| Satisfies field in commits | Every commit | [Count] | Done/Missing |
| Typecheck/Lint | Before commits | [Done/Not] | Done/Missing |

## Phase 3: Generate Compliance Report

```markdown
## Value Delivery Compliance Audit

### PR Threshold Check

| Metric | Current | Threshold | Status |
|--------|---------|-----------|--------|
| Lines of Code | [N] | 300 | [status] |
| Files Changed | [N] | 10 | [status] |
| Commits | [N] | 5 | [status] |
| console.log | [N] | 0 | [status] |

**Verdict:** [PASSED / TRIGGER_PR]

### Gaps Identified

| Requirement | Expected | Actual | Status |
|-------------|----------|--------|--------|
| [requirement] | [expected] | [actual] | [status] |
...

### Recommendations

[List any improvements for next session]
```

## Phase 4: Log to Session Journal

If using Notion sync, add compliance report to Session Journal entry.

## Output Format

The audit should produce a table matching the format shown in the user's compliance screenshot, with clear CROSSED indicators for threshold violations and status icons for gap analysis.

## Integration

This skill is invoked by:
- `push-pr.mdc` - After PR is created (Phase 4)
- Manual invocation for retrospective

## Invocation

Invoked automatically after PR push, or manually with "use compliance-audit skill".
