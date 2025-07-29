#!/usr/bin/env node

import { exit } from "node:process";
import { Command } from "commander";
import figlet from "figlet";
import { z } from "zod";
import { Extractor } from "./extractors/index.js";
import { config } from "./libs/config.js";
import { logger } from "./libs/logger.js";
import { invoiceOutputSchema } from "./prompts/extract-invoice.prompt.js";
import { invoiceFacturxOutputSchema } from "./prompts/extract-invoice-facturx.prompt.js";
import { invoiceFatturapAOutputSchema } from "./prompts/extract-invoice-fatturPA.prompt.js";
import { FatturapAXmlSerializer } from "./utils/fatturapa-xml.js";
import type { AiConfig } from "./types.js";
import { ConfigUtils } from "./utils/config.js";
import { StringUtils } from "./utils/string.js";

export type CliOptions = z.infer<typeof CliOptions>;
export const CliOptions = z.object({
  vendor: z
    .enum(["openai", "mistral", "anthropic", "google", "ollama"])
    .optional(),
  model: z.string().optional(),
  key: z.string().optional(),
  pretty: z.boolean().default(false),
  format: z.enum(["json", "xml"]).default("json"),
  prompt: z.enum(["EXTRACT_INVOICE", "EXTRACT_INVOICE_FACTURX", "EXTRACT_INVOICE_FATTURAPA"]).default("EXTRACT_INVOICE_FATTURAPA")
});

export async function main(argv: string[]) {
  const program = new Command();
  const stdout: string[] = [];
  const stderr: string[] = [];
  let exitCode = 0;

  program
    .name("ai-invoice-extractor")
    .description("AI-based image/PDF invoices/receipts data extractor with FatturaPA support.")
    .argument("<file-path>", "Invoice/receipt file path (image or PDF)")
    // ai options
    .option("-v, --vendor [vendor]", "AI vendor")
    .option("-m, --model [model]", "AI model")
    .option("-k, --key [key]", "AI key")
    // output options
    .option("-f, --format [format]", "Output format: json or xml", "json")
    .option("-t, --prompt [prompt]", "Extraction prompt type", "EXTRACT_INVOICE_FATTURAPA")
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
        prompt: options.prompt
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
      stdout.push(
        `Extraction mode: ${parsedCliOptions.data.prompt}, Output format: ${parsedCliOptions.data.format}`
      );

      // Start data extraction
      // ---------------------------
      const extractor = Extractor.create(mergedAiConfig);

      // Select appropriate schema based on prompt type
      const getSchema = () => {
        switch (parsedCliOptions.data.prompt) {
          case "EXTRACT_INVOICE":
            return invoiceOutputSchema;
          case "EXTRACT_INVOICE_FACTURX":
            return invoiceFacturxOutputSchema;
          case "EXTRACT_INVOICE_FATTURAPA":
            return invoiceFatturapAOutputSchema;
          default:
            return invoiceFatturapAOutputSchema;
        }
      };

      try {
        const data = await extractor.analyseFile({
          path: filePath,
          prompt: parsedCliOptions.data.prompt,
          output: getSchema(),
        });

        // Format output based on requested format
        if (parsedCliOptions.data.format === "xml" && parsedCliOptions.data.prompt === "EXTRACT_INVOICE_FATTURAPA") {
          // Serialize to FatturaPA XML
          const xmlOutput = FatturapAXmlSerializer.serialize(data);
          stdout.push(`\n${xmlOutput}\n`);
        } else {
          // Output as JSON
          if (options.pretty) {
            stdout.push(`\n${JSON.stringify(data, null, 2)}\n\n`);
          } else {
            stdout.push(`\n${JSON.stringify(data)}\n\n`);
          }
        }
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
