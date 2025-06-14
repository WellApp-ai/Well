import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"

const confidenceValue = z.object({
  value: z.union([z.string(), z.number(), z.null()]),
  confidence: z.number().min(0).max(1)
})

const addressSchema = z.object({
  street: confidenceValue,
  city: confidenceValue,
  postal_code: confidenceValue,
  country: confidenceValue
})

const partySchema = z.object({
  name: confidenceValue,
  vat_id: confidenceValue,
  address: addressSchema
})

const paymentMeansSchema = z.object({
  type_code: confidenceValue,
  iban: confidenceValue,
  bic: confidenceValue
})

const taxDetailSchema = z.object({
  category_code: confidenceValue,
  percent: confidenceValue,
  amount: confidenceValue,
  taxable_amount: confidenceValue
})

const referenceSchema = z.object({
  document_type: confidenceValue,
  document_number: confidenceValue
})

const itemSchema = z.object({
  description: confidenceValue,
  quantity: confidenceValue,
  unit_price: confidenceValue,
  total: confidenceValue,
  vat_percent: confidenceValue,
  vat_amount: confidenceValue
})

export const invoiceFacturxOutputSchema = z.object({
  document_type_code: confidenceValue,
  invoice_number: confidenceValue,
  issue_date: confidenceValue,
  due_date: confidenceValue,
  seller: partySchema,
  buyer: partySchema,
  payment_means: paymentMeansSchema,
  currency: confidenceValue,
  references: z.array(referenceSchema),
  tax_details: z.array(taxDetailSchema),
  total_tax_amount: confidenceValue,
  total_gross_amount: confidenceValue,
  line_items: z.array(itemSchema),
  additional_information: confidenceValue
})

export type InvoiceFacturxOutput = z.infer<typeof invoiceFacturxOutputSchema>

export const extractInvoiceFacturxPrompt = `
You are an AI specialized in extracting invoice data from images or PDFs according to the Factur-X (EN 16931) electronic invoicing standard.

Extract all fields required for maximum Factur-X compliance, including:
- Invoice document type code (e.g., 380 for commercial invoice)
- Invoice number
- Issue date
- Due date
- Seller (name, VAT ID, address: street, city, postal code, country)
- Buyer (name, VAT ID, address)
- Payment means (type code, IBAN, BIC if available)
- Invoice currency (ISO 4217 code)
- References (e.g., purchase order number, contract)
- Tax details (category code, percent, amount, taxable amount)
- Total tax amount
- Total gross amount
- All line items, each with: description, quantity, unit price, total, VAT percent and VAT amount
- Any additional information or notes present on the document

For each field, include:
- a "value" (string/number or null if absent)
- a "confidence" score from 0.0 to 1.0 indicating certainty based on OCR and context

If a field is not present, set "value": null and "confidence": 0.0.

Return only valid JSON matching the following JSON schema:

${JSON.stringify(zodToJsonSchema(invoiceFacturxOutputSchema))}
`
