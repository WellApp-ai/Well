import { z } from "zod"

/**
 * Comprehensive FatturaPA (Italian e-invoicing) data model
 * Supports all document types: TD01 (domestic), TD17-TD19 (cross-border)
 * Includes all required and optional fields per Italian SDI specifications
 */

// ==============================
// Base confidence value schema
// ==============================

const confidenceValue = z.object({
  value: z.union([z.string(), z.number(), z.null()]),
  confidence: z.number().min(0).max(1)
})

const confidenceString = z.object({
  value: z.union([z.string(), z.null()]),
  confidence: z.number().min(0).max(1)
})

const confidenceNumber = z.object({
  value: z.union([z.number(), z.null()]),
  confidence: z.number().min(0).max(1)
})

const confidenceBoolean = z.object({
  value: z.union([z.boolean(), z.null()]),
  confidence: z.number().min(0).max(1)
})

const confidenceDate = z.object({
  value: z.union([z.string(), z.null()]), // ISO date string
  confidence: z.number().min(0).max(1)
})

// ==============================
// Address schemas
// ==============================

const addressSchema = z.object({
  street: confidenceString,
  street_number: confidenceString,
  postal_code: confidenceString,
  city: confidenceString,
  province: confidenceString, // Italian province code
  country: confidenceString, // ISO 3166-1 alpha-2 country code
  additional_info: confidenceString
})

// ==============================
// Party (Supplier/Customer) schemas
// ==============================

const partySchema = z.object({
  // Basic identification
  name: confidenceString,
  legal_form: confidenceString,
  
  // Tax identification
  vat_id: confidenceString, // Italian VAT number or foreign VAT
  tax_id: confidenceString, // Codice Fiscale for Italian entities
  foreign_vat_id: confidenceString, // For cross-border (TD17-TD19)
  
  // Contact information
  address: addressSchema,
  phone: confidenceString,
  email: confidenceString,
  pec: confidenceString, // Certified email (Italian)
  
  // Registration information
  rea_office: confidenceString, // REA registration office
  rea_number: confidenceString, // REA registration number
  share_capital: confidenceNumber,
  company_status: confidenceString, // LS = liquidation, LN = normal
  
  // For cross-border transactions
  representative_tax_id: confidenceString, // Italian tax representative
  is_foreign: confidenceBoolean
})

// ==============================
// Tax and VAT schemas
// ==============================

const taxDetailSchema = z.object({
  taxable_amount: confidenceNumber,
  vat_rate: confidenceNumber, // VAT percentage
  vat_amount: confidenceNumber,
  nature_code: confidenceString, // N1-N7 for VAT exemptions
  nature_description: confidenceString,
  administrative_reference: confidenceString,
  rounding_amount: confidenceNumber
})

const withholdingTaxSchema = z.object({
  withholding_type: confidenceString, // RT01, RT02, etc.
  taxable_amount: confidenceNumber,
  rate: confidenceNumber,
  amount: confidenceNumber,
  description: confidenceString
})

// ==============================
// Payment schemas
// ==============================

const paymentTermsSchema = z.object({
  payment_conditions: confidenceString, // TP01=immediate, TP02=deferred, TP03=installments
  due_date: confidenceDate,
  amount: confidenceNumber,
  payment_method: confidenceString, // MP05=bank transfer, MP08=card, etc.
  
  // Bank details
  iban: confidenceString,
  bic: confidenceString,
  bank_name: confidenceString,
  beneficiary_name: confidenceString,
  
  // Advanced payment info
  installment_number: confidenceNumber,
  advance_payment: confidenceNumber,
  penalty_amount: confidenceNumber,
  penalty_date: confidenceDate,
  discount_amount: confidenceNumber,
  discount_date: confidenceDate
})

// ==============================
// Reference documents schema
// ==============================

const referenceDocumentSchema = z.object({
  document_type: confidenceString, // Order, contract, transport doc, etc.
  document_number: confidenceString,
  document_date: confidenceDate,
  cig: confidenceString, // Codice Identificativo Gara (tender code)
  cup: confidenceString, // Codice Unico Progetto (project code)
  office_code: confidenceString, // Codice Ufficio (office code for PA)
  line_reference: confidenceNumber // Reference to specific invoice line
})

// ==============================
// Line item schemas
// ==============================

const lineItemSchema = z.object({
  line_number: confidenceNumber,
  description: confidenceString,
  quantity: confidenceNumber,
  unit_of_measure: confidenceString,
  unit_price: confidenceNumber,
  total_price: confidenceNumber,
  
  // Discounts and markups
  discount_percentage: confidenceNumber,
  discount_amount: confidenceNumber,
  markup_percentage: confidenceNumber,
  markup_amount: confidenceNumber,
  
  // Tax information
  vat_rate: confidenceNumber,
  vat_amount: confidenceNumber,
  vat_nature_code: confidenceString, // N1-N7 for exemptions
  vat_administrative_reference: confidenceString,
  
  // Additional details
  product_code: confidenceString,
  product_code_type: confidenceString, // EAN, internal, etc.
  start_date: confidenceDate, // For services
  end_date: confidenceDate, // For services
  withholding_tax: withholdingTaxSchema,
  
  // Cross-border specific
  customs_info: confidenceString,
  origin_country: confidenceString
})

// ==============================
// Currency and exchange rate schema
// ==============================

const currencyInfoSchema = z.object({
  currency_code: confidenceString, // ISO 4217 currency code
  exchange_rate: confidenceNumber, // Exchange rate to EUR
  exchange_rate_date: confidenceDate
})

// ==============================
// Transportation/Delivery schema  
// ==============================

const transportationSchema = z.object({
  transport_method: confidenceString,
  carrier_name: confidenceString,
  carrier_vat_id: confidenceString,
  transport_date: confidenceDate,
  delivery_address: addressSchema,
  delivery_terms: confidenceString, // Incoterms
  transport_reason: confidenceString,
  number_of_packages: confidenceNumber,
  package_description: confidenceString,
  gross_weight: confidenceNumber,
  net_weight: confidenceNumber,
  transport_document_number: confidenceString,
  transport_document_date: confidenceDate
})

// ==============================
// Main FatturaPA invoice schema
// ==============================

export const fatturapaInvoiceSchema = z.object({
  // ==============================
  // Document Header
  // ==============================
  
  // Document identification
  document_type_code: confidenceString, // TD01, TD17, TD18, TD19
  invoice_number: confidenceString,
  issue_date: confidenceDate,
  currency: currencyInfoSchema,
  
  // Format and transmission info
  transmission_format: confidenceString, // FPR12 (1.2), FPA12 (PA 1.2)
  country_code: confidenceString, // IT for Italian documents
  
  // ==============================
  // Parties
  // ==============================
  
  supplier: partySchema,
  customer: partySchema,
  
  // Third-party entities
  tax_representative: partySchema, // Italian tax representative for foreign suppliers
  intermediary: partySchema, // Intermediary for submission
  
  // ==============================
  // Document Details
  // ==============================
  
  // Line items
  line_items: z.array(lineItemSchema),
  
  // Tax summary
  tax_details: z.array(taxDetailSchema),
  withholding_taxes: z.array(withholdingTaxSchema),
  
  // Totals
  taxable_amount: confidenceNumber, // Total before VAT
  vat_amount: confidenceNumber, // Total VAT
  withholding_amount: confidenceNumber, // Total withholding tax
  total_amount: confidenceNumber, // Final amount to pay
  rounding_amount: confidenceNumber, // Rounding difference
  
  // Advanced charges
  advance_amount: confidenceNumber, // Advanced payments received
  stamp_duty_amount: confidenceNumber, // Bollo (stamp duty)
  
  // ==============================
  // Payment Information
  // ==============================
  
  payment_terms: z.array(paymentTermsSchema),
  
  // ==============================
  // References and Attachments
  // ==============================
  
  reference_documents: z.array(referenceDocumentSchema),
  transportation: transportationSchema,
  
  // Attachments
  has_attachments: confidenceBoolean,
  attachment_count: confidenceNumber,
  attachment_descriptions: z.array(confidenceString),
  
  // ==============================
  // Additional Information
  // ==============================
  
  general_notes: confidenceString,
  administrative_reference: confidenceString, // For public administration
  invoice_note: confidenceString,
  
  // Cross-border specific fields
  is_domestic: confidenceBoolean, // True for TD01, false for TD17-TD19
  origin_country: confidenceString,
  destination_country: confidenceString,
  customs_procedure: confidenceString,
  
  // ==============================
  // Digital Signature Info (if present)
  // ==============================
  
  is_digitally_signed: confidenceBoolean,
  signature_date: confidenceDate,
  signer_name: confidenceString,
  
  // ==============================
  // Metadata
  // ==============================
  
  extraction_date: confidenceDate,
  document_language: confidenceString,
  processing_notes: confidenceString
})

// ==============================
// Export types
// ==============================

export type FatturapaInvoice = z.infer<typeof fatturapaInvoiceSchema>
export type ConfidenceValue<T = string | number> = z.infer<typeof confidenceValue>
export type Address = z.infer<typeof addressSchema>
export type Party = z.infer<typeof partySchema>
export type TaxDetail = z.infer<typeof taxDetailSchema>
export type PaymentTerms = z.infer<typeof paymentTermsSchema>
export type LineItem = z.infer<typeof lineItemSchema>
export type ReferenceDocument = z.infer<typeof referenceDocumentSchema>
export type CurrencyInfo = z.infer<typeof currencyInfoSchema>
export type Transportation = z.infer<typeof transportationSchema>

// ==============================
// Document type constants
// ==============================

export const FATTURAPA_DOCUMENT_TYPES = {
  TD01: "Fattura domestica", // Domestic invoice
  TD17: "Integrazione fattura reverse charge interno", // Domestic reverse charge integration
  TD18: "Integrazione fattura acquisti intracomunitari", // Intra-EU purchase integration  
  TD19: "Integrazione fattura acquisti da paesi extra UE", // Extra-EU purchase integration
  TD20: "Autofattura", // Self-billing
  TD21: "Autofattura per acquisti extra UE", // Self-billing for extra-EU purchases
  TD22: "Fattura differita di cui all'art. 21, comma 4, lett. a)", // Deferred invoice
  TD23: "Fattura differita di cui all'art. 21, comma 4, lett. b)", // Deferred invoice
  TD24: "Fattura differita di cui all'art. 21, comma 4, lett. c)", // Deferred invoice
  TD25: "Fattura differita di cui all'art. 21, comma 4, lett. c-bis)", // Deferred invoice
  TD26: "Cessione di beni ammortizzabili e per passaggi interni", // Transfer of depreciable goods
  TD27: "Fattura per autoconsumo o per cessioni gratuite senza rivalsa" // Self-consumption or free transfers
} as const

export const VAT_NATURE_CODES = {
  N1: "Escluse ex art. 15", // Excluded by art. 15
  N2: "Non soggette", // Not subject to VAT
  N3: "Non imponibili", // Not taxable
  N4: "Esenti", // Exempt
  N5: "Regime del margine/IVA non esposta in fattura", // Margin scheme/VAT not shown
  N6: "Inversione contabile", // Reverse charge
  N7: "IVA assolta in altro stato UE" // VAT paid in another EU state
} as const

export const PAYMENT_CONDITIONS = {
  TP01: "Pagamento a rate", // Installment payment
  TP02: "Pagamento completo", // Full payment
  TP03: "Anticipo" // Advance payment
} as const

export const PAYMENT_METHODS = {
  MP01: "Contanti", // Cash
  MP02: "Assegno", // Check
  MP03: "Assegno circolare", // Cashier's check
  MP04: "Contanti presso tesoreria", // Cash at treasury
  MP05: "Bonifico", // Bank transfer
  MP06: "Vaglia cambiario", // Bill of exchange
  MP07: "Bollettino bancario", // Bank receipt
  MP08: "Carta di pagamento", // Payment card
  MP09: "RID", // Direct debit
  MP10: "RID utenze", // Utility direct debit
  MP11: "RID veloce", // Fast direct debit
  MP12: "RIBA", // Bank collection
  MP13: "MAV", // Payment slip
  MP14: "Quietanza erario", // Tax payment receipt
  MP15: "Giroconto su conti di contabilità speciale", // Special accounting transfer
  MP16: "Domiciliazione bancaria", // Bank domiciliation
  MP17: "Domiciliazione postale", // Postal domiciliation
  MP18: "Bollettino di c/c postale", // Postal current account
  MP19: "SEPA Direct Debit", // SEPA Direct Debit
  MP20: "SEPA Direct Debit CORE", // SEPA Direct Debit CORE
  MP21: "SEPA Direct Debit B2B", // SEPA Direct Debit B2B
  MP22: "Trattenuta su somme già riscosse" // Withholding on amounts already collected
} as const