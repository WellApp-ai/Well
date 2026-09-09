import { DEFAULT_MODEL_ID } from "@/constants"
import * as dotenv from "dotenv"
import { z } from "zod"

// Load .env and .env.local files
dotenv.config()

if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: ".env.local", override: true })
}

/**
 * Load and validate environment variables.
 *
 * @returns Environment variables
 */
const loadEnv = () => {
  const result = z
    .object({
      // A string flag with a closed vocabulary. z.coerce.boolean would turn the
      // string "false" into true, and an unknown word must be an error, not false.
      EXTRACTOR_DEBUG: z
        .preprocess(
          value => (value === undefined ? "false" : String(value).toLowerCase()),
          z.enum(["1", "true", "yes", "0", "false", "no"])
        )
        .transform(value => ["1", "true", "yes"].includes(value)),
      EXTRACTOR_VENDOR: z.enum(["openai", "mistral", "anthropic", "google", "ollama"]).default("openai"),
      EXTRACTOR_MODEL: z.string().optional(),
      EXTRACTOR_API_KEY: z.string().optional()
    })
    .transform(data => {
      // Set default model if not set
      if (data.EXTRACTOR_VENDOR === "openai" && !data.EXTRACTOR_MODEL) {
        data.EXTRACTOR_MODEL = DEFAULT_MODEL_ID["openai" as const]
      }
      if (data.EXTRACTOR_VENDOR === "mistral" && !data.EXTRACTOR_MODEL) {
        data.EXTRACTOR_MODEL = DEFAULT_MODEL_ID["mistral" as const]
      }

      return data
    })
    .safeParse({
      EXTRACTOR_DEBUG: process.env.EXTRACTOR_DEBUG,
      EXTRACTOR_VENDOR: process.env.EXTRACTOR_VENDOR,
      EXTRACTOR_MODEL: process.env.EXTRACTOR_MODEL,
      EXTRACTOR_API_KEY: process.env.EXTRACTOR_API_KEY
    })

  if (!result.success) {
    throw new Error(`Environment variables validation error: ${result.error.message}`)
  }

  return result.data
}

/**
 * Environment variables.
 */
export const env = loadEnv()
