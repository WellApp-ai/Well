---
name: balance-sheet
description: Build a balance sheet (bilan) from a Well workspace. Use when the user asks for a balance sheet, bilan, assets/liabilities/equity, or financial position at a point in time.
---

# Balance sheet (bilan) from Well

Like the P&L, the balance sheet comes from the **posted ledger**, not from raw documents. It is a point-in-time snapshot: balances of the balance-sheet accounts as of a date.

## Do this

1. **Discover the schema** (`well:querying-well-data`):
   - `well_get_schema("ledger_accounts")` — chart of accounts. Balance-sheet accounts are the asset/liability/equity classes (French plan comptable: classes 1–5; income-statement classes 6–7 are excluded).
   - `well_get_schema("journal_entries")` / `journal_entry_lines` — posted movements with debit/credit and dates.
   - `well_get_schema("account_balances")` — Well may expose computed balances directly; prefer these when present, they are the canonical balance per account.
2. **As-of date**: filter postings with `date _lte <as_of>` (a balance sheet is cumulative from inception, not a period).
3. **Compute each account balance** (sum of debits − credits, or read `account_balances`), then group by class:
   - **Actif** (assets): debit-normal balances (classes 2, 3, 4-debit, 5).
   - **Passif** (liabilities + equity): credit-normal balances (classes 1, 4-credit).
4. **Check it balances**: total Actif must equal total Passif. If it doesn't, surface the gap rather than hiding it — it usually means unposted entries or a period filter mistake.

## Do NOT

- Do not derive assets/liabilities from invoice or bank-transaction lists directly; use the posted ledger / `account_balances`.
- Do not assume account-class conventions without reading the chart of accounts.

## If the ledger is empty

Say the books aren't posted yet. A bank `accounts` + `account_balances` snapshot can give a **cash position** (not a balance sheet) as a clearly-labelled fallback.

## Present it

Two columns — **Actif** and **Passif** — grouped by class with subtotals, the as-of date, the currency, and an explicit "Actif = Passif ✓/✗" balance check.
