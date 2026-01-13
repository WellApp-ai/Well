---
name: competitor-scan
description: Research best-in-class products using Browser MCP and WebSearch
---

# Competitor Scan Skill

Research how best-in-class products solve similar problems using Browser MCP for screenshots and WebSearch for teardowns.

## When to Use

- At the start of DIVERGE Loop (L1)
- When exploring new UI patterns
- When benchmarking against industry standards

## Instructions

### Phase 1: Identify Competitors

Use the domain competitor table:

| Domain | Products to Study |
|--------|-------------------|
| Workspaces/Collaboration | Notion, Linear, Slack, Figma, Attio |
| Data Tables | Airtable, Retool, Rows, Grist |
| AI Chat | ChatGPT, Claude, Gemini, Perplexity |
| Onboarding/Flows | Stripe, Plaid, Mercury, Ramp |
| Settings/Admin | Vercel, Railway, PlanetScale |
| Invitations/Team | Slack, Notion, Linear, Figma |
| Billing/Subscriptions | Stripe, Paddle, Chargebee |

### Phase 2: Screenshot Key Flows (Browser MCP)

For each relevant competitor:

```
1. browser_navigate to the product URL or relevant page
2. browser_snapshot to understand the page structure
3. browser_take_screenshot to capture the UI
4. browser_click / browser_type to navigate through flows
```

**Capture:**
- Entry points (how users start the flow)
- Key screens (main interactions)
- Edge cases (empty states, errors)
- Micro-interactions (hover states, transitions)

### Phase 3: Research Teardowns (WebSearch)

Search for existing analysis:

```
WebSearch "[Product] UI teardown [feature]"
WebSearch "[Product] UX case study [feature]"
WebSearch "[Feature] best practices design patterns"
```

### Phase 4: Extract Patterns

For each competitor, note:

| Aspect | Pattern |
|--------|---------|
| **Layout** | How is content organized? |
| **Navigation** | How do users move between states? |
| **Actions** | How are primary/secondary actions presented? |
| **Feedback** | How is success/error communicated? |
| **Copy** | What language/tone is used? |

## Output Format

After running this skill, output:

```markdown
## Competitor Scan

### Products Analyzed
1. [Product A] - [URL or feature]
2. [Product B] - [URL or feature]
3. [Product C] - [URL or feature]

### Key Patterns Observed

| Pattern | Product | Description |
|---------|---------|-------------|
| [Pattern] | [Product] | [How they do it] |

### Insights for Our Design
- [Insight 1]: [How to apply]
- [Insight 2]: [How to apply]

### Screenshots Captured
- [Description of screenshot 1]
- [Description of screenshot 2]
```

## Invocation

Invoke manually with "use competitor-scan skill" or follow Ask mode DIVERGE loop which references this skill's phases.

## Related Skills

- `problem-framing` - Define what problem to research
- `design-context` - Compare external patterns with internal
