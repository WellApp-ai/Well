# Troubleshooting

Common issues and solutions when using Well MCP.

## Connection Issues

### "Connection not working"

1. Verify your API key is correct (no extra spaces)
2. Restart your AI client completely
3. Check the config file syntax (valid JSON)
4. Ensure Node.js 18+ is installed (for local mode)

### "Authentication error" / 401 Unauthorized

1. Check your API key hasn't expired
2. Regenerate from [Well Dashboard](https://app.wellapp.ai/settings/api-keys)
3. Verify you're using the correct workspace

### "Connection lost" / Disconnects

1. Remove the Well server from settings
2. Add it again
3. Re-authenticate

---

## Data Issues

### "No data returned"

1. Ensure your Well workspace has data
2. Check that your API key has access to the workspace
3. Verify you authorized the correct workspace during OAuth

### "Invalid root" error

Available roots are:
- `invoices`
- `companies`
- `people`
- `documents`
- `connectors`

Check for typos (e.g., "invoice" vs "invoices").

---

## Client-Specific Issues

### Cursor: "Protected resource does not match"

This error occurs with `mcp-remote`. Try:

1. Clear mcp-remote cache:
   - macOS/Linux: `rm -rf ~/.mcp-auth`
   - Windows: `rmdir /s /q "%USERPROFILE%\.mcp-auth"`
2. Restart Cursor completely
3. Make sure you're using `https://api.wellapp.ai/v1/mcp` exactly

### OAuth redirect not working

1. Make sure you're logged into Well
2. Clear browser cookies for `wellapp.ai`
3. Check your browser isn't blocking popups
4. Try a different browser

### Claude Desktop: Config not loading

1. Validate your JSON syntax at [jsonlint.com](https://jsonlint.com)
2. Check the file location:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
3. Restart Claude Desktop after saving

---

## Logs Location

### Claude Desktop

- macOS: `~/Library/Logs/Claude/mcp*.log`
- Windows: `%APPDATA%\Claude\logs\mcp*.log`

### Cursor

Check the Output panel → select "MCP" from dropdown.

---

## Getting Help

If you're still having issues:

1. Check the [full documentation](https://docs.wellapp.ai/mcp)
2. Email support@wellapp.ai with:
   - Client name and version
   - Error message (screenshot if possible)
   - Steps to reproduce
3. Open an issue at [GitHub](https://github.com/WellApp-ai/Well/issues)
