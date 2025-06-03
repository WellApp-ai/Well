import z from "zod/v4"
import { MISTRAL_MODEL_ID, OPENAI_MODEL_ID, GOOGLE_MODEL_ID, ANTHROPIC_MODEL_ID, PROMPT_ID } from "./constants"

// ==============================
// Global types
// ==============================

export type PromptId = z.infer<typeof PromptId>
export const PromptId = z.enum(PROMPT_ID)

export type MistralModelId = z.infer<typeof MistralModelId>
export const MistralModelId = z.enum(MISTRAL_MODEL_ID)

export type OpenAIModelId = z.infer<typeof OpenAiModelId>
export const OpenAiModelId = z.enum(OPENAI_MODEL_ID)

export type AnthropicModelId = z.infer<typeof AnthropicModelId>
export const AnthropicModelId = z.enum(ANTHROPIC_MODEL_ID)

export type GoogleModelId = z.infer<typeof GoogleModelId>
export const GoogleModelId = z.enum(GOOGLE_MODEL_ID)

export type ModelId = MistralModelId | OpenAIModelId | GoogleModelId

export const MistralVendor = z.literal("mistral")
export const OpenAiVendor = z.literal("openai")
export const GoogleVendor = z.literal("google")

export type AiVendor = z.infer<typeof AiVendor>
export const AiVendor = z.union([MistralVendor, OpenAiVendor, GoogleVendor])

export type AiConfig = z.infer<typeof AiConfig>
export const AiConfig = z.discriminatedUnion("vendor", [
  z.object({
    vendor: z.literal("openai"),
    model: OpenAiModelId,
    apiKey: z.string().min(1)
  }),
  z.object({
    vendor: z.literal("mistral"),
    model: MistralModelId,
    apiKey: z.string().min(1)
  }),
  z.object({
    vendor: z.literal("google"),
    model: GoogleModelId,
    apiKey: z.string().min(1)
  }),
  z.object({
    vendor: z.literal("anthropic"),
    model: AnthropicModelId,
    apiKey: z.string().min(1)
  }),
  z.object({
    vendor: z.literal("ollama"),
    model: z.string().min(1),
    apiKey: z.string().min(1)
  })
])

// ==============================
// Utils types
// ==============================

export type AnyString = string & {}

export type AsyncIterableStream<T> = AsyncIterable<T> & ReadableStream<T>
