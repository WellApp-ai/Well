---
name: cash-flow-forecast
description: Forecast cash flow and runway for a Well workspace from booked invoices and collected bank transactions. Use when the user asks for a cash-flow forecast, runway, how long until they run out of cash, projected balance, or expected inflows/outflows.
---

# Cash-flow forecast from Well

A trustworthy forecast is grounded in **what actually happened** — invoices raised,
cash collected, and observed days-to-pay — not in optimistic projections. Every
forecast must state its **time window and filters**, and flag thin history and
missing data explicitly.

## Start from the deterministic tools, not from raw reads

**`well_get_runway` already computes runway** — cash on hand ÷ trailing-3-month
average burn — server-side, applying the sign-convention detection,
internal-transfer exclusion and FX conversion that a hand-rolled sum over
`account_balances` gets wrong. It returns the exact figure the Well app shows,
plus the completeness signals a re-derivation destroys:

- `status`: `ok` · `capped` (>36 months — report as ">36 months") · `infinite`
  (positive cash, not burning) · `insufficient_data`.
- `partial` + `excluded: { accounts, transactions }` — rows left out.
- `hints[]` — each a `detected_gap` with a `suggested_action`.

`well_get_cash_position` does the same for the current position and its
per-account breakdown.

**Do not rebuild either from `well_query_records`.** Call the tool, then extend
it with the forward-looking half below.

## Run the coverage gate first

See `well:data-coverage`. A forecast with no bank source, or with a period the
sync never covered, is a number with a hole in it — check before computing, and
carry the coverage line into the output. `status: "insufficient_data"` from
`well_get_runway` is that gate answering: report it and point at
`well_list_connectors`' `install_url`, don't substitute an estimate.

## Build the forward half

1. **Starting position** — `well_get_cash_position` (or the `cash` field of
   `well_get_runway`). Note the currency.
2. **Expected inflows (booked)** — open `invoices` (issued, unpaid) with due dates
   and outstanding amounts. Adjust each due date by the customer's observed
   **days-to-pay** where history exists (derive from past `invoices` + their
   settling `transactions` / `invoice_transactions`).
3. **Expected outflows (booked)** — received/payable `invoices` with due dates;
   plus recurring outflows visible in `transactions` history (rent, payroll,
   subscriptions).
4. **Project** the balance forward per period (week or month): starting cash +
   expected inflows − expected outflows. Report the projected balance per period
   and the **runway** — reconciling against `well_get_runway`'s figure, and saying
   so when the two disagree rather than silently preferring one.

## Rules

- **State the window and filters** (e.g. "next 13 weeks, EUR, excludes
  intra-account transfers"). A forecast without its assumptions is a vanity number.
- **Carry `partial` / `excluded` / `hints` into the output.** A figure that
  excluded 12 accounts is not the same figure as one that excluded none.
- **Flag thin history.** If days-to-pay or recurring-outflow history is sparse
  (low n), say so — confidence is overstated on thin data.
- Distinguish **booked** (invoices/contracts that exist) from **assumed**
  (run-rate extrapolation), and label which is which.
- Don't sum across currencies without converting (see `exchange_rates`).

## Present it

The coverage line first, then a per-period table — opening balance, inflows,
outflows, closing balance — the runway in plain terms ("≈ N weeks at current
trajectory"), the stated window/filters, the exclusion counts if any, and an
explicit confidence note when history is thin.
