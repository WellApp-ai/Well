---
name: qa-planning
description: Generate QA Contract with numbered Gherkin scenarios (G#N) and acceptance criteria (AC#N)
---

# QA Planning Skill

Generate the **QA Contract** - exhaustive Gherkin BDD scenarios (G#N) for all data sources and acceptance criteria (AC#N) for frontend. This contract is consumed by Plan Mode and verified by qa-commit skill.

## When to Use

- During Ask mode Phase 2 (CONVERGE) for any feature work
- Before implementation to define testable acceptance criteria
- When documenting expected behavior for QA team

## Output: QA Contract

The QA Contract is the primary artifact, consisting of:
- **G#1, G#2, ...** - Numbered Gherkin scenarios (backend/data)
- **AC#1, AC#2, ...** - Numbered acceptance criteria (frontend)

These IDs are referenced in Plan Mode's Commit Plan (Satisfies field) and verified by qa-commit skill.

## Instructions

### Phase 0: Identify ALL Data Sources (CRITICAL)

**STOP. Before writing any Gherkin, exhaustively map ALL data sources for the feature.**

Categorize each data source:

| Category | Description | Gherkin Type |
|----------|-------------|--------------|
| **Runtime API** | Fetched at request time from server | API scenarios (G#N) |
| **Build-time Static** | Generated during build, served as static files | Build script scenarios (G#N) |
| **Database** | Direct DB queries (Hasura, Postgres) | Query scenarios (G#N) |
| **External API** | Third-party services | Integration scenarios (G#N) |
| **Middleware** | Request routing, auth, transforms | Routing scenarios (G#N) |

**Data Source Inventory Template:**

```markdown
## Data Source Inventory

### Runtime APIs
| Endpoint | Method | Auth | Resource | Status |
|----------|--------|------|----------|--------|
| `/v1/resource` | GET | Yes | Resource | Existing |
| `/public/resource` | GET | No | Resource | New |

### Build-time Static
| Output Path | Source | Generator | Content |
|-------------|--------|-----------|---------|
| `/components.json` | Codebase | Build script | Component metadata |
| `/charts/[slug].json` | Codebase | Build script | Chart config + examples |

### Database Queries
| Query | Source | Auth | Purpose |
|-------|--------|------|---------|
| `connectors` | Hasura | Yes | List connectors |

### Middleware
| Route | Behavior | Auth |
|-------|----------|------|
| `developers.*` | Rewrite to public routes | Skip |

### External APIs
| Service | Endpoint | Purpose |
|---------|----------|---------|
| (none for this feature) | | |
```

**Validation:** Count total data sources. If < 3 for a non-trivial feature, you likely missed something. Re-examine the feature scope.

### Phase 2: Define Pre-conditions Matrix (Given)

For each service, treat it as a **black box**. Based on the contract interface or data model, list all pre-condition parameters:

```markdown
### [Method] [Path] Pre-conditions

| Parameter | Type | Source | Possible Values |
|-----------|------|--------|-----------------|
| `Authorization` | header | request | valid_token, invalid_token, expired_token, missing |
| `id` | path | URL | existing_uuid, non_existing_uuid, malformed, deleted |
| `status` | query | URL | enum values from data model |
| `[field]` | body | JSON | valid, null, empty, wrong_type, too_long |
```

**Sources:**
- **header**: Authorization, Content-Type, custom headers
- **path**: URL parameters (`:id`, `:slug`)
- **query**: Query string filters, pagination
- **body**: Request payload fields

### Phase 3: Map When (Method + Path)

Each scenario has exactly ONE action:

```
When [METHOD] [/path/to/resource]
```

Examples:
- `When GET /v1/connectors`
- `When POST /v1/connectors`
- `When GET /v1/connectors/{id}`
- `When DELETE /v1/connectors/{id}`

### Phase 4: Define Then (Response Contract)

Specify expected response object. Response varies based on pre-conditions:

```gherkin
Then status [code]
And response.[field] is [type]
And response.[field] equals [value]
And response.[field] in [array of valid values]
And response does NOT include [sensitive_field]
```

**Response Schema Template:**

```typescript
// Success response
{
  data: {
    type: string,
    id: UUID,
    attributes: { ... }
  },
  meta?: { count: number }
}

// Error response
{
  error: {
    code: "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION_ERROR",
    message: string
  }
}
```

### Phase 5: Write Gherkin Scenarios (G#N)

For each method+path, write scenarios covering all pre-condition combinations:

```gherkin
Feature: [Resource] API

  @G#1
  Scenario: G#1.1 - [Method] [path] - happy path
    Given Authorization header is "Bearer valid_token"
    And [pre-condition 1]
    And [pre-condition 2]
    When [METHOD] [/path]
    Then status 200
    And response.data.id is UUID
    And response.data.attributes.[field] is [type]

  @G#2
  Scenario: G#1.2 - [Method] [path] - missing auth
    Given no Authorization header
    When [METHOD] [/path]
    Then status 401
    And response.error.code equals "UNAUTHORIZED"

  @G#3
  Scenario: G#1.3 - [Method] [path] - not found
    Given Authorization header is "Bearer valid_token"
    And id is "non_existing_uuid"
    When [METHOD] [/path/{id}]
    Then status 404
    And response.error.code equals "NOT_FOUND"
```

**Numbering Convention:**
- `G#N` = Feature-level ID (G#1, G#2...)
- `G#N.M` = Scenario within feature (G#1.1, G#1.2...)
- Use `@G#N` tag for traceability

**Coverage Matrix per Endpoint:**

| Method | Required Scenarios |
|--------|-------------------|
| GET (list) | Valid, filtered, paginated, empty, unauthorized |
| GET (detail) | Found, not found, deleted, unauthorized, malformed ID |
| POST | Valid, each validation error, conflict, unauthorized |
| PUT/PATCH | Valid, partial, not found, conflict, unauthorized |
| DELETE | Success, not found, unauthorized, cascade |

### Phase 6: Build-time Static Scenarios (G#N)

For build-time generated data, write scenarios verifying the build script:

**Pre-conditions for Build Scripts:**

| Parameter | Type | Possible Values |
|-----------|------|-----------------|
| Source file exists | boolean | true, false |
| Source file valid | boolean | valid structure, malformed |
| Metadata complete | boolean | all fields, partial, missing |
| Export type | enum | default, named, none |

**Template:**

```gherkin
Feature: [Resource] Build Extraction

  @G#N
  Scenario: G#N.1 - Extract [resource] with complete metadata
    Given [source file] exists at [path]
    And [source file] has valid [structure]
    And [metadata fields] are documented
    When build script runs
    Then [output.json] includes [resource] entry
    And entry has [required fields]

  @G#N
  Scenario: G#N.2 - Skip internal/private [resources]
    Given [source file] has underscore prefix
    When build script runs
    Then [output.json] does NOT include entry

  @G#N
  Scenario: G#N.3 - Handle missing optional fields
    Given [source file] exists
    And [optional field] is not documented
    When build script runs
    Then entry has [optional field] as null
```

**Coverage Matrix for Build Scripts:**

| Source Type | Required Scenarios |
|-------------|-------------------|
| Component | Extract props, extract examples, skip internal, handle missing docs |
| Chart | Extract config schema, extract data schema, extract examples |
| Docs | Parse MDX, extract frontmatter, build navigation |
| Search Index | Index all sources, handle empty content, validate structure |

### Phase 7: Middleware/Routing Scenarios (G#N)

For middleware and routing logic:

**Pre-conditions:**

| Parameter | Type | Possible Values |
|-----------|------|-----------------|
| Host header | string | subdomain variants, main domain, unknown |
| Path | string | valid routes, invalid routes |
| Auth state | enum | authenticated, unauthenticated |

**Template:**

```gherkin
Feature: Hostname Routing

  @G#N
  Scenario: G#N.1 - Route [subdomain] to [target]
    Given Host header is "[subdomain].domain.com"
    And path is "[path]"
    When request arrives at middleware
    Then rewrite to [target route group]
    And [skip/require] authentication

  @G#N
  Scenario: G#N.2 - Unknown subdomain redirect
    Given Host header is "unknown.domain.com"
    When request arrives at middleware
    Then redirect to [default domain]
```

### Phase 8: Frontend QA (Acceptance Criteria - AC#N)

For each UI component/screen, define **numbered** testable criteria using AC#N format:

| ID | Screen | Criteria | Test Method | Priority |
|----|--------|----------|-------------|----------|
| AC#1 | [Component] | Renders without error | Storybook | P0 |
| AC#2 | [Component] | Displays loading state | Storybook | P0 |
| AC#3 | [Component] | Displays error state with retry | Storybook | P0 |
| AC#4 | [Component] | Displays empty state with CTA | Storybook | P1 |
| AC#5 | [Component] | Keyboard navigation works | Browser MCP | P1 |
| AC#6 | [Component] | Screen reader accessible | Manual | P1 |
| AC#7 | [Component] | Mobile responsive | Browser MCP | P2 |

**Numbering Rules:**
- Use sequential IDs: AC#1, AC#2, AC#3...
- IDs are feature-scoped (reset for each feature)
- Include ID in first column for traceability

**Data Source Mapping for AC:**
Each AC must indicate which data source it consumes:

| ID | Screen | Criteria | Data Source | Priority |
|----|--------|----------|-------------|----------|
| AC#1 | ConnectorsList | Renders list | API: /public/connectors | P0 |
| AC#2 | ComponentsList | Renders list | Static: /components.json | P0 |

**State Coverage:**

| State | Required Tests |
|-------|---------------|
| Initial | Default render, correct layout |
| Loading | Skeleton/spinner visible, no interaction |
| Success | Data displayed correctly, actions enabled |
| Error | Error message visible, retry available |
| Empty | Empty message visible, CTA available |

### Phase 9: Integration Points

Identify cross-cutting concerns:

| Concern | Test Approach |
|---------|---------------|
| Auth token handling | Gherkin: expired token, refresh flow |
| Optimistic updates | Frontend: show immediate, rollback on error |
| Cache invalidation | Frontend: data refreshes after mutation |
| Error boundaries | Frontend: component failure doesn't crash app |

### Phase 10: Coverage Summary

```markdown
## Coverage Summary

### Data Sources
| Category | Count | Items |
|----------|-------|-------|
| Runtime APIs | [N] | [list endpoints] |
| Build-time Static | [N] | [list outputs] |
| Middleware | [N] | [list routes] |
| Database | [N] | [list queries] |
| External APIs | [N] | [list services] |
| **Total** | [N] | |

### Gherkin Scenarios
| Category | Count | IDs |
|----------|-------|-----|
| API scenarios | [N] | G#1 - G#[N] |
| Build scenarios | [N] | G#[N] - G#[M] |
| Middleware scenarios | [N] | G#[M] - G#[P] |
| **Total** | [N] | |

### Frontend Acceptance
| Category | Count | IDs |
|----------|-------|-----|
| Acceptance criteria | [N] | AC#1 - AC#[N] |

### Validation Checklist
- [ ] Every data source has at least 1 G#N scenario
- [ ] Every AC#N maps to a data source
- [ ] All error cases covered (401, 404, 400, 500)
- [ ] Build scripts have extraction + skip + missing scenarios
- [ ] Middleware has all subdomain variants
```

### Phase 11: Artifact Validation (Poka-Yoke)

Before Gate transition, validate artifacts silently. Only show output if validation fails.

#### Gate 1 Validation (DIVERGE -> CONVERGE)

Check:
- [ ] All wireframes have status (OK/KO/DIG, or no comment = OK)
- [ ] No orphan references (#{N} mentioned but not defined)
- [ ] At least 1 wireframe validated (OK)

#### Gate 2 Validation (CONVERGE -> PLAN)

Check:
- [ ] QA Contract has at least 1 G#N (Gherkin scenario)
- [ ] QA Contract has at least 1 AC#N (acceptance criteria)
- [ ] Each phase has at least 1 commit planned
- [ ] No circular dependencies in phasing order
- [ ] All G#N and AC#N are assigned to phases

#### Validation Output

**If all pass:** (silent, no output - proceed normally)

**If validation fails:**

```
R | [Feature] | VALIDATION ERROR
---
Cannot proceed to [NEXT_PHASE]:
- [Missing: wireframe #4 has no status]
- [Missing: QA Contract needs at least 1 G#N]

Fix: [Specific action to resolve]
```

#### Integration

This validation runs automatically before:
- Gate 1 presentation (ask.mdc Phase 1 - DIVERGE)
- Gate 2 presentation (ask.mdc Phase 2 - CONVERGE)

## Output Format: QA Contract

```markdown
## QA Contract: [Feature Name]

### Data Source Inventory

#### Runtime APIs
| Endpoint | Method | Auth | Resource | Status |
|----------|--------|------|----------|--------|
| `/v1/resource` | GET | Yes | Resource | Existing |
| `/public/resource` | GET | No | Resource | New |

#### Build-time Static
| Output Path | Source | Generator |
|-------------|--------|-----------|
| `/components.json` | Codebase | Build script |

#### Middleware
| Route Pattern | Behavior |
|---------------|----------|
| `developers.*` | Rewrite to public, skip auth |

---

### API Scenarios (G#1 - G#N)

#### G#1: [METHOD] [/path] ([Resource])

**Pre-conditions:**

| Parameter | Type | Possible Values |
|-----------|------|-----------------|
| `Authorization` | header | valid_token, invalid_token, missing |
| `id` | path | existing, non_existing, malformed |

**Scenarios:**

| ID | Given | When | Then |
|----|-------|------|------|
| G#1.1 | valid token | GET /path | 200, data array |
| G#1.2 | invalid token | GET /path | 401, UNAUTHORIZED |

---

### Build Scenarios (G#N - G#M)

#### G#N: [Resource] Extraction

**Pre-conditions:**

| Parameter | Type | Possible Values |
|-----------|------|-----------------|
| Source exists | boolean | true, false |
| Metadata complete | boolean | complete, partial |

**Scenarios:**

| ID | Given | When | Then |
|----|-------|------|------|
| G#N.1 | source exists, complete | Build runs | output.json includes entry |
| G#N.2 | internal file (underscore) | Build runs | output.json excludes entry |

---

### Middleware Scenarios (G#M - G#P)

#### G#M: Hostname Routing

| ID | Given (Host) | Given (Path) | Then |
|----|--------------|--------------|------|
| G#M.1 | developers.domain.com | /connectors | Rewrite to /(public), skip auth |
| G#M.2 | app.domain.com | /settings/* | Route to /(app), require auth |

---

### Response Schemas

```typescript
// Success
{ data: { type, id, attributes }, meta: { count } }

// Error
{ error: { code, message } }

// Static file
{ data: [{ slug, name, ... }], meta: { count } }
```

---

### Frontend Acceptance Criteria

| ID | Screen | Criteria | Data Source | Priority |
|----|--------|----------|-------------|----------|
| AC#1 | [Component] | Renders list | API: /public/x | P0 |
| AC#2 | [Component] | Renders from static | Static: /x.json | P0 |

---

### Coverage Summary

| Category | Count | IDs |
|----------|-------|-----|
| Runtime APIs | [N] | G#1 - G#[N] |
| Build Scripts | [N] | G#[N] - G#[M] |
| Middleware | [N] | G#[M] - G#[P] |
| Acceptance Criteria | [N] | AC#1 - AC#[N] |
| **Total Scenarios** | [N] | |

### Validation
- [ ] Every data source has ≥1 G#N
- [ ] Every AC#N maps to data source
- [ ] Error cases covered (401, 404, 400)
```

## Consuming the QA Contract

This QA Contract is used by:
- **Plan Mode**: Maps G#N and AC#N to commits via "Satisfies" field
- **qa-commit skill**: Verifies implementation against assigned criteria
- **test-hardening skill**: Converts passed criteria to automated tests

## Invocation

Invoke manually with "use qa-planning skill" or follow Ask mode Phase 2 (CONVERGE) which references this skill.

## Related Skills

- `state-machine` - Defines states that need testing
- `bpmn-workflow` - Uses Gherkin scenarios for process documentation
- `qa-commit` - Verifies implementation against QA Contract
- `test-hardening` - Converts passed scenarios to automated tests
