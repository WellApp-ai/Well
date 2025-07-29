import { describe, it, expect } from "vitest";
import { invoiceFatturapAOutputSchema } from "@/prompts/extract-invoice-fatturPA.prompt";
import { readFileSync } from "fs";

describe("FatturaPA Schema Validation", () => {
  it("should validate Italian B2B invoice data", () => {
    const italianInvoiceData = JSON.parse(
      readFileSync("examples/fatturapa/scenarios/italian/invoice-italian-b2b.json", "utf8")
    );
    
    const result = invoiceFatturapAOutputSchema.safeParse(italianInvoiceData);
    if (!result.success) {
      console.error("Validation errors:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("should validate foreign supplier invoice data", () => {
    const foreignInvoiceData = JSON.parse(
      readFileSync("examples/fatturapa/scenarios/foreign/invoice-foreign-supplier.json", "utf8")
    );
    
    const result = invoiceFatturapAOutputSchema.safeParse(foreignInvoiceData);
    if (!result.success) {
      console.error("Validation errors:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("should validate Public Administration invoice data", () => {
    const paInvoiceData = JSON.parse(
      readFileSync("examples/fatturapa/scenarios/italian/invoice-public-administration.json", "utf8")
    );
    
    const result = invoiceFatturapAOutputSchema.safeParse(paInvoiceData);
    if (!result.success) {
      console.error("Validation errors:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("should require essential FatturaPA fields", () => {
    const minimalInvoice = {
      transmission_format: { value: "FPR12", confidence: 1.0 },
      progressive_file_number: { value: "00001", confidence: 1.0 },
      document_type: { value: "TD01", confidence: 1.0 },
      invoice_number: { value: "TEST-001", confidence: 1.0 },
      issue_date: { value: "2024-01-01", confidence: 1.0 }
      // Missing required fields like seller, buyer, etc.
    };

    const result = invoiceFatturapAOutputSchema.safeParse(minimalInvoice);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some(issue => issue.path.includes('seller'))).toBe(true);
    expect(result.error?.issues.some(issue => issue.path.includes('buyer'))).toBe(true);
  });

  it("should handle confidence values correctly", () => {
    const testData = {
      transmission_format: { value: "FPR12", confidence: 1.0 },
      progressive_file_number: { value: "00001", confidence: 0.9 },
      document_type: { value: "TD01", confidence: 0.8 },
      invoice_number: { value: "TEST-001", confidence: 1.0 },
      issue_date: { value: "2024-01-01", confidence: 1.0 },
      seller: {
        name: { value: "Test Seller", confidence: 1.0 },
        vat_id: { value: "12345678901", confidence: 1.0 },
        tax_code: { value: null, confidence: 0.0 }, // null value with 0 confidence
        country_code: { value: "IT", confidence: 1.0 },
        address: {
          street: { value: "Test Street", confidence: 1.0 },
          civic_number: { value: null, confidence: 0.0 },
          city: { value: "Test City", confidence: 1.0 },
          postal_code: { value: "12345", confidence: 1.0 },
          province: { value: "RM", confidence: 0.9 },
          country: { value: "IT", confidence: 1.0 }
        },
        legal_form: { value: "RF01", confidence: 1.0 },
        share_capital: { value: null, confidence: 0.0 },
        shareholder_status: { value: null, confidence: 0.0 },
        liquidation_status: { value: null, confidence: 0.0 },
        phone: { value: null, confidence: 0.0 },
        fax: { value: null, confidence: 0.0 },
        email: { value: null, confidence: 0.0 },
        pec: { value: null, confidence: 0.0 }
      },
      buyer: {
        name: { value: "Test Buyer", confidence: 1.0 },
        vat_id: { value: "98765432109", confidence: 1.0 },
        tax_code: { value: null, confidence: 0.0 },
        country_code: { value: "IT", confidence: 1.0 },
        address: {
          street: { value: "Buyer Street", confidence: 1.0 },
          civic_number: { value: null, confidence: 0.0 },
          city: { value: "Buyer City", confidence: 1.0 },
          postal_code: { value: "54321", confidence: 1.0 },
          province: { value: "MI", confidence: 1.0 },
          country: { value: "IT", confidence: 1.0 }
        },
        legal_form: { value: null, confidence: 0.0 },
        share_capital: { value: null, confidence: 0.0 },
        shareholder_status: { value: null, confidence: 0.0 },
        liquidation_status: { value: null, confidence: 0.0 },
        phone: { value: null, confidence: 0.0 },
        fax: { value: null, confidence: 0.0 },
        email: { value: null, confidence: 0.0 },
        pec: { value: null, confidence: 0.0 }
      },
      tax_representative: null,
      currency: {
        currency_code: { value: "EUR", confidence: 1.0 },
        exchange_rate: { value: null, confidence: 0.0 },
        exchange_rate_date: { value: null, confidence: 0.0 }
      },
      payment_details: [],
      tax_details: [],
      line_items: [],
      references: [],
      delivery: null,
      withholding: null,
      taxable_amount_total: { value: "100.00", confidence: 1.0 },
      tax_amount_total: { value: "22.00", confidence: 1.0 },
      withholding_amount_total: { value: null, confidence: 0.0 },
      payable_amount: { value: "122.00", confidence: 1.0 },
      general_notes: { value: null, confidence: 0.0 },
      related_documents: [],
      pa_code: { value: null, confidence: 0.0 },
      pa_pec: { value: null, confidence: 0.0 }
    };

    const result = invoiceFatturapAOutputSchema.safeParse(testData);
    if (!result.success) {
      console.error("Validation errors:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });
});