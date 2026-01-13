---
name: hotfix
description: Expedited workflow for urgent production issues
---

# Hotfix Skill

Fast-track fixes for production incidents.

## When to Use
- Production is down or degraded
- Critical bug affecting users
- Security vulnerability discovered

## How It Differs from Normal Flow

| Normal | Hotfix |
|--------|--------|
| Branch from develop | Branch from main |
| ASK mode exploration | Skip to fix |
| Full PR review | Expedited review |
| Standard Slack message | URGENT alert |

## The Flow
1. **Branch** - Create hotfix branch from main
2. **Fix** - Implement minimal fix
3. **Verify** - Test fix works
4. **PR** - Create with HOTFIX label
5. **Alert** - Notify team urgently

## Phase Checklist

### Phase 1: Create Hotfix Branch
- [ ] Fetch latest: `git fetch origin main`
- [ ] Branch from main: `git checkout -b hotfix/<issue-summary> origin/main`
- [ ] Confirm on hotfix branch

### Phase 2: Implement Fix
- [ ] Identify root cause (minimal investigation)
- [ ] Implement smallest possible fix
- [ ] Run typecheck and lint
- [ ] NO new features, NO refactoring

### Phase 3: Verify
- [ ] Test fix locally
- [ ] Confirm original issue resolved
- [ ] Check for obvious regressions

### Phase 4: Create PR
- [ ] Push branch: `git push -u origin HEAD`
- [ ] Create PR to main with HOTFIX label:
  ```bash
  gh pr create --base main --title "HOTFIX: <summary>" --label hotfix
  ```
- [ ] Request expedited review

### Phase 5: Alert Team

Generate urgent Slack message:

```
:rotating_light: **HOTFIX: [Issue Summary]**

**Impact:** [What was broken]
**Fix:** [What was changed]

:github: PR: [link]
:notion: Incident: [link if exists]

Requesting expedited review from: @[reviewer]
```

## After Merge
- [ ] Merge main back to develop: `git checkout develop && git merge main`
- [ ] Create incident report in Notion (if major)
