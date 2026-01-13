---
name: skill-creator
description: Template and guide for creating new skills
---

# Skill Creator

Use this skill to create new skills.

## SKILL.md Template

```yaml
---
name: your-skill-name
description: When to use this skill
---

# Skill Name

Brief description of what this skill does.

## When to Use
- Situation 1
- Situation 2

## Instructions
Step-by-step guide Claude follows.

## Examples
Concrete usage examples.

## Guidelines
- Best practice 1
- Best practice 2
```

## Skill vs Mode Decision

| Create a... | When... |
|-------------|---------|
| **Mode** | Triggered by user intent (workflow) |
| **Skill** | Invoked explicitly for capability |

**Examples:**
- "init feature" → Mode (workflow triggered by intent)
- "use webapp-testing" → Skill (capability invoked explicitly)

## File Location

- Modes: `.cursor/rules/modes/<name>.mdc`
- Skills: `.cursor/rules/skills/<name>/SKILL.md`

## Naming Conventions

- Use lowercase with hyphens: `my-skill-name`
- Be descriptive: `webapp-testing` not `test`
- Match the folder name to the skill name

## Required Sections

1. **YAML Frontmatter** - name and description
2. **Title** - Clear skill name
3. **When to Use** - Trigger conditions
4. **Instructions** - What Claude should do
5. **Examples** - Concrete usage

## Optional Sections

- Guidelines / Best Practices
- Common Issues / Troubleshooting
- Related Skills / Modes

## After Creating

1. Test the skill with explicit invocation: "use [skill-name] skill"
2. Document in team wiki if shared
3. Consider adding to Mode Detection if workflow-based

## Existing Skills

| Skill | Purpose |
|-------|---------|
| `mcp-server` | Create MCP integrations |
| `webapp-testing` | Browser/Storybook testing |
| `skill-creator` | Create new skills (this one) |
