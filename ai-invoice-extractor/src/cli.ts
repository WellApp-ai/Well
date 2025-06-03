#!/usr/bin/env node

import { exit } from "node:process"
import { Command } from "commander"
import figlet from "figlet"
import { z } from "zod/v4"
import { Extractor } from "./extractors"
import { config } from "./libs/config"
import { logger } from "./libs/logger"
import { invoiceOutputSchema } from "./prompts/extract-invoice.prompt"
import type { AiConfig } from "./types"
import { ConfigUtils } from "./utils/config"
import { StringUtils } from "./utils/string"

export type CliOptions = z.infer<typeof CliOptions>
export const CliOptions = z.object({
  vendor: z.enum(["openai", "mistral", "anthropic", "google", "ollama"]).optional(),
  model: z.string("AI model is required").optional(),
  key: z.string("AI API Key is required.").optional(),
  pretty: z.boolean("Output pretty JSON").default(false)
})

const program = new Command()

program
  .name("ai-invoice-extractor")
  .description("AI-based image/PDF invoices/receipts data extractor.")
  .argument("<file-path>", "Invoice/receipt file path (image or PDF)")
  // ai options
  .option("-v, --vendor [vendor]", "AI vendor")
  .option("-m, --model [model]", "AI model")
  .option("-k, --key [key]", "AI key")
  // other options
  .option("-p, --pretty", "Output pretty JSON", false)
  .action(async (filePath, options) => {
    console.log(figlet.textSync("AI Invoice Extractor"))
    console.log("by Wellapp.ai\n")

    // Validate CLI options
    // ---------------------------
    const parsedCliOptions = CliOptions.safeParse({
      vendor: options.vendor,
      model: options.model,
      key: options.key,
      pretty: options.pretty
    } satisfies CliOptions)

    if (!parsedCliOptions.success) {
      logger.error(z.prettifyError(parsedCliOptions.error))
      exit(1)
    }

    logger.debug(`cli options: ${JSON.stringify(parsedCliOptions.data, null, 2)}`)

    // Merge CLI options with environment variables
    // ---------------------------
    const envAiConfig = config.ai

    const mergedAiConfig = ConfigUtils.mergeAiConfig({
      cliAiConfig: {
        vendor: parsedCliOptions.data.vendor,
        model: parsedCliOptions.data.model,
        apiKey: parsedCliOptions.data.key
      } as AiConfig,
      envAiConfig
    })

    if (!mergedAiConfig.apiKey) {
      logger.error("No AI configuration found. Please provide an API key.")
      exit(1)
    }

    logger.info(
      `Using ${mergedAiConfig.vendor}:${mergedAiConfig.model} with API key ${StringUtils.mask(mergedAiConfig.apiKey)}`
    )

    // Start data extraction
    // ---------------------------
    const extractor = Extractor.create(mergedAiConfig)

    try {
      const data = await extractor.analyseFile({
        path: filePath,
        prompt: "EXTRACT_INVOICE",
        output: invoiceOutputSchema
      })

      if (options.pretty) {
        process.stdout.write(`\n${JSON.stringify(data, null, 2)}\n\n`)
      } else {
        process.stdout.write(`\n${JSON.stringify(data)}\n\n`)
      }

      exit(0)
    } catch (error) {
      process.stderr.write(`${(error as Error).message}\n`)
      exit(1)
    }
  })

program.parse(process.argv)
