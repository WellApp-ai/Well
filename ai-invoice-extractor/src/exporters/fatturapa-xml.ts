import type { FatturapaInvoice, ConfidenceValue } from "../models/invoice"

/**
 * FatturaPA XML Exporter
 * Generates compliant XML for Italian Sistema di Interscambio (SDI)
 * Based on FatturaPA format version 1.2.1
 */

interface XmlOptions {
  formatOutput?: boolean
  includeConfidenceData?: boolean
  validateRequired?: boolean
}

export class FatturapaXmlExporter {
  
  constructor(private options: XmlOptions = {}) {
    this.options = {
      formatOutput: true,
      includeConfidenceData: false,
      validateRequired: true,
      ...options
    }
  }

  /**
   * Exports FatturaPA invoice data to compliant XML
   */
  export(invoice: FatturapaInvoice): string {
    if (this.options.validateRequired) {
      this.validateRequiredFields(invoice)
    }

    const xmlDoc = this.buildXmlDocument(invoice)
    
    if (this.options.formatOutput) {
      return this.formatXml(xmlDoc)
    }
    
    return xmlDoc
  }

  private buildXmlDocument(invoice: FatturapaInvoice): string {
    const header = this.buildHeader(invoice)
    const body = this.buildBody(invoice)
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<ns2:FatturaElettronica versione="FPR12" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:ns2="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2">
  <FatturaElettronicaHeader>
    ${header}
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    ${body}
  </FatturaElettronicaBody>
</ns2:FatturaElettronica>`
  }

  private buildHeader(invoice: FatturapaInvoice): string {
    const transmissionData = this.buildTransmissionData(invoice)
    const supplier = this.buildSupplier(invoice)
    const customer = this.buildCustomer(invoice)
    const taxRepresentative = this.buildTaxRepresentative(invoice)
    const intermediary = this.buildIntermediary(invoice)

    return `
    <DatiTrasmissione>
      ${transmissionData}
    </DatiTrasmissione>
    <CedentePrestatore>
      ${supplier}
    </CedentePrestatore>
    <CessionarioCommittente>
      ${customer}
    </CessionarioCommittente>
    ${taxRepresentative}
    ${intermediary}`
  }

  private buildTransmissionData(invoice: FatturapaInvoice): string {
    const format = this.getValue(invoice.transmission_format) || "FPR12"
    const country = this.getValue(invoice.country_code) || "IT"
    
    return `
      <IdTrasmittente>
        <IdPaese>${country}</IdPaese>
        <IdCodice>${this.getValue(invoice.supplier.vat_id) || "00000000000"}</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>1</ProgressivoInvio>
      <FormatoTrasmissione>${format}</FormatoTrasmissione>
      <CodiceDestinatario>0000000</CodiceDestinatario>`
  }

  private buildSupplier(invoice: FatturapaInvoice): string {
    const supplier = invoice.supplier
    const address = this.buildAddress(supplier.address)
    
    return `
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>${this.getValue(invoice.country_code) || "IT"}</IdPaese>
          <IdCodice>${this.getValue(supplier.vat_id) || ""}</IdCodice>
        </IdFiscaleIVA>
        ${this.getValue(supplier.tax_id) ? `<CodiceFiscale>${this.getValue(supplier.tax_id)}</CodiceFiscale>` : ""}
        <Anagrafica>
          <Denominazione>${this.getValue(supplier.name) || ""}</Denominazione>
        </Anagrafica>
        ${this.getValue(supplier.legal_form) ? `<RegimeFiscale>${this.getValue(supplier.legal_form)}</RegimeFiscale>` : ""}
      </DatiAnagrafici>
      <Sede>
        ${address}
      </Sede>
      ${this.getValue(supplier.rea_office) ? this.buildReaData(supplier) : ""}`
  }

  private buildCustomer(invoice: FatturapaInvoice): string {
    const customer = invoice.customer
    const address = this.buildAddress(customer.address)
    
    return `
      <DatiAnagrafici>
        ${this.getValue(customer.vat_id) ? `
        <IdFiscaleIVA>
          <IdPaese>${this.getCustomerCountry(invoice)}</IdPaese>
          <IdCodice>${this.getValue(customer.vat_id)}</IdCodice>
        </IdFiscaleIVA>` : ""}
        ${this.getValue(customer.tax_id) ? `<CodiceFiscale>${this.getValue(customer.tax_id)}</CodiceFiscale>` : ""}
        <Anagrafica>
          <Denominazione>${this.getValue(customer.name) || ""}</Denominazione>
        </Anagrafica>
      </DatiAnagrafici>
      <Sede>
        ${address}
      </Sede>`
  }

  private buildAddress(address: any): string {
    return `
        <Indirizzo>${this.getValue(address.street) || ""}</Indirizzo>
        ${this.getValue(address.street_number) ? `<NumeroCivico>${this.getValue(address.street_number)}</NumeroCivico>` : ""}
        <CAP>${this.getValue(address.postal_code) || "00000"}</CAP>
        <Comune>${this.getValue(address.city) || ""}</Comune>
        ${this.getValue(address.province) ? `<Provincia>${this.getValue(address.province)}</Provincia>` : ""}
        <Nazione>${this.getValue(address.country) || "IT"}</Nazione>`
  }

  private buildReaData(party: any): string {
    return `
      <IscrizioneREA>
        <Ufficio>${this.getValue(party.rea_office)}</Ufficio>
        <NumeroREA>${this.getValue(party.rea_number)}</NumeroREA>
        ${this.getValue(party.share_capital) ? `<CapitaleSociale>${this.formatNumber(this.getValue(party.share_capital))}</CapitaleSociale>` : ""}
        ${this.getValue(party.company_status) ? `<StatoLiquidazione>${this.getValue(party.company_status)}</StatoLiquidazione>` : ""}
      </IscrizioneREA>`
  }

  private buildTaxRepresentative(invoice: FatturapaInvoice): string {
    const rep = invoice.tax_representative
    if (!this.getValue(rep.name)) return ""
    
    return `
    <RappresentanteFiscale>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>${this.getValue(rep.vat_id) || ""}</IdCodice>
        </IdFiscaleIVA>
        <Anagrafica>
          <Denominazione>${this.getValue(rep.name)}</Denominazione>
        </Anagrafica>
      </DatiAnagrafici>
    </RappresentanteFiscale>`
  }

  private buildIntermediary(invoice: FatturapaInvoice): string {
    const intermediary = invoice.intermediary
    if (!this.getValue(intermediary.name)) return ""
    
    return `
    <SoggettoEmittente>
      <Denominazione>${this.getValue(intermediary.name)}</Denominazione>
    </SoggettoEmittente>`
  }

  private buildBody(invoice: FatturapaInvoice): string {
    const generalData = this.buildGeneralData(invoice)
    const lineItems = this.buildLineItems(invoice)
    const taxData = this.buildTaxData(invoice)
    const payment = this.buildPaymentData(invoice)
    const attachments = this.buildAttachments(invoice)

    return `
    <DatiGenerali>
      ${generalData}
    </DatiGenerali>
    <DatiBeniServizi>
      ${lineItems}
      ${taxData}
    </DatiBeniServizi>
    ${payment}
    ${attachments}`
  }

  private buildGeneralData(invoice: FatturapaInvoice): string {
    const docType = this.getValue(invoice.document_type_code) || "TD01"
    const invoiceNumber = this.getValue(invoice.invoice_number) || ""
    const issueDate = this.formatDate(this.getValue(invoice.issue_date))
    const currency = this.getValue(invoice.currency.currency_code) || "EUR"
    
    let generalData = `
      <DatiGeneraliDocumento>
        <TipoDocumento>${docType}</TipoDocumento>
        <Divisa>${currency}</Divisa>
        <Data>${issueDate}</Data>
        <Numero>${invoiceNumber}</Numero>
        ${this.buildReferences(invoice)}
        ${this.buildAmounts(invoice)}
      </DatiGeneraliDocumento>`

    // Add order references if present
    if (invoice.reference_documents.length > 0) {
      generalData += this.buildReferenceDocuments(invoice.reference_documents)
    }

    return generalData
  }

  private buildReferences(invoice: FatturapaInvoice): string {
    let refs = ""
    
    // CIG and CUP codes for public administration
    invoice.reference_documents.forEach(ref => {
      const cig = this.getValue(ref.cig)
      const cup = this.getValue(ref.cup)
      const office = this.getValue(ref.office_code)
      
      if (cig) refs += `<CodiceCIG>${cig}</CodiceCIG>\n`
      if (cup) refs += `<CodiceCUP>${cup}</CodiceCUP>\n`
      if (office) refs += `<CodiceCommessaConvenzione>${office}</CodiceCommessaConvenzione>\n`
    })
    
    return refs
  }

  private buildAmounts(invoice: FatturapaInvoice): string {
    let amounts = ""
    
    const taxableAmount = this.getValue(invoice.taxable_amount)
    const totalAmount = this.getValue(invoice.total_amount)
    const roundingAmount = this.getValue(invoice.rounding_amount)
    
    if (taxableAmount) amounts += `<ImportoTotaleDocumento>${this.formatNumber(taxableAmount)}</ImportoTotaleDocumento>\n`
    if (roundingAmount) amounts += `<Arrotondamento>${this.formatNumber(roundingAmount)}</Arrotondamento>\n`
    
    return amounts
  }

  private buildLineItems(invoice: FatturapaInvoice): string {
    let lines = ""
    
    invoice.line_items.forEach((item, index) => {
      const lineNum = this.getValue(item.line_number) || (index + 1)
      const description = this.getValue(item.description) || ""
      const quantity = this.getValue(item.quantity) || 1
      const unitPrice = this.getValue(item.unit_price) || 0
      const totalPrice = this.getValue(item.total_price) || 0
      const vatRate = this.getValue(item.vat_rate) || 0
      const unitOfMeasure = this.getValue(item.unit_of_measure) || ""
      const natureCode = this.getValue(item.vat_nature_code) || ""
      
      lines += `
      <DettaglioLinee>
        <NumeroLinea>${lineNum}</NumeroLinea>
        <Descrizione>${this.escapeXml(description)}</Descrizione>
        <Quantita>${this.formatNumber(quantity)}</Quantita>
        ${unitOfMeasure ? `<UnitaMisura>${unitOfMeasure}</UnitaMisura>` : ""}
        <PrezzoUnitario>${this.formatNumber(unitPrice)}</PrezzoUnitario>
        <PrezzoTotale>${this.formatNumber(totalPrice)}</PrezzoTotale>
        <AliquotaIVA>${this.formatNumber(vatRate)}</AliquotaIVA>
        ${natureCode ? `<Natura>${natureCode}</Natura>` : ""}
      </DettaglioLinee>`
    })
    
    return lines
  }

  private buildTaxData(invoice: FatturapaInvoice): string {
    let taxData = ""
    
    invoice.tax_details.forEach(tax => {
      const taxableAmount = this.getValue(tax.taxable_amount) || 0
      const vatRate = this.getValue(tax.vat_rate) || 0
      const vatAmount = this.getValue(tax.vat_amount) || 0
      const natureCode = this.getValue(tax.nature_code) || ""
      
      taxData += `
      <DatiRiepilogo>
        <AliquotaIVA>${this.formatNumber(vatRate)}</AliquotaIVA>
        ${natureCode ? `<Natura>${natureCode}</Natura>` : ""}
        <ImponibileImporto>${this.formatNumber(taxableAmount)}</ImponibileImporto>
        <Imposta>${this.formatNumber(vatAmount)}</Imposta>
      </DatiRiepilogo>`
    })
    
    return taxData
  }

  private buildPaymentData(invoice: FatturapaInvoice): string {
    if (invoice.payment_terms.length === 0) return ""
    
    let paymentData = `<DatiPagamento>`
    
    invoice.payment_terms.forEach(payment => {
      const condition = this.getValue(payment.payment_conditions) || "TP02"
      const amount = this.getValue(payment.amount) || 0
      const dueDate = this.formatDate(this.getValue(payment.due_date))
      const method = this.getValue(payment.payment_method) || "MP05"
      const iban = this.getValue(payment.iban)
      
      paymentData += `
      <CondizioniPagamento>${condition}</CondizioniPagamento>
      <DettaglioPagamento>
        <ModalitaPagamento>${method}</ModalitaPagamento>
        ${dueDate ? `<DataScadenzaPagamento>${dueDate}</DataScadenzaPagamento>` : ""}
        <ImportoPagamento>${this.formatNumber(amount)}</ImportoPagamento>
        ${iban ? `<IBAN>${iban}</IBAN>` : ""}
      </DettaglioPagamento>`
    })
    
    paymentData += `</DatiPagamento>`
    return paymentData
  }

  private buildReferenceDocuments(references: any[]): string {
    let refs = ""
    
    references.forEach(ref => {
      const docType = this.getValue(ref.document_type)
      const docNumber = this.getValue(ref.document_number)
      const docDate = this.formatDate(this.getValue(ref.document_date))
      
      if (docNumber) {
        refs += `
        <DatiOrdineAcquisto>
          <RiferimentoNumeroLinea>1</RiferimentoNumeroLinea>
          <IdDocumento>${docNumber}</IdDocumento>
          ${docDate ? `<Data>${docDate}</Data>` : ""}
        </DatiOrdineAcquisto>`
      }
    })
    
    return refs
  }

  private buildAttachments(invoice: FatturapaInvoice): string {
    const hasAttachments = this.getValue(invoice.has_attachments)
    if (!hasAttachments) return ""
    
    let attachments = ""
    invoice.attachment_descriptions.forEach((desc, index) => {
      const description = this.getValue(desc)
      if (description) {
        attachments += `
        <Allegati>
          <NomeAttachment>attachment_${index + 1}</NomeAttachment>
          <DescrizioneAttachment>${this.escapeXml(description)}</DescrizioneAttachment>
        </Allegati>`
      }
    })
    
    return attachments
  }

  // Utility methods
  private getValue<T>(confidenceValue: ConfidenceValue<T> | any): T | null {
    if (confidenceValue && typeof confidenceValue === 'object' && 'value' in confidenceValue) {
      return confidenceValue.value
    }
    return confidenceValue || null
  }

  private formatNumber(num: unknown): string {
    if (num === null || num === undefined) return "0.00"
    return Number(num).toFixed(2)
  }

  private formatDate(dateStr: unknown): string {
    if (!dateStr || typeof dateStr !== 'string') return new Date().toISOString().split('T')[0]
    
    try {
      const date = new Date(dateStr)
      return date.toISOString().split('T')[0]
    } catch {
      return new Date().toISOString().split('T')[0]
    }
  }

  private escapeXml(text: unknown): string {
    if (!text || typeof text !== 'string') return ""
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  private getCustomerCountry(invoice: FatturapaInvoice): string {
    const country = this.getValue(invoice.customer.address.country)
    return (typeof country === 'string' ? country : null) || "IT"
  }

  private formatXml(xml: string): string {
    // Simple XML formatting - in production, consider using a proper XML formatter
    return xml.replace(/></g, ">\n<")
              .replace(/^\s*\n/gm, "")
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .join('\n')
  }

  private validateRequiredFields(invoice: FatturapaInvoice): void {
    const errors: string[] = []
    
    // Required fields validation
    if (!this.getValue(invoice.invoice_number)) {
      errors.push("Invoice number is required")
    }
    
    if (!this.getValue(invoice.issue_date)) {
      errors.push("Issue date is required")
    }
    
    if (!this.getValue(invoice.supplier.name)) {
      errors.push("Supplier name is required")
    }
    
    if (!this.getValue(invoice.customer.name)) {
      errors.push("Customer name is required")
    }
    
    if (invoice.line_items.length === 0) {
      errors.push("At least one line item is required")
    }
    
    if (errors.length > 0) {
      throw new Error(`FatturaPA validation failed: ${errors.join(", ")}`)
    }
  }
}