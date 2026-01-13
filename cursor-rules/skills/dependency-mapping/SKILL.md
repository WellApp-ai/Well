---
name: dependency-mapping
description: Map slice dependencies using DSM matrix and prioritize by risk
---

# Dependency Mapping Skill

Map dependencies between implementation slices using Design Structure Matrix (DSM), calculate risk scores, and recommend implementation sequence.

## When to Use

- During Ask mode Phase 2 (CONVERGE)
- When planning multi-slice features
- Before phasing to understand risk order

## Instructions

### Phase 1: Build DSM Matrix

Create a square matrix with slices on both axes. Mark dependencies with `*`:

```
         | #1.1 | #1.2 | #2.1 | #2.2 | #2.3 | #3.1 |
---------+------+------+------+------+------+------+
#1.1     |  -   |      |      |      |      |      |
#1.2     |  *   |  -   |      |      |      |      |
#2.1     |      |  *   |  -   |      |      |      |
#2.2     |      |      |  *   |  -   |      |  *   |
#2.3     |      |  *   |  *   |      |  -   |      |
#3.1     |      |      |      |      |      |  -   |

Legend: * = row depends on column
Reading: Row #2.2 has * in columns #2.1 and #3.1 = #2.2 depends on #2.1 AND #3.1
```

### Phase 2: Calculate Dependency Score

For each slice, count:

| Metric | Formula | Meaning |
|--------|---------|---------|
| **Fan-in** | How many slices depend ON this? | High = blocker, ship early |
| **Fan-out** | How many slices does this DEPEND on? | High = risky, ship later |
| **Dependency Score** | Fan-out count | Lower = safer |

### Phase 3: Calculate Leverage Score

Score each slice on reuse of existing patterns:

| Level | Score | Description |
|-------|-------|-------------|
| Full Reuse | 0 | Uses existing component from design system/Storybook as-is |
| Extend | 1 | Extends existing component with new props/variants |
| Compose | 2 | Composes multiple existing components |
| New Pattern | 3 | Creates new component following design system tokens |
| New System | 5 | Requires new patterns not in design system |

**Check these sources before scoring:**
- `/docs/design-system/components.md` - Existing components
- `Glob **/*.stories.tsx` - Storybook patterns
- `SemanticSearch` for similar implementations in codebase

### Phase 4: Calculate Risk Score

```
Risk Score = (Dependencies x 2) + Leverage + PriorityTier

Where PriorityTier:
- P1 (Frontend-only) = 0
- P2 (Frontend + Backend non-breaking) = 1
- P3 (Backend contract changes) = 2
- P4 (Data model changes) = 3
```

### Phase 5: Identify Blockers

Flag slices that block others (high fan-in):

```
#3.1 WorkspaceInvite Entity
  Fan-in: 3 (blocks #2.2, #2.3, #2.4)
  RECOMMENDATION: Consider stub/mock for Phase 1, or ship early despite risk
```

### Phase 6: Rank by Risk

Sort slices by Risk Score (lowest first = ships first):

| Rank | Slice | Deps | Leverage | Tier | Risk Score |
|------|-------|------|----------|------|------------|
| 1 | #1.1 Workspace Switcher | 0 | Extend (1) | P1 (0) | 1 |
| 2 | #1.2 Members Page UI | 1 | Compose (2) | P1 (0) | 4 |
| 3 | #2.1 List Members API | 1 | N/A | P2 (1) | 4 |

## Output Format

```markdown
## Dependency Analysis

### DSM Matrix

[Matrix as shown above]

### Risk Scoring

| Slice | Deps | Leverage | Tier | Risk | Rank |
|-------|------|----------|------|------|------|
| [Slice] | [N] | [Level (score)] | P[N] | [Score] | [#] |

### Blockers Identified

| Slice | Blocks | Fan-in | Recommendation |
|-------|--------|--------|----------------|
| [Slice] | [List] | [N] | [Stub/Ship early/etc] |

### Recommended Sequence

1. [Lowest risk slice] - [Why safe]
2. [Next slice] - [Dependencies satisfied by #1]
...

### Existing System Leverage

| Component | Source | Slices Using | LOC Saved |
|-----------|--------|--------------|-----------|
| [Component] | [design-system/Storybook] | [List] | ~[N] |
```

## Invocation

Invoke manually with "use dependency-mapping skill" or follow Ask mode Phase 2 (CONVERGE) which references this skill.

## Related Skills

- `phasing` - Uses risk scores to group into phases
- `design-context` - Identifies existing patterns to leverage
- `gtm-alignment` - May override risk-based order for GTM priority
