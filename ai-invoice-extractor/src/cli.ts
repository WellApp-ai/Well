#!/usr/bin/env node
import { Command } from "commander";
import figlet from "figlet";
import { z } from "zod";
import { Extractor } from "./extractors/index.js";
import { config } from "./libs/config.js";
import { logger } from "./libs/logger.js";
import { invoiceOutputSchema } from "./prompts/extract-invoice.prompt.js";
import { invoiceFacturxOutputSchema } from "./prompts/extract-invoice-facturx.prompt.js";
import { invoiceFatturapaOutputSchema } from "./prompts/extract-invoice-fatturapa.prompt.js";
import type { AiConfig } from "./types.js";
import { ConfigUtils } from "./utils/config.js";
import { StringUtils } from "./utils/string.js";
import { serializeFatturapaToXML, serializeFatturapaToJSON } from "./utils/fatturapa.js";

export type CliOptions = z.infer<typeof CliOptions>;
export const CliOptions = z.object({
  vendor: z
    .enum(["openai", "mistral", "anthropic", "google", "ollama"])
    .optional(),
  model: z.string().optional(),
  key: z.string().optional(),
  pretty: z.boolean().default(false),
  format: z.enum(["basic", "facturx", "fatturapa"]).default("basic"),
  output: z.enum(["json", "xml"]).default("json")
});

export async function main(argv: string[]) {
  const program = new Command();
  const stdout: string[] = [];
  const stderr: string[] = [];
  let exitCode = 0;

  program
    .name("ai-invoice-extractor")
    .description("AI-based image/PDF invoices/receipts data extractor.")
    .argument("<file-path>", "Invoice/receipt file path (image or PDF)")
    // ai options
    .option("-v, --vendor [vendor]", "AI vendor")
    .option("-m, --model [model]", "AI model")
    .option("-k, --key [key]", "AI key")
    // extraction options
    .option("-f, --format [format]", "Extraction format: basic, facturx, fatturapa", "basic")
    .option("-o, --output [output]", "Output format: json, xml (for fatturapa)", "json")
    // other options
    .option("-p, --pretty", "Output pretty JSON", false)
    .exitOverride((err) => {
      exitCode = 1;
      throw err;
    })
    .action(async (filePath, options) => {
      stdout.push(figlet.textSync("AI Invoice Extractor"));
      stdout.push("by Wellapp.ai\n");

      // Validate CLI options
      // ---------------------------
      const parsedCliOptions = CliOptions.safeParse({
        vendor: options.vendor,
        model: options.model,
        key: options.key,
        pretty: options.pretty,
        format: options.format,
        output: options.output,
      } satisfies CliOptions);

      if (!parsedCliOptions.success) {
        const messages = parsedCliOptions.error.issues.map((issue) =>
          issue.path.length
            ? `${issue.path.join(".")}: ${issue.message}`
            : issue.message,
        );
        stderr.push(messages.join("\n"));
        exitCode = 1;
        return;
      }

      logger.debug(
        `cli options: ${JSON.stringify(parsedCliOptions.data, null, 2)}`
      );

      // Merge CLI options with environment variables
      // ---------------------------
      const envAiConfig = config.ai;

      const mergedAiConfig = ConfigUtils.mergeAiConfig({
        cliAiConfig: {
          vendor: parsedCliOptions.data.vendor,
          model: parsedCliOptions.data.model,
          apiKey: parsedCliOptions.data.key,
        } as AiConfig,
        envAiConfig,
      });

      if (!mergedAiConfig.apiKey) {
        stderr.push("No AI configuration found. Please provide an API key.");
        exitCode = 1;
        return;
      }

      stdout.push(
        `Using ${mergedAiConfig.vendor}:${
          mergedAiConfig.model
        } with API key ${StringUtils.mask(mergedAiConfig.apiKey)}`
      );

      // Start data extraction
      // ---------------------------
      const extractor = Extractor.create(mergedAiConfig);

      try {
        let prompt: string;
        let outputSchema: any;

        // Select prompt and schema based on format
        switch (parsedCliOptions.data.format) {
          case "facturx":
            prompt = "EXTRACT_INVOICE_FACTURX";
            outputSchema = invoiceFacturxOutputSchema;
            break;
          case "fatturapa":
            prompt = "EXTRACT_INVOICE_FATTURAPA";
            outputSchema = invoiceFatturapaOutputSchema;
            break;
          default:
            prompt = "EXTRACT_INVOICE";
            outputSchema = invoiceOutputSchema;
        }

        stdout.push(`Using extraction format: ${parsedCliOptions.data.format}`);

        const data = await extractor.analyseFile({
          path: filePath,
          prompt,
          output: outputSchema,
        });

        // Handle output serialization based on format and output type
        let outputData: string;
        
        if (parsedCliOptions.data.format === "fatturapa" && parsedCliOptions.data.output === "xml") {
          // Serialize FatturaPA data to XML
          outputData = serializeFatturapaToXML(data);
        } else if (parsedCliOptions.data.format === "fatturapa" && parsedCliOptions.data.output === "json") {
          // Serialize FatturaPA data to structured JSON
          const structuredData = serializeFatturapaToJSON(data);
          outputData = options.pretty ? JSON.stringify(structuredData, null, 2) : JSON.stringify(structuredData);
        } else {
          // Default JSON output for basic and facturx formats
          outputData = options.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        }

        stdout.push(`\n${outputData}\n`);
      } catch (error) {
        stderr.push(`${(error as Error).message}\n`);
        exitCode = 1;
      }
    });

  try {
    await program.parseAsync(argv, { from: "user" });
  } catch (error) {
    stderr.push((error as Error).message);
  }

  return {
    exitCode,
    stdout,
    stderr,
  };
}

if (process.env.NODE_ENV !== "test") {
  main(process.argv);
}
