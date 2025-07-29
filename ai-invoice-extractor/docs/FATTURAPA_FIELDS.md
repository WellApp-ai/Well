# FatturaPA Field Reference

This document provides a comprehensive reference for all FatturaPA (Italian Electronic Invoicing) fields supported by the AI Invoice Extractor.

## Overview

FatturaPA is the mandatory format for electronic invoicing in Italy for:
- Business-to-Business (B2B) transactions
- Business-to-Public Administration (B2PA) transactions  
- Cross-border transactions involving Italian entities

The format supports both domestic invoices and cross-border scenarios with different document types.

## Document Types

| Code | Description | Use Case |
|------|-------------|----------|
| TD01 | Commercial Invoice | Standard domestic B2B invoice |
| TD02 | Advance/Down Payment Invoice | Partial payment invoice |
| TD03 | Accompanying Invoice | Invoice with goods delivery |
| TD04 | Credit Note | Return/correction invoice |
| TD05 | Debit Note | Additional charges invoice |
| TD06 | Fee Note | Professional services invoice |
| TD16 | VAT Registration Invoice | Reverse charge mechanism |
| TD17 | Integration Invoice (Intra-EU) | Cross-border EU purchases |
| TD18 | Integration Invoice (San Marino Goods) | Goods from San Marino |
| TD19 | Integration Invoice (San Marino Services) | Services from San Marino |
| TD20 | Self-Invoice | Self-billing scenario |
| TD21-TD28 | Other Specialized Types | Various specific scenarios |

## Field Categories

### 1. Transmission Header (`transmission_header`)

Fields required for electronic transmission to the Italian SDI (Sistema di Interscambio).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `progressive_code` | string | Yes | Unique transmission code (5 digits) |
| `transmission_format` | string | Yes | Format version (e.g., "FPR12") |
| `recipient_code` | string | Yes | 7-character recipient code or "0000000" |
| `email_pec` | string | No | PEC email if recipient_code is "0000000" |
| `country_code` | string | Yes | ISO 3166-1 alpha-2 country code (e.g., "IT") |

### 2. Document Metadata

Core invoice information fields.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `document_type` | string | Yes | Document type code (TD01, TD17, etc.) |
| `invoice_number` | string | Yes | Invoice number |
| `issue_date` | string | Yes | Invoice issue date (YYYY-MM-DD) |
| `due_date` | string | No | Payment due date |
| `currency` | string | Yes | Currency code (ISO 4217, e.g., "EUR") |
| `exchange_rate` | number | No | Exchange rate for foreign currency |

### 3. Supplier Information (`supplier`)

Complete details about the invoice issuer.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `company_name` | string | Yes* | Company legal name |
| `name` | string | Yes* | Individual first name (if not company) |
| `surname` | string | Yes* | Individual last name (if not company) |
| `fiscal_code` | string | Yes | Italian fiscal code (16 characters) |
| `vat_number` | string | Yes | VAT number with country prefix |
| `tax_regime` | string | Yes | Tax regime code (RF01-RF19) |
| `phone` | string | No | Phone number |
| `fax` | string | No | Fax number |
| `email` | string | No | Email address |

*Either `company_name` OR (`name` + `surname`) is required.

#### Supplier Address (`supplier.address`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `street` | string | Yes | Street name |
| `street_number` | string | No | Street number |
| `postal_code` | string | Yes | Postal code |
| `city` | string | Yes | City name |
| `province` | string | Yes | Province code (2 letters) |
| `country` | string | Yes | Country code (ISO 3166-1 alpha-2) |

### 4. Customer Information (`customer`)

Complete details about the invoice recipient.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `company_name` | string | Yes* | Company legal name |
| `name` | string | Yes* | Individual first name (if not company) |
| `surname` | string | Yes* | Individual last name (if not company) |
| `fiscal_code` | string | No | Italian fiscal code |
| `vat_number` | string | No | VAT number with country prefix |
| `foreign_vat_id` | string | No | Foreign VAT identification |
| `foreign_tax_code` | string | No | Foreign tax code |
| `phone` | string | No | Phone number |
| `fax` | string | No | Fax number |
| `email` | string | No | Email address |
| `pec` | string | No | Certified email (PEC) address |

*Either `company_name` OR (`name` + `surname`) is required.

#### Customer Address (`customer.address`)

Same structure as supplier address.

### 5. Line Items (`line_items`)

Array of invoice line items with detailed pricing and tax information.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `line_number` | string | Yes | Sequential line number |
| `description` | string | Yes | Item/service description |
| `quantity` | number | Yes | Quantity |
| `unit_of_measure` | string | No | Unit of measure (e.g., "pz", "ore", "kg") |
| `unit_price` | number | Yes | Price per unit |
| `discount_percentage` | number | No | Discount percentage |
| `discount_amount` | number | No | Discount amount |
| `net_price` | number | Yes | Net line total (after discounts) |
| `vat_rate` | number | Yes | VAT rate percentage |
| `vat_nature` | string | No | VAT nature code for exempt items |
| `administrative_reference` | string | No | Administrative reference |
| `other_data` | string | No | Additional item data |

#### VAT Nature Codes

Used when VAT rate is 0 or item is exempt:

| Code | Description |
|------|-------------|
| N1 | Exempt under Articles 15 et seq. of DPR 633/72 |
| N2 | Non-taxable - other cases |
| N2.1 | Non-taxable - reverse charge |
| N2.2 | Non-taxable - ceased activity |
| N3 | Non-taxable - export |
| N3.1 | Non-taxable - EU transfers |
| N4 | Exempt |
| N5 | VAT regime for retail trade |
| N6 | Reverse charge |
| N7 | VAT paid in other EU countries |

### 6. Tax Summary (`vat_summary`)

Array of VAT totals grouped by rate.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vat_rate` | number | Yes | VAT rate percentage |
| `vat_nature` | string | No | VAT nature code (for exempt) |
| `reference_standard` | string | No | Legal reference for exemption |
| `taxable_amount` | number | Yes | Total taxable amount for this rate |
| `vat_amount` | number | Yes | Total VAT amount for this rate |
| `exemption_reason` | string | No | Reason for exemption |
| `refund_taxable_amount` | number | No | Refund taxable amount |

### 7. Withholding Tax (`withholding_tax`)

Array of withholding tax details (optional).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `withholding_type` | string | No | Type code (RT01-RT06) |
| `withholding_amount` | number | No | Withholding amount |
| `taxable_amount` | number | No | Amount subject to withholding |
| `withholding_rate` | number | No | Withholding rate percentage |
| `withholding_reason` | string | No | Reason code (A-Z9) |

### 8. Social Security Contributions (`social_security`)

Array of social security contribution details (optional).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contribution_type` | string | No | Type code (TC01-TC22) |
| `rate` | number | No | Contribution rate percentage |
| `contribution_amount` | number | No | Contribution amount |
| `taxable_amount` | number | No | Amount subject to contribution |
| `vat_nature` | string | No | VAT nature if applicable |
| `administrative_reference` | string | No | Administrative reference |

### 9. Totals

Overall invoice totals and amounts.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `taxable_amount` | number | Yes | Total taxable amount |
| `vat_amount` | number | Yes | Total VAT amount |
| `withholding_amount` | number | No | Total withholding amount |
| `social_security_amount` | number | No | Total social security amount |
| `stamp_duty_amount` | number | No | Stamp duty amount |
| `total_amount` | number | Yes | Total invoice amount |
| `rounding_amount` | number | No | Rounding adjustment |
| `net_amount_due` | number | Yes | Final amount due |

### 10. Payment Details (`payment_details`)

Payment terms and bank information.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `payment_terms` | string | Yes | Payment conditions (TP01-TP03) |
| `payment_method` | string | Yes | Payment method (MP01-MP22) |
| `due_date` | string | No | Payment due date |
| `payment_amount` | number | Yes | Payment amount |
| `iban` | string | No | Bank IBAN |
| `abi` | string | No | Italian bank ABI code |
| `cab` | string | No | Italian bank CAB code |
| `bic` | string | No | Bank BIC/SWIFT code |
| `advance_payment` | number | No | Early payment discount |
| `payment_due_days` | number | No | Payment terms in days |
| `bank_name` | string | No | Bank name |
| `account_holder` | string | No | Account holder name |

#### Payment Terms Codes

| Code | Description |
|------|-------------|
| TP01 | Payment in installments |
| TP02 | Payment in full |
| TP03 | Advance payment |

#### Payment Method Codes (Common)

| Code | Description |
|------|-------------|
| MP01 | Cash |
| MP02 | Check |
| MP03 | Cashier's check |
| MP04 | Cash at treasury |
| MP05 | Bank transfer |
| MP06 | Letter of credit |
| MP07 | Bank draft |
| MP08 | Payment slip |
| MP12 | Direct debit |
| MP13 | Credit transfer |
| MP20 | Postal payment |

### 11. Document References (`document_references`)

Array of related document references.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reference_type` | string | No | Document type |
| `reference_number` | string | No | Document number |
| `reference_date` | string | No | Document date |
| `cig_code` | string | No | CIG code (tender identification) |
| `cup_code` | string | No | CUP code (investment project) |
| `purchase_order_reference` | string | No | Purchase order number |
| `contract_reference` | string | No | Contract number |
| `agreement_reference` | string | No | Agreement number |
| `reception_reference` | string | No | Reception reference |
| `administrative_reference` | string | No | Administrative reference |

### 12. Additional Information

Miscellaneous invoice information.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `general_notes` | string | No | General notes or comments |
| `cause_of_issue` | string | No | Reason for invoice issuance |
| `art73_declaration` | string | No | Article 73 DPR 633/72 declaration |
| `transport_document_type` | string | No | Transport document type |
| `transport_document_number` | string | No | Transport document number |
| `transport_document_date` | string | No | Transport document date |

## Cross-Border Scenarios

### Intra-EU Purchases (TD17)

For purchases from other EU countries:
- `document_type`: "TD17"
- Supplier has non-Italian EU VAT number
- Customer is Italian entity
- VAT reverse charge mechanism applies
- Reference standard: "Art. 17 DPR 633/72"

### San Marino Transactions (TD18/TD19)

For transactions with San Marino:
- `document_type`: "TD18" (goods) or "TD19" (services)
- Country code "SM" for San Marino
- Special VAT treatment applies
- Integration invoice mechanism

## Output Formats

### JSON Output
Structured JSON format suitable for API integration and database storage.

### XML Output  
FatturaPA-compliant XML ready for submission to Italian SDI (Sistema di Interscambio).

## Usage Examples

See the `/examples/fatturapa/` directory for complete examples of:
- Italian domestic invoice (TD01)
- Cross-border EU invoice (TD17)
- San Marino services invoice (TD19)

Each example includes both the extracted data structure and the corresponding XML/JSON outputs.