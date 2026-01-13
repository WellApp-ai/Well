---
name: phasing
description: Group slices into risk-optimized phases with timeline generation
---

# Phasing Skill

Group implementation slices into phases based on combined risk and GTM scores, then generate a visual timeline.

## When to Use

- During Ask mode Phase 2 (CONVERGE), after dependency-mapping and gtm-alignment
- Before transitioning to Plan mode
- To generate the final delivery timeline

## Instructions

### Phase 1: Gather Scores

Collect scores from previous skills:

| Slice | Risk Score | GTM Score |
|-------|------------|-----------|
| [From dependency-mapping] | [N] | [From gtm-alignment] |

### Phase 2: Calculate Combined Score

```
Final Priority Score = Risk - (GTM x 0.5)

Lower score = ships earlier
```

| Slice | Risk | GTM | Final | Rank |
|-------|------|-----|-------|------|
| #2.2 Invite Flow | 7 | 8 | 3.0 | 1 |
| #1.1 Switcher | 1 | 4 | -1.0 | 2 |
| #1.2 Members UI | 4 | 3 | 2.5 | 3 |

### Phase 3: Group into Phases

Apply grouping rules:

| Phase | Criteria | Typical Contents |
|-------|----------|------------------|
| Phase 1 | P1 + Lowest risk + Serves T1 | FE-only components, quick wins |
| Phase 2 | P2 + Dependencies on P1 complete | FE+BE integration, non-breaking |
| Phase 3 | P3/P4 + Highest risk | Contract changes, data model |

**Grouping Constraints:**
- Respect dependency order (check DSM matrix from dependency-mapping)
- Each phase should be independently deployable
- Each phase should serve at least one complete persona tier
- Keep phases to 3-5 days when possible

### Phase 4: Generate Timeline (ASCII)

Use ASCII format grouped by stack. Show only dependencies with arrows. No dates or effort estimates.

**ASCII Timeline Format:**

```
TIMELINE: [Feature Name]
═══════════════════════════════════════════════════════════

FRONTEND
├── [Slice name]
├── [Slice name] ───────────────┐
├── [Slice name] ───────────────┼──┐
└── [Slice name] ───────────────┘  │
                                   │
BACKEND                            │
└── [Slice name] ◄─────────────────┘
         │
         ▼
INFRASTRUCTURE
└── [Slice name]
         │
         ▼
INTEGRATION
├── [Slice name]
└── [Slice name]

═══════════════════════════════════════════════════════════
LEGEND:
├── = parallel (no dependency)
──► = dependency (must complete before)
```

**Stack Grouping Rules:**

| Section | Contains |
|---------|----------|
| Frontend | Components, pages, client-side logic, Storybook |
| Backend | API routes, middleware, services, database |
| Infrastructure | DNS, deployment, environment config |
| Integration | Cross-cutting features, E2E flows |

**Dependency Notation:**
- `├──` items in same section run in parallel
- `──►` or `◄──` arrows show blocking dependencies
- `│` and `▼` show sequential flow between stacks

### Phase 6: Document Checkpoints

| Phase End | Validation | Who Validates |
|-----------|------------|---------------|
| Phase 1 | Storybook review, design QA | Design team |
| Phase 2 | E2E on staging, API tests pass | QA team |
| Phase 3 | Production deploy, monitoring | Ops team |

## Output Format

Output an **executive summary** (like DIVERGE), then the **ASCII timeline**. Do NOT show QA Contract details or Priority Matrix.

```markdown
## Value Analysis Complete

### Executive Summary

| Phase | Status | Key Output |
|-------|--------|------------|
| Scope | ✓ | Full ([N] validated wireframes from Phase 1) |
| State Machines | ✓ | [N] components, [N] states, [N] transitions |
| QA Contract | ✓ | [N] Gherkin (G#1-N), [N] acceptance (AC#1-N) |
| Dependencies | ✓ | [N] slices, [N] blockers, DSM matrix built |
| Design Reuse | ✓ | [N] existing components leveraged |
| Personas (Notion) | ✓ | Fetched [N] from DB, T1: [name], T2: [name] |
| GTM Strategy (Notion) | ✓ | Positioning: "[excerpt...]" |
| Persona Coverage | ✓ | Phase 1 serves [Tier], Phase 2 serves [Tiers] |
| Phasing | ✓ | [N] phases, [N] commits total |

### Proposed Timeline

[ASCII timeline with stacks and dependency arrows - no dates/effort]

### Checkpoints

| Phase | Validation | Owner |
|-------|------------|-------|
| 1 | [Validation] | [Team] |
| 2 | [Validation] | [Team] |
| 3 | [Validation] | [Team] |
```

## Invocation

Invoke manually with "use phasing skill" or follow Ask mode Phase 2 (CONVERGE) which references this skill.

## Related Skills

- `dependency-mapping` - Provides risk scores
- `gtm-alignment` - Provides GTM scores
