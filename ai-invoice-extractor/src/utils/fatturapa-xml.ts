import type { InvoiceFatturapAOutput } from "../prompts/extract-invoice-fatturPA.prompt.js"

/**
 * XML serialization utilities for FatturaPA format
 */
export class FatturapAXmlSerializer {
  
  /**
   * Serialize invoice data to FatturaPA XML format
   */
  static serialize(data: InvoiceFatturapAOutput): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica 
  versione="${this.getValue(data.transmission_format) || 'FPR12'}" 
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#" 
  xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xsi:schemaLocation="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2/Schema_del_file_xml_FatturaPA_versione_1.2.xsd">
  
  ${this.serializeHeader(data)}
  
  ${this.serializeBody(data)}
  
</p:FatturaElettronica>`

    return this.formatXml(xml)
  }
  
  private static serializeHeader(data: InvoiceFatturapAOutput): string {
    return `<FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>${this.getValue(data.seller.country_code) || 'IT'}</IdPaese>
        <IdCodice>${this.getValue(data.seller.vat_id) || ''}</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>${this.getValue(data.progressive_file_number) || '1'}</ProgressivoInvio>
      <FormatoTrasmissione>${this.getValue(data.transmission_format) || 'FPR12'}</FormatoTrasmissione>
      ${this.getValue(data.pa_code) ? `<CodiceDestinatario>${this.getValue(data.pa_code)}</CodiceDestinatario>` : '<CodiceDestinatario>0000000</CodiceDestinatario>'}
      ${this.getValue(data.pa_pec) ? `<PECDestinatario>${this.getValue(data.pa_pec)}</PECDestinatario>` : ''}
    </DatiTrasmissione>
    
    ${this.serializeSupplier(data.seller)}
    
    ${this.serializeBuyer(data.buyer)}
    
    ${data.tax_representative ? this.serializeTaxRepresentative(data.tax_representative) : ''}
  </FatturaElettronicaHeader>`
  }
  
  private static serializeSupplier(seller: InvoiceFatturapAOutput['seller']): string {
    return `<CedentePrestatore>
    <DatiAnagrafici>
      <IdFiscaleIVA>
        <IdPaese>${this.getValue(seller.country_code) || 'IT'}</IdPaese>
        <IdCodice>${this.getValue(seller.vat_id) || ''}</IdCodice>
      </IdFiscaleIVA>
      ${this.getValue(seller.tax_code) ? `<CodiceFiscale>${this.getValue(seller.tax_code)}</CodiceFiscale>` : ''}
      <Anagrafica>
        <Denominazione>${this.getValue(seller.name) || ''}</Denominazione>
      </Anagrafica>
      ${this.getValue(seller.legal_form) ? `<RegimeFiscale>${this.getValue(seller.legal_form)}</RegimeFiscale>` : '<RegimeFiscale>RF01</RegimeFiscale>'}
    </DatiAnagrafici>
    
    <Sede>
      <Indirizzo>${this.getValue(seller.address.street) || ''}</Indirizzo>
      ${this.getValue(seller.address.civic_number) ? `<NumeroCivico>${this.getValue(seller.address.civic_number)}</NumeroCivico>` : ''}
      <CAP>${this.getValue(seller.address.postal_code) || ''}</CAP>
      <Comune>${this.getValue(seller.address.city) || ''}</Comune>
      ${this.getValue(seller.address.province) ? `<Provincia>${this.getValue(seller.address.province)}</Provincia>` : ''}
      <Nazione>${this.getValue(seller.address.country) || this.getValue(seller.country_code) || 'IT'}</Nazione>
    </Sede>
    
    ${this.serializeContacts(seller)}
  </CedentePrestatore>`
  }
  
  private static serializeBuyer(buyer: InvoiceFatturapAOutput['buyer']): string {
    return `<CessionarioCommittente>
    <DatiAnagrafici>
      ${this.getValue(buyer.vat_id) ? `<IdFiscaleIVA>
        <IdPaese>${this.getValue(buyer.country_code) || 'IT'}</IdPaese>
        <IdCodice>${this.getValue(buyer.vat_id)}</IdCodice>
      </IdFiscaleIVA>` : ''}
      ${this.getValue(buyer.tax_code) ? `<CodiceFiscale>${this.getValue(buyer.tax_code)}</CodiceFiscale>` : ''}
      <Anagrafica>
        <Denominazione>${this.getValue(buyer.name) || ''}</Denominazione>
      </Anagrafica>
    </DatiAnagrafici>
    
    <Sede>
      <Indirizzo>${this.getValue(buyer.address.street) || ''}</Indirizzo>
      ${this.getValue(buyer.address.civic_number) ? `<NumeroCivico>${this.getValue(buyer.address.civic_number)}</NumeroCivico>` : ''}
      <CAP>${this.getValue(buyer.address.postal_code) || ''}</CAP>
      <Comune>${this.getValue(buyer.address.city) || ''}</Comune>
      ${this.getValue(buyer.address.province) ? `<Provincia>${this.getValue(buyer.address.province)}</Provincia>` : ''}
      <Nazione>${this.getValue(buyer.address.country) || this.getValue(buyer.country_code) || 'IT'}</Nazione>
    </Sede>
  </CessionarioCommittente>`
  }
  
  private static serializeTaxRepresentative(representative: NonNullable<InvoiceFatturapAOutput['tax_representative']>): string {
    return `<RappresentanteFiscale>
    <DatiAnagrafici>
      <IdFiscaleIVA>
        <IdPaese>${this.getValue(representative.country_code) || 'IT'}</IdPaese>
        <IdCodice>${this.getValue(representative.vat_id) || ''}</IdCodice>
      </IdFiscaleIVA>
      <Anagrafica>
        <Denominazione>${this.getValue(representative.name) || ''}</Denominazione>
      </Anagrafica>
    </DatiAnagrafici>
  </RappresentanteFiscale>`
  }
  
  private static serializeContacts(party: InvoiceFatturapAOutput['seller'] | InvoiceFatturapAOutput['buyer']): string {
    const contacts = []
    
    if (this.getValue(party.phone)) {
      contacts.push(`<Telefono>${this.getValue(party.phone)}</Telefono>`)
    }
    if (this.getValue(party.fax)) {
      contacts.push(`<Fax>${this.getValue(party.fax)}</Fax>`)
    }
    if (this.getValue(party.email)) {
      contacts.push(`<Email>${this.getValue(party.email)}</Email>`)
    }
    
    return contacts.length > 0 ? `<Contatti>\n      ${contacts.join('\n      ')}\n    </Contatti>` : ''
  }
  
  private static serializeBody(data: InvoiceFatturapAOutput): string {
    return `<FatturaElettronicaBody>
    ${this.serializeDocumentData(data)}
    
    ${this.serializeBuyerData(data)}
    
    ${this.serializeLineItems(data)}
    
    ${this.serializeTaxSummary(data)}
    
    ${this.serializePaymentData(data)}
  </FatturaElettronicaBody>`
  }
  
  private static serializeDocumentData(data: InvoiceFatturapAOutput): string {
    return `<DatiGenerali>
    <DatiGeneraliDocumento>
      <TipoDocumento>${this.getValue(data.document_type) || 'TD01'}</TipoDocumento>
      <Divisa>${this.getValue(data.currency.currency_code) || 'EUR'}</Divisa>
      <Data>${this.formatDate(this.getValue(data.issue_date))}</Data>
      <Numero>${this.getValue(data.invoice_number) || ''}</Numero>
      ${this.getValue(data.general_notes) ? `<Causale>${this.getValue(data.general_notes)}</Causale>` : ''}
      ${this.getValue(data.currency.exchange_rate) && this.getValue(data.currency.currency_code) !== 'EUR' ? 
        `<TassoConversione>${this.getValue(data.currency.exchange_rate)}</TassoConversione>` : ''}
    </DatiGeneraliDocumento>
    
    ${this.serializeDocumentReferences(data)}
  </DatiGenerali>`
  }
  
  private static serializeBuyerData(data: InvoiceFatturapAOutput): string {
    if (data.delivery && this.hasDeliveryData(data.delivery)) {
      return `<DatiTrasporto>
      ${this.getValue(data.delivery.delivery_date) ? `<DataConsegna>${this.formatDate(this.getValue(data.delivery.delivery_date))}</DataConsegna>` : ''}
      <IndirizzoResa>
        <Indirizzo>${this.getValue(data.delivery.delivery_address.street) || ''}</Indirizzo>
        <CAP>${this.getValue(data.delivery.delivery_address.postal_code) || ''}</CAP>
        <Comune>${this.getValue(data.delivery.delivery_address.city) || ''}</Comune>
        <Nazione>${this.getValue(data.delivery.delivery_address.country) || 'IT'}</Nazione>
      </IndirizzoResa>
    </DatiTrasporto>`
    }
    return ''
  }
  
  private static serializeLineItems(data: InvoiceFatturapAOutput): string {
    if (!data.line_items || data.line_items.length === 0) return ''
    
    const lines = data.line_items.map((item, index) => `
    <DettaglioLinee>
      <NumeroLinea>${this.getValue(item.line_number) || (index + 1)}</NumeroLinea>
      <Descrizione>${this.getValue(item.description) || ''}</Descrizione>
      ${this.getValue(item.quantity) ? `<Quantita>${this.getValue(item.quantity)}</Quantita>` : ''}
      ${this.getValue(item.unit_of_measure) ? `<UnitaMisura>${this.getValue(item.unit_of_measure)}</UnitaMisura>` : ''}
      <PrezzoUnitario>${this.getValue(item.unit_price) || '0.00'}</PrezzoUnitario>
      ${this.getValue(item.discount_percentage) ? `<ScontoMaggiorazione>
        <Tipo>SC</Tipo>
        <Percentuale>${this.getValue(item.discount_percentage)}</Percentuale>
      </ScontoMaggiorazione>` : ''}
      <PrezzoTotale>${this.getValue(item.total_amount) || '0.00'}</PrezzoTotale>
      <AliquotaIVA>${this.getValue(item.tax_rate) || '0.00'}</AliquotaIVA>
      ${this.getValue(item.tax_nature) ? `<Natura>${this.getValue(item.tax_nature)}</Natura>` : ''}
    </DettaglioLinee>`).join('')
    
    return lines
  }
  
  private static serializeTaxSummary(data: InvoiceFatturapAOutput): string {
    if (!data.tax_details || data.tax_details.length === 0) return ''
    
    const taxSummaries = data.tax_details.map(tax => `
    <DatiRiepilogo>
      <AliquotaIVA>${this.getValue(tax.tax_rate) || '0.00'}</AliquotaIVA>
      ${this.getValue(tax.tax_nature) ? `<Natura>${this.getValue(tax.tax_nature)}</Natura>` : ''}
      <ImponibileImporto>${this.getValue(tax.taxable_amount) || '0.00'}</ImponibileImporto>
      <Imposta>${this.getValue(tax.tax_amount) || '0.00'}</Imposta>
      ${this.getValue(tax.vat_collectability) ? `<EsigibilitaIVA>${this.getValue(tax.vat_collectability)}</EsigibilitaIVA>` : ''}
      ${this.getValue(tax.administrative_reference) ? `<RiferimentoNormativo>${this.getValue(tax.administrative_reference)}</RiferimentoNormativo>` : ''}
    </DatiRiepilogo>`).join('')
    
    return taxSummaries
  }
  
  private static serializePaymentData(data: InvoiceFatturapAOutput): string {
    if (!data.payment_details || data.payment_details.length === 0) return ''
    
    const paymentConditions = data.payment_details[0]
    
    return `<DatiPagamento>
    <CondizioniPagamento>${this.getValue(paymentConditions.payment_conditions) || 'TP02'}</CondizioniPagamento>
    <DettaglioPagamento>
      ${this.getValue(paymentConditions.payment_method) ? `<ModalitaPagamento>${this.getValue(paymentConditions.payment_method)}</ModalitaPagamento>` : '<ModalitaPagamento>MP05</ModalitaPagamento>'}
      ${this.getValue(paymentConditions.payment_due_date) ? `<DataScadenzaPagamento>${this.formatDate(this.getValue(paymentConditions.payment_due_date))}</DataScadenzaPagamento>` : ''}
      <ImportoPagamento>${this.getValue(data.payable_amount) || this.getValue(paymentConditions.payment_amount) || '0.00'}</ImportoPagamento>
      ${this.getValue(paymentConditions.iban) ? `<IBAN>${this.getValue(paymentConditions.iban)}</IBAN>` : ''}
      ${this.getValue(paymentConditions.bic) ? `<BIC>${this.getValue(paymentConditions.bic)}</BIC>` : ''}
    </DettaglioPagamento>
  </DatiPagamento>`
  }
  
  private static serializeDocumentReferences(data: InvoiceFatturapAOutput): string {
    if (!data.references || data.references.length === 0) return ''
    
    const refs = data.references.filter(ref => this.getValue(ref.document_number))
    if (refs.length === 0) return ''
    
    return refs.map(ref => {
      if (this.getValue(ref.cig) || this.getValue(ref.cup)) {
        return `<DatiContratto>
        ${this.getValue(ref.document_number) ? `<IdDocumento>${this.getValue(ref.document_number)}</IdDocumento>` : ''}
        ${this.getValue(ref.document_date) ? `<Data>${this.formatDate(this.getValue(ref.document_date))}</Data>` : ''}
        ${this.getValue(ref.cig) ? `<CodiceCIG>${this.getValue(ref.cig)}</CodiceCIG>` : ''}
        ${this.getValue(ref.cup) ? `<CodiceCUP>${this.getValue(ref.cup)}</CodiceCUP>` : ''}
      </DatiContratto>`
      } else {
        return `<DatiOrdineAcquisto>
        ${this.getValue(ref.document_number) ? `<RiferimentoNumeroLinea>1</RiferimentoNumeroLinea>
        <IdDocumento>${this.getValue(ref.document_number)}</IdDocumento>` : ''}
        ${this.getValue(ref.document_date) ? `<Data>${this.formatDate(this.getValue(ref.document_date))}</Data>` : ''}
      </DatiOrdineAcquisto>`
      }
    }).join('')
  }
  
  // Helper methods
  private static getValue(confidenceValue: any): string | number | null {
    if (!confidenceValue || typeof confidenceValue !== 'object') return confidenceValue
    return confidenceValue.value
  }
  
  private static formatDate(dateValue: any): string {
    if (!dateValue) return ''
    
    // Try to parse various date formats and convert to YYYY-MM-DD
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return dateValue
    
    return date.toISOString().split('T')[0]
  }
  
  private static hasDeliveryData(delivery: any): boolean {
    return delivery && (
      this.getValue(delivery.delivery_date) ||
      this.getValue(delivery.delivery_address?.street) ||
      this.getValue(delivery.delivery_address?.city)
    )
  }
  
  private static formatXml(xml: string): string {
    // Basic XML formatting - in production you might want to use a proper XML formatter
    return xml
      .replace(/>\s*</g, '>\n<')
      .replace(/^\s+|\s+$/gm, '')
      .split('\n')
      .map(line => {
        const depth = (line.match(/^<[^\/].*[^\/]>.*<\/.*>$/) ? 0 : 
                      line.match(/^<\//) ? -1 : 
                      line.match(/^<.*\/$/) ? 0 : 1)
        return '  '.repeat(Math.max(0, depth)) + line.trim()
      })
      .join('\n')
  }
}