---
name: vat-summary
description: Produce a VAT / sales-tax summary for a period from a Well workspace's posted ledger. Use when the user asks for a VAT return, VAT summary, sales tax owed, output vs input VAT, or tax declaration figures for a period.
---

# VAT summary from Well

A VAT return is a **byproduct of closed books**, not a separate project. If the ledger is posted and correct, the figures already exist — the work is presentation. Work **backward from the filing deadline** and **forward from the posted ledger**, and surface uncertainty rather than reporting a number you're not sure of.

## Build it from the posted ledger + tax rates

1. **Discover the schema first** (see `well:querying-well-data`).
2. **Output VAT (collected on sales)** — from issued `invoices` / `invoice_items` and their `tax_rates`, or the corresponding VAT `ledger_accounts` / `journal_entries` for the period. Group by rate (standard / reduced / zero / exempt).
3. **Input VAT (paid on purchases)** — from received `invoices` / `invoice_items` + `tax_rates`, or the input-VAT ledger accounts.
4. **Net VAT due** = output VAT − recoverable input VAT, per the period's date filter.
5. **By rate and jurisdiction** — break the totals down by VAT rate and, for multi-jurisdiction workspaces, by jurisdiction. Read the rate from the data (`tax_rates`), don't assume it.

## Rules — conservative by design

- **"The books are not closed yet."** If the period's `journal_entries` are still DRAFT / unposted, say so before producing a final figure — declarations fall out of *closed* books. Offer a provisional figure clearly labelled as such.
- **Surface uncertainty, don't file it.** Where a rate, exemption, or jurisdiction treatment is ambiguous, flag it for human review rather than guessing.
- Read rates and jurisdictions from `tax_rates` / the data; never hardcode a percentage.
- Don't sum across currencies without converting (`exchange_rates`).

## Present it

Output VAT (by rate) → total; Input VAT (by rate) → total; **Net VAT due**; the period and jurisdiction; a books-closed/draft status line; and any flagged uncertainties for review.
