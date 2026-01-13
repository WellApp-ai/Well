---
name: tech-divergence
description: Evaluate technical options with scoring matrix, trigger Gate 4 for significant decisions
---

# Tech Divergence Skill

Evaluate technical implementation options using an 8-dimension scoring matrix. Low scores auto-proceed; high scores (>= 4) trigger Gate 4 for human decision.

## When to Use

- During Plan Mode Phase 2 (Technical Diverge)
- Before committing to a specific architecture or pattern
- When multiple valid implementation approaches exist

## Scoring Matrix (8 Dimensions)

Each dimension scores 0 (auto-proceed) or 1 (adds to checkpoint score):

| Dimension | 0 (Low Risk) | 1 (Checkpoint) |
|-----------|--------------|----------------|
| **Pattern** | Exists in codebase | New pattern required |
| **Scope** | Single domain | Cross-domain impact |
| **Data Model** | Add field to existing | New entity/table |
| **Dependencies** | Use existing libs | New dependency |
| **API Surface** | Internal only | Public/breaking change |
| **Reversibility** | Easy to undo | Requires migration |
| **Security** | Non-sensitive data | Auth/permissions |
| **Performance** | Simple CRUD | Cache/queue/optimization |

## Phase 1: Gather Context

### 1.1 Query Pattern Library (Notion)

Check if similar patterns exist:

```
API-query-database:
  database_id: "[PATTERN_LIBRARY_DB_ID]"
  filter:
    property: "Domain"
    select:
      equals: "[current domain]"
```

### 1.2 Search Codebase

```
SemanticSearch: "How is [similar feature] implemented?"
Grep: "[pattern name]" in relevant directories
```

### 1.3 Query Context7 (External Libraries)

If new libraries are being considered:

```
Context7 MCP:
1. resolve-library-id: libraryName = "[library]"
2. get-library-docs: topic = "best practices", mode = "info"
```

## Phase 2: Score Each Dimension

For each of the 8 dimensions, evaluate and score:

```
## Technical Divergence Score

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Pattern | 0/1 | [Exists/New] |
| Scope | 0/1 | [Single/Cross-domain] |
| Data Model | 0/1 | [Field/Entity] |
| Dependencies | 0/1 | [Existing/New] |
| API Surface | 0/1 | [Internal/Public] |
| Reversibility | 0/1 | [Easy/Migration] |
| Security | 0/1 | [Non-sensitive/Auth] |
| Performance | 0/1 | [CRUD/Optimization] |
| **TOTAL** | [0-8] | |
```

## Phase 3: Determine Path

### If Score < 4: Auto-Proceed

```
## Technical Approach: Auto-Proceed

**Score:** [N]/8 (below threshold)

**Selected Approach:** [Describe the approach]

**Rationale:** 
- Pattern exists: [reference]
- Low cross-domain impact
- Easy to reverse if needed

Proceeding to Commit Plan...
```

### If Score >= 4: Gate 4 (Human Checkpoint)

```
## Gate 4: Technical Approach Selection

**Score:** [N]/8 (threshold reached)

**Why human input needed:**
- [List dimensions that scored 1]

### Option A: [Name] (Conservative)

**Approach:** [Description]
**Effort:** S
**Risk:** Low
**Trade-off:** [What you give up]

### Option B: [Name] (Balanced)

**Approach:** [Description]
**Effort:** M
**Risk:** Medium
**Trade-off:** [What you give up]

### Option C: [Name] (Bold)

**Approach:** [Description]
**Effort:** L
**Risk:** Higher
**Trade-off:** [What you give up]

---

**Which approach would you like to proceed with?** (A / B / C)

*If you reject an option, I'll invoke decision-capture to record why.*
```

## Phase 4: Record Decision

After Gate 4 selection:

1. If option rejected, invoke `decision-capture` skill
2. Record selected approach in context for Commit Plan
3. Update Pattern Library if new pattern established

## Integration with Plan Mode

This skill is invoked during Plan Mode Phase 2:

```
Plan Mode Flow:
Phase 1: APPETITE → 
Phase 2: TECHNICAL DIVERGE (this skill) →
  If score < 4: Auto-proceed
  If score >= 4: Gate 4 → Human selects
Phase 3: COMMIT PLAN
```

## MCP Tools Used

| Tool | Purpose |
|------|---------|
| Notion MCP | Query Pattern Library database |
| Context7 MCP | Get library best practices |
| SemanticSearch | Find existing codebase patterns |
| Grep | Search for specific implementations |

## Example Scoring

### Low Score Example (Auto-Proceed)

**Feature:** Add a new column to existing table

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Pattern | 0 | Column additions done before |
| Scope | 0 | Single domain (tables) |
| Data Model | 0 | Adding field, not entity |
| Dependencies | 0 | Using existing libs |
| API Surface | 0 | Internal only |
| Reversibility | 0 | Easy migration |
| Security | 0 | Non-sensitive data |
| Performance | 0 | Simple CRUD |
| **TOTAL** | 0 | Auto-proceed |

### High Score Example (Gate 4)

**Feature:** Add real-time collaboration

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Pattern | 1 | No WebSocket patterns yet |
| Scope | 1 | Affects auth, tables, workflows |
| Data Model | 1 | New presence entity |
| Dependencies | 1 | Need socket.io |
| API Surface | 1 | New WS endpoints |
| Reversibility | 1 | Would need cleanup migration |
| Security | 1 | User session handling |
| Performance | 1 | Needs connection pooling |
| **TOTAL** | 8 | Gate 4 required |

## Invocation

Invoked automatically by Plan Mode Phase 2, or manually with "use tech-divergence skill".
