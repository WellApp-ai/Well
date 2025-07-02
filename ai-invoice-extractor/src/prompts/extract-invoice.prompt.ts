import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"

const confidenceValue = z.object({
  value: z.union([z.string(), z.number(), z.null()]),
  confidence: z.number().min(0).max(1)
})

const addressSchema = z.object({
  value: z.string(),
  confidence: z.number().min(0).max(1)
})

const supplierSchema = z.object({
  name: confidenceValue,
  vat_id: confidenceValue,
  address: addressSchema
})

const customerSchema = z.object({
  name: confidenceValue,
  address: addressSchema
})

const itemSchema = z.object({
  description: confidenceValue,
  quantity: confidenceValue,
  unit_price: confidenceValue,
  total: confidenceValue
})

export const invoiceOutputSchema = z.object({
  document_type: confidenceValue,
  invoice_number: confidenceValue,
  issue_date: confidenceValue,
  due_date: confidenceValue,
  supplier: supplierSchema,
  customer: customerSchema,
  items: z.array(itemSchema),
  total_amount: confidenceValue,
  currency: confidenceValue
})

export type InvoiceOutput = z.infer<typeof invoiceOutputSchema>

export const extractInvoicePrompt = `
You are an AI specialized in extracting structured data from invoice and receipt images. 
Extract the information and return it in the specified JSON schema.

For each field, include a \`confidence\` score from 0.0 to 1.0 that reflects your 
certainty based on the OCR and context. 

If the field is not present in the image, return \`"value": null\` and a confidence score of 0.0.

Return only valid JSON matching the JSON schema. The JSON schema is:

${JSON.stringify(zodToJsonSchema(invoiceOutputSchema))}
`
