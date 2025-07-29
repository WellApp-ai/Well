import { describe, it, expect } from "vitest"
import { invoiceFatturapaOutputSchema } from "@/prompts/extract-invoice-fatturapa.prompt"
import { serializeFatturapaToXML, serializeFatturapaToJSON, detectDocumentType } from "@/utils/fatturapa"

describe("FatturaPA Schema Validation", () => {
  it("should validate a complete FatturaPA invoice structure", () => {
    const sampleData = {
      transmission_header: {
        progressive_code: { value: "00001", confidence: 0.95 },
        transmission_format: { value: "FPR12", confidence: 0.99 },
        recipient_code: { value: "ABCDEFG", confidence: 0.90 },
        email_pec: { value: null, confidence: 0.0 },
        country_code: { value: "IT", confidence: 0.99 }
      },
      document_type: { value: "TD01", confidence: 0.98 },
      invoice_number: { value: "INV-2024-001", confidence: 0.95 },
      issue_date: { value: "2024-01-15", confidence: 0.92 },
      due_date: { value: "2024-02-15", confidence: 0.88 },
      currency: { value: "EUR", confidence: 0.99 },
      exchange_rate: { value: null, confidence: 0.0 },
      supplier: {
        company_name: { value: "ACME Italia S.r.l.", confidence: 0.95 },
        name: { value: null, confidence: 0.0 },
        surname: { value: null, confidence: 0.0 },
        fiscal_code: { value: "ACMITA12345678901", confidence: 0.90 },
        vat_number: { value: "IT12345678901", confidence: 0.93 },
        tax_regime: { value: "RF01", confidence: 0.85 },
        address: {
          street: { value: "Via Roma", confidence: 0.88 },
          street_number: { value: "123", confidence: 0.85 },
          postal_code: { value: "00100", confidence: 0.92 },
          city: { value: "Roma", confidence: 0.95 },
          province: { value: "RM", confidence: 0.90 },
          country: { value: "IT", confidence: 0.99 }
        },
        phone: { value: "+39 06 1234567", confidence: 0.82 },
        fax: { value: null, confidence: 0.0 },
        email: { value: "info@acmeitalia.it", confidence: 0.88 },
        representative_fiscal_code: { value: null, confidence: 0.0 },
        representative_name: { value: null, confidence: 0.0 },
        representative_surname: { value: null, confidence: 0.0 }
      },
      customer: {
        company_name: { value: "Beta Solutions S.p.A.", confidence: 0.94 },
        name: { value: null, confidence: 0.0 },
        surname: { value: null, confidence: 0.0 },
        fiscal_code: { value: "BETSOL98765432101", confidence: 0.89 },
        vat_number: { value: "IT98765432101", confidence: 0.91 },
        foreign_vat_id: { value: null, confidence: 0.0 },
        foreign_tax_code: { value: null, confidence: 0.0 },
        address: {
          street: { value: "Via Milano", confidence: 0.87 },
          street_number: { value: "456", confidence: 0.83 },
          postal_code: { value: "20100", confidence: 0.91 },
          city: { value: "Milano", confidence: 0.94 },
          province: { value: "MI", confidence: 0.89 },
          country: { value: "IT", confidence: 0.98 }
        },
        phone: { value: "+39 02 9876543", confidence: 0.80 },
        fax: { value: null, confidence: 0.0 },
        email: { value: "orders@betasolutions.it", confidence: 0.86 },
        pec: { value: "betasolutions@pec.it", confidence: 0.84 }
      },
      line_items: [
        {
          line_number: { value: "1", confidence: 0.99 },
          description: { value: "Consulenza informatica", confidence: 0.92 },
          quantity: { value: "10", confidence: 0.95 },
          unit_of_measure: { value: "ore", confidence: 0.88 },
          unit_price: { value: "80.00", confidence: 0.93 },
          discount_percentage: { value: null, confidence: 0.0 },
          discount_amount: { value: null, confidence: 0.0 },
          net_price: { value: "800.00", confidence: 0.94 },
          vat_rate: { value: "22.00", confidence: 0.96 },
          vat_nature: { value: null, confidence: 0.0 },
          administrative_reference: { value: null, confidence: 0.0 },
          other_data: { value: null, confidence: 0.0 }
        }
      ],
      vat_summary: [
        {
          vat_rate: { value: "22.00", confidence: 0.96 },
          vat_nature: { value: null, confidence: 0.0 },
          reference_standard: { value: null, confidence: 0.0 },
          taxable_amount: { value: "800.00", confidence: 0.94 },
          vat_amount: { value: "176.00", confidence: 0.93 },
          exemption_reason: { value: null, confidence: 0.0 },
          refund_taxable_amount: { value: null, confidence: 0.0 }
        }
      ],
      withholding_tax: [],
      social_security: [],
      other_taxes: [],
      taxable_amount: { value: "800.00", confidence: 0.94 },
      vat_amount: { value: "176.00", confidence: 0.93 },
      withholding_amount: { value: null, confidence: 0.0 },
      social_security_amount: { value: null, confidence: 0.0 },
      stamp_duty_amount: { value: null, confidence: 0.0 },
      total_amount: { value: "976.00", confidence: 0.95 },
      rounding_amount: { value: null, confidence: 0.0 },
      net_amount_due: { value: "976.00", confidence: 0.95 },
      payment_details: {
        payment_terms: { value: "TP02", confidence: 0.88 },
        payment_method: { value: "MP05", confidence: 0.90 },
        due_date: { value: "2024-02-15", confidence: 0.88 },
        payment_amount: { value: "976.00", confidence: 0.95 },
        iban: { value: "IT60X0542811101000000123456", confidence: 0.85 },
        abi: { value: "05428", confidence: 0.82 },
        cab: { value: "11101", confidence: 0.80 },
        bic: { value: "BPMOIT22XXX", confidence: 0.83 },
        advance_payment: { value: null, confidence: 0.0 },
        payment_due_days: { value: "30", confidence: 0.87 },
        bank_name: { value: "Banco BPM", confidence: 0.85 },
        account_holder: { value: "ACME Italia S.r.l.", confidence: 0.88 }
      },
      document_references: [],
      attachments: [],
      general_notes: { value: "Pagamento a 30 giorni", confidence: 0.85 },
      cause_of_issue: { value: null, confidence: 0.0 },
      art73_declaration: { value: null, confidence: 0.0 },
      transport_document_type: { value: null, confidence: 0.0 },
      transport_document_number: { value: null, confidence: 0.0 },
      transport_document_date: { value: null, confidence: 0.0 }
    }

    const result = invoiceFatturapaOutputSchema.safeParse(sampleData)
    expect(result.success).toBe(true)
  })

  it("should validate minimum required fields", () => {
    const minimalData = {
      transmission_header: {
        progressive_code: { value: "00001", confidence: 0.95 },
        transmission_format: { value: "FPR12", confidence: 0.99 },
        recipient_code: { value: "ABCDEFG", confidence: 0.90 },
        email_pec: { value: null, confidence: 0.0 },
        country_code: { value: "IT", confidence: 0.99 }
      },
      document_type: { value: "TD01", confidence: 0.98 },
      invoice_number: { value: "INV-001", confidence: 0.95 },
      issue_date: { value: "2024-01-15", confidence: 0.92 },
      due_date: { value: "2024-02-15", confidence: 0.88 },
      currency: { value: "EUR", confidence: 0.99 },
      exchange_rate: { value: null, confidence: 0.0 },
      supplier: {
        company_name: { value: "Test Company", confidence: 0.95 },
        name: { value: null, confidence: 0.0 },
        surname: { value: null, confidence: 0.0 },
        fiscal_code: { value: "TEST123", confidence: 0.90 },
        vat_number: { value: "IT12345678901", confidence: 0.93 },
        tax_regime: { value: "RF01", confidence: 0.85 },
        address: {
          street: { value: "Via Test", confidence: 0.88 },
          street_number: { value: "1", confidence: 0.85 },
          postal_code: { value: "00100", confidence: 0.92 },
          city: { value: "Roma", confidence: 0.95 },
          province: { value: "RM", confidence: 0.90 },
          country: { value: "IT", confidence: 0.99 }
        },
        phone: { value: null, confidence: 0.0 },
        fax: { value: null, confidence: 0.0 },
        email: { value: null, confidence: 0.0 },
        representative_fiscal_code: { value: null, confidence: 0.0 },
        representative_name: { value: null, confidence: 0.0 },
        representative_surname: { value: null, confidence: 0.0 }
      },
      customer: {
        company_name: { value: "Customer Company", confidence: 0.94 },
        name: { value: null, confidence: 0.0 },
        surname: { value: null, confidence: 0.0 },
        fiscal_code: { value: "CUST123", confidence: 0.89 },
        vat_number: { value: "IT98765432101", confidence: 0.91 },
        foreign_vat_id: { value: null, confidence: 0.0 },
        foreign_tax_code: { value: null, confidence: 0.0 },
        address: {
          street: { value: "Via Customer", confidence: 0.87 },
          street_number: { value: "2", confidence: 0.83 },
          postal_code: { value: "20100", confidence: 0.91 },
          city: { value: "Milano", confidence: 0.94 },
          province: { value: "MI", confidence: 0.89 },
          country: { value: "IT", confidence: 0.98 }
        },
        phone: { value: null, confidence: 0.0 },
        fax: { value: null, confidence: 0.0 },
        email: { value: null, confidence: 0.0 },
        pec: { value: null, confidence: 0.0 }
      },
      line_items: [],
      vat_summary: [],
      withholding_tax: [],
      social_security: [],
      other_taxes: [],
      taxable_amount: { value: "100.00", confidence: 0.94 },
      vat_amount: { value: "22.00", confidence: 0.93 },
      withholding_amount: { value: null, confidence: 0.0 },
      social_security_amount: { value: null, confidence: 0.0 },
      stamp_duty_amount: { value: null, confidence: 0.0 },
      total_amount: { value: "122.00", confidence: 0.95 },
      rounding_amount: { value: null, confidence: 0.0 },
      net_amount_due: { value: "122.00", confidence: 0.95 },
      payment_details: {
        payment_terms: { value: "TP02", confidence: 0.88 },
        payment_method: { value: "MP05", confidence: 0.90 },
        due_date: { value: "2024-02-15", confidence: 0.88 },
        payment_amount: { value: "122.00", confidence: 0.95 },
        iban: { value: null, confidence: 0.0 },
        abi: { value: null, confidence: 0.0 },
        cab: { value: null, confidence: 0.0 },
        bic: { value: null, confidence: 0.0 },
        advance_payment: { value: null, confidence: 0.0 },
        payment_due_days: { value: null, confidence: 0.0 },
        bank_name: { value: null, confidence: 0.0 },
        account_holder: { value: null, confidence: 0.0 }
      },
      document_references: [],
      attachments: [],
      general_notes: { value: null, confidence: 0.0 },
      cause_of_issue: { value: null, confidence: 0.0 },
      art73_declaration: { value: null, confidence: 0.0 },
      transport_document_type: { value: null, confidence: 0.0 },
      transport_document_number: { value: null, confidence: 0.0 },
      transport_document_date: { value: null, confidence: 0.0 }
    }

    const result = invoiceFatturapaOutputSchema.safeParse(minimalData)
    expect(result.success).toBe(true)
  })
})

describe("FatturaPA Serialization", () => {
  const sampleData = {
    transmission_header: {
      progressive_code: { value: "00001", confidence: 0.95 },
      transmission_format: { value: "FPR12", confidence: 0.99 },
      recipient_code: { value: "ABCDEFG", confidence: 0.90 },
      email_pec: { value: null, confidence: 0.0 },
      country_code: { value: "IT", confidence: 0.99 }
    },
    document_type: { value: "TD01", confidence: 0.98 },
    invoice_number: { value: "INV-2024-001", confidence: 0.95 },
    issue_date: { value: "2024-01-15", confidence: 0.92 },
    due_date: { value: "2024-02-15", confidence: 0.88 },
    currency: { value: "EUR", confidence: 0.99 },
    exchange_rate: { value: null, confidence: 0.0 },
    supplier: {
      company_name: { value: "ACME Italia S.r.l.", confidence: 0.95 },
      name: { value: null, confidence: 0.0 },
      surname: { value: null, confidence: 0.0 },
      fiscal_code: { value: "ACMITA12345678901", confidence: 0.90 },
      vat_number: { value: "IT12345678901", confidence: 0.93 },
      tax_regime: { value: "RF01", confidence: 0.85 },
      address: {
        street: { value: "Via Roma", confidence: 0.88 },
        street_number: { value: "123", confidence: 0.85 },
        postal_code: { value: "00100", confidence: 0.92 },
        city: { value: "Roma", confidence: 0.95 },
        province: { value: "RM", confidence: 0.90 },
        country: { value: "IT", confidence: 0.99 }
      },
      phone: { value: null, confidence: 0.0 },
      fax: { value: null, confidence: 0.0 },
      email: { value: null, confidence: 0.0 },
      representative_fiscal_code: { value: null, confidence: 0.0 },
      representative_name: { value: null, confidence: 0.0 },
      representative_surname: { value: null, confidence: 0.0 }
    },
    customer: {
      company_name: { value: "Beta Solutions S.p.A.", confidence: 0.94 },
      name: { value: null, confidence: 0.0 },
      surname: { value: null, confidence: 0.0 },
      fiscal_code: { value: "BETSOL98765432101", confidence: 0.89 },
      vat_number: { value: "IT98765432101", confidence: 0.91 },
      foreign_vat_id: { value: null, confidence: 0.0 },
      foreign_tax_code: { value: null, confidence: 0.0 },
      address: {
        street: { value: "Via Milano", confidence: 0.87 },
        street_number: { value: "456", confidence: 0.83 },
        postal_code: { value: "20100", confidence: 0.91 },
        city: { value: "Milano", confidence: 0.94 },
        province: { value: "MI", confidence: 0.89 },
        country: { value: "IT", confidence: 0.98 }
      },
      phone: { value: null, confidence: 0.0 },
      fax: { value: null, confidence: 0.0 },
      email: { value: null, confidence: 0.0 },
      pec: { value: null, confidence: 0.0 }
    },
    line_items: [],
    vat_summary: [],
    withholding_tax: [],
    social_security: [],
    other_taxes: [],
    taxable_amount: { value: "800.00", confidence: 0.94 },
    vat_amount: { value: "176.00", confidence: 0.93 },
    withholding_amount: { value: null, confidence: 0.0 },
    social_security_amount: { value: null, confidence: 0.0 },
    stamp_duty_amount: { value: null, confidence: 0.0 },
    total_amount: { value: "976.00", confidence: 0.95 },
    rounding_amount: { value: null, confidence: 0.0 },
    net_amount_due: { value: "976.00", confidence: 0.95 },
    payment_details: {
      payment_terms: { value: "TP02", confidence: 0.88 },
      payment_method: { value: "MP05", confidence: 0.90 },
      due_date: { value: "2024-02-15", confidence: 0.88 },
      payment_amount: { value: "976.00", confidence: 0.95 },
      iban: { value: null, confidence: 0.0 },
      abi: { value: null, confidence: 0.0 },
      cab: { value: null, confidence: 0.0 },
      bic: { value: null, confidence: 0.0 },
      advance_payment: { value: null, confidence: 0.0 },
      payment_due_days: { value: null, confidence: 0.0 },
      bank_name: { value: null, confidence: 0.0 },
      account_holder: { value: null, confidence: 0.0 }
    },
    document_references: [],
    attachments: [],
    general_notes: { value: null, confidence: 0.0 },
    cause_of_issue: { value: null, confidence: 0.0 },
    art73_declaration: { value: null, confidence: 0.0 },
    transport_document_type: { value: null, confidence: 0.0 },
    transport_document_number: { value: null, confidence: 0.0 },
    transport_document_date: { value: null, confidence: 0.0 }
  } as any

  it("should serialize FatturaPA data to XML", () => {
    const xml = serializeFatturapaToXML(sampleData)
    
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<p:FatturaElettronica')
    expect(xml).toContain('<FatturaElettronicaHeader>')
    expect(xml).toContain('<DatiTrasmissione>')
    expect(xml).toContain('<ProgressivoInvio>00001</ProgressivoInvio>')
    expect(xml).toContain('<FormatoTrasmissione>FPR12</FormatoTrasmissione>')
    expect(xml).toContain('<CodiceDestinatario>ABCDEFG</CodiceDestinatario>')
    expect(xml).toContain('<CedentePrestatore>')
    expect(xml).toContain('<CessionarioCommittente>')
    expect(xml).toContain('<FatturaElettronicaBody>')
    expect(xml).toContain('<TipoDocumento>TD01</TipoDocumento>')
    expect(xml).toContain('<Numero>INV-2024-001</Numero>')
    expect(xml).toContain('</p:FatturaElettronica>')
  })

  it("should serialize FatturaPA data to structured JSON", () => {
    const json = serializeFatturapaToJSON(sampleData)
    
    expect(json).toHaveProperty('metadata')
    expect(json).toHaveProperty('transmission')
    expect(json).toHaveProperty('supplier')
    expect(json).toHaveProperty('customer')
    expect(json).toHaveProperty('lineItems')
    expect(json).toHaveProperty('taxSummary')
    expect(json).toHaveProperty('totals')
    expect(json).toHaveProperty('payment')
    
    expect((json as any).metadata.format).toBe('FatturaPA')
    expect((json as any).metadata.documentType).toBe('TD01')
    expect((json as any).metadata.invoiceNumber).toBe('INV-2024-001')
    expect((json as any).supplier.companyName).toBe('ACME Italia S.r.l.')
    expect((json as any).customer.companyName).toBe('Beta Solutions S.p.A.')
  })
})

describe("Document Type Detection", () => {
  it("should detect TD01 for domestic Italian invoice", () => {
    const domesticInvoice = {
      customer: { 
        address: { country: { value: "IT" } },
        vat_number: { value: "IT12345678901" }
      },
      supplier: { 
        address: { country: { value: "IT" } }
      },
      line_items: []
    }
    
    expect(detectDocumentType(domesticInvoice)).toBe("TD01")
  })

  it("should detect TD17 for intra-EU purchase", () => {
    const euInvoice = {
      customer: { 
        address: { country: { value: "DE" } },
        vat_number: { value: "DE123456789" }
      },
      supplier: { 
        address: { country: { value: "IT" } }
      },
      line_items: []
    }
    
    expect(detectDocumentType(euInvoice)).toBe("TD17")
  })

  it("should detect TD18 for San Marino goods", () => {
    const sanMarinoInvoice = {
      customer: { 
        address: { country: { value: "SM" } }
      },
      supplier: { 
        address: { country: { value: "IT" } }
      },
      line_items: []
    }
    
    expect(detectDocumentType(sanMarinoInvoice)).toBe("TD18")
  })

  it("should detect TD19 for San Marino services", () => {
    const sanMarinoServicesInvoice = {
      customer: { 
        address: { country: { value: "SM" } }
      },
      supplier: { 
        address: { country: { value: "IT" } }
      },
      line_items: [
        { description: { value: "Consulting services for software development" } }
      ]
    }
    
    expect(detectDocumentType(sanMarinoServicesInvoice)).toBe("TD19")
  })
})