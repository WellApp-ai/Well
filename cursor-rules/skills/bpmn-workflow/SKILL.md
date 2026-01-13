---
name: bpmn-workflow
description: Generate and maintain BPMN 2.0 diagrams linked to Gherkin scenarios
---

# BPMN Workflow Skill

Generate BPMN 2.0 process diagrams from feature specifications, link them to Gherkin scenarios, and compose a system-wide workflow diagram.

## When to Use

- After completing Ask mode (feature exploration) to visualize the flow
- When documenting system processes for stakeholders
- Before Plan mode to ensure all scenarios are captured
- When updating existing features with new scenarios

## Prerequisites

- Feature has been explored in Ask mode with wireframes
- User flows have been identified
- API endpoints (if any) have been specified

## Instructions

### Phase 1: Gather Feature Context

**Step 1.1: Check for existing .feature files**

```
Glob docs/bpmn/features/**/*.feature
```

If found, parse existing scenarios:
```
CallMcpTool:
  server: "bpmn-mcp"
  toolName: "read-feature"
  arguments: { "featurePath": "docs/bpmn/features/{feature-id}/{feature-id}.feature" }
```

**Step 1.2: If no .feature file exists, generate scenarios from:**

- Ask mode wireframes (each screen = potential scenario)
- User flow descriptions
- API endpoints defined (CRUD operations = scenarios)
- Edge cases identified (error states, empty states)

### Phase 2: Generate Gherkin (if needed)

If generating new scenarios, structure them as:

```gherkin
Feature: [Feature Name]
  As a [user type]
  I want to [action]
  So that [benefit]

  Scenario: [Happy path name]
    Given [precondition]
    When [action]
    Then [expected result]

  Scenario: [Error case name]
    Given [precondition]
    When [invalid action]
    Then [error handling]
```

**Scenario naming conventions:**
- Happy path: `Successful [action]`, `[Action] completes`
- Validation: `[Action] with invalid [field]`
- Error: `[Action] when [error condition]`
- Edge: `[Action] with [edge case]`

### Phase 3: Generate BPMN

Call the generate-bpmn MCP tool:

```
CallMcpTool:
  server: "bpmn-mcp"
  toolName: "generate-bpmn"
  arguments: {
    "featureId": "{feature-id}",
    "featureName": "{Feature Name}",
    "scenarios": [
      {
        "id": "{scenario-id}",
        "name": "{Scenario Name}",
        "steps": [
          { "keyword": "Given", "text": "{step text}" },
          { "keyword": "When", "text": "{step text}" },
          { "keyword": "Then", "text": "{step text}" }
        ]
      }
    ],
    "outputPath": "docs/bpmn/features/{feature-id}/{feature-id}.bpmn"
  }
```

### Phase 4: Create Manifest Link

Link BPMN elements to Gherkin scenarios:

```
CallMcpTool:
  server: "bpmn-mcp"
  toolName: "link-gherkin"
  arguments: {
    "featureId": "{feature-id}",
    "featureName": "{Feature Name}",
    "bpmnFile": "docs/bpmn/features/{feature-id}/{feature-id}.bpmn",
    "featureFile": "docs/bpmn/features/{feature-id}/{feature-id}.feature"
  }
```

This creates `docs/bpmn/features/{feature-id}/manifest.json` with traceability links.

### Phase 5: Compose System Diagram

Update the master system diagram:

```
CallMcpTool:
  server: "bpmn-mcp"
  toolName: "compose-system"
  arguments: {
    "systemName": "Well Platform",
    "featuresDir": "docs/bpmn/features",
    "outputPath": "docs/bpmn/system.bpmn"
  }
```

## Output Format

After completing all phases, present:

```markdown
## BPMN Workflow Generated

### Files Created/Updated

| File | Status | Description |
|------|--------|-------------|
| `docs/bpmn/features/{id}/{id}.feature` | Created/Updated | [N] scenarios |
| `docs/bpmn/features/{id}/{id}.bpmn` | Created | Process diagram |
| `docs/bpmn/features/{id}/manifest.json` | Created | [N] links |
| `docs/bpmn/system.bpmn` | Updated | Added {Feature Name} pool |

### Scenarios Mapped

| Scenario | BPMN Element | Steps |
|----------|--------------|-------|
| [Name] | Task_{id} | [N] |

### System Diagram

[ASCII representation of system pools]

┌─────────────────┐     ┌─────────────────┐
│  Auth           │────▶│  Workspaces     │
│  • Login        │     │  • Create       │
│  • Register     │     │  • Switch       │
└─────────────────┘     └─────────────────┘
```

## BPMN Element Mapping

| Gherkin Concept | BPMN Element |
|-----------------|--------------|
| Scenario | UserTask |
| Given steps | Documentation (preconditions) |
| When steps | Documentation (action) |
| Then steps | Documentation (expected) |
| Feature | Process |
| Background | Subprocess (shared) |

## Storage Structure

```
docs/bpmn/
├── README.md                    # Documentation
├── system.bpmn                  # Master system diagram
└── features/
    └── {feature-id}/
        ├── {feature-id}.bpmn    # Feature process diagram
        ├── {feature-id}.feature # Gherkin scenarios
        └── manifest.json        # BPMN ↔ Gherkin links
```

## Related Skills

- **problem-framing** - Defines the problem before BPMN generation
- **competitor-scan** - Research how competitors document workflows
- **design-context** - Ensures BPMN aligns with existing patterns

## Troubleshooting

**No MCP server available:**
- Ensure bpmn-mcp is configured in `.cursor/mcp.json`
- Check that `@wellapp/bpmn` package is built

**Invalid BPMN generated:**
- Validate with `validate-bpmn` tool
- Check scenario IDs are unique
- Ensure step keywords are valid (Given/When/Then/And/But)

**Manifest links broken:**
- Re-run `link-gherkin` after updating scenarios
- Ensure scenario IDs match between .feature and manifest
