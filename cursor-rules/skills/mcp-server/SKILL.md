---
name: mcp-server
description: Guide for creating new MCP server integrations
---

# MCP Server Creation Guide

Use this skill when creating a new MCP server integration.

## MCP Folder Structure

MCPs live in: `~/.cursor/projects/<project>/mcps/<server-name>/`

```
mcps/
├── user-notion/
│   └── tools/
│       ├── API-retrieve-a-page.json
│       └── ...
├── cursor-ide-browser/
│   └── tools/
│       ├── browser_navigate.json
│       └── ...
└── user-n8n-mcp/
    └── tools/
        └── ...
```

## Tool Descriptor Format

Each tool is a JSON file:

```json
{
  "name": "tool-name",
  "description": "What this tool does",
  "arguments": {
    "type": "object",
    "properties": {
      "param1": { "type": "string", "description": "..." }
    },
    "required": ["param1"]
  }
}
```

## Usage Pattern

1. Read tool descriptor before calling
2. Use `CallMcpTool` with server, toolName, arguments
3. Handle response appropriately

## Example Call

```
CallMcpTool:
  server: "user-notion"
  toolName: "API-retrieve-a-page"
  arguments: { "page_id": "abc123" }
```

## Existing MCPs Reference

| MCP | Capabilities |
|-----|--------------|
| **user-notion** | Page/block CRUD, search, comments |
| **cursor-ide-browser** | Navigation, clicks, screenshots, console |
| **user-n8n-mcp** | Workflow search, details, execution |
| **user-context7** | Library docs lookup |
| **figma** | Design specs, code generation from frames |

## Creating a New MCP

1. Create folder: `mcps/<server-name>/tools/`
2. Add tool descriptors as JSON files
3. Configure server in `~/.cursor/mcp.json`
4. Restart Cursor (Cmd+Shift+P > "Reload Window")
5. Test with `CallMcpTool`

## Authentication Patterns

### Pattern 1: API Token (env block)

For MCPs that use API keys (Notion, n8n):

```json
"mcp-name": {
  "command": "npx",
  "args": ["-y", "@package/mcp-server"],
  "env": {
    "API_KEY": "your-token-here"
  }
}
```

### Pattern 2: URL-based (no auth)

For MCPs that connect to local servers (Figma desktop):

```json
"mcp-name": {
  "url": "http://127.0.0.1:PORT/mcp"
}
```

### Pattern 3: OAuth (remote URL)

For MCPs that use browser OAuth (Figma remote):

```json
"mcp-name": {
  "url": "https://service.com/mcp"
}
```

After adding, click "Connect" in Cursor MCP settings to authorize.

## Troubleshooting

**Installation loops infinitely:**
- Cancel and manually edit `~/.cursor/mcp.json`
- Add config block directly, then restart Cursor

**MCP not appearing:**
- Check JSON syntax is valid
- Verify package name is correct
- Restart Cursor after changes

## Best Practices

- Always read tool schema before calling
- Handle errors gracefully
- Use descriptive tool names
- Document required vs optional parameters
