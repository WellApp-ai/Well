---
name: querying-well-data
description: How to query a Well workspace correctly — discover the schema first, then query the right root. Use whenever the user asks about their invoices, companies, contacts, bank transactions, accounts, or accounting ledger in Well, or before writing any well_query_records call.
---

# Querying Well data

Well exposes a workspace's financial graph through these MCP tools:

- `well_get_schema()` — list every available **root** (entity type).
- `well_get_schema({ root })` — list the fields available on one root, with types and semantic context.
- `well_query_records({ root, fields, whereClause?, orderBy?, limit? })` — read rows.
- `well_get_entity({ root, id })` — fetch one record by id.
- `well_list_workspaces()` — the workspaces this connection authorizes (see "Scope first" below).
- `well_list_connectors({ q? })` — the connectable catalog, each entry with `is_connected`, `connection_status`, and an `install_url` deep link.
- `well_get_runway()` / `well_get_cash_position()` / `well_get_cost_structure()` — **deterministic KPIs computed server-side**, identical to what the Well app shows, each reporting its own completeness (`status`, `partial`, `excluded`, `hints`). Prefer these over re-deriving the same figure from raw reads, which throws those signals away.

## Scope first: which workspace are you answering for?

One connection can authorize several workspaces. When it does and you pass no
`workspace_id`, a read **fans out across all of them and merges the rows into one
flat result** — every row tagged with its own `workspace_id`, but a single figure
computed over the merge belongs to no one company.

So before answering a question about "the" business:

1. `well_list_workspaces()` — it returns each workspace's id, name, and the
   company identity behind it (registered name, trade name, country, currency,
   fiscal year start) so two similarly-named workspaces can be told apart.
2. Pass `workspace_id` on every subsequent call, unless the user genuinely asked
   for the consolidated view.
3. **Name the workspace in the answer.** Every table, figure and chart states
   which company it is for, alongside its period and currency. A number whose
   owner is unstated is the one error a reader cannot catch.

Writes never guess: with more than one authorized workspace and no
`workspace_id`, a write is refused rather than sent to the default.

## Then check coverage

Before producing any figure, run the coverage gate — `well:data-coverage`. It
checks that a bank source exists and is healthy, and that the period's
transactions are categorized, and reports each gap with the action that closes
it. A figure computed over incomplete data is wrong in a way that looks right.

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

**`_neq` on a nullable enum drops the nulls.** A row whose status was never set
matches neither `_eq` nor `_neq`, so filtering "everything that isn't X" with
`_neq` silently undercounts by however many rows are null. Spell both out:

```json
{ "_or": [ { "field": { "_is_null": true } }, { "field": { "_neq": "x" } } ] }
```

## Gotchas

- A read is scoped to the workspace you name in `workspace_id`; omit it with several authorized workspaces and it fans out across all of them (see "Scope first" above).
- Select the specific fields you need (5–15), not everything — it is faster and cheaper.
- Amounts on commercial documents are in the document currency; check the schema `context` for currency fields before summing across currencies (see `exchange_rates`).
