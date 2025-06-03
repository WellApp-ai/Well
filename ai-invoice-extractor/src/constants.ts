import { extractInvoicePrompt } from "./prompts/extract-invoice.prompt"
import type { AiVendor, ModelId, PromptId } from "./types"

// ==============================
// Prompts
// ==============================

export const PROMPT_ID = ["EXTRACT_INVOICE"] as const

export const PROMPTS: Record<PromptId, string> = {
  EXTRACT_INVOICE: extractInvoicePrompt
  // other built-in prompts live here
}

// ==============================
// Model IDs
// ==============================

export const DEFAULT_MODEL_ID: Record<AiVendor, ModelId> = {
  openai: "o4-mini",
  mistral: "mistral-small-latest",
  google: "gemini-1.5-flash",
  anthropic: "claude-3-5-sonnet-20241022",
  ollama: "llama3.2"
} as const

export const MISTRAL_MODEL_ID = [
  // "ministral-3b-latest", // no vision capability
  // "ministral-8b-latest", // no vision capability
  // "mistral-large-latest", // no vision capability
  "mistral-small-latest", // error "No object generated"
  "pixtral-large-latest", // error "No object generated"
  "pixtral-12b-2409" // error "No object generated"
  // "open-mistral-7b", // no vision capability
  // "open-mixtral-8x7b", // no vision capability
  // "open-mixtral-8x22b" // no vision capability
] as const

export const GOOGLE_MODEL_ID = [
  "gemini-2.0-flash-exp",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b-latest",
  "gemini-1.5-flash-8b"
] as const

export const ANTHROPIC_MODEL_ID = [
  "claude-4-opus-20250514",
  "claude-4-sonnet-20250514",
  "claude-3-7-sonnet-20250219",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-sonnet-20240620",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307"
] as const

export const OPENAI_MODEL_ID = [
  "o4-mini",
  "o4-mini-2025-04-16",
  "gpt-4.1",
  "gpt-4.1-2025-04-14",
  "gpt-4.1-mini",
  "gpt-4.1-mini-2025-04-14",
  "gpt-4.1-nano",
  "gpt-4.1-nano-2025-04-14",
  "gpt-4o",
  "gpt-4o-2024-05-13",
  "gpt-4o-2024-08-06",
  "gpt-4o-2024-11-20",
  "gpt-4o-audio-preview",
  "gpt-4o-audio-preview-2024-10-01",
  "gpt-4o-audio-preview-2024-12-17",
  "gpt-4o-search-preview",
  "gpt-4o-search-preview-2025-03-11",
  "gpt-4o-mini-search-preview",
  "gpt-4o-mini-search-preview-2025-03-11",
  "gpt-4o-mini",
  "gpt-4o-mini-2024-07-18",
  "gpt-4-turbo",
  "gpt-4-turbo-2024-04-09",
  "gpt-4-turbo-preview",
  "gpt-4-0125-preview",
  "gpt-4-1106-preview",
  "gpt-4",
  "gpt-4-0613",
  "gpt-4.5-preview",
  "gpt-4.5-preview-2025-02-27",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-1106",
  "chatgpt-4o-latest"
] as const
