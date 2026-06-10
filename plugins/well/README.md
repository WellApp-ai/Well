# Well plugin

Connect Claude to your **Well** financial data — invoices, companies, contacts, bank transactions, accounts, and the accounting ledger — and run real finance workflows.

The plugin bundles Well's hosted **OAuth MCP server** (nothing to install, no API key) plus task skills for the things people actually ask for:

- **`well:querying-well-data`** — discover the schema, then query the right root.
- **`well:compte-de-resultat`** — build a P&L from the posted ledger (not raw invoices).
- **`well:balance-sheet`** — build a bilan from the posted ledger / account balances.
- **`well:reconciliation`** — match transactions to invoices; surface unpaid / unexplained items.

## Install — Claude Code

Installing the plugin **auto-configures the MCP server** (it's bundled in the plugin — you never run `claude mcp add`). Two steps, each on its own line:

```bash
/plugin marketplace add WellApp-ai/Well   # 1. register the catalog
/plugin install well@well                 # 2. install the plugin (+ MCP + skills)
```

> `marketplace add` only registers the catalog — it does **not** install anything. You must also run `install`. (If you only ran step 1 and "nothing happened," step 2 is what you're missing.)

Then connect:

```bash
/well:connect
```

`/well:connect` walks you through the one-time browser sign-in (`/mcp` → **well** → **Authenticate** — no API key), verifies the tools respond, and shows what to ask. Run `/reload-plugins` first if the plugin was just installed.

### Team / repo auto-install

To install the plugin for a whole team automatically, copy [`examples/team-settings.json`](./examples/team-settings.json) into your repo's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": { "well": { "source": { "source": "github", "repo": "WellApp-ai/Well" } } },
  "enabledPlugins": ["well@well"]
}
```

When a teammate trusts the repo, Claude Code prompts to add the marketplace **and** install the plugin in one step. Each user still authenticates once with `/well:connect`.

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
