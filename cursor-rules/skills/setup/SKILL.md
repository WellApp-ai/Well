---
name: setup
description: One-time environment setup for new team members
---

# Environment Setup Skill

Use this skill for first-time setup of your development environment.

## Phase 1: Core Development Tools

Verify these are installed:
- [ ] Cursor IDE (latest version)
- [ ] GitHub Desktop
- [ ] Docker
- [ ] TablePlus (database GUI)
- [ ] Figma Desktop App - https://www.figma.com/downloads/
- [ ] Screen.studio (optional, for demos)
- [ ] Google Cloud SDK (only for admins)

## Phase 2: Repository Setup

1. Clone the repository
2. Run `npm install` in monorepo root
3. Start Docker: `docker-compose up -d`
4. Run migrations: `npm run migrate`
5. Seed database: `npm run seed`

## Phase 2.5: Pattern Resources Orientation

Familiarize yourself with design resources:

1. Read `/docs/pattern-resources.md` - External UI/UX references
2. Read `/docs/design-system/` folder - Internal tokens and guidelines
3. Bookmark key competitor sites for your domain:
   - [Mobbin](https://mobbin.com/) - Real app screenshots
   - [Page Flows](https://pageflows.com/) - User flow recordings
   - [Refactoring UI](https://www.refactoringui.com/) - Visual design principles

## Phase 3: Environment Configuration

1. Copy `.env.example` to `.env` in:
   - `apps/api/.env`
   - `apps/web/.env`
2. Configure required variables

## Phase 4: MCP Configuration

### Installation Method: Manual (Recommended)

Cursor's UI auto-install can loop indefinitely. **Edit `~/.cursor/mcp.json` directly.**

### Complete mcp.json Template

Copy this to `~/.cursor/mcp.json` and replace `YOUR_*` placeholders:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer YOUR_NOTION_TOKEN\", \"Notion-Version\": \"2022-06-28\"}"
      }
    },
    "n8n-mcp": {
      "command": "npx",
      "args": ["-y", "supergateway", "--streamableHttp", "YOUR_N8N_URL/mcp-server/http", "--header", "authorization:Bearer YOUR_N8N_TOKEN"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "figma": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

### Authentication by MCP

| MCP | Auth Type | How to Get Token |
|-----|-----------|------------------|
| Notion | API Token | notion.so/my-integrations > New integration > Copy token |
| n8n | Bearer Token | n8n instance > Settings > API > Create key |
| Context7 | None | Just works |
| Figma Desktop | None | Enable in Figma app Dev Mode (Shift+D) |
| Figma Remote | OAuth | Use `"url": "https://mcp.figma.com/mcp"`, click Connect in Cursor |
| Browser | None | Built-in to Cursor |

### Browser MCP (Built-in)

Browser MCP is built into Cursor and requires no setup. Use it for:
- Taking screenshots of competitor apps during DIVERGE phase
- Testing Storybook stories
- E2E workflow verification

**Tip**: During feature exploration, navigate to competitor apps and use `browser_take_screenshot` to capture reference designs.

### Troubleshooting

**MCP won't install (infinite loop):**
1. Cancel the operation (Cmd+C or close dialog)
2. Manually edit `~/.cursor/mcp.json`
3. Add the config block directly
4. Restart Cursor: Cmd+Shift+P > "Reload Window"

**MCP shows disconnected:**
1. Verify JSON syntax is valid (use jsonlint.com)
2. Check token is correct and not expired
3. For Figma: ensure desktop app is running with MCP enabled

**Verification:**
After restart, list MCP folder to confirm all servers loaded:
```bash
ls ~/.cursor/projects/*/mcps/
```

## Phase 5: Cursor Settings

Configure in Cursor Settings:
- Model: Claude Opus 4.5
- Auto mode: Disabled
- Completion sounds: Enabled
- Usage summary: Always

## Phase 6: Verification

Run these to verify setup:
- [ ] `npm run dev` - starts without errors
- [ ] `npm run typecheck` - passes
- [ ] `npm run storybook` - loads components

## Completion

When all phases complete, you're ready to use:
- `init [Notion URL]` - Start a new feature
- `plan [feature]` - Create implementation plan
