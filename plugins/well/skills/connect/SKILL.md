---
name: connect
description: Connect and verify the Well MCP — authenticate, confirm the tools work, and show what to ask. Use when the user runs /well:connect, just installed the Well plugin, or says the Well connection/MCP "isn't working" / "nothing happened".
disable-model-invocation: false
---

# Connect to Well

Run this right after installing the Well plugin, or whenever the Well tools aren't responding. Walk the user through it conversationally — do not dump all steps at once if a step is already done.

## 1. Confirm the MCP server is registered

Installing the plugin auto-adds the `well` MCP server (it is bundled in the plugin manifest). If the user just installed it, make sure it's active:

- Tell them to run `/reload-plugins` if they haven't since installing.
- The server should now appear when they run `/mcp`.

## 2. Authenticate (one time, browser sign-in — no API key)

The Well MCP uses OAuth, so the first connection needs a one-time sign-in:

> Run `/mcp`, select **well**, and choose **Authenticate**. A browser opens — sign in to your Well account and approve. No API key, no config.

If `/mcp` shows **well** as already authenticated, skip this.

## 3. Verify it works

Call `well_get_schema` (no arguments) to confirm the connection is live. If it returns the list of roots (companies, invoices, transactions, ledger_accounts, …), the connection is working — tell the user "Connected ✓, N data types available."

If it returns an auth error, send them back to step 2. If it returns a server error on the heavy roots, the connection is fine but the workspace data path may be temporarily unavailable — say so rather than implying the setup failed.

## 4. Show what to ask

Once connected, offer 3 concrete starting prompts so the user gets value immediately:

- "Summarize last month's cash flow"
- "List my unpaid invoices over €5,000"
- "Build my compte de résultat for the last quarter"

Mention the deeper skills are available too: `/well:reconciliation`, `/well:vat-summary`, `/well:ar-aging`, `/well:month-end-close`, `/well:compte-de-resultat`, `/well:balance-sheet`, `/well:cash-flow-forecast`.

## Note on billing

Tool calls use Well credits, billed to the workspace plan. Mention this once if the user asks about cost — do not interrupt every call.
