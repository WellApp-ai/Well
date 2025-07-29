import { describe, test, expect, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { FatturapaXmlExporter } from '../../../src/exporters/fatturapa-xml'
import { FatturapaJsonExporter } from '../../../src/exporters/fatturapa-json'
import { fatturapaInvoiceSchema } from '../../../src/models/invoice'
import type { FatturapaInvoice } from '../../../src/models/invoice'

/**
 * FatturaPA Export Tests
 * 
 * Tests the XML and JSON exporters with sample FatturaPA data
 */

describe('FatturaPA Exporters', () => {
  let sampleInvoice: FatturapaInvoice
  let xmlExporter: FatturapaXmlExporter
  let jsonExporter: FatturapaJsonExporter

  beforeEach(() => {
    // Load sample domestic invoice
    const samplePath = join(__dirname, '../../../examples/fatturapa/domestic-invoice-sample.json')
    const sampleData = JSON.parse(readFileSync(samplePath, 'utf8'))
    
    // Validate sample data against schema
    sampleInvoice = fatturapaInvoiceSchema.parse(sampleData)
    
    // Initialize exporters
    xmlExporter = new FatturapaXmlExporter({
      formatOutput: true,
      includeConfidenceData: false,
      validateRequired: true
    })
    
    jsonExporter = new FatturapaJsonExporter({
      includeConfidenceScores: false,
      includeMetadata: true,
      prettyPrint: true,
      cleanNullValues: true
    })
  })

  describe('XML Export', () => {
    test('should export valid FatturaPA XML', () => {
      const xmlOutput = xmlExporter.export(sampleInvoice)
      
      // Basic XML structure tests
      expect(xmlOutput).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xmlOutput).toContain('<ns2:FatturaElettronica')
      expect(xmlOutput).toContain('versione="FPR12"')
      expect(xmlOutput).toContain('<FatturaElettronicaHeader>')
      expect(xmlOutput).toContain('<FatturaElettronicaBody>')
      
      // Document data tests
      expect(xmlOutput).toContain('<TipoDocumento>TD01</TipoDocumento>')
      expect(xmlOutput).toContain('<Numero>INV-2024-001</Numero>')
      expect(xmlOutput).toContain('<Divisa>EUR</Divisa>')
      
      // Supplier data tests
      expect(xmlOutput).toContain('<Denominazione>Tech Solutions S.r.l.</Denominazione>')
      expect(xmlOutput).toContain('<IdCodice>IT12345678901</IdCodice>')
      expect(xmlOutput).toContain('<Indirizzo>Via Roma</Indirizzo>')
      expect(xmlOutput).toContain('<Comune>Milano</Comune>')
      
      // Customer data tests
      expect(xmlOutput).toContain('<Denominazione>Cliente S.p.A.</Denominazione>')
      expect(xmlOutput).toContain('<IdCodice>IT98765432109</IdCodice>')
      
      // Line items tests
      expect(xmlOutput).toContain('<DettaglioLinee>')
      expect(xmlOutput).toContain('<Descrizione>Servizi di consulenza IT</Descrizione>')
      expect(xmlOutput).toContain('<PrezzoUnitario>1000.00</PrezzoUnitario>')
      expect(xmlOutput).toContain('<AliquotaIVA>22.00</AliquotaIVA>')
      
      // Tax summary tests
      expect(xmlOutput).toContain('<DatiRiepilogo>')
      expect(xmlOutput).toContain('<ImponibileImporto>1000.00</ImponibileImporto>')
      expect(xmlOutput).toContain('<Imposta>220.00</Imposta>')
      
      // Payment data tests
      expect(xmlOutput).toContain('<DatiPagamento>')
      expect(xmlOutput).toContain('<ModalitaPagamento>MP05</ModalitaPagamento>')
      expect(xmlOutput).toContain('<IBAN>IT60 X054 2811 1010 0000 0123 456</IBAN>')
    })

    test('should handle missing optional fields gracefully', () => {
      // Create invoice with minimal required fields
      const minimalInvoice: Partial<FatturapaInvoice> = {
        document_type_code: { value: 'TD01', confidence: 1.0 },
        invoice_number: { value: 'MIN-001', confidence: 1.0 },
        issue_date: { value: '2024-01-01', confidence: 1.0 },
        supplier: {
          name: { value: 'Minimal Supplier', confidence: 1.0 },
          vat_id: { value: 'IT12345678901', confidence: 1.0 },
          address: {
            street: { value: 'Via Test', confidence: 1.0 },
            city: { value: 'Roma', confidence: 1.0 },
            postal_code: { value: '00100', confidence: 1.0 },
            country: { value: 'IT', confidence: 1.0 }
          }
        },
        customer: {
          name: { value: 'Minimal Customer', confidence: 1.0 },
          address: {
            street: { value: 'Via Cliente', confidence: 1.0 },
            city: { value: 'Roma', confidence: 1.0 },
            postal_code: { value: '00100', confidence: 1.0 },
            country: { value: 'IT', confidence: 1.0 }
          }
        },
        line_items: [{
          line_number: { value: 1, confidence: 1.0 },
          description: { value: 'Test item', confidence: 1.0 },
          quantity: { value: 1, confidence: 1.0 },
          unit_price: { value: 100, confidence: 1.0 },
          total_price: { value: 100, confidence: 1.0 },
          vat_rate: { value: 22, confidence: 1.0 }
        }],
        tax_details: [{
          taxable_amount: { value: 100, confidence: 1.0 },
          vat_rate: { value: 22, confidence: 1.0 },
          vat_amount: { value: 22, confidence: 1.0 }
        }],
        currency: {
          currency_code: { value: 'EUR', confidence: 1.0 }
        },
        taxable_amount: { value: 100, confidence: 1.0 },
        vat_amount: { value: 22, confidence: 1.0 },
        total_amount: { value: 122, confidence: 1.0 }
      }

      expect(() => {
        const xmlOutput = xmlExporter.export(minimalInvoice as FatturapaInvoice)
        expect(xmlOutput).toContain('<TipoDocumento>TD01</TipoDocumento>')
        expect(xmlOutput).toContain('<Numero>MIN-001</Numero>')
      }).not.toThrow()
    })

    test('should validate required fields', () => {
      const invalidInvoice = {
        ...sampleInvoice,
        invoice_number: { value: null, confidence: 0.0 }
      }

      expect(() => {
        xmlExporter.export(invalidInvoice)
      }).toThrow('Invoice number is required')
    })
  })

  describe('JSON Export', () => {
    test('should export structured JSON', () => {
      const jsonOutput = jsonExporter.export(sampleInvoice)
      const parsedJson = JSON.parse(jsonOutput)
      
      // Check main structure
      expect(parsedJson).toHaveProperty('header')
      expect(parsedJson).toHaveProperty('body')
      expect(parsedJson).toHaveProperty('metadata')
      
      // Check header structure
      expect(parsedJson.header).toHaveProperty('transmission')
      expect(parsedJson.header).toHaveProperty('supplier')
      expect(parsedJson.header).toHaveProperty('customer')
      
      // Check body structure
      expect(parsedJson.body).toHaveProperty('general_data')
      expect(parsedJson.body).toHaveProperty('line_items')
      expect(parsedJson.body).toHaveProperty('tax_summary')
      expect(parsedJson.body).toHaveProperty('payment_data')
      
      // Check specific values
      expect(parsedJson.header.transmission.sender_country).toBe('IT')
      expect(parsedJson.header.supplier.legal_info.name).toBe('Tech Solutions S.r.l.')
      expect(parsedJson.body.general_data.document_type).toBe('TD01')
      expect(parsedJson.body.general_data.number).toBe('INV-2024-001')
      expect(parsedJson.body.line_items).toHaveLength(1)
      expect(parsedJson.body.tax_summary).toHaveLength(1)
    })

    test('should export for validation', () => {
      const validationOutput = jsonExporter.exportForValidation(sampleInvoice)
      const parsedValidation = JSON.parse(validationOutput)
      
      // Check validation structure
      expect(parsedValidation).toHaveProperty('transmission_data')
      expect(parsedValidation).toHaveProperty('invoice_data')
      expect(parsedValidation).toHaveProperty('parties')
      expect(parsedValidation).toHaveProperty('totals')
      expect(parsedValidation).toHaveProperty('line_count')
      expect(parsedValidation).toHaveProperty('tax_rates')
      
      // Check specific validation values
      expect(parsedValidation.invoice_data.type).toBe('TD01')
      expect(parsedValidation.parties.supplier.vat_id).toBe('IT12345678901')
      expect(parsedValidation.totals.total).toBe(1220)
      expect(parsedValidation.line_count).toBe(1)
      expect(parsedValidation.tax_rates).toContain(22)
    })

    test('should clean null values when enabled', () => {
      const cleanExporter = new FatturapaJsonExporter({
        cleanNullValues: true,
        prettyPrint: false
      })
      
      const jsonOutput = cleanExporter.export(sampleInvoice)
      const parsedJson = JSON.parse(jsonOutput)
      
      // Should not contain null values in cleaned output
      const jsonString = JSON.stringify(parsedJson)
      expect(jsonString).not.toContain('"value":null')
      
      // Should still contain valid data
      expect(parsedJson.header.supplier.legal_info.name).toBe('Tech Solutions S.r.l.')
    })

    test('should include confidence scores when enabled', () => {
      const confidenceExporter = new FatturapaJsonExporter({
        includeConfidenceScores: true,
        cleanNullValues: false
      })
      
      const jsonOutput = confidenceExporter.export(sampleInvoice)
      const parsedJson = JSON.parse(jsonOutput)
      
      // Should contain confidence scores
      expect(parsedJson.header.supplier.legal_info.name).toHaveProperty('confidence')
      expect(parsedJson.body.general_data.number).toHaveProperty('confidence')
      expect(typeof parsedJson.header.supplier.legal_info.name.confidence).toBe('number')
    })
  })

  describe('Schema Validation', () => {
    test('should validate sample data against FatturaPA schema', () => {
      expect(() => {
        fatturapaInvoiceSchema.parse(sampleInvoice)
      }).not.toThrow()
    })

    test('should reject invalid data', () => {
      const invalidData = {
        ...sampleInvoice,
        document_type_code: 'INVALID' // Should be an object with value and confidence
      }

      expect(() => {
        fatturapaInvoiceSchema.parse(invalidData)
      }).toThrow()
    })
  })
})