---
name: problem-framing
description: Frame problems using JTBD Job Stories, HMW questions, and persona validation
---

# Problem Framing Skill

Frame problems effectively using Jobs-to-be-Done, How Might We questions, and persona validation from Notion.

## When to Use

- At the start of DIVERGE loop (Ask mode)
- When exploring a new feature or problem space
- Before ideation to ensure clear problem definition

## Instructions

### Phase 1: Job Story Definition

Create a Job Story in this format:

```
When [situation/context],
I want to [motivation/action],
So I can [expected outcome/benefit].
```

**Example:**
```
When I'm managing multiple client workspaces,
I want to switch between them quickly,
So I can respond to urgent requests without losing context.
```

### Phase 2: How Might We (HMW) Question

Reframe the problem as an opportunity question:

```
How might we [opportunity that addresses the job story]?
```

**Guidelines:**
- Start broad, then narrow if needed
- Avoid suggesting solutions in the question
- Focus on the user's goal, not the feature

**Example:**
```
How might we help users navigate between workspaces seamlessly?
```

### Phase 3: Persona Lookup (Notion MCP)

Fetch relevant personas from Notion database:

1. **Search for personas database:**
   ```
   API-post-search with query "Personas" or "User Personas"
   ```

2. **Query the database:**
   ```
   API-query-data-source with database_id from search results
   ```

3. **Get persona details:**
   ```
   API-retrieve-a-page + API-get-block-children for each relevant persona
   ```

**Extract these fields:**
- Name
- Role / Job Title
- Goals (what they want to achieve)
- Pain Points (what frustrates them)
- Context (environment, constraints)

### Phase 4: Three Dimensions Check

Validate the problem addresses all three job dimensions:

| Dimension | Question | Example |
|-----------|----------|---------|
| **Functional** | What task are they completing? | "Switch between workspaces" |
| **Emotional** | How do they want to feel? | "In control, not overwhelmed" |
| **Social** | How do they want to be perceived? | "Responsive, professional" |

## Output Format

After running this skill, output:

```markdown
## Problem Framing

### Job Story
When [situation],
I want to [motivation],
So I can [outcome].

### How Might We
How might we [opportunity]?

### Relevant Personas

| Persona | Role | Goals | Pain Points |
|---------|------|-------|-------------|
| [Name] | [Role] | [Goals] | [Pain Points] |

### Three Dimensions

| Dimension | Definition |
|-----------|------------|
| Functional | [Task] |
| Emotional | [Feeling] |
| Social | [Perception] |
```

## Invocation

Invoke manually with "use problem-framing skill" or follow Ask mode DIVERGE loop which references this skill's phases.

## Related Skills

- `design-context` - Run after problem-framing
- `competitor-scan` - Research how others solve this problem
