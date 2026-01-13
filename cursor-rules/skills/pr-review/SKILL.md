---
name: pr-review
description: Automated code review using ReadLints and Shell for technical validation
---

# PR Review Skill

Automated technical validation before commits. Uses ReadLints for lint/type errors and Shell for running validation commands.

## When to Use

- Before every commit (invoked by commit.mdc)
- Before pushing PR (invoked by push-pr.mdc Phase 1)
- Manually with "use pr-review skill"

## Phase 0: Runtime Check (Auto-Resolve)

Verify development environment is ready. Auto-resolve safe issues, prompt for risky ones.

### 0.1 Dependencies Check

Check if dependencies are fresh:

```bash
# Check if node_modules exists
ls -d node_modules 2>/dev/null

# Check if package-lock.json is newer than node_modules
find package-lock.json -newer node_modules 2>/dev/null
```

**If node_modules missing or stale (auto-resolve):**

```bash
npm install
```

Wait for install to complete before proceeding.

### 0.2 Docker Containers

Check if required containers are running:

```bash
docker ps --filter name=well_ --format "{{.Names}}: {{.Status}}"
```

**Expected:** `well_postgres` and `well_hasura` running

**If not running (auto-resolve):**

```bash
cd apps/api/docker && docker compose up -d
```

Wait up to 30 seconds for containers to be healthy.

### 0.3 Database Migrations

Check for pending migrations:

```bash
cd apps/api && npm run mikro:up -- --dry-run 2>&1 | head -5
```

**If migrations pending (WARN - do NOT auto-run):**

```
Database migrations may be pending.

Run manually if needed: cd apps/api && npm run mikro:up

Continue without running migrations? (y/n)
```

Wait for user confirmation before proceeding.

### 0.4 API Server (port 8080)

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health --max-time 5
```

**Expected:** HTTP 200

**If not responding:**

1. Check if process exists: `lsof -i :8080`
2. If NO process, prompt user to start:
   ```
   API server not running on port 8080.
   
   Start with: npm run dev (in apps/api)
   ```
3. If process EXISTS but unresponsive, ASK user:
   ```
   API server on port 8080 is unresponsive (process exists but not responding).
   
   Options:
   A) Kill process and restart (recommended)
   B) Skip and continue anyway
   C) Abort commit
   
   Reply with A, B, or C.
   ```
4. If user chooses A:
   ```bash
   lsof -ti :8080 | xargs kill -9 2>/dev/null
   ```
   Then prompt user to restart: `cd apps/api && npm run dev`

### 0.5 Web Server (port 3000)

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 5
```

**Expected:** HTTP 200

**If not responding:**

1. Check if process exists: `lsof -i :3000`
2. If NO process, prompt user to start:
   ```
   Web server not running on port 3000.
   
   Start with: npm run dev (in apps/web)
   ```
3. If process EXISTS but unresponsive, ASK user:
   ```
   Web server on port 3000 is unresponsive (process exists but not responding).
   
   Options:
   A) Kill process and restart (recommended)
   B) Skip and continue anyway
   C) Abort commit
   
   Reply with A, B, or C.
   ```
4. If user chooses A:
   ```bash
   lsof -ti :3000 | xargs kill -9 2>/dev/null
   ```
   Then prompt user to restart: `cd apps/web && npm run dev`

### 0.6 Build Cache (on error only)

If typecheck passes but runtime errors occur (module not found, stale code):

```bash
npm run clean
```

Then prompt user to restart dev servers.

### 0.7 Runtime Check Output

```markdown
### Runtime Environment

| Service | Status | Action |
|---------|--------|--------|
| Dependencies | FRESH/STALE | [installed/skipped] |
| Docker (postgres) | UP/DOWN | [started/already running] |
| Docker (hasura) | UP/DOWN | [started/already running] |
| Migrations | CURRENT/PENDING | [warning shown/current] |
| API Server (8080) | UP/DOWN/STALE | [running/started/killed/skipped] |
| Web Server (3000) | UP/DOWN/STALE | [running/started/killed/skipped] |

**Runtime:** [READY / WAITING - user action needed]
```

If any service requires manual action, wait for user confirmation before proceeding.

## Phase 1: Technical Validation

### 1.1 Type Check

```bash
npm run typecheck
```

**Expected:** Exit code 0, no errors

### 1.2 Lint Check

```bash
npm run lint
```

**Expected:** Exit code 0, no errors

### 1.3 ReadLints Integration

Use Cursor's ReadLints tool on changed files:

```
ReadLints:
  paths: [list of changed files]
```

Categorize results:

| Severity | Action |
|----------|--------|
| Error | BLOCK - must fix before commit |
| Warning | WARN - should fix, can proceed |
| Info | PASS - informational only |

## Phase 2: Code Quality Checks

### 2.1 Console.log Detection

Search changed files for debug statements:

```
Grep:
  pattern: "console\.(log|debug|warn|error)"
  path: [changed files]
```

**If found:** WARN - remove before commit

### 2.2 TODO/FIXME Detection

```
Grep:
  pattern: "(TODO|FIXME|HACK|XXX):"
  path: [changed files]
```

**If found:** INFO - document or address

### 2.3 Hardcoded Values

```
Grep:
  pattern: "(localhost|127\.0\.0\.1|hardcoded)"
  path: [changed files]
```

**If found:** WARN - use environment variables

## Phase 3: Risk Assessment

Calculate risk score based on:

| Factor | Weight | Criteria |
|--------|--------|----------|
| Lines Changed | 1-3 | <50=1, 50-200=2, >200=3 |
| Files Changed | 1-3 | <5=1, 5-10=2, >10=3 |
| New Dependencies | 0-2 | None=0, 1=1, >1=2 |
| API Changes | 0-2 | None=0, Internal=1, Public=2 |
| Database Changes | 0-2 | None=0, Field=1, Entity=2 |

**Risk Levels:**
- LOW (0-4): Standard review
- MEDIUM (5-8): Careful review
- HIGH (9+): Thorough review recommended

## Output Format

```markdown
## PR Review Report

### Runtime Environment

| Service | Status | Action |
|---------|--------|--------|
| Dependencies | FRESH/STALE | [installed/skipped] |
| Docker (postgres) | UP/DOWN | [started/already running] |
| Docker (hasura) | UP/DOWN | [started/already running] |
| Migrations | CURRENT/PENDING | [warning shown/current] |
| API Server (8080) | UP/DOWN/STALE | [running/killed/skipped] |
| Web Server (3000) | UP/DOWN/STALE | [running/killed/skipped] |

**Runtime:** [READY / WAITING]

### Technical Validation

| Check | Status | Details |
|-------|--------|---------|
| TypeCheck | PASS/FAIL | [error count or "clean"] |
| Lint | PASS/FAIL | [error count or "clean"] |
| ReadLints | PASS/WARN/FAIL | [summary] |

### Code Quality

| Check | Status | Count | Files |
|-------|--------|-------|-------|
| console.log | PASS/WARN | [N] | [files] |
| TODO/FIXME | PASS/INFO | [N] | [files] |
| Hardcoded | PASS/WARN | [N] | [files] |

### Risk Assessment

| Factor | Score |
|--------|-------|
| Lines Changed | [N] |
| Files Changed | [N] |
| New Dependencies | [N] |
| API Changes | [N] |
| Database Changes | [N] |
| **Total Risk** | [N] ([LOW/MEDIUM/HIGH]) |

### Verdict

**[PASS / WARN / BLOCK]**

[If BLOCK: List issues that must be fixed]
[If WARN: List issues that should be addressed]
[If PASS: Ready to commit]
```

## Verdict Logic

| Condition | Verdict |
|-----------|---------|
| Runtime WAITING (user action needed) | BLOCK |
| User chose C (Abort) for stale server | BLOCK |
| Dependencies installed | Continue (auto-resolved) |
| Migrations pending | WARN (can proceed after confirmation) |
| Server killed by user (chose A) | Continue after user restarts |
| TypeCheck FAIL or Lint FAIL | BLOCK |
| ReadLints has Errors | BLOCK |
| console.log found | WARN |
| Risk >= HIGH | WARN |
| All checks pass | PASS |

## Integration

This skill is invoked by:
- `commit.mdc` - Before each commit
- `push-pr.mdc` - Phase 1.1 validation
- `agent.mdc` - Part of commit-level workflow

## Tools Used

| Tool | Purpose |
|------|---------|
| Shell | Run npm scripts (typecheck, lint) |
| ReadLints | Get IDE diagnostic errors |
| Grep | Search for patterns in code |
| Read | Examine specific file contents |

## Quick Mode

For rapid iteration, run minimal checks:

```markdown
## Quick Review

- [ ] `npm run typecheck` - PASS
- [ ] `npm run lint` - PASS
- [ ] No console.log - PASS

**Verdict:** PASS - Ready to commit
```

Use full review before PR push; quick mode acceptable for intermediate commits.
