---
name: decision-capture
description: Capture patine (decision wisdom) at Gates when KO or challenge occurs
---

# Decision Capture Skill

Lightweight skill for capturing the "patine" - the accumulated wisdom of why decisions were made and alternatives rejected. Triggered at Gates when human provides KO or challenges a proposal.

## When to Use

- At any Gate when human provides KO
- When human challenges or rejects a proposal
- When debug skill finds a pattern worth remembering
- When significant technical decision is made

## Trigger Conditions

| Trigger | Context | Type |
|---------|---------|------|
| Gate 1 KO | Wireframe rejected | Decision |
| Gate 2 KO | Scope option rejected | Decision |
| Gate 3 KO/BLOCK | Phasing challenged | Decision |
| Gate 4 KO | Technical approach rejected | Decision |
| Gate 5 Changes | PR review feedback | Decision |
| Debug Pattern | Recurring issue found | Kaizen |
| DIG 3+ times | Same wireframe refined repeatedly | Kaizen |
| Same error fixed 2+ times | Fix pattern emerged | Kaizen |
| User corrects assumption | AI was wrong about something | Hansei |
| Takt warning exceeded | Phase took longer than target | Hansei |
| Jidoka Tier 2/3 | Escalation to human required | Hansei |

## Phase 1: Detect Decision Type

Categorize the decision:

| Type | Signal | Example |
|------|--------|---------|
| Technical | Code, architecture, library | "Don't use GraphQL subscriptions" |
| UX | Interaction, visual, flow | "Sidebar navigation, not top nav" |
| Process | Workflow, phasing, priority | "Ship auth before tables" |

## Phase 2: Prompt for Rationale

Ask for brief rationale (keep it light):

```markdown
I'll note this decision for future reference.

**In one sentence, why this decision?**

Examples:
- "We tried X in 2024, broke production"
- "Users missed this in testing"
- "Conflicts with our caching strategy"

(Press Enter to skip if you prefer not to explain)
```

**If human declines:** Record decision without rationale (still valuable).

## Phase 3: Attribute

Capture metadata:

| Field | Source |
|-------|--------|
| Who | Current user (from context) |
| When | Current date |
| Domain | From branch name or changed files |
| Gate | Which Gate triggered capture |
| Related Task | Notion task ID if available |

## Phase 4: Store

### Layer 1: Notion (Default - Always)

Use Notion MCP to create record:

```
API-create-page:
  parent: { database_id: "[DECISION_PATINE_DB_ID]" }
  properties:
    Title: { title: [{ text: { content: "[Decision summary]" }}]}
    Domain: { select: { name: "[domain]" }}
    Type: { select: { name: "[Technical/UX/Process]" }}
    Decision: { rich_text: [{ text: { content: "[What we decided]" }}]}
    Rationale: { rich_text: [{ text: { content: "[Why]" }}]}
    Rejected: { rich_text: [{ text: { content: "[What we didn't do and why]" }}]}
    Impact: { select: { name: "[Low/Medium/High]" }}
    Gate: { select: { name: "[Gate 1/2/3/4/5/Debug]" }}
```

### Layer 2: ADR File (If High Impact)

If Impact = High or Type = Technical with cross-domain effect:

1. Get next ADR number: `ls docs/decisions/ | wc -l`
2. Create file: `/docs/decisions/NNN-[slug].md`
3. Use ADR template

**ADR Template:**

```markdown
# ADR-[NNN]: [Title]

**Date**: [YYYY-MM-DD]
**Status**: Accepted
**Domain**: [domain]
**Captured at**: Gate [N]

## Context

[1-2 sentences: What problem were we solving?]

## Decision

[What we chose to do]

## Rationale

[Why this approach - the positive case]

## Rejected Alternatives

### [Alternative Name]
**Why not**: [Reason]

## Consequences

- [Trade-off 1]
- [Trade-off 2]

## References

- Notion: [link to Decision Patine record]
- Task: [link to related task if applicable]
```

### Layer 3: Inline Comment (If Micro/Code-Specific)

For small code-level decisions during implementation:

```typescript
// ADR: [Brief decision]. [Why not alternative]. —@[initials] [YYYY-MM]
```

Example:
```typescript
// ADR: No useMemo here - profiling showed <1ms gain, adds complexity. —@mc 2026-01
```

## Phase 5: Confirm

Output confirmation:

```markdown
**Noted:** [Decision summary]

Stored in Decision Patine database.
[If ADR created: Created ADR-[NNN] in /docs/decisions/]

Continuing with workflow...
```

---

## Kaizen/Hansei Capture (NEW)

Automatic learning capture without user prompts. These triggers capture patterns and reflections silently.

### Automatic Triggers

These captures happen automatically without prompting user:

**Kaizen (pattern emerged):**
- Wireframe DIG'd 3+ times → Capture the pattern that emerged
- Same error fixed 2+ times → Capture the fix pattern
- Repeated code pattern → Capture abstraction opportunity

**Hansei (reflection):**
- User corrects AI assumption → Capture what was wrong
- Phase exceeded takt warning → Capture why it took longer
- Jidoka escalation → Capture what blocked progress

### Kaizen Format

```markdown
Type: KAIZEN
Source: [Phase] [Loop/Commit]
Learning: "[What pattern emerged]"
Category: [UX_PATTERN | TECHNICAL | PROCESS]
Impact: LOW | MEDIUM | HIGH
```

**Example:**
```markdown
Type: KAIZEN
Source: DIVERGE Loop 3
Learning: "Invite modals benefit from email preview side panel"
Category: UX_PATTERN
Impact: MEDIUM
```

### Hansei Format

```markdown
Type: HANSEI
Source: [Phase] [Loop/Commit]
Learning: "[What we learned from the mistake/delay]"
Category: [ASSUMPTION | COMPLEXITY | PROCESS]
Impact: LOW | MEDIUM | HIGH
```

**Example:**
```markdown
Type: HANSEI
Source: CONVERGE
Learning: "Original scope too ambitious - exceeded 40min takt warning"
Category: COMPLEXITY
Impact: LOW
```

### Silent Capture Rules

- Do NOT prompt user for rationale on Kaizen/Hansei triggers
- Capture automatically based on observed patterns
- Include in session-journal sync at end of session
- Only HIGH impact Kaizen/Hansei create immediate ADR files

### Session Aggregation

Instead of immediately creating Notion entries for each:
1. Collect Kaizen/Hansei entries in memory during session
2. Aggregate in session-journal sync at end (Phase 5 of notion-sync)
3. Only HIGH impact items create immediate ADR files

---

## Querying Patine

Before proposing new patterns, query existing decisions:

```
API-query-database:
  database_id: "[DECISION_PATINE_DB_ID]"
  filter:
    property: "Domain"
    select:
      equals: "[current domain]"
```

Use results to:
1. Avoid re-proposing rejected alternatives
2. Understand existing constraints
3. Reference past decisions in new proposals

## Anti-Patterns

**DON'T:**
- Require rationale for every micro-decision
- Create ADR files for non-architectural choices
- Capture decisions that are already in code comments
- Ask "why" more than once if human declines

**DO:**
- Capture at the moment of friction (KO, challenge)
- Accept "we tried this before, it failed" as valid rationale
- Keep entries scannable (1-2 sentences)
- Link to evidence when available (PRs, issues, metrics)

## Integration

This skill is invoked by:
- `ask.mdc` - Gates 1, 2, 3 on KO
- `plan.mdc` - Gate 4 on option rejection
- `push-pr.mdc` - Gate 5 on changes requested
- `debug` - When pattern worth remembering is found

## Notion Database Schema

**Database: Decision Patine**

| Property | Type | Required |
|----------|------|----------|
| Title | Title | Yes |
| Domain | Select | Yes |
| Type | Select | Yes |
| Decision | Rich Text | Yes |
| Rationale | Rich Text | No |
| Rejected | Rich Text | No |
| Challenged By | Person | No |
| Date | Date | Yes |
| Impact | Select | Yes |
| Gate | Select | No |
| Related Task | Relation | No |
| ADR File | URL | No |

## Invocation

Invoked automatically at Gates on KO, or manually with "use decision-capture skill".
