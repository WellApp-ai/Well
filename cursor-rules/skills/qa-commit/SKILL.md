---
name: qa-commit
description: Verify implementation against QA Contract (G#N, AC#N), auto-invoke debug on RED
---

# QA Commit Skill

Verify that the current commit satisfies its assigned QA Contract criteria (G#N Gherkin scenarios and AC#N acceptance criteria). Returns GREEN (pass) or RED (fail, triggers debug).

## When to Use

- After pr-review passes, before git commit
- During Agent Mode commit-level workflow
- Manually with "use qa-commit skill"

## Input: Commit Context

Before running, identify:
1. Current commit from Commit Plan
2. Assigned criteria: "Satisfies: G#X, AC#Y, ..."
3. Related files being changed

## Phase 1: Load QA Contract

Retrieve the assigned criteria for this commit:

```markdown
## Commit: [Name]
**Satisfies:** G#1, G#2, AC#1, AC#3

### Criteria to Verify:
- G#1: [Scenario description]
- G#2: [Scenario description]
- AC#1: [Acceptance criteria]
- AC#3: [Acceptance criteria]
```

## Phase 2: Technical Validation

Use Cursor tools for technical checks:

### 2.1 ReadLints

```
ReadLints:
  paths: [changed files]
```

**Expect:** No errors related to committed functionality

### 2.2 Type Safety

```bash
npm run typecheck
```

**Expect:** Exit code 0

### 2.3 Related Tests (if exist)

```bash
npm run test -- --grep "[feature name]"
```

**Expect:** All tests pass

## Phase 3: Gherkin Verification (Backend - G#N)

For each G#N assigned to this commit:

### 3.1 Endpoint Existence

Verify the API endpoint exists and is implemented:

```
SemanticSearch: "Where is [endpoint] implemented?"
```

### 3.2 Response Shape

Check response matches expected schema:

```
Grep: "interface.*Response" in related files
```

### 3.3 Error Handling

Verify error cases are handled:

```
Grep: "throw|catch|error" in handler files
```

### Gherkin Checklist

| G#N | Scenario | Status | Notes |
|-----|----------|--------|-------|
| G#1 | [Name] | PASS/FAIL | [Details] |
| G#2 | [Name] | PASS/FAIL | [Details] |

## Phase 4: Acceptance Verification (Frontend - AC#N)

For each AC#N assigned to this commit:

### 4.1 Component Existence

Verify component is implemented:

```
Glob: **/*[ComponentName]*.tsx
```

### 4.2 Storybook Story (if AC involves visual)

Check Storybook story exists:

```
Glob: **/*[ComponentName]*.stories.tsx
```

### 4.3 Browser MCP Verification (if running)

For interactive acceptance criteria:

```
Browser MCP:
1. browser_navigate to Storybook URL
2. browser_snapshot to check state
3. browser_click/browser_type to test interaction
4. browser_take_screenshot for evidence
```

### Acceptance Checklist

| AC#N | Criteria | Status | Evidence |
|------|----------|--------|----------|
| AC#1 | [Criteria] | PASS/FAIL | [Screenshot/Notes] |
| AC#3 | [Criteria] | PASS/FAIL | [Screenshot/Notes] |

## Phase 5: Generate Verification Report

```markdown
## Verification Report

**Commit:** [Name]
**Satisfies:** G#1, G#2, AC#1, AC#3

### Technical Validation

| Check | Status |
|-------|--------|
| ReadLints | PASS/FAIL |
| TypeCheck | PASS/FAIL |
| Tests | PASS/FAIL/SKIP |

### Gherkin Scenarios (Backend)

| ID | Scenario | Status | Notes |
|----|----------|--------|-------|
| G#1 | [Name] | PASS/FAIL | [Details] |
| G#2 | [Name] | PASS/FAIL | [Details] |

### Acceptance Criteria (Frontend)

| ID | Criteria | Status | Evidence |
|----|----------|--------|----------|
| AC#1 | [Criteria] | PASS/FAIL | [Link/Notes] |
| AC#3 | [Criteria] | PASS/FAIL | [Link/Notes] |

### Verdict

**[GREEN / RED]**

[If GREEN: All criteria verified, ready to commit]
[If RED: Failed criteria listed, invoking debug skill]
```

## Phase 6: Handle Verdict

### GREEN Verdict

```markdown
All criteria verified. Proceeding to git commit.
```

### RED Verdict - Auto-Invoke Debug

```markdown
**Verification failed. Auto-invoking debug skill.**

### Failed Criteria:
- [G#N or AC#N]: [What failed]
- [G#N or AC#N]: [What failed]

### Context for Debug:
- Error messages: [from ReadLints]
- Expected behavior: [from QA Contract]
- Actual behavior: [observed]

Invoking debug skill with context...
```

After debug fixes, re-run qa-commit to verify.

## Integration with Debug

When verdict is RED:

1. Automatically invoke `debug` skill
2. Pass context:
   - Failed G#N or AC#N
   - Error messages from ReadLints/Shell
   - Browser console/network errors (if applicable)
3. Debug skill fixes issue
4. Re-run qa-commit
5. Repeat until GREEN or user intervention

## MCP Tools Used

| Tool | Purpose |
|------|---------|
| ReadLints | Get lint/type errors |
| Shell | Run tests, typecheck |
| Browser MCP | Storybook verification |
| SemanticSearch | Find implementations |
| Grep | Search for patterns |

## Invocation

Invoked by:
- `commit.mdc` - After pr-review passes
- `agent.mdc` - Part of commit-level workflow

Or manually with "use qa-commit skill".
