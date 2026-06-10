---
name: compte-de-resultat
description: Build a profit & loss statement (compte de résultat / income statement) from a Well workspace. Use when the user asks for a P&L, income statement, compte de résultat, revenue vs expenses, or net result over a period.
---

# Compte de résultat (P&L) from Well

A correct income statement comes from the **posted accounting ledger**, not from raw invoices. Well's sync/posting pipelines post invoices and bank transactions into `journal_entries` against `ledger_accounts`; that posted data already handles classification, accruals, and settlement that a raw-invoice sum misses.

## Do this

1. **Discover the schema first** (see `well:querying-well-data`):
   - `well_get_schema("ledger_accounts")` — the chart of accounts. Look for the account **code/number** and **name/type** fields; income-statement accounts are the revenue and expense classes (in a French plan comptable, classe 7 = produits, classe 6 = charges).
   - `well_get_schema("journal_entries")` and `well_get_schema("journal_entry_lines")` if present — the posted movements with debit/credit amounts and the date you'll filter the period on.
2. **Scope the period** with a `whereClause` on the posting/entry date (e.g. `_gte` start, `_lte` end).
3. **Aggregate by account**: sum the posted amounts per ledger account, then group revenue accounts and expense accounts.
4. **Net result** = total produits (revenue) − total charges (expenses).

## Do NOT

- **Do not reconstruct the P&L by summing issued invoices as revenue and received invoices as expenses.** That misses postings, non-invoice entries, accruals, and account classification, and double-counts or omits settlement. Use the ledger.
- Do not hardcode account codes you haven't confirmed from `well_get_schema`/the data — read the chart of accounts first.

## If the ledger is empty

If `journal_entries` / `ledger_accounts` return no rows for the workspace, the books may not be posted yet. Say so explicitly, and only then offer an invoice-based **approximation** — clearly labelled as an estimate, not the compte de résultat — built from `invoices` (issued = revenue proxy, received = expense proxy) over the period.

## Present it

Group the output as: Produits (revenue) lines → total; Charges (expense) lines → total; **Résultat net**. Note the currency and the period. Offer a month-by-month or category breakdown as a follow-up.
