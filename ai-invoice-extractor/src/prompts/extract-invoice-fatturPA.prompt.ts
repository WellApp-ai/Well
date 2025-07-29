import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"

const confidenceValue = z.object({
  value: z.union([z.string(), z.number(), z.null()]),
  confidence: z.number().min(0).max(1)
})

// Extended address schema for FatturaPA compliance
const fatturapaAddressSchema = z.object({
  street: confidenceValue,
  civic_number: confidenceValue,
  city: confidenceValue,
  postal_code: confidenceValue,
  province: confidenceValue,
  country: confidenceValue
})

// Enhanced party schema for FatturaPA with foreign entity support
const fatturapaPartySchema = z.object({
  name: confidenceValue,
  vat_id: confidenceValue,
  tax_code: confidenceValue, // Codice Fiscale
  country_code: confidenceValue, // For foreign entities
  address: fatturapaAddressSchema,
  // Additional FatturaPA fields
  legal_form: confidenceValue,
  share_capital: confidenceValue,
  shareholder_status: confidenceValue,
  liquidation_status: confidenceValue,
  // Contact details
  phone: confidenceValue,
  fax: confidenceValue,
  email: confidenceValue,
  pec: confidenceValue // Certified email for Italian entities
})

// Payment terms and methods for FatturaPA
const fatturapaPaymentSchema = z.object({
  payment_conditions: confidenceValue, // TP01, TP02, etc.
  payment_method: confidenceValue, // MP01-MP23
  payment_due_date: confidenceValue,
  payment_amount: confidenceValue,
  iban: confidenceValue,
  bic: confidenceValue,
  bank_name: confidenceValue,
  beneficiary: confidenceValue
})

// Enhanced tax details for Italian requirements
const fatturapaTaxSchema = z.object({
  taxable_amount: confidenceValue,
  tax_rate: confidenceValue,
  tax_amount: confidenceValue,
  tax_nature: confidenceValue, // N1-N7 for exempt taxes
  administrative_reference: confidenceValue,
  // For reverse charge scenarios
  vat_collectability: confidenceValue // I=immediate, D=deferred, S=split payment
})

// Transport/delivery information
const fatturapaDeliverySchema = z.object({
  delivery_address: fatturapaAddressSchema,
  delivery_date: confidenceValue,
  transport_date: confidenceValue,
  transport_reason: confidenceValue
})

// Enhanced line item schema for FatturaPA
const fatturapaItemSchema = z.object({
  line_number: confidenceValue,
  description: confidenceValue,
  quantity: confidenceValue,
  unit_of_measure: confidenceValue,
  unit_price: confidenceValue,
  total_before_discount: confidenceValue,
  discount_percentage: confidenceValue,
  discount_amount: confidenceValue,
  total_amount: confidenceValue,
  tax_rate: confidenceValue,
  tax_nature: confidenceValue, // For tax-exempt items
  administrative_reference: confidenceValue,
  // Product classification
  article_code_type: confidenceValue,
  article_code_value: confidenceValue
})

// Currency and exchange rate information
const fatturapaCurrencySchema = z.object({
  currency_code: confidenceValue, // ISO 4217
  exchange_rate: confidenceValue,
  exchange_rate_date: confidenceValue
})

// Document references (orders, contracts, etc.)
const fatturapaReferenceSchema = z.object({
  document_type: confidenceValue,
  document_number: confidenceValue,
  document_date: confidenceValue,
  cig: confidenceValue, // Codice Identificativo Gara
  cup: confidenceValue  // Codice Unico Progetto
})

// Withholding tax information
const fatturapaWithholdingSchema = z.object({
  withholding_type: confidenceValue,
  withholding_rate: confidenceValue,
  withholding_amount: confidenceValue,
  withholding_causale: confidenceValue
})

// Main FatturaPA schema
export const invoiceFatturapAOutputSchema = z.object({
  // Header information
  transmission_format: confidenceValue, // Always "FPR12" for FatturaPA
  progressive_file_number: confidenceValue,
  
  // Document identification
  document_type: confidenceValue, // TD01-TD28
  invoice_number: confidenceValue,
  issue_date: confidenceValue,
  
  // Parties
  seller: fatturapaPartySchema,
  buyer: fatturapaPartySchema,
  
  // Representative (for foreign entities)
  tax_representative: fatturapaPartySchema.optional(),
  
  // Currency and rates
  currency: fatturapaCurrencySchema,
  
  // Payment information
  payment_details: z.array(fatturapaPaymentSchema),
  
  // Tax summary
  tax_details: z.array(fatturapaTaxSchema),
  
  // Line items
  line_items: z.array(fatturapaItemSchema),
  
  // Document references
  references: z.array(fatturapaReferenceSchema),
  
  // Delivery information
  delivery: fatturapaDeliverySchema.optional(),
  
  // Withholding tax
  withholding: fatturapaWithholdingSchema.optional(),
  
  // Totals
  taxable_amount_total: confidenceValue,
  tax_amount_total: confidenceValue,
  withholding_amount_total: confidenceValue,
  payable_amount: confidenceValue,
  
  // Additional information
  general_notes: confidenceValue,
  related_documents: z.array(confidenceValue),
  
  // Public administration specific fields
  pa_code: confidenceValue, // Codice Destinatario for PA
  pa_pec: confidenceValue   // PEC for PA communications
})

export type InvoiceFatturapAOutput = z.infer<typeof invoiceFatturapAOutputSchema>

export const extractInvoiceFatturapAPrompt = `
You are an AI specialized in extracting invoice data from images or PDFs according to the Italian FatturaPA (Fatturazione Elettronica) standard.

Extract all fields required for FatturaPA compliance, paying special attention to:

HEADER INFORMATION:
- Transmission format (always "FPR12" for FatturaPA)
- Progressive file number
- Document type code (TD01 for standard invoice, TD04 for credit note, etc.)

PARTY INFORMATION:
- For Italian entities: VAT ID (Partita IVA), Tax Code (Codice Fiscale)
- For foreign entities: Country code, VAT ID format according to country
- Complete addresses including province (for Italian addresses)
- Contact details including PEC (certified email) for Italian entities

CURRENCY AND EXCHANGE RATES:
- Currency code (ISO 4217)
- Exchange rate and date (for non-EUR currencies)

PAYMENT INFORMATION:
- Payment conditions (TP01=immediate, TP02=deferred, TP03=installments)
- Payment method codes (MP01-MP23, e.g., MP05=bank transfer)
- Banking details (IBAN, BIC, bank name)

TAX DETAILS:
- VAT rates and amounts
- Tax nature codes for exempt transactions (N1-N7)
- VAT collectability (I=immediate, D=deferred, S=split payment)
- Administrative references for exempt taxes

LINE ITEMS:
- Detailed product/service descriptions
- Quantities, units of measure, prices
- Discount information
- Tax rates and nature codes per line
- Article codes if present

SPECIAL SCENARIOS:
- Public Administration invoices (PA code, PEC)
- Foreign supplier/customer handling
- Reverse charge mechanisms
- Withholding tax information
- Document references (CIG, CUP for public contracts)

For each field, provide:
- "value": actual extracted value or null if not present
- "confidence": score from 0.0 to 1.0 indicating extraction certainty

Return only valid JSON matching this schema:

${JSON.stringify(zodToJsonSchema(invoiceFatturapAOutputSchema))}
`