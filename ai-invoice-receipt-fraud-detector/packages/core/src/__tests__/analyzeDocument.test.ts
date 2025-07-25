import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzeDocument } from "../analyzeDocument";
import { DocumentInput, DetectionResult } from "../types";
import { getCurrentLLM } from "../llm/models";

vi.mock("../llm/models");

beforeEach(() => {
  vi.clearAllMocks();
  (getCurrentLLM as import("vitest").Mock).mockReturnValue({
    generate: vi.fn().mockResolvedValue({
      is_fake: false,
      confidence: 0,
      indicators: [],
    }),
  });
});

vi.mock("../parseDocument", () => ({
  parseDocument: vi.fn().mockImplementation(async (input: DocumentInput) => {
    if (input.type === "structured") {
      return input.data;
    }
    return {
      extracted_text: "This is a valid invoice with a total of 120.",
      metadata: { producer: "Valid Producer" },
      total: 120,
      items: [{ price: "100" }, { price: "20" }],
    };
  }),
}));

describe("analyzeDocument", () => {
  it("should analyze a document and return results", async () => {
    const document: DocumentInput = {
      type: "structured",
      data: {
        content: "Sample content",
        metadata: {
          creationDate: new Date(),
          author: "Test Author",
        },
        fileType: "pdf",
      },
    };

    const results: DetectionResult = await analyzeDocument(document);

    expect(results).toBeDefined();
    expect(results.is_fake).toBeDefined();
    expect(results.confidence).toBeDefined();
    expect(results.indicators).toBeDefined();
  });

  it("should not flag a valid document as fraudulent", async () => {
    const document: DocumentInput = {
      type: "structured",
      data: {
        total: 120,
        items: [{ price: "100" }, { price: "20" }],
        extracted_text: "Invoice for services rendered. Total: 120.",
        metadata: { producer: "Legit Software" },
      },
    };

    const results: DetectionResult = await analyzeDocument(document);

    expect(results.is_fake).toBe(false);
    expect(results.confidence).toBe(0);
    expect(results.indicators).toHaveLength(0);
  });

  it("should flag an invoice where the total does not match the sum of items", async () => {
    const document: DocumentInput = {
      type: "structured",
      data: {
        total: 200, // Declared total
        items: [{ price: "100" }, { price: "20" }], // Actual sum is 120
        extracted_text: "Invoice with wrong total. Total: 200.",
        metadata: { producer: "Legit Software" },
      },
    };

    const results: DetectionResult = await analyzeDocument(document);

    expect(results.is_fake).toBe(true);
    expect(results.confidence).toBe(60);
    expect(results.indicators).toHaveLength(1);
    expect(results.indicators[0]).toEqual({
      category: "textual",
      value: "invoice total does not match item sum",
      description: "Declared total is 200, but sum of items is 120.00",
    });
  });

  it("should flag a document with suspicious metadata", async () => {
    const document: DocumentInput = {
      type: "structured",
      data: {
        total: 120,
        items: [{ price: "100" }, { price: "20" }],
        extracted_text: "Invoice from a suspicious source.",
        metadata: { producer: "PDF-Generator-AI" },
      },
    };

    const results: DetectionResult = await analyzeDocument(document);

    expect(results.is_fake).toBe(true);
    expect(results.confidence).toBe(60);
    expect(results.indicators).toHaveLength(1);
    expect(results.indicators[0]).toEqual({
      category: "metadata",
      value: "PDF-Generator-AI",
      description: "Suspicious PDF producer suggests AI-generated document",
    });
  });

  it("should return a fraudulent result when the LLM detects fraud", async () => {
    // Mock the LLM response for this specific test
    (getCurrentLLM as import("vitest").Mock).mockReturnValue({
      generate: vi.fn().mockResolvedValue({
        is_fake: true,
        confidence: 95,
        indicators: [
          {
            category: "llm",
            value: "Unusual invoice format",
            description:
              "The invoice format is inconsistent with typical invoices.",
          },
        ],
      }),
    });

    const document: DocumentInput = {
      type: "structured",
      data: {
        total: 120,
        items: [{ price: "100" }, { price: "20" }],
        extracted_text: "A seemingly valid invoice.",
        metadata: { producer: "Legit Software" },
      },
    };

    const results: DetectionResult = await analyzeDocument(document);

    expect(results.is_fake).toBe(true);
    expect(results.confidence).toBe(95);
    expect(results.indicators).toHaveLength(1);
    expect(results.indicators[0].category).toBe("llm");
  });
});
