---
name: notion-sync
description: Standardize Notion task updates across all modes
---

# Notion Sync Skill

Standardize how Notion tasks are updated across all modes.

## When to Use
- Push PR mode: update PR link and append plan
- Init mode: update branch name
- Any mode updating task status
- Appending content to task pages

## Phases

### Phase 1: Retrieve Task Page

Fetch current task state:

```
API-retrieve-a-page:
  page_id: [task-page-id]
```

Verify the page exists and note current field values.

### Phase 2: Update Standard Fields

Update properties based on context:

**Available fields:**

| Field | Type | When to Update |
|-------|------|----------------|
| Github PR link | url | On PR creation |
| Branch name | rich_text | On branch creation |
| Lifecycle/Status | select | On state changes |

**API call:**
```
API-patch-page:
  page_id: [task-page-id]
  properties:
    "Github PR link": { url: "[PR-URL]" }
    "Branch name": { rich_text: [{ text: { content: "[branch-name]" }}]}
```

### Phase 3: Append Content (Optional)

If content needs to be added to the page body:

**Get existing blocks:**
```
API-get-block-children:
  block_id: [page-id]
```

**Append new content:**
```
API-patch-block-children:
  block_id: [page-id]
  children: [
    {
      "type": "heading_2",
      "heading_2": { "rich_text": [{ "text": { "content": "Implementation Plan" }}]}
    },
    {
      "type": "paragraph",
      "paragraph": { "rich_text": [{ "text": { "content": "[plan-content]" }}]}
    }
  ]
```

**Content types to append:**
- Implementation plans (from Plan mode)
- PR summaries (from Push PR mode)
- Status updates

### Phase 4: Confirm Sync

Verify the update was successful:

```
API-retrieve-a-page:
  page_id: [task-page-id]
```

Check that updated fields reflect new values.

---

## Phase 5: Session Journal Sync (NEW)

Sync session metrics and decisions to Session Journal database.

### When to Run

- After PR is created (via push-pr.mdc)
- On manual "sync session" command
- On session abandon

### 5.1: Gather Session Data

Collect from `session-status` skill:
- Duration, loops, rework, waiting, RED count, escalations

Collect from `decision-capture` skill:
- Decisions made this session (KO, significant OK)
- Learnings captured (Kaizen/Hansei)

### 5.2: Check for Existing Session

```
Notion MCP: API-post-search
  query: "[branch-name]"
  filter:
    property: "object"
    value: "page"
  sort:
    property: "last_edited_time"
    direction: "descending"
```

### 5.3: Create or Update Session Page

**If new session:**
```
Notion MCP: API-post-page
  parent: { database_id: "[SESSION_JOURNAL_DB_ID]" }
  properties:
    Title: { title: [{ text: { content: "[Feature] - [Date]" }}]}
    Task: { relation: [{ id: "[kanban_task_id]" }]}
    Date: { date: { start: "[session_date]" }}
    Duration: { number: [total_minutes] }
    Phase Reached: { select: { name: "[phase]" }}
    Outcome: { select: { name: "[outcome]" }}
    Loops: { number: [total_loops] }
    Rework: { number: [rework_count] }
    Waiting: { number: [waiting_minutes] }
    RED Count: { number: [red_count] }
    Escalations: { number: [escalation_count] }
    Branch: { rich_text: [{ text: { content: "[branch-name]" }}]}
```

**If existing session:**
```
Notion MCP: API-patch-page
  page_id: [existing_page_id]
  properties:
    Duration: { number: [updated_minutes] }
    Phase Reached: { select: { name: "[latest_phase]" }}
    Outcome: { select: { name: "[outcome]" }}
    Loops: { number: [updated_loops] }
    ... (other updated metrics)
```

### 5.4: Append Decisions and Learnings

```
Notion MCP: API-patch-block-children
  block_id: [session_page_id]
  children:
    - type: heading_2
      heading_2: { rich_text: [{ text: { content: "Decisions" }}]}
    - type: bulleted_list_item
      bulleted_list_item: { rich_text: [{ text: { content: "[KO] [decision 1] - [rationale]" }}]}
    - type: bulleted_list_item
      bulleted_list_item: { rich_text: [{ text: { content: "[OK] [decision 2] - [rationale]" }}]}
    - type: heading_2
      heading_2: { rich_text: [{ text: { content: "Learnings" }}]}
    - type: bulleted_list_item
      bulleted_list_item: { rich_text: [{ text: { content: "[Kaizen] [learning 1]" }}]}
    - type: bulleted_list_item
      bulleted_list_item: { rich_text: [{ text: { content: "[Hansei] [learning 2]" }}]}
```

### 5.5: Link to Kanban Task

```
Notion MCP: API-patch-page
  page_id: [kanban_task_id]
  properties:
    Session Journal: { relation: [{ id: "[session_page_id]" }]}
```

### 5.6: Create ADR for High-Impact Decisions

If any decision has Impact = HIGH:
1. Create ADR file in `/docs/decisions/`
2. Link ADR URL in Session Journal page

### Session Journal Output

```markdown
## Session Journal Synced

**Session:** [Feature] - [Date]
**Page:** [Notion URL]
**Kanban:** Linked to [Task name]

### Metrics Recorded
- Duration: [N]min
- Loops: [N]
- Rework: [N]
- RED Count: [N]
- Escalations: [N]

### Decisions: [N] captured
### Learnings: [N] captured
[If ADR: ADR-[NNN] created]

**Status:** Sync successful
```

---

## Output

Present sync summary:

```
## Notion Sync Complete

**Task:** [task-title]
**Page ID:** [page-id]

### Updates Applied
- ✅ Github PR link: [url]
- ✅ Branch name: [branch]
- ✅ Content appended: [description]

**Status:** Sync successful
```

---

## Standard Field Reference

**Staffing Database ID:** `256c4d5e-7bea-80ca-ba8d-c0ba0bb881c6`

**Common Properties:**
- `Github PR link` (url) - Link to GitHub PR
- `Branch name` (rich_text) - Git branch name
- `Lifecycle` or `Status` (select) - Task state
- `Assignee` (people) - Task owner
- `Sprint` (relation) - Sprint association

---

## Integration

This skill is invoked by:
- `push-pr.mdc` - Phase 2.2 (Sync Notion) + Phase 4 (Session Journal)
- `init.mdc` - Update branch name
- Any mode needing Notion updates
- Manual "sync session" command

**Notion MCP Tools:**
- `API-retrieve-a-page` - Get task details
- `API-get-block-children` - Get page content
- `API-patch-page` - Update page properties
- `API-patch-block-children` - Add content to page
- `API-post-page` - Create new session entries
- `API-post-search` - Find existing sessions by branch
