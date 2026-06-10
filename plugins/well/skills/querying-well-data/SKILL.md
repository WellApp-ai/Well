---
name: querying-well-data
description: How to query a Well workspace correctly — discover the schema first, then query the right root. Use whenever the user asks about their invoices, companies, contacts, bank transactions, accounts, or accounting ledger in Well, or before writing any well_query_records call.
---

# Querying Well data

Well exposes a workspace's financial graph through three MCP tools:

- `well_get_schema()` — list every available **root** (entity type).
- `well_get_schema({ root })` — list the fields available on one root, with types and semantic context.
- `well_query_records({ root, fields, whereClause?, orderBy?, limit? })` — read rows.
- `well_get_entity({ root, id })` — fetch one record by id.

## The one rule: discover before you query

**Always call `well_get_schema(root)` first**, pick the fields you need from what it returns, then call `well_query_records`. Field paths are arrays: `"invoices.issuer.name"` → `["invoices", "issuer", "name"]`. Do not guess field names — they vary by root and are documented in the schema response (each field carries a `type` and often a `context` explaining what it means).

## The roots you can read

Calling `well_get_schema()` with no argument returns the full set. It includes far more than invoices and companies — in particular the **accounting graph**:

- **Commercial documents:** `invoices`, `invoice_items`, `invoice_transactions`
- **Parties:** `companies`, `people`, `payment_means`
- **Banking:** `accounts`, `transactions`, `account_balances`
- **Accounting graph (read-only, posted by Well's pipelines):** `ledger_accounts`, `journals`, `journal_entries`
- **Reference:** `tax_rates`, `exchange_rates`, `categories`, `connectors`
- **Workspace:** `memberships`, `tasks`, `workspace_connectors`

If you are about to answer a financial question by reconstructing it from raw invoices, **stop and check `well_get_schema()` first** — the posted ledger (`journal_entries`, `ledger_accounts`) is almost always the correct, more accurate source. See the `well:compte-de-resultat` and `well:balance-sheet` skills.

## Filtering

`whereClause` is a Hasura-style boolean expression. Use the operator the field's `type` allows (from the schema):

- `numeric` / `date` → `_eq`, `_gt`, `_lt`, `_gte`, `_lte`
- `enum` → `_eq`, `_neq`, `_in`, `_nin`, `_is_null`
- `text` → `_eq`, `_like`, `_ilike`
- relations → nest: `{ "issuer": { "name": { "_ilike": "%acme%" } } }`

## Gotchas

- Reads are scoped to the authenticated workspace automatically — you never pass a workspace id.
- Select the specific fields you need (5–15), not everything — it is faster and cheaper.
- Amounts on commercial documents are in the document currency; check the schema `context` for currency fields before summing across currencies (see `exchange_rates`).
