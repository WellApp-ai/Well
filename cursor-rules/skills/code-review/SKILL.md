---
name: code-review
description: Review code changes against hard rules and conventions
---

# Code Review Skill

Systematically review code for quality, conventions, and potential issues.

## When to Use
- Before committing changes (auto-triggered)
- Reviewing others' PRs
- Self-review before pushing
- Pre-push validation (Phase 0)

---

## Phase 0: Pre-Push Validation

Before reviewing code, ensure build passes:

- [ ] `npm run typecheck` - No type errors
- [ ] `npm run lint` - No lint errors
- [ ] No console.log in changed files
- [ ] Tests pass (if applicable): `npm run test`

If any check fails, fix before proceeding to code review.

**Quick check command:**
```bash
npm run typecheck && npm run lint
```

**Check for console.log:**
```bash
git diff --cached --name-only | xargs grep -l "console.log" 2>/dev/null
```

---

## Review Checklist

### Hard Rules Check
- [ ] No `any` type usage
- [ ] No console.log statements
- [ ] Components under 200 lines
- [ ] No inline styles (Tailwind only)
- [ ] No arbitrary values (`px-[13px]`)
- [ ] API follows 3-layer pattern

### Code Quality Check
- [ ] Clear variable/function names
- [ ] No duplicated code
- [ ] Proper error handling
- [ ] Types are specific (not `unknown` everywhere)

### Conventions Check
- [ ] Follows existing patterns in codebase
- [ ] Imports organized correctly
- [ ] File in correct location (feature folder)

### Security Check
- [ ] No hardcoded secrets/API keys
- [ ] No exposed sensitive data
- [ ] Proper input validation

## Output Format

Present findings as:

---

## Code Review Summary

**Files Changed:** [count]
**Issues Found:** [count by severity]

### Critical (must fix)
- [ ] `file.ts:L42` - [issue description]

### Warnings (should fix)
- [ ] `file.ts:L15` - [issue description]

### Suggestions (nice to have)
- [ ] `file.ts:L88` - [suggestion]

### Approved
- [x] No blocking issues found

---

**Proceed with commit?** (yes / fix issues first)

---

## Auto-Trigger
This skill is automatically invoked before every commit.
