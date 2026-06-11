---
name: month-end-close
description: Run a month-end (or period) close checklist against a Well workspace — verify everything is reconciled and posted before the books are closed. Use when the user asks to close the month/period, run a close checklist, check if the books are ready to close, or what's left before closing.
---

# Month-end close from Well

Closing is a **repeatable checklist, not a heroic event** — and every step has a manual fallback, because the day it breaks is the day it matters. The close is what *produces* the financials: once the period is reconciled and posted, the P&L, balance sheet, and tax figures fall out of it (see `well:compte-de-resultat`, `well:balance-sheet`, `well:vat-summary`).

## The checklist

1. **Discover the schema first** (see `well:querying-well-data`) and fix the period (date range).
2. **Bank reconciliation** — every `transactions` row in the period is matched to its invoice(s) or categorised; no unexplained movements. Use `well:reconciliation`. Confirm `account_balances` match the bank's closing balance.
3. **Receivables / payables** — open `invoices` reviewed; nothing miscoded; AR aging sane (`well:ar-aging`).
4. **Posting status** — every transaction and invoice in the period is **posted to a journal entry** (not left DRAFT). Query `journal_entries` for the period and flag any source document with no posted entry — those are the gaps that block a clean close.
5. **Balances** — trial balance balances (total debits = total credits) across `ledger_accounts` / `journal_entries`; `account_balances` reconciled.
6. **Tax** — VAT/tax for the period computed from the now-posted ledger (`well:vat-summary`).

## Rules

- **Report readiness, don't fake it.** If anything is unreconciled, unposted, or unbalanced, list it as a blocker — do not declare the period closed.
- Each blocker should name the specific document/account and what's missing, so it's actionable.
- Incremental is fine: surface "N of M done, here are the M−N gaps" rather than all-or-nothing.

## Present it

A checklist with pass/blocker per item, a list of specific gaps (each naming the document/account + what's needed), the trial-balance debits=credits check, and a clear verdict: **ready to close** or **N blockers remain**.
