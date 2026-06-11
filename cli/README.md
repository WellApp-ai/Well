# Well CLI

A self-contained command-line tool for your Well financial data — invoices, companies, contacts, transactions, and the accounting ledger — straight from the terminal.

It's a sibling of the [Well MCP](https://docs.wellapp.ai/mcp/introduction) and the [Claude Code plugin](../plugins/well): same hosted backend, same OAuth, different front door. The MCP is consumed by AI clients; the CLI is run by a human (or a script). The two **coexist** — each authenticates as its own OAuth client with its own consent screen, its own token, and an independent lifecycle.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/WellApp-ai/Well/main/cli/well -o /usr/local/bin/well
chmod +x /usr/local/bin/well
```

Requires Python 3.8+ (standard library only — no dependencies).

## Use

```bash
well login              # browser sign-in; the consent screen shows "Well CLI"
well schema             # list the roots you can query
well schema invoices    # list the fields on a root
well invoices unpaid    # render unpaid invoices as a table
```

Example:

```
  ●  well  — invoices unpaid

  INVOICE_NUMBER  GRAND_TOTAL  STATUS   NAME
  INV-1042        €4,200.00    overdue  Globex
  INV-0991        €2,750.00    overdue  Initech

  2 shown of 7 total
```

## How auth works

`well login` registers an OAuth client named **"Well CLI"** via Dynamic Client Registration (RFC 7591), runs the standard authorization-code + PKCE flow against `api.wellapp.ai`, and caches the token in `~/.well/credentials.json` (mode `0600`). No API key, nothing to paste. Because it's a distinct OAuth client, the consent screen reads "Well CLI" — never the MCP bridge's name — and connecting/disconnecting the CLI never affects your Claude/MCP connection.

## Configuration

| Env var | Default | Purpose |
| --- | --- | --- |
| `WELL_URL` | `https://api.wellapp.ai/v1` | API base (point at staging if needed) |
| `WELL_CLI_PORT` | `8765` | localhost port for the OAuth callback |

## Tools it exposes

The CLI talks to the Well MCP over JSON-RPC, so it has access to the same tools: `well_get_schema`, `well_query_records`, `well_get_entity`, `well_add_contact_channel`, `well_remove_contact_channel`, `well_update_invoice`, `well_delete_invoice`.
