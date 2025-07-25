import { z } from "zod/v4"

export type CliOptions = z.infer<typeof CliOptions>
export const CliOptions = z.object({
  vendor: z.enum(["openai", "mistral", "anthropic", "google", "ollama"]).optional(),
  model: z.string("AI model is required").optional(),
  key: z.string("AI API Key is required.").optional(),
  pretty: z.boolean("Output pretty JSON").default(false)
})