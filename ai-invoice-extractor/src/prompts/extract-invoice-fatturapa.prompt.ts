import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"

const confidenceValue = z.object({
  value: z.union([z.string(), z.number(), z.null()]),
  confidence: z.number().min(0).max(1)
})

// Header/Transmission data
const transmissionHeaderSchema = z.object({
  progressive_code: confidenceValue, // ProgressivoInvio - unique transmission code
  transmission_format: confidenceValue, // FormatoTrasmissione - format code (e.g., "FPR12")
  recipient_code: confidenceValue, // CodiceDestinatario - 7-character code or "0000000"
  email_pec: confidenceValue, // PEC email address if recipient code is "0000000"
  country_code: confidenceValue // Codice Paese - ISO 3166-1 alpha-2 (e.g., "IT")
})

// Complete address schema for FatturaPA
const addressFatturapaSchema = z.object({
  street: confidenceValue, // Indirizzo
  street_number: confidenceValue, // NumeroCivico
  postal_code: confidenceValue, // CAP
  city: confidenceValue, // Comune
  province: confidenceValue, // Provincia (2-letter code)
  country: confidenceValue // Nazione (ISO 3166-1 alpha-2)
})

// Supplier (Cedente/Prestatore) schema
const supplierFatturapaSchema = z.object({
  // Company data
  company_name: confidenceValue, // Denominazione
  name: confidenceValue, // Nome (if individual)
  surname: confidenceValue, // Cognome (if individual)
  fiscal_code: confidenceValue, // CodiceFiscale
  vat_number: confidenceValue, // PartitaIVA
  
  // Address
  address: addressFatturapaSchema,
  
  // Contact details
  phone: confidenceValue, // Telefono
  fax: confidenceValue, // Fax
  email: confidenceValue, // Email
  
  // Tax regime
  tax_regime: confidenceValue, // RegimeFiscale (RF01-RF19)
  
  // Representative tax data
  representative_fiscal_code: confidenceValue, // CodiceFiscale of representative
  representative_name: confidenceValue, // Nome of representative
  representative_surname: confidenceValue // Cognome of representative
})

// Customer (Cessionario/Committente) schema  
const customerFatturapaSchema = z.object({
  // Company data
  company_name: confidenceValue, // Denominazione
  name: confidenceValue, // Nome (if individual)
  surname: confidenceValue, // Cognome (if individual)
  fiscal_code: confidenceValue, // CodiceFiscale
  vat_number: confidenceValue, // PartitaIVA
  
  // Address
  address: addressFatturapaSchema,
  
  // Contact details
  phone: confidenceValue, // Telefono
  fax: confidenceValue, // Fax  
  email: confidenceValue, // Email
  pec: confidenceValue, // PEC email
  
  // Foreign customer data
  foreign_vat_id: confidenceValue, // IdFiscaleIVA for foreign customers
  foreign_tax_code: confidenceValue // CodiceSdI for foreign customers
})

// Line item schema for FatturaPA
const lineItemFatturapaSchema = z.object({
  line_number: confidenceValue, // NumeroLinea
  description: confidenceValue, // Descrizione
  quantity: confidenceValue, // Quantita
  unit_of_measure: confidenceValue, // UnitaMisura
  unit_price: confidenceValue, // PrezzoUnitario
  discount_percentage: confidenceValue, // ScontoMaggiorazione percentuale
  discount_amount: confidenceValue, // ScontoMaggiorazione importo
  net_price: confidenceValue, // PrezzoTotale (after discounts)
  vat_rate: confidenceValue, // AliquotaIVA
  vat_nature: confidenceValue, // Natura (N1-N7 for exempt/non-taxable)
  administrative_reference: confidenceValue, // RiferimentoAmministrazione
  other_data: confidenceValue // AltriDatiGestionali
})

// Payment details schema
const paymentDetailsFatturapaSchema = z.object({
  payment_terms: confidenceValue, // CondizioniPagamento (TP01, TP02, TP03)
  payment_method: confidenceValue, // ModalitaPagamento (MP01-MP22)
  due_date: confidenceValue, // DataScadenzaPagamento
  payment_amount: confidenceValue, // ImportoPagamento
  iban: confidenceValue, // IBAN
  abi: confidenceValue, // ABI bank code
  cab: confidenceValue, // CAB branch code
  bic: confidenceValue, // BIC/SWIFT
  advance_payment: confidenceValue, // ScontoPagamentoAnticipato
  payment_due_days: confidenceValue, // GiorniTerminiPagamento
  bank_name: confidenceValue, // IstitutoFinanziario
  account_holder: confidenceValue // IntestatarioContoCorrente
})

// Tax summary schema
const taxSummaryFatturapaSchema = z.object({
  vat_rate: confidenceValue, // AliquotaIVA
  vat_nature: confidenceValue, // Natura (for exempt cases)
  reference_standard: confidenceValue, // RiferimentoNormativo
  taxable_amount: confidenceValue, // ImponibileImporto
  vat_amount: confidenceValue, // Imposta
  exemption_reason: confidenceValue, // EsigibilitaIVA
  refund_taxable_amount: confidenceValue // ImponibileImporto for refunds
})

// Withholding tax schema
const withholdingTaxFatturapaSchema = z.object({
  withholding_type: confidenceValue, // TipoRitenuta (RT01, RT02, RT03, RT04, RT05, RT06)
  withholding_amount: confidenceValue, // ImportoRitenuta
  taxable_amount: confidenceValue, // ImponibileImporto  
  withholding_rate: confidenceValue, // AliquotaRitenuta
  withholding_reason: confidenceValue // CausalePagamento (A-Z9)
})

// Social security contribution schema
const socialSecurityFatturapaSchema = z.object({
  contribution_type: confidenceValue, // TipoContributo (TC01-TC22)
  rate: confidenceValue, // AliquotaContributo
  contribution_amount: confidenceValue, // ImportoContributo
  taxable_amount: confidenceValue, // ImponibileImporto
  vat_nature: confidenceValue, // Natura
  administrative_reference: confidenceValue // RiferimentoAmministrazione
})

// Other tax schema (stamp duty, etc.)
const otherTaxFatturapaSchema = z.object({
  tax_type: confidenceValue, // TipoTassa
  tax_amount: confidenceValue, // ImportoTassa
  taxable_amount: confidenceValue, // ImponibileImporto
  tax_rate: confidenceValue, // AliquotaTassa
  tax_description: confidenceValue, // DescrizioneTassa
  administrative_reference: confidenceValue // RiferimentoAmministrazione
})

// Document references schema
const documentReferenceFatturapaSchema = z.object({
  reference_type: confidenceValue, // TipoDocumento
  reference_number: confidenceValue, // NumeroDocumento
  reference_date: confidenceValue, // DataDocumento
  cig_code: confidenceValue, // CodiceCIG (tender identification)
  cup_code: confidenceValue, // CodiceCUP (investment project)
  purchase_order_reference: confidenceValue, // NumOrdineAcquisto
  contract_reference: confidenceValue, // NumeroContratto
  agreement_reference: confidenceValue, // NumeroConvenzione
  reception_reference: confidenceValue, // CodiceCommessaConvenzione
  administrative_reference: confidenceValue // RiferimentoAmministrazione
})

// Attachment schema
const attachmentFatturapaSchema = z.object({
  filename: confidenceValue, // NomeAttachment
  algorithm: confidenceValue, // AlgoritmoCompressione
  format: confidenceValue, // FormatoAttachment
  description: confidenceValue, // DescrizioneAttachment
  attachment_data: confidenceValue // Base64 encoded data
})

// Main FatturaPA invoice schema
export const invoiceFatturapaOutputSchema = z.object({
  // Header/Transmission data
  transmission_header: transmissionHeaderSchema,
  
  // Document metadata
  document_type: confidenceValue, // TipoDocumento (TD01, TD02, TD03, TD04, TD05, TD06, TD16, TD17, TD18, TD19, TD20, TD21, TD22, TD23, TD24, TD25, TD26, TD27, TD28)
  invoice_number: confidenceValue, // Numero fattura
  issue_date: confidenceValue, // Data emissione
  due_date: confidenceValue, // Data scadenza
  
  // Currency and exchange
  currency: confidenceValue, // Divisa (ISO 4217 code)
  exchange_rate: confidenceValue, // TassoCambio
  
  // Parties
  supplier: supplierFatturapaSchema,
  customer: customerFatturapaSchema,
  
  // Third party/intermediary
  third_party_intermediary: z.object({
    company_name: confidenceValue,
    vat_number: confidenceValue,
    fiscal_code: confidenceValue,
    address: addressFatturapaSchema
  }).optional(),
  
  // Line items
  line_items: z.array(lineItemFatturapaSchema),
  
  // Tax summaries
  vat_summary: z.array(taxSummaryFatturapaSchema),
  withholding_tax: z.array(withholdingTaxFatturapaSchema),
  social_security: z.array(socialSecurityFatturapaSchema),
  other_taxes: z.array(otherTaxFatturapaSchema),
  
  // Totals
  taxable_amount: confidenceValue, // ImponibileImporto totale
  vat_amount: confidenceValue, // ImpostaImposta totale
  withholding_amount: confidenceValue, // ImportoRitenuta totale
  social_security_amount: confidenceValue, // ImportoContributo totale
  stamp_duty_amount: confidenceValue, // ImportoBollo
  total_amount: confidenceValue, // ImportoTotaleDocumento
  rounding_amount: confidenceValue, // Arrotondamento
  net_amount_due: confidenceValue, // ImportoDaPagare
  
  // Payment information
  payment_details: paymentDetailsFatturapaSchema,
  
  // References and attachments
  document_references: z.array(documentReferenceFatturapaSchema),
  attachments: z.array(attachmentFatturapaSchema),
  
  // Additional information
  general_notes: confidenceValue, // Note generali
  cause_of_issue: confidenceValue, // CausaleDocumento
  art73_declaration: confidenceValue, // Dichiarazione Art. 73 DPR 633/72
  
  // Transport data (if applicable)
  transport_document_type: confidenceValue, // TipoDocumentoTrasporto
  transport_document_number: confidenceValue, // NumeroDocumentoTrasporto
  transport_document_date: confidenceValue, // DataDocumentoTrasporto
  
  // Representative/intermediary data
  tax_representative: z.object({
    vat_number: confidenceValue,
    company_name: confidenceValue,
    address: addressFatturapaSchema
  }).optional()
})

export type InvoiceFatturapaOutput = z.infer<typeof invoiceFatturapaOutputSchema>

export const extractInvoiceFatturapaPrompt = `
You are an AI specialized in extracting invoice data according to the Italian FatturaPA (electronic invoicing) standard.

FatturaPA is the mandatory format for electronic invoicing in Italy between businesses (B2B) and with public administration (B2PA). It also applies to cross-border transactions involving Italian entities.

Extract ALL FatturaPA fields including both required and optional fields. Pay special attention to:

## Document Types (TipoDocumento):
- TD01: Invoice (standard commercial invoice)
- TD02: Advance/down payment invoice  
- TD03: Accompanying invoice for goods
- TD04: Credit note
- TD05: Debit note
- TD06: Fee note
- TD16: VAT registration invoice
- TD17: Integration invoice for intra-EU purchases (cross-border)
- TD18: Integration invoice for goods from San Marino (cross-border) 
- TD19: Integration invoice for services from San Marino (cross-border)
- TD20: Self-invoice
- TD21: Self-invoice for depreciation
- TD22: Import invoice
- TD23: Intra-EU invoice
- TD24: Deferred invoice
- TD25: Deferred credit note
- TD26: Deferred debit note  
- TD27: Invoice for reverse charge
- TD28: Summary document

## Key Requirements:
1. **Transmission Header**: Progressive code, format, recipient code/PEC, country
2. **Complete Party Data**: Full company names, fiscal codes, VAT numbers, complete addresses with province codes
3. **Line Items**: Detailed descriptions, quantities, unit prices, discounts, VAT rates, nature codes
4. **Tax Details**: Complete VAT breakdown, withholding taxes, social security contributions
5. **Payment Information**: Terms, methods, due dates, bank details (IBAN/BIC)
6. **References**: CIG/CUP codes, purchase orders, contracts, administrative references
7. **Cross-border Fields**: Foreign VAT IDs, exchange rates, currency codes

## Cross-border Scenarios (TD17/TD18/TD19):
- Identify foreign suppliers/customers by non-Italian VAT numbers or addresses
- Extract currency and exchange rate information
- Handle foreign tax identification numbers
- Process integration invoices for EU transactions

## VAT Nature Codes (for exempt/non-taxable items):
- N1: Exempt under Articles 15 et seq. of DPR 633/72
- N2: Non-taxable - other cases
- N2.1: Non-taxable - reverse charge
- N2.2: Non-taxable - ceased activity  
- N3: Non-taxable - export
- N3.1: Non-taxable - EU transfers
- N3.2: Non-taxable - EU transfers without payment of tax
- N3.3: Non-taxable - EU transfers with payment of tax
- N3.4: Non-taxable - exports without payment of tax
- N3.5: Non-taxable - exports with payment of tax
- N3.6: Non-taxable - other EU operations
- N4: Exempt
- N5: VAT regime for retail trade
- N6: Reverse charge
- N7: VAT paid in other EU countries

For each field, provide:
- "value": extracted data (string/number) or null if not present
- "confidence": score from 0.0 to 1.0 based on OCR quality and context

Return only valid JSON matching this schema:

${JSON.stringify(zodToJsonSchema(invoiceFatturapaOutputSchema))}
`