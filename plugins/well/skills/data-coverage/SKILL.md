---
name: data-coverage
description: Check whether a Well workspace's data is complete enough to answer a financial question — bank source connected and healthy, transactions categorized — and offer the control that closes each gap (the connect card for a missing bank, the named rows for missing categories). Use BEFORE producing any figure, table, or chart from Well data, and whenever the user asks why a number looks wrong, low, or incomplete.
---

# Data coverage — what the figures are missing

A financial figure is only as complete as the data under it. Two gaps make a Well
answer quietly wrong rather than visibly wrong, and neither announces itself:

1. **No bank source, or an unhealthy one.** Cash movement that was never synced
   cannot appear in a cash position, a runway, a P&L, or a reconciliation. The
   number computes, looks plausible, and is missing a whole account.
2. **Uncategorized transactions.** Money that moved but carries no category
   lands nowhere in a cost structure or an expense breakdown. The categories
   shown are real; the total under them is not the total that moved.

Both are checked **before** the figure is produced — not mentioned afterwards —
and both carry the action that closes them. Reporting a gap the user cannot act
on is a complaint, not a diagnosis.

## Run the gate

### 1. Is there banking data at all?

Detect from the DATA, not from the connector catalog — a connector can be
connected and still have synced nothing.

```
well_query_records({ root: "accounts", fields: [["accounts","account_id"]], limit: 1 })
well_query_records({ root: "transactions", fields: [["transactions","transaction_id"]],
                     whereClause: { <the period's date field>: { _gte: <start>, _lte: <end> } },
                     limit: 1 })
```

- **No accounts** → there is no bank source. This is a blocker for anything
  cash-shaped; say so before computing.
- **Accounts but no transactions in the period** → the source exists but the
  period is not covered (sync gap, or a genuinely dormant month — say which you
  can and cannot tell apart).

### 2. No bank source → CALL `well_list_connectors`

Do not describe the fix in prose. **Call the tool.** In a host that renders MCP
app widgets (Claude Desktop), `well_list_connectors` draws the Well connect
card — the searchable provider picker, each tile with its logo and a one-click
install — which is the affordance the user actually needs. Summarising the
catalog into a paragraph replaces a working control with a description of one.

- Know which bank? `q: "<bank name>"` — the long tail is only reachable by
  search, so a specific bank must be searched for by name.
- Don't know? Call it with no `q` for the curated, matched-first view.
- The tool takes no category filter today, so "show me the banks" is expressed
  as a name search, not as a category.

Every entry carries `is_connected`, `connection_status`, and an **`install_url`**.
In a text-only host no card renders, so hand over the `install_url` directly —
the link works either way, and it survives being signed out or having no
workspace yet.

**A connected-but-unhealthy connector is a different errand.** It shows in
`connection_status`; name it and say the sync is stale or failing. Telling
someone to connect a bank they already connected is how a real diagnosis reads
as noise.

### 3. How much is uncategorized?

`transactions.category_status` is a typed enum — `categorized`,
`uncategorized`, `classifier_abstained`, `classifier_failed`, `pending`,
`legacy_unmapped` — and it is **null on a row nothing has looked at yet**. So
"not categorized" is *not* `_neq: "categorized"`, which drops the nulls and
undercounts the gap:

```json
{ "_and": [
    { "<date field>": { "_gte": "<start>", "_lte": "<end>" } },
    { "_or": [
        { "category_status": { "_is_null": true } },
        { "category_status": { "_neq": "categorized" } }
    ]}
]}
```

Report the count against the period's total, and **list the rows** (counterparty,
date, amount) rather than only the number — a list is something the user can act
on, a count is not. The statuses are worth distinguishing when you name them:
`pending` is work in flight, `classifier_abstained` / `classifier_failed` are
rows that need a human decision, `uncategorized` / null have not been attempted.

Categorizing is done in the Well app on the transactions the list names; there is
no MCP write for it, so point at the rows, don't promise to fix them.

## Prefer the tools that already report their own coverage

`well_get_runway`, `well_get_cash_position` and `well_get_cost_structure` compute
deterministically server-side — the same numbers the Well app shows — and each
returns its own completeness signals:

- `status: "insufficient_data"` — not enough connected data to compute at all.
  Say that, and go to step 2; do not substitute a hand-rolled estimate.
- `partial: true` with `excluded: { accounts, transactions }` — rows were left
  out (a missing FX rate, an unsupported account). Report the counts; never
  present the figure as unconditionally complete.
- `hints[]` — each with a `detected_gap` and a `suggested_action`, already
  written for the user.

Rebuilding these from raw `well_query_records` reads throws every one of those
signals away and produces a number that cannot tell you what it is missing.
That is the failure this skill exists to prevent.

## Report it

A **coverage line above the figure**, never a footnote below it:

> Coverage: 2 accounts, 1 Jan–31 Mar. **41 of 380 transactions uncategorized**
> (12 pending, 29 need a decision). Revolut is connected but last synced 18 days ago.

Then the figure. Then, if a gap is open, the action — the `install_url` for a
missing bank, the named rows for missing categories. When coverage is clean, say
so in one clause and move on; silence reads as unchecked, not as complete.

## Rules

- **Gate, don't annotate.** The check runs before the figure exists. A caveat
  added after the fact is read after the number has already been believed.
- **Never present a partial figure as complete.** If a gap is open, the figure
  is labelled with it in the same breath, in the same block.
- **Offer the control, not a description of it.** A missing bank source means
  calling `well_list_connectors` so its connect card renders — not writing a
  sentence about connecting a bank. The same applies to the named transaction
  rows: a list the user can work through beats a count they cannot.
- **Say what you cannot tell apart.** A month with no transactions may be a sync
  gap or a dormant month; the data alone does not distinguish them. Say which.
