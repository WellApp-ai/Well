---
name: autonomous-loop
description: Iterate until success or limit, composing existing skills with Jidoka integration
---

# Autonomous Loop Skill (Ralph Wiggum)

Keep iterating until success without human intervention per attempt. Composes existing skills and respects Jidoka escalation.

## When to Use

- User requests hands-off iteration
- Explicitly triggered with keywords

## Trigger Phrases

- "ralph mode"
- "keep going"
- "iterate until done"
- "autonomous"
- "don't stop"

## Parameters

| Param | Default | Description |
|-------|---------|-------------|
| max_iterations | 5 | Max attempts before pause |
| success_criteria | typecheck + lint + ReadLints clean | What defines success |

## Phase 1: Initialize

1. Acknowledge activation
2. Invoke `session-status` skill for current state
3. Initialize counters:
   - iteration = 0
   - error_history = [] (shared with debug skill)

**Output:**
```
Entering autonomous loop. Max 5 iterations.
Current: [session-status header]
```

## Phase 2: Execute Loop

```
FOR iteration IN 1..max_iterations:
    
    2.1: Execute current task action
         - Implement changes per commit plan
         - Run npm run typecheck
         - Run npm run lint
    
    2.2: Invoke pr-review skill
         - If BLOCK: proceed to 2.4
         - If PASS: proceed to 2.3
    
    2.3: Invoke qa-commit skill
         - If GREEN: proceed to 2.5
         - If RED: proceed to 2.4
    
    2.4: Invoke debug skill
         - Debug skill checks Jidoka tier internally
         - If Tier 2/3 escalation: EXIT loop, return JIDOKA
         - If Tier 1 fix attempted: CONTINUE loop
    
    2.5: Success checkpoint
         - Log iteration as SUCCESS
         - Proceed to next commit or EXIT if done
```

## Phase 3: Iteration Report

After each iteration, output:

```markdown
## Iteration [N]/[max]

| Step | Skill | Result |
|------|-------|--------|
| Execute | (implementation) | [files changed] |
| Review | pr-review | PASS/BLOCK |
| Verify | qa-commit | GREEN/RED |
| Debug | debug | [if invoked] |

**Outcome:** [SUCCESS / CONTINUE / JIDOKA / MAX]
```

## Phase 4: Exit and Report

On loop exit, invoke `session-status` skill and output:

```markdown
## Autonomous Loop Complete

**Exit reason:** [SUCCESS / JIDOKA / MAX / INTERRUPT]
**Iterations:** [N] of [max]

| Iter | Action | Result |
|------|--------|--------|
| 1 | [description] | [outcome] |
| 2 | [description] | [outcome] |

[session-status footer with next steps]
```

## Exit Conditions

| Condition | Trigger | Result |
|-----------|---------|--------|
| SUCCESS | All checks pass, commit complete | Normal exit, proceed to next commit |
| JIDOKA | Tier 2/3 escalation triggered | Exit loop, present options to human |
| MAX | iteration >= max_iterations | Exit loop, report and wait for guidance |
| INTERRUPT | User sends message | Exit loop, respond to user |

## Safety Guardrails

- NEVER auto-commit without GREEN from qa-commit
- NEVER auto-push to remote
- NEVER delete files without explicit approval
- PAUSE on any destructive operation
- EXIT on user message (treat as INTERRUPT)

## Integration with Jidoka

Ralph Wiggum respects Jidoka escalation tiers:

| Tier | Ralph Behavior |
|------|----------------|
| Tier 1 (error_count < 3) | Continue autonomously, debug skill handles |
| Tier 2 (same error 3x) | EXIT loop, Jidoka presents options |
| Tier 3 (any error 5x) | EXIT loop, Jidoka requires human triage |

## Integration

This skill composes:
- `session-status` - Progress tracking
- `pr-review` - Technical validation
- `qa-commit` - QA contract verification
- `debug` - Error fixing with Jidoka

This skill is invoked by:
- User trigger phrases
- `agent.mdc` when user requests autonomous mode

## Invocation

Trigger with: "ralph mode", "keep going", "iterate until done"

## Tools Used

| Tool | Purpose |
|------|---------|
| Shell | npm run typecheck, npm run lint |
| ReadLints | IDE diagnostic errors |
| Grep | Pattern search in code |
| SemanticSearch | Find implementations |
| Read | Read file contents |
| StrReplace | Make code changes |
| Browser MCP | Visual verification (via qa-commit) |
