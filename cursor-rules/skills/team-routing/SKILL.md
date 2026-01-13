---
name: team-routing
description: Detect domain from context and find appropriate team member
---

# Team Routing Skill

Automatically detect domain from branch names or file paths and find the appropriate reviewer.

## When to Use
- Push PR mode: auto-assign reviewer
- Init mode: show domain context
- Any mode needing domain owner lookup

## Phases

### Phase 1: Extract Keywords

Extract domain keywords from context:

**From branch name:**
```
feature/tables-filter     → keywords: ["tables"]
fix/auth-token-expired    → keywords: ["auth"]
chore/settings-refactor   → keywords: ["settings"]
```

**From changed files:**
```bash
git diff --name-only origin/develop | head -20
```

Match file paths against known patterns:
- `apps/web/features/tables/` → "tables"
- `apps/api/routes/auth/` → "auth"
- `apps/web/features/settings/` → "settings"

### Phase 2: Query Notion Domains Database

```
API-query-database: [Domains-DB-ID]
Filter: Keywords contains [extracted-keyword]
        OR Codebase_Paths contains [file-pattern]
```

**Expected result:**
- Domain name
- Topology type (stream-aligned, platform, enabling, complicated-subsystem)
- Primary keywords

### Phase 3: Query Team Capabilities

```
API-query-database: Team Capabilities
Filter: Primary_Domain matches [domain-name]
        AND Availability = "Available"
Sort: Open_PR_Count ASC
```

**Expected result:**
- Person name
- GitHub handle
- Max Open PRs
- Current Open PR count

### Phase 4: Check Availability

For each candidate:
1. Query current open PRs:
   ```bash
   gh pr list --state open --author [github_handle] --json number | jq length
   ```
2. Compare against Max_Open_PRs threshold
3. Skip if at or over capacity

### Phase 5: Fallback Logic

If no available primary owner:

1. **Backup Owners:** Query Skills table for overlapping skills
2. **Skills Match:** Match changed file extensions to skill file patterns
3. **No Match:** Return warning: "No available reviewer found for domain [X]"

---

## Output

Present findings as:

```
## Domain Detection

**Branch:** [branch-name]
**Detected Domain:** [domain-name]
**Topology:** [stream-aligned | platform | enabling | complicated-subsystem]

### Reviewer Assignment

**Primary Owner:** @[github_handle] ([person_name])
**Availability:** [Available | At capacity (X/Y PRs)]
**Assignment:** [Assigned | Fallback to @backup | No available reviewer]
```

---

## Integration

This skill is invoked by:
- `push-pr.mdc` - Phase 1.2 (Find Reviewer)
- `init.mdc` - Domain context display

**Notion Databases Required:**
- Domains (keywords, codebase paths)
- Team Capabilities (person, domain, availability, max PRs)
- Skills (file patterns for fallback matching)
