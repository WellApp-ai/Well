---
name: slack-announce
description: Generate formatted Slack messages for team communication
---

# Slack Announce Skill

Generate copy-ready Slack messages for various team announcements.

## When to Use
- Push PR mode: announce new PR
- Hotfix mode: urgent fix notification
- Deploy notifications
- Incident communication

## Phases

### Phase 1: Determine Message Type

Identify the type of announcement:

| Type | Context | Priority |
|------|---------|----------|
| `pr` | New PR created | Normal |
| `hotfix` | Urgent production fix | High |
| `deploy` | Deployment to environment | Normal |
| `incident` | Production issue | Critical |

### Phase 2: Gather Context

Collect required information based on type:

**For PR:**
- Feature name (from branch or PR title)
- PR URL
- Notion task URL
- Reviewer name and handle
- Domain name

**For Hotfix:**
- Issue description
- Affected systems
- PR URL (if applicable)
- Urgency level

**For Deploy:**
- Version/tag
- Environment (test/production)
- Key changes summary

### Phase 3: Select Emoji

**By message type:**

| Type | Primary Emoji | Secondary Emojis |
|------|---------------|------------------|
| pr (feat) | 🚀 | 📋 🔗 👀 |
| pr (fix) | 🔧 | 📋 🔗 👀 |
| pr (chore) | 🧹 | 📋 🔗 👀 |
| pr (docs) | 📚 | 📋 🔗 👀 |
| pr (refactor) | ♻️ | 📋 🔗 👀 |
| hotfix | ⚠️ | 🔥 🚨 |
| deploy | ✅ | 🎉 📦 |
| incident | 🚨 | ⚠️ 🔴 |

### Phase 4: Generate Fun Closing

Select a closing that matches the **PR context**. Be human, be fun, be relevant.

#### By PR Type

**Features (feat):**
```
- "Feature flag? Where we're going, we don't need feature flags 🚗"
- "Users asked, we delivered 📦"
- "Fresh code, hot off the keyboard! ⌨️🔥"
- "Time to make some bytes dance! 💃"
- "Let's gooooo! 🎸"
```

**Fixes (fix):**
```
- "Bug squashed. No insects were harmed 🐛✨"
- "It's not a bug, it was an undocumented feature 📝"
- "Another bug bites the dust 🎵"
- "Sleep well tonight, this one's fixed 😴"
```

**Refactors (refactor):**
```
- "Same same, but different, but still same 🔄"
- "If it ain't broke... refactor it anyway ♻️"
- "Deleting code is my love language 💕"
- "Less is more. Literally, we deleted stuff 🗑️"
```

**Chores (chore):**
```
- "The unglamorous work that makes the magic happen ✨"
- "Housekeeping complete, the codebase says thank you 🏠"
- "Ctrl+S, Ctrl+Ship! 🚢"
- "Another day, another deploy (hopefully) 🤞"
```

**Docs (docs):**
```
- "Future us will thank present us 📚"
- "Documentation: because tribal knowledge doesn't scale 🧠"
- "README? More like READ-ME-PLEASE 🙏"
```

#### By Domain (Contextual)

**Cursor Rules / AI Workflow:**
```
- "Teaching the AI new tricks! 🎓🤖"
- "The machines are learning... from us, for once 🧠"
- "The rules now have rules about rules 🤯"
- "25 skills walk into a codebase... 🚶‍♂️"
- "Now with 100% more patine (it's French, we're fancy) 🥐"
```

**Tables / Data:**
```
- "Rows and columns, living in harmony 📊"
- "Data goes in, insights come out 🔮"
```

**Auth / Security:**
```
- "Keeping the bad guys out since [current_year] 🔐"
- "Trust no one. Except this PR. Trust this PR 🤝"
```

**Payments / Billing:**
```
- "Making money moves 💰"
- "Cha-ching! 💵"
```

#### Generic (Fallback)

```
- "Shipping it before my coffee gets cold ☕"
- "May the code review gods be merciful 🙏"
- "Works on my machine™ 💻"
- "One small commit for dev, one giant leap for the product 🌙"
```

#### Hotfixes (Serious but Human)

```
- "On it! 🔥"
- "Fix incoming, hold tight! 🏃‍♂️"
- "Crisis averted. Coffee break earned ☕"
- "The bat-signal was answered 🦇"
```

#### Selection Logic

1. First, try **domain-specific** closing if domain is detected
2. Then, try **type-specific** closing based on commit type
3. Fall back to **generic** if no match
4. **Rotate** - don't repeat the same closing twice in a row

### Phase 5: Format Message

**PR Template:**
```
[emoji] **[Feature Name]**

[Two-liner: what this does + why it matters]

📋 Notion: [notion-link]
🔗 PR: [github-pr-link]
👀 Reviewer: @[handle] (auto-assigned from [domain])

[Fun closing]
```

**Hotfix Template:**
```
⚠️ **HOTFIX: [Issue Title]**

🔴 **Impact:** [affected systems/users]
🔧 **Fix:** [brief description]

🔗 PR: [github-pr-link]
👀 Reviewer: @[handle]

[Closing]
```

**Deploy Template:**
```
✅ **Deployed to [Environment]**

📦 Version: [tag/version]
📝 Changes:
- [bullet 1]
- [bullet 2]

🎉 Ship it!
```

---

## Output

Present the formatted message in a copyable code block:

```
## Slack Message (copy-ready)

[Formatted message here - ready to paste into Slack]
```

---

## Slack MCP Integration (Optional)

If Slack MCP is configured, messages can be sent automatically.

### Phase 6: Send via Slack MCP

**Prerequisites:**
- Slack MCP server installed and configured
- Bot token with `chat:write` scope
- Channel ID for announcements

**Send message:**
```
Slack MCP:
  tool: send_message
  arguments:
    channel: "[CHANNEL_ID]"
    text: "[formatted message from Phase 5]"
```

**Fallback:** If Slack MCP not available, output copy-ready message for manual posting.

### Setup Instructions

See `setup` skill Phase 9 for Slack MCP installation.

---

## Integration

This skill is invoked by:
- `push-pr.mdc` - Phase 3.1 (Announce)
- `pr-threshold` - When threshold crossed (optional notification)
- `hotfix/SKILL.md` - Urgent notification
- Deploy scripts (future)
