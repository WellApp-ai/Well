---
name: debug
description: Systematic debugging with MCP integration, auto-invoke from qa-commit, Phase 7 Harden
---

# Debug Skill

Diagnose and fix issues systematically. Enhanced with MCP integrations for deeper analysis and automatic regression test generation.

## When to Use

- **Auto-invoked** by qa-commit skill on RED verdict
- Error messages appearing in console/terminal
- Feature not working as expected
- Build/runtime failures
- "Something is broken" situations

## Modes

| Mode | Trigger | Context Provided |
|------|---------|------------------|
| **Auto** | qa-commit RED verdict | Failed G#N/AC#N, error messages |
| **Manual** | User invokes | User describes issue |

## The Enhanced Flow

```
Phase 0: Context Loading (if auto-invoked)
    ↓
Phase 0.5: Jidoka Escalation Check ──→ [Tier 2/3] ──→ ESCALATE to human
    ↓ [Tier 1]
Phase 1: Gather (ReadLints, Browser MCP, Context7)
    ↓
Phase 2: Reproduce (Browser MCP)
    ↓
Phase 3: Isolate (Known Issues DB query)
    ↓
Phase 4: Diagnose
    ↓
Phase 5: Fix
    ↓
Phase 6: Verify ──→ [FAIL] ──→ Phase 8 ──→ Phase 0.5
    ↓ [PASS]
Phase 7: Harden (generate regression test)
    ↓
Phase 8: Update Jidoka Counters (reset on success)
```

---

## Phase 0: Context Loading (Auto-Invoke Only)

When invoked from qa-commit, receive context:

```markdown
## Debug Context (from qa-commit)

**Failed Criteria:**
- [G#N or AC#N]: [Description]

**Verification Report:**
- ReadLints errors: [list]
- Shell errors: [list]
- Browser errors: [list if applicable]

**Expected Behavior:**
[From QA Contract]

**Actual Behavior:**
[Observed during verification]
```

Skip this phase if manually invoked.

---

## Phase 0.5: Jidoka Escalation Check (NEW)

Before attempting fix, check escalation tier to determine if human intervention is needed.

### Track Error History

Maintain error_history across debug invocations:

| Field | Description |
|-------|-------------|
| error_signature | Hash of error type + location |
| count | Times this exact error seen |
| fixes_attempted | List of fix descriptions |

### Tier Evaluation

| Tier | Condition | Action |
|------|-----------|--------|
| Tier 1 | error_count < 3 | Continue to Phase 1 (normal debug) |
| Tier 2 | error_count >= 3 (same error) | ESCALATE to human |
| Tier 3 | total_errors >= 5 (any) | ESCALATE to human |

### Tier 2/3 Escalation Output

If escalation triggered, skip Phases 1-7 and output:

```
R | [Feature] | AGENT | JIDOKA STOP
---
Same error detected [N] times:
> [Error message]

Attempted fixes:
1. [Fix 1] - Failed: [why]
2. [Fix 2] - Failed: [why]
3. [Fix 3] - Failed: [why]

Options:
A. Try different approach - [describe alternative]
B. Skip this commit, continue to next
C. Pause session, investigate manually
D. Abort feature, reassess scope

---
Reply with A, B, C, or D
```

Invoke `decision-capture` skill with escalation context.

### Escalation Resolution

On user response:
- **A:** Reset error_count for this signature, apply new approach
- **B:** Mark commit as SKIPPED, proceed to next
- **C:** End session, invoke `session-status` for final metrics
- **D:** End session with ABANDONED outcome

---

## Phase 1: Gather Information (Enhanced)

### 1.1 ReadLints Integration

Use Cursor's ReadLints tool on affected files:

```
ReadLints:
  paths: [affected files from context]
```

Categorize:
- Errors → Primary suspects
- Warnings → Secondary investigation
- Related files → Expand scope if needed

### 1.2 Browser MCP Deep Scan

For frontend issues, use Browser MCP:

```
browser_navigate: [affected URL]
browser_snapshot: Get current DOM state
browser_console_messages: All errors/warnings
browser_network_requests: API failures
```

Extract:
- Console errors with stack traces
- Failed network requests with status codes
- DOM state anomalies

### 1.3 Context7 Error Lookup

Identify libraries involved and query for error patterns:

```
Context7 MCP:
1. resolve-library-id: libraryName = "[library from stack trace]"
2. get-library-docs: topic = "[error message keywords]", mode = "info"
```

Look for:
- Known issues with the library
- Common error patterns
- Recommended fixes

### 1.4 Standard Gathering

- [ ] Get full error message/stack trace
- [ ] Check server logs if backend issue
- [ ] Identify when issue started (recent changes?)

---

## Phase 2: Reproduce (Enhanced)

### 2.1 Document Steps

```markdown
## Reproduction Steps

1. Navigate to: [URL]
2. Action: [What triggers the issue]
3. Expected: [What should happen]
4. Actual: [What actually happens]
```

### 2.2 Browser MCP Reproduction

```
browser_navigate: [starting URL]
browser_click: [trigger element]
browser_type: [if input needed]
browser_take_screenshot: Capture failure state
browser_network_requests: Capture API calls
```

### 2.3 Capture Evidence

- Screenshot at failure point
- Console log at failure
- Network request/response

---

## Phase 3: Isolate (Enhanced with Known Issues DB)

### 3.1 Query Known Issues Database

Before deep investigation, check if this is a known issue:

```
Notion MCP:
API-query-database:
  database_id: "[KNOWN_ISSUES_DB_ID]"
  filter:
    property: "Error Pattern"
    rich_text:
      contains: "[error keywords]"
```

**If match found:**
```markdown
## Known Issue Match

**Pattern:** [Error pattern from DB]
**Root Cause:** [From DB]
**Fix Pattern:** [From DB]
**Occurrences:** [N] times

Applying known fix...
```
→ Skip to Phase 5 with known fix.

**If no match:**
→ Continue to Phase 4.

### 3.2 Standard Isolation

- [ ] Trace error to specific file/line
- [ ] Check recent git changes: `git log -5 --oneline`
- [ ] Search for related code: `SemanticSearch`, `Grep`

---

## Phase 4: Diagnose

### 4.1 Root Cause Analysis

Read relevant code with context:

```
Read: [file with error]
SemanticSearch: "How is [function] supposed to work?"
```

### 4.2 Check Common Issues

- [ ] Type mismatches
- [ ] Null/undefined access
- [ ] Async timing issues
- [ ] Missing dependencies
- [ ] State management bugs
- [ ] API contract mismatches

### 4.3 Hypothesis Formation

```markdown
## Diagnosis

**Root Cause:** [What's causing the issue]

**Evidence:**
- [Evidence 1]
- [Evidence 2]

**Proposed Fix:** [What needs to change]
```

---

## Phase 5: Fix (Enhanced)

### 5.1 Pattern Compliance

Before implementing fix:

1. Invoke `design-context` skill (silent)
2. Check Context7 for library best practices
3. Ensure fix follows existing patterns

### 5.2 Implement Fix

- [ ] Propose minimal fix
- [ ] Explain why fix works
- [ ] Wait for user approval before implementing

### 5.3 Apply Fix

Make the code changes.

---

## Phase 6: Verify (Enhanced)

### 6.1 Technical Verification

```bash
npm run typecheck
npm run lint
npm run test -- --grep "[related tests]"
```

### 6.2 Re-run qa-commit

For the specific failed criteria:

```markdown
## Re-verification

Re-running qa-commit for:
- [G#N or AC#N that failed]

Result: [PASS/FAIL]
```

### 6.3 Outcome

**If PASS:** Continue to Phase 7 (Harden)
**If FAIL:** Return to Phase 3 (Isolate) with new information

---

## Phase 7: Harden (NEW)

Prevent regression by generating tests and updating knowledge base.

### 7.1 Generate Regression Test

Create test that would catch this issue:

**For Backend (G#N):**
```typescript
// Regression test: [issue description]
// Debug session: [date]
it('should not [bug behavior] when [condition]', async () => {
  // Reproduction steps
  const result = await [action that caused bug];
  expect(result).not.toBe([buggy behavior]);
  expect(result).toBe([correct behavior]);
});
```

**For Frontend (AC#N):**
```typescript
// Regression test: [issue description]
test('should handle [edge case]', async ({ page }) => {
  // Reproduction steps
  await page.goto('[URL]');
  await page.click('[trigger]');
  await expect(page.locator('[element]')).toBeVisible();
});
```

### 7.2 Invoke test-hardening

```markdown
Invoking test-hardening skill for regression test...
```

### 7.3 Update Known Issues (if novel)

If this was a new issue pattern:

```
Notion MCP:
API-create-page:
  parent: { database_id: "[KNOWN_ISSUES_DB_ID]" }
  properties:
    Error Pattern: "[Error message pattern]"
    Root Cause: "[What caused it]"
    Fix Pattern: "[How to fix]"
    Library: [relation if applicable]
    Occurrences: 1
```

### 7.4 Capture Patine (if significant)

If this reveals a pattern worth remembering:

```markdown
Invoking decision-capture skill...
"Learned: [pattern] causes [issue]. Fix: [approach]."
```

---

## Phase 8: Update Jidoka Counters (NEW)

Update escalation counters based on fix outcome.

### On GREEN (fix successful)

- Reset error_count for this signature to 0
- Clear fixes_attempted list
- Log success in session metrics
- Invoke `session-status` to update muda tracking

```markdown
## Jidoka Counter Reset

Error signature: [hash]
Previous count: [N]
New count: 0
Status: RESOLVED
```

### On RED (fix failed)

- Increment error_count for this signature
- Append fix description to fixes_attempted
- Return to Phase 0.5 for tier check

```markdown
## Jidoka Counter Update

Error signature: [hash]
Count: [N] → [N+1]
Fix attempted: [description]
Next: Re-evaluate escalation tier
```

---

## Output Format

```markdown
## Debug Report

### Issue
[Brief description]

### Root Cause
[What caused it]

### Fix Applied
[What was changed]

### Verification
- TypeCheck: PASS
- Lint: PASS
- Tests: PASS
- qa-commit: GREEN

### Hardening
- Regression test: [Created/Skipped]
- Known Issues: [Added/Existing]
- Patine: [Captured/Skipped]

**Status:** RESOLVED
```

---

## MCP Tools Used

| Tool | Phase | Purpose |
|------|-------|---------|
| ReadLints | 1 | Get lint/type errors |
| Browser MCP | 1, 2 | Console, network, DOM |
| Context7 | 1 | Library error patterns |
| Notion MCP | 3, 7 | Known Issues database |
| Shell | 6 | Run tests, typecheck |
| SemanticSearch | 3, 4 | Find related code |
| Grep | 3 | Search for patterns |

---

## Invocation

- **Auto:** Invoked by qa-commit on RED verdict
- **Manual:** "use debug skill"
