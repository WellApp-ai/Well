# 🔧 Customization Guide

This guide helps you adapt the Cursor Rules to your specific project and tech stack.

## Quick Customization Checklist

- [ ] Update `00-hard-rules.mdc` with your tech constraints
- [ ] Replace `01-web.mdc` with your frontend framework rules
- [ ] Replace `02-api.mdc` with your backend framework rules
- [ ] Configure `04-mcp-tools.mdc` with your MCP servers
- [ ] Remove unused skills from `skills/`
- [ ] Update team/project-specific references

---

## File-by-File Guide

### `00-hard-rules.mdc` — Inviolable Constraints

This is the most important file to customize. These rules are **always applied**.

#### TypeScript Section

Update for your TypeScript configuration:

```markdown
## TypeScript
- Strict mode enabled
- NO `any` type - use `unknown` or proper generics
- Run `npm run typecheck` before every commit
```

If you use a different type checker or command:

```markdown
## TypeScript
- Run `yarn tsc --noEmit` before every commit
```

#### Styling Section

Replace with your styling approach:

**Tailwind (default):**
```markdown
## Styling
- Tailwind utilities ONLY
- NO arbitrary values (`px-[13px]`) - use design tokens only
```

**CSS Modules:**
```markdown
## Styling
- CSS Modules for component styles
- Use design tokens from `styles/tokens.css`
```

**Styled Components:**
```markdown
## Styling
- Styled Components with theme tokens
- NO inline styles except for dynamic values
```

#### Component Size

Adjust thresholds for your codebase:

```markdown
## Component Size
- Target: <150 lines per component
- Warning: 150-200 lines
- Violation: >200 lines (MUST split)
```

#### API Integration

Update for your API patterns:

```markdown
## API Integration
- 3-layer pattern: ApiClient → Service → Query Hook
- Use `API_CONFIG.BASE_URL` from environment
- All API calls through `lib/api/` services
```

---

### `01-web.mdc` — Frontend Rules

Replace entirely based on your frontend stack.

#### Next.js (App Router)

Already configured for Next.js 15. Key sections:
- App Router patterns
- Server Components vs Client Components
- Data fetching patterns

#### React (Vite/CRA)

```markdown
# Web Rules (React + Vite)

## Routing
- Use React Router v6
- Lazy load route components

## State Management
- React Query for server state
- Zustand for client state
- NO Redux

## Component Patterns
- Function components only
- Custom hooks for logic extraction
```

#### Vue.js

```markdown
# Web Rules (Vue 3)

## Composition API
- Use `<script setup>` syntax
- Composables in `composables/` directory

## State Management
- Pinia for global state
- Vue Query for server state
```

---

### `02-api.mdc` — Backend Rules

Replace entirely based on your backend stack.

#### Express.js (default)

Already configured. Key sections:
- Route patterns
- Middleware organization
- Error handling

#### NestJS

```markdown
# API Rules (NestJS)

## Module Structure
- Feature modules in `src/modules/`
- Shared module for common providers

## Patterns
- Use decorators for validation
- DTOs with class-validator
- Repository pattern with TypeORM
```

#### FastAPI (Python)

```markdown
# API Rules (FastAPI)

## Structure
- Routers in `app/routers/`
- Models in `app/models/`
- Schemas in `app/schemas/`

## Patterns
- Pydantic for validation
- SQLAlchemy for ORM
- Dependency injection for services
```

---

### `04-mcp-tools.mdc` — MCP Configuration

Update with your actual MCP servers.

#### Remove Unused MCPs

If you don't use Notion:
```markdown
## Notion MCP
[Remove or comment out this section]
```

#### Add Your MCPs

```markdown
## Your Custom MCP

**Tools available:**
- `tool_name` - Description

**Usage:**
- When to use this MCP
- Example invocations
```

#### Common MCP Configurations

**GitHub Copilot:**
```markdown
## GitHub MCP
- Use for PR management
- Issue tracking integration
```

**Linear:**
```markdown
## Linear MCP
- Task management
- Sprint tracking
```

---

### Skills to Remove

Remove skills that don't apply to your workflow:

```bash
# Remove Notion-specific skills (if not using Notion)
rm -rf skills/notion-sync/
rm -rf skills/team-routing/

# Remove BPMN workflow (if not using process diagrams)
rm -rf skills/bpmn-workflow/

# Remove Slack announcements (if not using Slack)
rm -rf skills/slack-announce/

# Remove GTM alignment (if not tracking go-to-market)
rm -rf skills/gtm-alignment/
```

#### Core Skills (Keep These)

These skills work without external dependencies:

| Skill | Purpose |
|-------|---------|
| `problem-framing` | JTBD analysis |
| `qa-planning` | Generate QA Contract |
| `debug` | Systematic debugging |
| `pr-review` | Pre-commit validation |
| `qa-commit` | QA verification |
| `session-status` | Progress tracking |

---

## Project-Specific References

### Update Paths

Search and replace these patterns:

| Pattern | Replace With |
|---------|--------------|
| `apps/web/` | Your frontend path |
| `apps/api/` | Your backend path |
| `lib/queries/` | Your query hooks path |
| `components/ui/` | Your UI components path |

### Update Commands

Search for these commands and update:

| Default | Your Command |
|---------|--------------|
| `npm run typecheck` | Your typecheck command |
| `npm run lint` | Your lint command |
| `npm run test` | Your test command |
| `npm run dev` | Your dev command |

---

## Creating Custom Skills

Use the `skill-creator` skill or follow this template:

```markdown
---
name: my-custom-skill
description: What this skill does
---

# My Custom Skill

Brief description.

## When to Use

- Trigger condition 1
- Trigger condition 2

## Phases

### Phase 1: [Name]

- [ ] Step 1
- [ ] Step 2

### Phase 2: [Name]

- [ ] Step 1
- [ ] Step 2

## Output Format

\`\`\`markdown
## Skill Output

[Template]
\`\`\`
```

Save to `skills/my-custom-skill/SKILL.md`.

---

## Removing Features

### No Task Management Integration

Remove from `03-shared.mdc`:
- Notion references
- Task tracking sections

Remove skills:
- `notion-sync/`
- `team-routing/`

### No Browser Testing

Remove from `04-mcp-tools.mdc`:
- Browser MCP section

Update skills that reference Browser MCP:
- `competitor-scan/`
- `webapp-testing/`
- `debug/`

### Simpler Workflow (No Gates)

Modify `modes/ask.mdc`:
- Remove Gate 1 and Gate 2 sections
- Simplify to single-phase exploration

Modify `modes/plan.mdc`:
- Remove Gate 3
- Auto-proceed on tech decisions

---

## Validation After Customization

Run this checklist after customizing:

```bash
# Check all files are valid
find .cursor/rules -name "*.mdc" -exec head -1 {} \;

# Verify skill structure
ls .cursor/rules/skills/*/SKILL.md

# Test with a simple command
# In Cursor: "init test feature"
```

---

## Getting Help

- Open an issue: https://github.com/WellApp-ai/Well/issues
- Check examples in `templates/` directory
