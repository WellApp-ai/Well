---
name: cash-flow-forecast
description: Forecast cash flow and runway for a Well workspace from booked invoices and collected bank transactions. Use when the user asks for a cash-flow forecast, runway, how long until they run out of cash, projected balance, or expected inflows/outflows.
---

# Cash-flow forecast from Well

A trustworthy forecast is grounded in **what actually happened** — invoices raised, cash collected, and observed days-to-pay — not in optimistic projections. Every forecast must state its **time window and filters**, and flag thin history explicitly.

## Build it from booked + collected

1. **Discover the schema first** (see `well:querying-well-data`).
2. **Starting position** — current cash: `well_get_schema("account_balances")` / `accounts`, sum the latest balance per account (note the currency).
3. **Expected inflows (booked)** — open `invoices` (issued, unpaid) with their due dates and outstanding amounts. Adjust each due date by the customer's observed **days-to-pay** where history exists (derive from past `invoices` + their settling `transactions` / `invoice_transactions`).
4. **Expected outflows (booked)** — received/payable `invoices` with due dates; plus recurring outflows visible in `transactions` history (rent, payroll, subscriptions).
5. **Project** the balance forward per period (week or month): starting cash + expected inflows − expected outflows. Report the projected balance per period and the **runway** (the period the balance crosses zero, if any).

## Rules

- **State the window and filters** behind the forecast (e.g. "next 13 weeks, EUR, excludes intra-account transfers"). A forecast without its assumptions is a vanity number.
- **Flag thin history.** If days-to-pay or recurring-outflow history is sparse (low n), say so — confidence is overstated on thin data.
- Distinguish **booked** (invoices/contracts that exist) from **assumed** (run-rate extrapolation), and label which is which.
- Don't sum across currencies without converting (see `exchange_rates`).

## Present it

A per-period table — opening balance, inflows, outflows, closing balance — the runway in plain terms ("≈ N weeks at current trajectory"), the stated window/filters, and an explicit confidence note when history is thin.
