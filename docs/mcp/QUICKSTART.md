# Quick Start

Get Well MCP running in 5 minutes.

## Prerequisites

- Well account with data at [app.wellapp.ai](https://app.wellapp.ai)
- API key from [Settings > API Keys](https://app.wellapp.ai/settings/api-keys)
- Node.js 18+ (for local mode only)

## Option 1: Remote Server (OAuth) - Recommended

Add this URL to your MCP client:

```
https://api.wellapp.ai/v1/mcp
```

Then authenticate with your Well account. Done!

**Supported clients:** Claude Desktop, Windsurf, ChatGPT

## Option 2: Local Server (API Key)

1. Get your API key from [Well Dashboard](https://app.wellapp.ai/settings/api-keys)

2. Run the MCP server:

```bash
export WELL_API_KEY="your-api-key"
npx @wellapp/mcp
```

Or include it in your client config (see [Client Setup](./CLIENTS.md)).

## Test Your Connection

Once configured, try these prompts in your AI client:

```
Show me my invoices
```

```
What companies do I have in Well?
```

```
Find all unpaid invoices over 1000 EUR
```

If you see your data, you're all set!

## Next Steps

- [Configure your specific client](./CLIENTS.md)
- [See all available tools](./TOOLS.md)
- [Troubleshooting guide](./TROUBLESHOOTING.md)
