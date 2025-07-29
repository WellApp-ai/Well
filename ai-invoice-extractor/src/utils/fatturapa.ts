import type { InvoiceFatturapaOutput } from "../prompts/extract-invoice-fatturapa.prompt"

/**
 * Utility functions for FatturaPA XML and JSON serialization
 */

// Helper function to extract confidence value
function getValue(confidenceValue: { value: string | number | null; confidence: number } | undefined): string | null {
  if (!confidenceValue) return null
  return confidenceValue.value?.toString() || null
}

// Helper function to format date for FatturaPA (YYYY-MM-DD)
function formatDate(dateValue: string | null): string | null {
  if (!dateValue) return null
  
  // Try to parse and format various date formats to YYYY-MM-DD
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return dateValue // Return as-is if can't parse
  
  return date.toISOString().split('T')[0]
}

// Helper function to format decimal values
function formatDecimal(value: string | number | null, decimals = 2): string | null {
  if (!value) return null
  
  const num = typeof value === 'string' ? Number.parseFloat(value) : value
  if (isNaN(num)) return null
  
  return num.toFixed(decimals)
}

/**
 * Convert FatturaPA data to XML format
 */
export function serializeFatturapaToXML(data: InvoiceFatturapaOutput): string {
  const xmlParts: string[] = []
  
  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>')
  xmlParts.push('<p:FatturaElettronica xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" versione="FPR12" xsi:schemaLocation="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2/Schema_del_file_xml_FatturaPA_versione_1.2.xsd">')
  
  // FatturaElettronicaHeader
  xmlParts.push('  <FatturaElettronicaHeader>')
  
  // DatiTrasmissione
  xmlParts.push('    <DatiTrasmissione>')
  const transmissionHeader = data.transmission_header
  
  if (getValue(transmissionHeader.progressive_code)) {
    xmlParts.push(`      <ProgressivoInvio>${getValue(transmissionHeader.progressive_code)}</ProgressivoInvio>`)
  }
  
  if (getValue(transmissionHeader.transmission_format)) {
    xmlParts.push(`      <FormatoTrasmissione>${getValue(transmissionHeader.transmission_format)}</FormatoTrasmissione>`)
  }
  
  if (getValue(transmissionHeader.country_code)) {
    xmlParts.push(`      <IdTrasmittente>`)
    xmlParts.push(`        <IdPaese>${getValue(transmissionHeader.country_code)}</IdPaese>`)
    xmlParts.push(`        <IdCodice>${getValue(data.supplier.vat_number) || getValue(data.supplier.fiscal_code)}</IdCodice>`)
    xmlParts.push(`      </IdTrasmittente>`)
  }
  
  if (getValue(transmissionHeader.recipient_code)) {
    xmlParts.push(`      <CodiceDestinatario>${getValue(transmissionHeader.recipient_code)}</CodiceDestinatario>`)
  }
  
  if (getValue(transmissionHeader.email_pec)) {
    xmlParts.push(`      <PECDestinatario>${getValue(transmissionHeader.email_pec)}</PECDestinatario>`)
  }
  
  xmlParts.push('    </DatiTrasmissione>')
  
  // CedentePrestatore (Supplier)
  xmlParts.push('    <CedentePrestatore>')
  xmlParts.push('      <DatiAnagrafici>')
  
  if (getValue(data.supplier.vat_number)) {
    xmlParts.push('        <IdFiscaleIVA>')
    xmlParts.push(`          <IdPaese>${getValue(transmissionHeader.country_code) || 'IT'}</IdPaese>`)
    xmlParts.push(`          <IdCodice>${getValue(data.supplier.vat_number)}</IdCodice>`)
    xmlParts.push('        </IdFiscaleIVA>')
  }
  
  if (getValue(data.supplier.fiscal_code)) {
    xmlParts.push(`        <CodiceFiscale>${getValue(data.supplier.fiscal_code)}</CodiceFiscale>`)
  }
  
  xmlParts.push('        <Anagrafica>')
  if (getValue(data.supplier.company_name)) {
    xmlParts.push(`          <Denominazione>${getValue(data.supplier.company_name)}</Denominazione>`)
  } else if (getValue(data.supplier.name) && getValue(data.supplier.surname)) {
    xmlParts.push(`          <Nome>${getValue(data.supplier.name)}</Nome>`)
    xmlParts.push(`          <Cognome>${getValue(data.supplier.surname)}</Cognome>`)
  }
  xmlParts.push('        </Anagrafica>')
  
  if (getValue(data.supplier.tax_regime)) {
    xmlParts.push(`        <RegimeFiscale>${getValue(data.supplier.tax_regime)}</RegimeFiscale>`)
  }
  
  xmlParts.push('      </DatiAnagrafici>')
  
  // Supplier address
  if (data.supplier.address) {
    xmlParts.push('      <Sede>')
    if (getValue(data.supplier.address.street)) {
      xmlParts.push(`        <Indirizzo>${getValue(data.supplier.address.street)}</Indirizzo>`)
    }
    if (getValue(data.supplier.address.street_number)) {
      xmlParts.push(`        <NumeroCivico>${getValue(data.supplier.address.street_number)}</NumeroCivico>`)
    }
    if (getValue(data.supplier.address.postal_code)) {
      xmlParts.push(`        <CAP>${getValue(data.supplier.address.postal_code)}</CAP>`)
    }
    if (getValue(data.supplier.address.city)) {
      xmlParts.push(`        <Comune>${getValue(data.supplier.address.city)}</Comune>`)
    }
    if (getValue(data.supplier.address.province)) {
      xmlParts.push(`        <Provincia>${getValue(data.supplier.address.province)}</Provincia>`)
    }
    if (getValue(data.supplier.address.country)) {
      xmlParts.push(`        <Nazione>${getValue(data.supplier.address.country)}</Nazione>`)
    }
    xmlParts.push('      </Sede>')
  }
  
  xmlParts.push('    </CedentePrestatore>')
  
  // CessionarioCommittente (Customer)  
  xmlParts.push('    <CessionarioCommittente>')
  xmlParts.push('      <DatiAnagrafici>')
  
  if (getValue(data.customer.vat_number)) {
    xmlParts.push('        <IdFiscaleIVA>')
    xmlParts.push(`          <IdPaese>${getValue(data.customer.address?.country) || 'IT'}</IdPaese>`)
    xmlParts.push(`          <IdCodice>${getValue(data.customer.vat_number)}</IdCodice>`)
    xmlParts.push('        </IdFiscaleIVA>')
  }
  
  if (getValue(data.customer.fiscal_code)) {
    xmlParts.push(`        <CodiceFiscale>${getValue(data.customer.fiscal_code)}</CodiceFiscale>`)
  }
  
  xmlParts.push('        <Anagrafica>')
  if (getValue(data.customer.company_name)) {
    xmlParts.push(`          <Denominazione>${getValue(data.customer.company_name)}</Denominazione>`)
  } else if (getValue(data.customer.name) && getValue(data.customer.surname)) {
    xmlParts.push(`          <Nome>${getValue(data.customer.name)}</Nome>`)
    xmlParts.push(`          <Cognome>${getValue(data.customer.surname)}</Cognome>`)
  }
  xmlParts.push('        </Anagrafica>')
  
  xmlParts.push('      </DatiAnagrafici>')
  
  // Customer address
  if (data.customer.address) {
    xmlParts.push('      <Sede>')
    if (getValue(data.customer.address.street)) {
      xmlParts.push(`        <Indirizzo>${getValue(data.customer.address.street)}</Indirizzo>`)
    }
    if (getValue(data.customer.address.street_number)) {
      xmlParts.push(`        <NumeroCivico>${getValue(data.customer.address.street_number)}</NumeroCivico>`)
    }
    if (getValue(data.customer.address.postal_code)) {
      xmlParts.push(`        <CAP>${getValue(data.customer.address.postal_code)}</CAP>`)
    }
    if (getValue(data.customer.address.city)) {
      xmlParts.push(`        <Comune>${getValue(data.customer.address.city)}</Comune>`)
    }
    if (getValue(data.customer.address.province)) {
      xmlParts.push(`        <Provincia>${getValue(data.customer.address.province)}</Provincia>`)
    }
    if (getValue(data.customer.address.country)) {
      xmlParts.push(`        <Nazione>${getValue(data.customer.address.country)}</Nazione>`)
    }
    xmlParts.push('      </Sede>')
  }
  
  xmlParts.push('    </CessionarioCommittente>')
  xmlParts.push('  </FatturaElettronicaHeader>')
  
  // FatturaElettronicaBody
  xmlParts.push('  <FatturaElettronicaBody>')
  
  // DatiGenerali
  xmlParts.push('    <DatiGenerali>')
  xmlParts.push('      <DatiGeneraliDocumento>')
  
  if (getValue(data.document_type)) {
    xmlParts.push(`        <TipoDocumento>${getValue(data.document_type)}</TipoDocumento>`)
  }
  
  if (getValue(data.currency)) {
    xmlParts.push(`        <Divisa>${getValue(data.currency)}</Divisa>`)
  }
  
  if (getValue(data.issue_date)) {
    xmlParts.push(`        <Data>${formatDate(getValue(data.issue_date))}</Data>`)
  }
  
  if (getValue(data.invoice_number)) {
    xmlParts.push(`        <Numero>${getValue(data.invoice_number)}</Numero>`)
  }
  
  if (getValue(data.exchange_rate)) {
    xmlParts.push(`        <TassoCambio>${formatDecimal(getValue(data.exchange_rate), 6)}</TassoCambio>`)
  }
  
  if (getValue(data.total_amount)) {
    xmlParts.push(`        <ImportoTotaleDocumento>${formatDecimal(getValue(data.total_amount))}</ImportoTotaleDocumento>`)
  }
  
  if (getValue(data.rounding_amount)) {
    xmlParts.push(`        <Arrotondamento>${formatDecimal(getValue(data.rounding_amount))}</Arrotondamento>`)
  }
  
  if (getValue(data.general_notes)) {
    xmlParts.push(`        <Causale>${getValue(data.general_notes)}</Causale>`)
  }
  
  xmlParts.push('      </DatiGeneraliDocumento>')
  xmlParts.push('    </DatiGenerali>')
  
  // DatiBeniServizi (Line Items)
  xmlParts.push('    <DatiBeniServizi>')
  
  data.line_items.forEach((item, index) => {
    xmlParts.push('      <DettaglioLinee>')
    xmlParts.push(`        <NumeroLinea>${index + 1}</NumeroLinea>`)
    
    if (getValue(item.description)) {
      xmlParts.push(`        <Descrizione>${getValue(item.description)}</Descrizione>`)
    }
    
    if (getValue(item.quantity)) {
      xmlParts.push(`        <Quantita>${formatDecimal(getValue(item.quantity), 2)}</Quantita>`)
    }
    
    if (getValue(item.unit_of_measure)) {
      xmlParts.push(`        <UnitaMisura>${getValue(item.unit_of_measure)}</UnitaMisura>`)
    }
    
    if (getValue(item.unit_price)) {
      xmlParts.push(`        <PrezzoUnitario>${formatDecimal(getValue(item.unit_price))}</PrezzoUnitario>`)
    }
    
    if (getValue(item.net_price)) {
      xmlParts.push(`        <PrezzoTotale>${formatDecimal(getValue(item.net_price))}</PrezzoTotale>`)
    }
    
    if (getValue(item.vat_rate)) {
      xmlParts.push(`        <AliquotaIVA>${formatDecimal(getValue(item.vat_rate))}</AliquotaIVA>`)
    }
    
    if (getValue(item.vat_nature)) {
      xmlParts.push(`        <Natura>${getValue(item.vat_nature)}</Natura>`)
    }
    
    xmlParts.push('      </DettaglioLinee>')
  })
  
  // DatiRiepilogo (VAT Summary)
  data.vat_summary.forEach(vatItem => {
    xmlParts.push('      <DatiRiepilogo>')
    
    if (getValue(vatItem.vat_rate)) {
      xmlParts.push(`        <AliquotaIVA>${formatDecimal(getValue(vatItem.vat_rate))}</AliquotaIVA>`)
    }
    
    if (getValue(vatItem.vat_nature)) {
      xmlParts.push(`        <Natura>${getValue(vatItem.vat_nature)}</Natura>`)
    }
    
    if (getValue(vatItem.taxable_amount)) {
      xmlParts.push(`        <ImponibileImporto>${formatDecimal(getValue(vatItem.taxable_amount))}</ImponibileImporto>`)
    }
    
    if (getValue(vatItem.vat_amount)) {
      xmlParts.push(`        <Imposta>${formatDecimal(getValue(vatItem.vat_amount))}</Imposta>`)
    }
    
    if (getValue(vatItem.reference_standard)) {
      xmlParts.push(`        <RiferimentoNormativo>${getValue(vatItem.reference_standard)}</RiferimentoNormativo>`)
    }
    
    xmlParts.push('      </DatiRiepilogo>')
  })
  
  xmlParts.push('    </DatiBeniServizi>')
  
  // DatiPagamento (Payment Information)
  if (data.payment_details) {
    xmlParts.push('    <DatiPagamento>')
    
    if (getValue(data.payment_details.payment_terms)) {
      xmlParts.push(`      <CondizioniPagamento>${getValue(data.payment_details.payment_terms)}</CondizioniPagamento>`)
    }
    
    xmlParts.push('      <DettaglioPagamento>')
    
    if (getValue(data.payment_details.payment_method)) {
      xmlParts.push(`        <ModalitaPagamento>${getValue(data.payment_details.payment_method)}</ModalitaPagamento>`)
    }
    
    if (getValue(data.payment_details.due_date)) {
      xmlParts.push(`        <DataScadenzaPagamento>${formatDate(getValue(data.payment_details.due_date))}</DataScadenzaPagamento>`)
    }
    
    if (getValue(data.payment_details.payment_amount)) {
      xmlParts.push(`        <ImportoPagamento>${formatDecimal(getValue(data.payment_details.payment_amount))}</ImportoPagamento>`)
    }
    
    if (getValue(data.payment_details.iban)) {
      xmlParts.push(`        <IBAN>${getValue(data.payment_details.iban)}</IBAN>`)
    }
    
    if (getValue(data.payment_details.bic)) {
      xmlParts.push(`        <BIC>${getValue(data.payment_details.bic)}</BIC>`)
    }
    
    xmlParts.push('      </DettaglioPagamento>')
    xmlParts.push('    </DatiPagamento>')
  }
  
  xmlParts.push('  </FatturaElettronicaBody>')
  xmlParts.push('</p:FatturaElettronica>')
  
  return xmlParts.join('\n')
}

/**
 * Convert FatturaPA data to structured JSON format
 */
export function serializeFatturapaToJSON(data: InvoiceFatturapaOutput): object {
  return {
    metadata: {
      format: "FatturaPA",
      version: "1.2",
      documentType: getValue(data.document_type),
      invoiceNumber: getValue(data.invoice_number),
      issueDate: getValue(data.issue_date),
      dueDate: getValue(data.due_date),
      currency: getValue(data.currency),
      exchangeRate: getValue(data.exchange_rate) ? Number.parseFloat(getValue(data.exchange_rate)!) : null
    },
    transmission: {
      progressiveCode: getValue(data.transmission_header.progressive_code),
      transmissionFormat: getValue(data.transmission_header.transmission_format),
      recipientCode: getValue(data.transmission_header.recipient_code),
      emailPec: getValue(data.transmission_header.email_pec),
      countryCode: getValue(data.transmission_header.country_code)
    },
    supplier: {
      companyName: getValue(data.supplier.company_name),
      name: getValue(data.supplier.name),
      surname: getValue(data.supplier.surname),
      fiscalCode: getValue(data.supplier.fiscal_code),
      vatNumber: getValue(data.supplier.vat_number),
      taxRegime: getValue(data.supplier.tax_regime),
      address: {
        street: getValue(data.supplier.address.street),
        streetNumber: getValue(data.supplier.address.street_number),
        postalCode: getValue(data.supplier.address.postal_code),
        city: getValue(data.supplier.address.city),
        province: getValue(data.supplier.address.province),
        country: getValue(data.supplier.address.country)
      },
      contact: {
        phone: getValue(data.supplier.phone),
        fax: getValue(data.supplier.fax),
        email: getValue(data.supplier.email)
      }
    },
    customer: {
      companyName: getValue(data.customer.company_name),
      name: getValue(data.customer.name),
      surname: getValue(data.customer.surname),
      fiscalCode: getValue(data.customer.fiscal_code),
      vatNumber: getValue(data.customer.vat_number),
      foreignVatId: getValue(data.customer.foreign_vat_id),
      address: {
        street: getValue(data.customer.address.street),
        streetNumber: getValue(data.customer.address.street_number),
        postalCode: getValue(data.customer.address.postal_code),
        city: getValue(data.customer.address.city),
        province: getValue(data.customer.address.province),
        country: getValue(data.customer.address.country)
      },
      contact: {
        phone: getValue(data.customer.phone),
        fax: getValue(data.customer.fax),
        email: getValue(data.customer.email),
        pec: getValue(data.customer.pec)
      }
    },
    lineItems: data.line_items.map((item, index) => ({
      lineNumber: index + 1,
      description: getValue(item.description),
      quantity: getValue(item.quantity) ? Number.parseFloat(getValue(item.quantity)!) : null,
      unitOfMeasure: getValue(item.unit_of_measure),
      unitPrice: getValue(item.unit_price) ? Number.parseFloat(getValue(item.unit_price)!) : null,
      discountPercentage: getValue(item.discount_percentage) ? Number.parseFloat(getValue(item.discount_percentage)!) : null,
      discountAmount: getValue(item.discount_amount) ? Number.parseFloat(getValue(item.discount_amount)!) : null,
      netPrice: getValue(item.net_price) ? Number.parseFloat(getValue(item.net_price)!) : null,
      vatRate: getValue(item.vat_rate) ? Number.parseFloat(getValue(item.vat_rate)!) : null,
      vatNature: getValue(item.vat_nature)
    })),
    taxSummary: {
      vatSummary: data.vat_summary.map(vat => ({
        vatRate: getValue(vat.vat_rate) ? Number.parseFloat(getValue(vat.vat_rate)!) : null,
        vatNature: getValue(vat.vat_nature),
        taxableAmount: getValue(vat.taxable_amount) ? Number.parseFloat(getValue(vat.taxable_amount)!) : null,
        vatAmount: getValue(vat.vat_amount) ? Number.parseFloat(getValue(vat.vat_amount)!) : null,
        referenceStandard: getValue(vat.reference_standard)
      })),
      withholdingTax: data.withholding_tax.map(wt => ({
        type: getValue(wt.withholding_type),
        amount: getValue(wt.withholding_amount) ? Number.parseFloat(getValue(wt.withholding_amount)!) : null,
        taxableAmount: getValue(wt.taxable_amount) ? Number.parseFloat(getValue(wt.taxable_amount)!) : null,
        rate: getValue(wt.withholding_rate) ? Number.parseFloat(getValue(wt.withholding_rate)!) : null,
        reason: getValue(wt.withholding_reason)
      }))
    },
    totals: {
      taxableAmount: getValue(data.taxable_amount) ? Number.parseFloat(getValue(data.taxable_amount)!) : null,
      vatAmount: getValue(data.vat_amount) ? Number.parseFloat(getValue(data.vat_amount)!) : null,
      withholdingAmount: getValue(data.withholding_amount) ? Number.parseFloat(getValue(data.withholding_amount)!) : null,
      totalAmount: getValue(data.total_amount) ? Number.parseFloat(getValue(data.total_amount)!) : null,
      roundingAmount: getValue(data.rounding_amount) ? Number.parseFloat(getValue(data.rounding_amount)!) : null,
      netAmountDue: getValue(data.net_amount_due) ? Number.parseFloat(getValue(data.net_amount_due)!) : null
    },
    payment: {
      terms: getValue(data.payment_details.payment_terms),
      method: getValue(data.payment_details.payment_method),
      dueDate: getValue(data.payment_details.due_date),
      amount: getValue(data.payment_details.payment_amount) ? Number.parseFloat(getValue(data.payment_details.payment_amount)!) : null,
      iban: getValue(data.payment_details.iban),
      bic: getValue(data.payment_details.bic),
      bankName: getValue(data.payment_details.bank_name)
    },
    references: data.document_references.map(ref => ({
      type: getValue(ref.reference_type),
      number: getValue(ref.reference_number),
      date: getValue(ref.reference_date),
      cigCode: getValue(ref.cig_code),
      cupCode: getValue(ref.cup_code),
      purchaseOrderReference: getValue(ref.purchase_order_reference)
    })),
    additionalInfo: {
      generalNotes: getValue(data.general_notes),
      causeOfIssue: getValue(data.cause_of_issue),
      art73Declaration: getValue(data.art73_declaration)
    }
  }
}

/**
 * Document type detection for FatturaPA
 */
export function detectDocumentType(data: any): string {
  // Logic to detect TD01, TD17, TD18, TD19 based on invoice characteristics
  
  // Check if foreign customer (non-Italian VAT or address)
  const customerCountry = data.customer?.address?.country?.value
  const customerVat = data.customer?.vat_number?.value
  const supplierCountry = data.supplier?.address?.country?.value
  
  // TD17: Integration invoice for intra-EU purchases
  if (customerCountry && customerCountry !== 'IT' && customerCountry !== 'SM' && isEUCountry(customerCountry)) {
    return 'TD17'
  }
  
  // TD19: Integration invoice for services from San Marino (check first for services)
  if ((customerCountry === 'SM' || supplierCountry === 'SM') && hasServiceItems(data.line_items)) {
    return 'TD19'
  }
  
  // TD18: Integration invoice for goods from San Marino
  if (customerCountry === 'SM' || supplierCountry === 'SM') {
    return 'TD18'
  }
  
  // Default to TD01 (standard commercial invoice)
  return 'TD01'
}

// Helper function to check if country is in EU
function isEUCountry(countryCode: string): boolean {
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 
    'SI', 'ES', 'SE'
  ]
  return euCountries.includes(countryCode.toUpperCase())
}

// Helper function to detect if line items contain services
function hasServiceItems(lineItems: any[]): boolean {
  if (!lineItems || lineItems.length === 0) return false
  
  return lineItems.some(item => {
    const description = item.description?.value?.toLowerCase() || ''
    return description.includes('servic') || 
           description.includes('consultan') || 
           description.includes('licens') ||
           description.includes('support') ||
           description.includes('maintenance') ||
           description.includes('consulting')
  })
}