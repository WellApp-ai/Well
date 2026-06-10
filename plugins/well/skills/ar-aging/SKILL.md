---
name: ar-aging
description: Produce an accounts-receivable aging report and surface overdue invoices for a Well workspace. Use when the user asks who owes them money, an AR aging report, overdue invoices, days sales outstanding (DSO), or which customers to chase.
---

# Accounts-receivable aging from Well

Collections is **judgment, not nagging**. The point of an aging report is to chase the right customers — firmly where their payment history warrants it, gently where it doesn't — and to **never chase an invoice that was already paid, disputed, or credited**. Verify status before recommending any chase.

## Build it

1. **Discover the schema first** (see `well:querying-well-data`).
2. **Open receivables** — issued `invoices` filtered on the payment-status / outstanding field the schema exposes (don't infer "unpaid" by subtracting sums if a status field exists). Pull due date, outstanding amount, and the customer (`companies`).
3. **Confirm what's actually settled** — cross-check against `transactions` / `invoice_transactions` so a payment already received but not yet reflected in status isn't counted as overdue. This is the `well:reconciliation` sibling skill — reuse it.
4. **Bucket by age** from the due date: Current (not yet due), 1–30, 31–60, 61–90, 90+ days overdue. Total per bucket and per customer.
5. **Per-customer behavior** — where history exists, note each customer's typical days-to-pay so the user can prioritise (a chronic late-payer ≠ a first-time slip).

## Rules

- **Verify status before chasing.** Exclude paid / disputed / credited invoices from "to chase" — chasing a settled invoice is the fastest way to lose trust.
- Sort the chase list by amount × overdue age, but annotate each with the customer's payment tier.
- Don't sum across currencies without converting (`exchange_rates`).
- Report **DSO** (days sales outstanding) only with the window it's computed over.

## Present it

An aging table (buckets × totals), a top "to chase" list (verified-open only, with each customer's payment behavior), DSO with its window, and the total outstanding — in the workspace currency.
