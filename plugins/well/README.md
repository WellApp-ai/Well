# Well plugin

Connect Claude to your **Well** financial data — invoices, companies, contacts, bank transactions, accounts, and the accounting ledger — and run real finance workflows.

The plugin bundles Well's hosted **OAuth MCP server** (nothing to install, no API key) plus task skills for the things people actually ask for:

- **`well:querying-well-data`** — discover the schema, then query the right root.
- **`well:compte-de-resultat`** — build a P&L from the posted ledger (not raw invoices).
- **`well:balance-sheet`** — build a bilan from the posted ledger / account balances.
- **`well:reconciliation`** — match transactions to invoices; surface unpaid / unexplained items.
- **`well:cash-flow-forecast`** — forecast cash flow and runway from booked invoices + collected transactions.
- **`well:vat-summary`** — VAT / sales-tax summary for a period from the posted ledger (output − input VAT).
- **`well:ar-aging`** — accounts-receivable aging + a verified "to chase" list (never chases settled invoices).
- **`well:month-end-close`** — a close checklist: is everything reconciled and posted before closing the period.

## Install — Claude Code

```bash
/plugin marketplace add WellApp-ai/Well
/plugin install well@well
```

Then run `/mcp`, select **well**, and **Authenticate** — a browser opens to sign in to Well. (Custom connectors / the hosted server require a Well account.)

## Install — Claude Desktop / web (Cowork)

The same server is a **custom connector**. In Claude: **Settings → Connectors → Add custom connector**, paste:

```
https://api.wellapp.ai/v1/mcp
```

and sign in. (Requires a paid Claude plan.)

## Install — Codex

Add the hosted MCP to `~/.codex/config.toml`:

```toml
[mcp_servers.well]
command = "npx"
args = ["-y", "mcp-remote", "https://api.wellapp.ai/v1/mcp"]
```

`mcp-remote` runs the OAuth browser flow on first connect. (Codex's native plugin support is evolving; the remote-MCP config above works today across MCP-capable clients.)

## What you can ask

- "Build my compte de résultat for Q1."
- "What invoices are unpaid, and how much is outstanding?"
- "Reconcile last month's bank transactions against my invoices."
- "Show every company I've transacted with over €10k."

## Tools the MCP exposes

`well_get_schema`, `well_query_records`, `well_get_entity`, `well_add_contact_channel`, `well_remove_contact_channel`, `well_update_invoice`, `well_delete_invoice`.

## Docs

- Introduction: https://docs.wellapp.ai/mcp/introduction
- Guides: https://github.com/WellApp-ai/Well/tree/main/docs/mcp
