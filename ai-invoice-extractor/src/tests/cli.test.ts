import { describe, it, expect, mock } from "bun:test";
import { main } from "../cli.js";
import { invoiceOutputSchema } from "../prompts/extract-invoice.prompt.js";

// Mock the extractor to avoid actual API calls
mock.module("../extractors/index.js", () => ({
  Extractor: {
    create: mock(() => ({
      analyseFile: mock().mockResolvedValue({ success: true }),
    })),
  },
}));

describe("cli", () => {
  it("should exit with an error if the file path is missing", async () => {
    const { exitCode, stderr } = await main([]);
    expect(exitCode).toBe(1);
    expect(stderr.join("\n")).toContain(
      "error: missing required argument 'file-path'"
    );
  });

  it("should exit with an error if an invalid AI vendor is provided", async () => {
    const { exitCode, stderr } = await main([
      "--vendor",
      "invalid-vendor",
      "file.pdf",
    ]);
    expect(exitCode).toBe(1);
    expect(stderr.join("\n")).toContain("Invalid enum value.");
  });

  it("should exit with an error if the AI API key is not provided", async () => {
    const { exitCode, stderr } = await main(["file.pdf"]);
    expect(exitCode).toBe(1);
    expect(stderr.join("\n")).toContain(
      "No AI configuration found. Please provide an API key."
    );
  });

  it("should call the extractor with the correct parameters", async () => {
    const analyseFileMock = mock().mockResolvedValue({ success: true });
    const createMock = mock(() => ({
      analyseFile: analyseFileMock,
    }));
    mock.module("../extractors/index.js", () => ({
      Extractor: {
        create: createMock,
      },
    }));

    await main([
      "--vendor",
      "openai",
      "--model",
      "gpt-4",
      "--key",
      "test-key",
      "file.pdf",
    ]);

    expect(createMock).toHaveBeenCalledWith({
      vendor: "openai",
      model: "gpt-4",
      apiKey: "test-key",
    });
    expect(analyseFileMock).toHaveBeenCalledWith({
      path: "file.pdf",
      prompt: "EXTRACT_INVOICE",
      output: invoiceOutputSchema,
    });
  });

  it("should output pretty JSON when the --pretty option is used", async () => {
    const { stdout } = await main([
      "--vendor",
      "openai",
      "--key",
      "test-key",
      "--pretty",
      "file.pdf",
    ]);
    expect(stdout.join("\n")).toContain(
      JSON.stringify({ success: true }, null, 2)
    );
  });

  it("should output compact JSON by default", async () => {
    const { stdout } = await main([
      "--vendor",
      "openai",
      "--key",
      "test-key",
      "file.pdf",
    ]);
    expect(stdout.join("\n")).toContain(JSON.stringify({ success: true }));
  });

  it("should handle extraction errors gracefully", async () => {
    mock.module("../extractors/index.js", () => ({
      Extractor: {
        create: mock(() => ({
          analyseFile: mock().mockRejectedValue(new Error("Extraction failed")),
        })),
      },
    }));
    const { exitCode, stderr } = await main([
      "--vendor",
      "openai",
      "--key",
      "test-key",
      "file.pdf",
    ]);
    expect(exitCode).toBe(1);
    expect(stderr.join("\n")).toContain("Extraction failed");
  });
});
