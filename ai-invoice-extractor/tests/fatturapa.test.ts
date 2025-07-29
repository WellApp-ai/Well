import { describe, it, expect } from "vitest";
import { invoiceFatturapAOutputSchema } from "@/prompts/extract-invoice-fatturPA.prompt";
import { FatturapAXmlSerializer } from "@/utils/fatturapa-xml";
import { readFileSync } from "fs";
import { z } from "zod";

describe("FatturaPA Invoice Extraction", () => {
  describe("Schema Validation", () => {
    it("should validate Italian B2B invoice data", () => {
      const italianInvoiceData = JSON.parse(
        readFileSync("examples/fatturapa/scenarios/italian/invoice-italian-b2b.json", "utf8")
      );
      
      const result = invoiceFatturapAOutputSchema.safeParse(italianInvoiceData);
      expect(result.success).toBe(true);
    });

    it("should validate foreign supplier invoice data", () => {
      const foreignInvoiceData = JSON.parse(
        readFileSync("examples/fatturapa/scenarios/foreign/invoice-foreign-supplier.json", "utf8")
      );
      
      const result = invoiceFatturapAOutputSchema.safeParse(foreignInvoiceData);
      expect(result.success).toBe(true);
    });
  });

  describe("XML Serialization", () => {
    it("should serialize Italian invoice to valid XML", () => {
      const italianInvoiceData = JSON.parse(
        readFileSync("examples/fatturapa/scenarios/italian/invoice-italian-b2b.json", "utf8")
      );
      
      const xml = FatturapAXmlSerializer.serialize(italianInvoiceData);
      
      // Basic XML structure checks
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<p:FatturaElettronica');
      expect(xml).toContain('<FatturaElettronicaHeader>');
      expect(xml).toContain('<FatturaElettronicaBody>');
      expect(xml).toContain('</p:FatturaElettronica>');
      
      // Check Italian specific data
      expect(xml).toContain('<IdPaese>IT</IdPaese>');
      expect(xml).toContain('<Denominazione>Esempio S.r.l.</Denominazione>');
      expect(xml).toContain('<TipoDocumento>TD01</TipoDocumento>');
      expect(xml).toContain('<Divisa>EUR</Divisa>');
    });

    it("should serialize foreign supplier invoice to valid XML", () => {
      const foreignInvoiceData = JSON.parse(
        readFileSync("examples/fatturapa/scenarios/foreign/invoice-foreign-supplier.json", "utf8")
      );
      
      const xml = FatturapAXmlSerializer.serialize(foreignInvoiceData);
      
      // Check foreign supplier specific data
      expect(xml).toContain('<IdPaese>DE</IdPaese>');
      expect(xml).toContain('<Denominazione>Foreign Consulting GmbH</Denominazione>');
      expect(xml).toContain('<Divisa>USD</Divisa>');
      expect(xml).toContain('<TassoConversione>0.92</TassoConversione>');
      expect(xml).toContain('<RappresentanteFiscale>');
    });

    it("should handle missing optional fields gracefully", () => {
      const minimalData = {
        transmission_format: { value: "FPR12", confidence: 1.0 },
        progressive_file_number: { value: "00001", confidence: 1.0 },
        document_type: { value: "TD01", confidence: 1.0 },
        invoice_number: { value: "TEST-001", confidence: 1.0 },
        issue_date: { value: "2024-01-01", confidence: 1.0 },
        seller: {
          name: { value: "Test Seller", confidence: 1.0 },
          vat_id: { value: "12345678901", confidence: 1.0 },
          country_code: { value: "IT", confidence: 1.0 },
          address: {
            street: { value: "Test Street", confidence: 1.0 },
            city: { value: "Test City", confidence: 1.0 },
            postal_code: { value: "12345", confidence: 1.0 },
            country: { value: "IT", confidence: 1.0 }
          }
        },
        buyer: {
          name: { value: "Test Buyer", confidence: 1.0 },
          vat_id: { value: "98765432109", confidence: 1.0 },
          country_code: { value: "IT", confidence: 1.0 },
          address: {
            street: { value: "Buyer Street", confidence: 1.0 },
            city: { value: "Buyer City", confidence: 1.0 },
            postal_code: { value: "54321", confidence: 1.0 },
            country: { value: "IT", confidence: 1.0 }
          }
        },
        currency: {
          currency_code: { value: "EUR", confidence: 1.0 }
        },
        payment_details: [],
        tax_details: [],
        line_items: [],
        references: [],
        payable_amount: { value: "100.00", confidence: 1.0 }
      };
      
      expect(() => FatturapAXmlSerializer.serialize(minimalData)).not.toThrow();
    });
  });

  describe("FatturaPA Compliance", () => {
    it("should include all required FatturaPA fields for Italian entities", () => {
      const italianInvoiceData = JSON.parse(
        readFileSync("examples/fatturapa/scenarios/italian/invoice-italian-b2b.json", "utf8")
      );
      
      const xml = FatturapAXmlSerializer.serialize(italianInvoiceData);
      
      // Required FatturaPA elements
      expect(xml).toContain('<DatiTrasmissione>');
      expect(xml).toContain('<IdTrasmittente>');
      expect(xml).toContain('<ProgressivoInvio>');
      expect(xml).toContain('<FormatoTrasmissione>FPR12</FormatoTrasmissione>');
      expect(xml).toContain('<CedentePrestatore>');
      expect(xml).toContain('<CessionarioCommittente>');
      expect(xml).toContain('<DatiGeneraliDocumento>');
    });

    it("should handle foreign entities with tax representative", () => {
      const foreignInvoiceData = JSON.parse(
        readFileSync("examples/fatturapa/scenarios/foreign/invoice-foreign-supplier.json", "utf8")
      );
      
      const xml = FatturapAXmlSerializer.serialize(foreignInvoiceData);
      
      // Should include tax representative for foreign entities
      expect(xml).toContain('<RappresentanteFiscale>');
      expect(xml).toContain('<IdPaese>DE</IdPaese>'); // Foreign supplier country
      expect(xml).toContain('<TassoConversione>'); // Exchange rate for non-EUR
    });
  });
});