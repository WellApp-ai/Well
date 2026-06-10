---
name: reconciliation
description: Match bank transactions to invoices and surface unpaid / unmatched items in a Well workspace. Use when the user asks what's paid vs unpaid, to reconcile the bank, to find missing payments, or to match transactions to invoices.
---

# Reconciliation in Well

Goal: connect money movement (`transactions`) to commercial documents (`invoices`) and report what is matched, unpaid, or unexplained.

## What Well already links

Well's pipelines maintain the link between a bank transaction and the invoice(s) it settles. Check the schema before computing matches by hand:

1. `well_get_schema("invoice_transactions")` — the join between invoices and transactions, if exposed. Querying this root is the fastest path to "which invoices are settled by which transactions".
2. `well_get_schema("invoices")` — look for a payment-status / amount-paid / outstanding field and the `grand_total`.
3. `well_get_schema("transactions")` — amount, value/booking date, counterparty, and remittance fields.

## Do this

- **Unpaid invoices**: query `invoices` filtered on the payment-status / outstanding field the schema exposes (don't infer "unpaid" by subtracting sums if a status field exists). Sort by due date or amount.
- **Matched**: read `invoice_transactions` (or the link the schema shows) to list invoice ↔ transaction pairs.
- **Unmatched transactions**: `transactions` with no linked invoice — candidates for manual review (could be fees, transfers, or a missing invoice).
- When matching by hand (no link exposed), match on **amount + date proximity + counterparty**, never on amount alone.

## Do NOT

- Do not declare an invoice paid purely because a transaction of the same amount exists — confirm via the link or counterparty + date.
- Do not sum across currencies without converting (see `exchange_rates`).

## Present it

Three buckets — **Matched**, **Unpaid invoices**, **Unexplained transactions** — each with counts and totals, plus the currency. Offer to drill into any bucket with `well_get_entity`.
