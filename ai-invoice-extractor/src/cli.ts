#!/usr/bin/env node
import { Command } from "commander"
import figlet from "figlet"
import { z } from "zod"
import { BaseError } from "../../shared/errors/base.js"
import { Extractor } from "./extractors/index.js"
import { config } from "./libs/config.js"
import { logger } from "./libs/logger.js"
import { invoiceOutputSchema } from "./prompts/extract-invoice.prompt.js"
import type { AiConfig } from "./types.js"
import { ConfigUtils } from "./utils/config.js"
import { StringUtils } from "./utils/string.js"

export type CliOptions = z.infer<typeof CliOptions>
export const CliOptions = z.object({
  vendor: z.enum(["openai", "mistral", "anthropic", "google", "ollama"]).optional(),
  model: z.string().optional(),
  // A blank key is the same as no key: the vendor would reject it later with a
  // less helpful message and a worse exit code.
  key: z.string().trim().min(1, "API key must not be blank").optional(),
  pretty: z.boolean().default(false)
})

export async function main(argv: string[]) {
  const program = new Command()
  const stdout: string[] = []
  const stderr: string[] = []
  let exitCode = 0

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
    .exitOverride(err => {
      // Commander exits 0 for --help and --version, 1 for usage errors.
      exitCode = err.exitCode
      throw err
    })
    .action(async (filePath, options) => {
      stdout.push(figlet.textSync("AI Invoice Extractor"))
      stdout.push("by Wellapp.ai\n")

      // Validate CLI options
      // ---------------------------
      const parsedCliOptions = CliOptions.safeParse({
        vendor: options.vendor,
        model: options.model,
        key: options.key,
        pretty: options.pretty
      } satisfies CliOptions)

      if (!parsedCliOptions.success) {
        const messages = parsedCliOptions.error.issues.map(issue =>
          issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message
        )
        stderr.push(messages.join("\n"))
        exitCode = 1
        return
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
        stderr.push("No AI configuration found. Please provide an API key.")
        exitCode = 1
        return
      }

      stdout.push(
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
          stdout.push(`\n${JSON.stringify(data, null, 2)}\n\n`)
        } else {
          stdout.push(`\n${JSON.stringify(data)}\n\n`)
        }
      } catch (error) {
        if (error instanceof BaseError) {
          stderr.push(`Error ${error.code}: ${error.userMessage}`)
          if (error.recovery.type === "retry") {
            stderr.push(`Recovery: ${error.recovery.description}`)
          }
          if (error.technicalDetails && process.env.DEBUG) {
            stderr.push(`Technical details: ${error.technicalDetails}`)
          }
          exitCode = Math.floor(error.statusCode / 100) === 4 ? 1 : 2
        } else {
          stderr.push(`Unexpected error: ${(error as Error).message}`)
          exitCode = 2
        }
      }
    })

  try {
    await program.parseAsync(argv, { from: "user" })
  } catch (error) {
    stderr.push((error as Error).message)
  }

  return {
    exitCode,
    stdout,
    stderr
  }
}

// `main` collects output and an exit code so tests can call it in-process;
// the process entry point is the only place that prints and exits. The guard
// is the module's entry status, not NODE_ENV: a test that spawns the CLI as a
// child process inherits NODE_ENV=test and still expects a real run.
if (import.meta.main) {
  main(process.argv.slice(2)).then(({ exitCode, stdout, stderr }) => {
    for (const line of stdout) console.log(line)
    for (const line of stderr) console.error(line)
    process.exitCode = exitCode
  })
}
