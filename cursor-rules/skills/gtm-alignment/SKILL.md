---
name: gtm-alignment
description: Align phases with GTM strategy, persona tiers, and KPI targets
---

# GTM Alignment Skill

Ensure implementation phasing aligns with go-to-market strategy by validating against persona tiers and estimating business value from KPI database.

**CRITICAL:** This skill MUST fetch real data from Notion. Do NOT make up personas or GTM tiers.

## When to Use

- During Ask mode Phase 2 (CONVERGE), after dependency-mapping
- When prioritizing between equally-risky slices
- Before finalizing phase order

## Notion Database IDs

| Database | ID | Purpose |
|----------|-----|---------|
| Persona DB | `2b1c4d5e-7bea-80ee-85c2-fb96dfdcf98b` | Persona tiers, RICE scores, characteristics |
| GTM Strategy | `2b2c4d5e-7bea-809d-8c49-cc6b443738df` | Positioning, messaging, segments |

**Note:** If `API-query-data-source` fails, use `API-post-search` with query "Persona" as fallback.

## Instructions

### Phase 1: Fetch Persona Tiers (REQUIRED)

**Primary method - Query database:**
```
CallMcpTool:
  server: user-notion
  toolName: API-query-data-source
  arguments: {"data_source_id": "2b1c4d5e-7bea-80ee-85c2-fb96dfdcf98b"}
```

**Fallback method - Search (if query fails):**
```
CallMcpTool:
  server: user-notion
  toolName: API-post-search
  arguments: {"query": "Persona"}
```

**STOP if BOTH methods fail.** Report error and do not proceed with made-up data.

**Extract from Persona DB:**
- Persona name (title)
- RICE score (for prioritization)
- Goals, Pain points, Background
- Market segments

**Build Tier Priority Table (sorted by RICE score):**

| Tier | Persona | RICE Score | Key Traits |
|------|---------|------------|------------|
| T1 | [Highest RICE from Notion] | [Score] | [Goals/Pain points] |
| T2 | [Second RICE from Notion] | [Score] | [Goals/Pain points] |
| T3 | [Third RICE from Notion] | [Score] | [Goals/Pain points] |

**Evidence required:** Show persona names and RICE scores from Notion

### Phase 2: Fetch GTM Strategy (REQUIRED)

**Primary method - Query database:**
```
CallMcpTool:
  server: user-notion
  toolName: API-query-data-source
  arguments: {"data_source_id": "2b2c4d5e-7bea-809d-8c49-cc6b443738df"}
```

**Fallback method - Search (if query fails):**
```
CallMcpTool:
  server: user-notion
  toolName: API-post-search
  arguments: {"query": "GTM Strategy"}
```

**STOP if BOTH methods fail.** Report error and do not proceed with made-up data.

**Extract from GTM Strategy:**
- Current positioning statement
- Key differentiators vs. competitors
- Priority segments/verticals
- Messaging themes

**Evidence required:** Show positioning statement excerpt from Notion

### Phase 3: Map Slices to Personas

Using the ACTUAL persona data from Phase 1, map each slice to the persona it serves:

| Slice | Serves Persona | Tier | Why |
|-------|----------------|------|-----|
| [Slice name] | [Persona from Notion] | T1/T2/T3 | [Rationale] |

### Phase 4: Calculate GTM Score

```
GTM Score = (TierPriority x 3) + AnnouncementPotential

Where:
- TierPriority: T1=3, T2=2, T3=1, None=0
- AnnouncementPotential: Yes=2, Partial=1, No=0
```

### Phase 4: Calculate GTM Score

```
GTM Score = (TierPriority x 3) + ValueScore + AnnouncementPotential

Where:
- TierPriority: T1=3, T2=2, T3=1, None=0
- ValueScore: Critical=3, High=2, Medium=1, Low=0
- AnnouncementPotential: Yes=2, Partial=1, No=0
```

### Phase 5: Map Phases to Personas

| Phase | Serves Tier | Persona | Features Included | Can Announce? |
|-------|-------------|---------|-------------------|---------------|
| 1 | T1 | [Primary] | [Slice list] | Yes/No |
| 2 | T1, T2 | [Primary, Secondary] | [Slice list] | Yes/No |
| 3 | All | All personas | [Slice list] | Yes (Full Launch) |

**Rule:** Each phase should fully serve at least one persona tier.

### Phase 6: Reconcile with Risk Order

If GTM Score conflicts with Risk Score (from dependency-mapping):

| Scenario | Resolution |
|----------|------------|
| High GTM + High Risk | Split slice into MVP + Full (reduce risk, keep GTM priority) |
| High GTM + Low Risk | Prioritize (move earlier in sequence) |
| Low GTM + Low Risk | Keep in risk-based position |
| Low GTM + High Risk | Defer (move later in sequence) |

**Document conflicts for checkpoint:**
```
CONFLICT DETECTED:
- Risk order: #1.1 -> #1.2 -> #2.1 -> #2.2
- GTM order: #2.2 -> #1.1 -> #1.2 -> #2.1 (Invite flow is T1 priority)

RESOLUTION OPTIONS:
- Option A: Accept risk, prioritize GTM (ship #2.2 first)
- Option B: Split #2.2 into MVP + Full (ship #2.2-MVP in Phase 1)
- Option C: Ship #1.1 first, fast-follow with #2.2 (compromise)
```

## Output Format

Include **evidence of Notion fetch** in output:

```markdown
## GTM Alignment

### Data Sources (REQUIRED)

| Source | Status | Evidence |
|--------|--------|----------|
| Personas DB | ✓ Fetched | [N] records from `2b2c4d5e...` |
| GTM Strategy DB | ✓ Fetched | Positioning: "[first 50 chars...]" |

### Persona Tiers (from Notion)

| Tier | Persona | Characteristics |
|------|---------|-----------------|
| T1 | [From Notion] | [From Notion] |
| T2 | [From Notion] | [From Notion] |

### Strategy Fit
- Positioning: [From Notion GTM Strategy]
- Messaging: [Key message this enables]
- Differentiator: [Competitive advantage]

### Persona Coverage

| Phase | Serves Tier | Persona | Can Announce? |
|-------|-------------|---------|---------------|
| 1 | T1 | [Persona from Notion] | Yes/No |
| 2 | T1, T2 | [Personas from Notion] | Yes/No |

### Conflicts & Resolutions

| Conflict | Risk Order | GTM Order | Resolution |
|----------|------------|-----------|------------|
| [Description] | [Sequence] | [Sequence] | [Chosen option] |
```

## Validation Checkpoint

Before proceeding, verify:

- [ ] Personas DB queried successfully (not made up)
- [ ] GTM Strategy DB queried successfully (not made up)
- [ ] Each slice mapped to a real persona from Notion
- [ ] Evidence shown in output (record counts, positioning excerpt)

**If any query fails:** STOP and report the error. Do NOT proceed with invented data.

## Invocation

Invoke manually with "use gtm-alignment skill" or follow Ask mode Phase 2 (CONVERGE) which references this skill.

## Related Skills

- `dependency-mapping` - Run before GTM alignment
- `problem-framing` - Provides persona context
- `phasing` - Uses GTM scores for final ordering
