# Client Setup

Configure Well MCP in your AI client.

## Claude Desktop

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Option A: Remote (OAuth)

1. Open **Claude Desktop** → **Settings** → **Connectors**
2. Click **Add custom connector**
3. Enter URL: `https://api.wellapp.ai/v1/mcp`
4. Click **Add** and log in with your Well account

### Option B: Local (API Key)

```json
{
  "mcpServers": {
    "well": {
      "command": "npx",
      "args": ["-y", "@wellapp/mcp"],
      "env": {
        "WELL_API_KEY": "YOUR_API_KEY",
        "WELL_API_URL": "https://api.wellapp.ai/v1"
      }
    }
  }
}
```

> Restart Claude Desktop after saving.

---

## Cursor

**Location:** `~/.cursor/mcp.json`

### Option A: Remote (OAuth)

```json
{
  "mcpServers": {
    "well": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://api.wellapp.ai/v1/mcp"]
    }
  }
}
```

A browser window will open to authenticate.

### Option B: Local (API Key)

```json
{
  "mcpServers": {
    "well": {
      "command": "npx",
      "args": ["-y", "@wellapp/mcp"],
      "env": {
        "WELL_API_KEY": "YOUR_API_KEY",
        "WELL_API_URL": "https://api.wellapp.ai/v1"
      }
    }
  }
}
```

---

## Windsurf

**Location:**
- macOS: `~/.codeium/windsurf/mcp_config.json`
- Windows: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`

### Option A: Settings UI (OAuth)

1. Press `Cmd + ,` (Mac) or `Ctrl + ,` (Windows)
2. Scroll to **Cascade** → **MCP Servers**
3. Click **Add Server** → **Add custom server**
4. Enter name: `well` and URL: `https://api.wellapp.ai/v1/mcp`
5. Log in with your Well account

### Option B: Config File (API Key)

```json
{
  "mcpServers": {
    "well": {
      "command": "npx",
      "args": ["-y", "@wellapp/mcp"],
      "env": {
        "WELL_API_KEY": "YOUR_API_KEY",
        "WELL_API_URL": "https://api.wellapp.ai/v1"
      }
    }
  }
}
```

---

## VS Code

**Location:** `.vscode/mcp.json` in your workspace

```json
{
  "servers": {
    "well": {
      "command": "npx",
      "args": ["-y", "@wellapp/mcp"],
      "env": {
        "WELL_API_KEY": "YOUR_API_KEY",
        "WELL_API_URL": "https://api.wellapp.ai/v1"
      }
    }
  }
}
```

---

## ChatGPT

> Requires Pro or Plus plan with Developer Mode enabled.

1. Open **ChatGPT** → **Settings** → **Advanced** → Enable **Developer mode**
2. Go to **Settings** → **Connectors** → **Add custom connector**
3. Enter URL: `https://api.wellapp.ai/v1/mcp`
4. Log in with your Well account

---

## Summary

| Client | OAuth | API Key |
|--------|-------|---------|
| Claude Desktop | Settings UI | Config file |
| Cursor | Config file (`mcp-remote`) | Config file |
| Windsurf | Settings UI | Config file |
| VS Code | — | Config file |
| ChatGPT | Settings UI | — |
