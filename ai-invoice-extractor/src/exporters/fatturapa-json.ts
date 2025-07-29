import type { FatturapaInvoice, ConfidenceValue } from "../models/invoice"

/**
 * FatturaPA JSON Exporter  
 * Exports invoice data in JSON format mirroring FatturaPA structure
 * Provides both raw extracted data and clean structured output
 */

interface JsonExportOptions {
  includeConfidenceScores?: boolean
  includeMetadata?: boolean
  prettyPrint?: boolean
  cleanNullValues?: boolean
}

interface FatturapaJsonOutput {
  header: {
    transmission: {
      sender_country: string
      sender_code: string
      progressive_number: string
      format: string
      destination_code: string
    }
    supplier: any
    customer: any
    tax_representative?: any
    intermediary?: any
  }
  body: {
    general_data: {
      document_type: string
      currency: string
      date: string
      number: string
      references?: any[]
      totals: {
        taxable_amount: number
        vat_amount: number
        total_amount: number
        withholding_amount?: number
        rounding_amount?: number
      }
    }
    line_items: any[]
    tax_summary: any[]
    payment_data?: any[]
    attachments?: any[]
  }
  metadata?: {
    extraction_date: string
    document_language: string
    confidence_scores?: boolean
    processing_notes?: string
  }
}

export class FatturapaJsonExporter {
  
  constructor(private options: JsonExportOptions = {}) {
    this.options = {
      includeConfidenceScores: false,
      includeMetadata: true,
      prettyPrint: true,
      cleanNullValues: true,
      ...options
    }
  }

  /**
   * Exports FatturaPA invoice data to structured JSON
   */
  export(invoice: FatturapaInvoice): string {
    const jsonOutput = this.buildJsonStructure(invoice)
    
    if (this.options.prettyPrint) {
      return JSON.stringify(jsonOutput, null, 2)
    }
    
    return JSON.stringify(jsonOutput)
  }

  /**
   * Exports raw extracted data maintaining confidence scores
   */
  exportRaw(invoice: FatturapaInvoice): string {
    const cleanedInvoice = this.options.cleanNullValues 
      ? this.cleanNullValues(invoice)
      : invoice
    
    if (this.options.prettyPrint) {
      return JSON.stringify(cleanedInvoice, null, 2)
    }
    
    return JSON.stringify(cleanedInvoice)
  }

  private buildJsonStructure(invoice: FatturapaInvoice): FatturapaJsonOutput {
    const output: FatturapaJsonOutput = {
      header: this.buildHeader(invoice),
      body: this.buildBody(invoice)
    }

    if (this.options.includeMetadata) {
      output.metadata = this.buildMetadata(invoice)
    }

    return output
  }

  private buildHeader(invoice: FatturapaInvoice): any {
    return {
      transmission: {
        sender_country: this.getValue(invoice.country_code) || "IT",
        sender_code: this.getValue(invoice.supplier.vat_id) || "",
        progressive_number: "1",
        format: this.getValue(invoice.transmission_format) || "FPR12",
        destination_code: "0000000"
      },
      supplier: this.buildParty(invoice.supplier, "supplier"),
      customer: this.buildParty(invoice.customer, "customer"),
      ...(this.getValue(invoice.tax_representative.name) && {
        tax_representative: this.buildParty(invoice.tax_representative, "tax_representative")
      }),
      ...(this.getValue(invoice.intermediary.name) && {
        intermediary: this.buildParty(invoice.intermediary, "intermediary")
      })
    }
  }

  private buildParty(party: any, type: string): any {
    const partyData: any = {
      identification: {
        vat_id: this.getValueWithConfidence(party.vat_id),
        tax_id: this.getValueWithConfidence(party.tax_id),
        ...(this.getValue(party.foreign_vat_id) && {
          foreign_vat_id: this.getValueWithConfidence(party.foreign_vat_id)
        })
      },
      legal_info: {
        name: this.getValueWithConfidence(party.name),
        legal_form: this.getValueWithConfidence(party.legal_form)
      },
      address: {
        street: this.getValueWithConfidence(party.address.street),
        street_number: this.getValueWithConfidence(party.address.street_number),
        postal_code: this.getValueWithConfidence(party.address.postal_code),
        city: this.getValueWithConfidence(party.address.city),
        province: this.getValueWithConfidence(party.address.province),
        country: this.getValueWithConfidence(party.address.country),
        additional_info: this.getValueWithConfidence(party.address.additional_info)
      },
      contact: {
        phone: this.getValueWithConfidence(party.phone),
        email: this.getValueWithConfidence(party.email),
        pec: this.getValueWithConfidence(party.pec)
      }
    }

    // Add registration data if present
    if (this.getValue(party.rea_office) || this.getValue(party.rea_number)) {
      partyData.registration = {
        rea_office: this.getValueWithConfidence(party.rea_office),
        rea_number: this.getValueWithConfidence(party.rea_number),
        share_capital: this.getValueWithConfidence(party.share_capital),
        company_status: this.getValueWithConfidence(party.company_status)
      }
    }

    return this.options.cleanNullValues ? this.cleanNullValues(partyData) : partyData
  }

  private buildBody(invoice: FatturapaInvoice): any {
    return {
      general_data: {
        document_type: this.getValue(invoice.document_type_code) || "TD01",
        currency: this.buildCurrencyInfo(invoice),
        date: this.getValue(invoice.issue_date),
        number: this.getValue(invoice.invoice_number),
        ...(invoice.reference_documents.length > 0 && {
          references: this.buildReferences(invoice.reference_documents)
        }),
        totals: {
          taxable_amount: this.getValue(invoice.taxable_amount) || 0,
          vat_amount: this.getValue(invoice.vat_amount) || 0,
          total_amount: this.getValue(invoice.total_amount) || 0,
          ...(this.getValue(invoice.withholding_amount) && {
            withholding_amount: this.getValue(invoice.withholding_amount)
          }),
          ...(this.getValue(invoice.rounding_amount) && {
            rounding_amount: this.getValue(invoice.rounding_amount)
          })
        }
      },
      line_items: this.buildLineItems(invoice.line_items),
      tax_summary: this.buildTaxSummary(invoice.tax_details),
      ...(invoice.payment_terms.length > 0 && {
        payment_data: this.buildPaymentData(invoice.payment_terms)
      }),
      ...(this.getValue(invoice.has_attachments) && {
        attachments: this.buildAttachments(invoice)
      })
    }
  }

  private buildCurrencyInfo(invoice: FatturapaInvoice): any {
    const currencyData: any = {
      code: this.getValue(invoice.currency.currency_code) || "EUR"
    }

    if (this.getValue(invoice.currency.exchange_rate)) {
      currencyData.exchange_rate = this.getValue(invoice.currency.exchange_rate)
      currencyData.exchange_rate_date = this.getValue(invoice.currency.exchange_rate_date)
    }

    return currencyData
  }

  private buildReferences(references: any[]): any[] {
    return references.map(ref => ({
      document_type: this.getValueWithConfidence(ref.document_type),
      document_number: this.getValueWithConfidence(ref.document_number),
      document_date: this.getValueWithConfidence(ref.document_date),
      ...(this.getValue(ref.cig) && {
        cig: this.getValueWithConfidence(ref.cig)
      }),
      ...(this.getValue(ref.cup) && {
        cup: this.getValueWithConfidence(ref.cup)
      }),
      ...(this.getValue(ref.office_code) && {
        office_code: this.getValueWithConfidence(ref.office_code)
      })
    })).filter(ref => this.getValue(ref.document_number))
  }

  private buildLineItems(lineItems: any[]): any[] {
    return lineItems.map((item, index) => {
      const lineData: any = {
        line_number: this.getValue(item.line_number) || (index + 1),
        description: this.getValueWithConfidence(item.description),
        quantity: this.getValueWithConfidence(item.quantity),
        unit_of_measure: this.getValueWithConfidence(item.unit_of_measure),
        unit_price: this.getValueWithConfidence(item.unit_price),
        total_price: this.getValueWithConfidence(item.total_price),
        vat: {
          rate: this.getValueWithConfidence(item.vat_rate),
          amount: this.getValueWithConfidence(item.vat_amount),
          nature_code: this.getValueWithConfidence(item.vat_nature_code)
        }
      }

      // Add discounts if present
      if (this.getValue(item.discount_percentage) || this.getValue(item.discount_amount)) {
        lineData.discounts = {
          percentage: this.getValueWithConfidence(item.discount_percentage),
          amount: this.getValueWithConfidence(item.discount_amount)
        }
      }

      // Add product codes if present
      if (this.getValue(item.product_code)) {
        lineData.product = {
          code: this.getValueWithConfidence(item.product_code),
          code_type: this.getValueWithConfidence(item.product_code_type)
        }
      }

      // Add service periods if present
      if (this.getValue(item.start_date) || this.getValue(item.end_date)) {
        lineData.service_period = {
          start_date: this.getValueWithConfidence(item.start_date),
          end_date: this.getValueWithConfidence(item.end_date)
        }
      }

      return this.options.cleanNullValues ? this.cleanNullValues(lineData) : lineData
    })
  }

  private buildTaxSummary(taxDetails: any[]): any[] {
    return taxDetails.map(tax => ({
      vat_rate: this.getValueWithConfidence(tax.vat_rate),
      taxable_amount: this.getValueWithConfidence(tax.taxable_amount),
      vat_amount: this.getValueWithConfidence(tax.vat_amount),
      ...(this.getValue(tax.nature_code) && {
        nature_code: this.getValueWithConfidence(tax.nature_code),
        nature_description: this.getValueWithConfidence(tax.nature_description)
      })
    }))
  }

  private buildPaymentData(paymentTerms: any[]): any[] {
    return paymentTerms.map(payment => ({
      conditions: this.getValueWithConfidence(payment.payment_conditions),
      method: this.getValueWithConfidence(payment.payment_method),
      due_date: this.getValueWithConfidence(payment.due_date),
      amount: this.getValueWithConfidence(payment.amount),
      ...(this.getValue(payment.iban) && {
        bank_details: {
          iban: this.getValueWithConfidence(payment.iban),
          bic: this.getValueWithConfidence(payment.bic),
          bank_name: this.getValueWithConfidence(payment.bank_name),
          beneficiary_name: this.getValueWithConfidence(payment.beneficiary_name)
        }
      })
    }))
  }

  private buildAttachments(invoice: FatturapaInvoice): any[] {
    return invoice.attachment_descriptions.map((desc, index) => ({
      name: `attachment_${index + 1}`,
      description: this.getValueWithConfidence(desc)
    })).filter(att => this.getValue(att.description))
  }

  private buildMetadata(invoice: FatturapaInvoice): any {
    return {
      extraction_date: this.getValue(invoice.extraction_date) || new Date().toISOString(),
      document_language: this.getValue(invoice.document_language) || "it",
      confidence_scores: this.options.includeConfidenceScores,
      ...(this.getValue(invoice.processing_notes) && {
        processing_notes: this.getValue(invoice.processing_notes)
      }),
      document_classification: {
        is_domestic: this.getValue(invoice.is_domestic),
        document_type_code: this.getValue(invoice.document_type_code),
        origin_country: this.getValue(invoice.origin_country),
        destination_country: this.getValue(invoice.destination_country)
      }
    }
  }

  // Utility methods
  private getValue<T>(confidenceValue: ConfidenceValue<T> | any): T | null {
    if (confidenceValue && typeof confidenceValue === 'object' && 'value' in confidenceValue) {
      return confidenceValue.value
    }
    return confidenceValue || null
  }

  private getValueWithConfidence<T>(confidenceValue: ConfidenceValue<T> | any): any {
    if (!this.options.includeConfidenceScores) {
      return this.getValue(confidenceValue)
    }

    if (confidenceValue && typeof confidenceValue === 'object' && 'value' in confidenceValue) {
      return {
        value: confidenceValue.value,
        confidence: confidenceValue.confidence
      }
    }

    return {
      value: confidenceValue || null,
      confidence: 0.0
    }
  }

  private cleanNullValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return undefined
    }

    if (Array.isArray(obj)) {
      const cleaned = obj.map(item => this.cleanNullValues(item)).filter(item => item !== undefined)
      return cleaned.length > 0 ? cleaned : undefined
    }

    if (typeof obj === 'object') {
      const cleaned: any = {}
      let hasValidValues = false

      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = this.cleanNullValues(value)
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue
          hasValidValues = true
        }
      }

      return hasValidValues ? cleaned : undefined
    }

    // For primitive values, only filter out null/undefined/empty strings
    if (obj === null || obj === undefined || obj === '') {
      return undefined
    }

    return obj
  }

  /**
   * Exports invoice data in a format compatible with Italian SDI validation tools
   */
  exportForValidation(invoice: FatturapaInvoice): string {
    const validationData = {
      transmission_data: {
        sender_id: {
          country: this.getValue(invoice.country_code) || "IT",
          code: this.getValue(invoice.supplier.vat_id) || ""
        },
        format: this.getValue(invoice.transmission_format) || "FPR12"
      },
      invoice_data: {
        type: this.getValue(invoice.document_type_code) || "TD01",
        number: this.getValue(invoice.invoice_number),
        date: this.getValue(invoice.issue_date),
        currency: this.getValue(invoice.currency.currency_code) || "EUR"
      },
      parties: {
        supplier: {
          vat_id: this.getValue(invoice.supplier.vat_id),
          tax_id: this.getValue(invoice.supplier.tax_id),
          name: this.getValue(invoice.supplier.name),
          country: this.getValue(invoice.supplier.address.country) || "IT"
        },
        customer: {
          vat_id: this.getValue(invoice.customer.vat_id),
          tax_id: this.getValue(invoice.customer.tax_id),
          name: this.getValue(invoice.customer.name),
          country: this.getValue(invoice.customer.address.country) || "IT"
        }
      },
      totals: {
        taxable: this.getValue(invoice.taxable_amount) || 0,
        vat: this.getValue(invoice.vat_amount) || 0,
        total: this.getValue(invoice.total_amount) || 0
      },
      line_count: invoice.line_items.length,
      tax_rates: invoice.tax_details.map(tax => this.getValue(tax.vat_rate)).filter(rate => rate !== null)
    }

    return JSON.stringify(validationData, null, 2)
  }
}