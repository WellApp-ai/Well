---
name: design-context
description: Refresh UI/UX context from design system, Storybook, and codebase
---

# Design Context Skill

Ensures wireframes and UI decisions leverage existing patterns from the design system, Storybook, and codebase.

## When to Use

- Before presenting wireframes (Ask mode DIVERGE)
- Before implementing UI changes (Agent mode)
- At every DIVERGE Loop to stay grounded in existing patterns

## Instructions

### Phase 1: Design System Check

Read the design system documentation:

```
Read /docs/design-system/components.md
Read /docs/design-system/spacing.md
Read /docs/design-system/colors.md (if color decisions needed)
Read /docs/design-system/interactions.md (if interaction patterns needed)
```

**Note applicable:**
- Design tokens (`h-13`, `px-4`, `gap-3`)
- Component patterns (Button variants, DataTable, Dialog)
- Spacing conventions (p-4 for cards, gap-6 for sections)

### Phase 2: Storybook Patterns

Find existing component stories:

```
Glob **/*.stories.tsx
```

**Identify:**
- Components matching current wireframe needs
- Existing variants and props
- Documented states (loading, error, empty)

**Key story locations:**
- `/src/stories/` - General component stories
- `/features/*/components/*.stories.tsx` - Feature-specific stories

### Phase 3: Codebase Search

Search for similar UI patterns:

```
SemanticSearch "How is [pattern] implemented in the codebase?"
```

**Look for:**
- Similar features already built
- Reusable hooks and utilities
- Existing layout patterns

### Phase 4: Library Documentation (Context7 MCP)

Query library docs for unfamiliar patterns:

```
1. resolve-library-id with libraryName (e.g., "radix-ui")
2. query-docs with libraryId and specific question
```

**Common libraries:**
- `/radix-ui/primitives` - Dialog, Dropdown, Select patterns
- `/tanstack/query` - Data fetching patterns
- `/tanstack/table` - Table patterns

## Output Format

After running this skill, output:

```markdown
## Design Context

| Source | Relevant Patterns |
|--------|-------------------|
| Design System | [tokens, components] |
| Storybook | [stories that apply] |
| Codebase | [existing implementations] |
| Libraries | [patterns from docs] |

### Applicable Components
- [Component]: [How it applies to current wireframe]

### Design Tokens to Use
- Spacing: [tokens]
- Colors: [tokens]
- Typography: [tokens]
```

## Invocation

Invoke manually with "use design-context skill" or follow Ask mode DIVERGE loop which references this skill's phases.

## Related Skills

- `problem-framing` - Run before design-context
- `competitor-scan` - Compare with external patterns
