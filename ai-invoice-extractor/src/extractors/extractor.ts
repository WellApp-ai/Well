import { PROMPTS } from "@/constants"
import { logger } from "@/libs/logger"
import type { AiConfig, AnyString, MistralModelId, OpenAIModelId, GoogleModelId, AnthropicModelId, PromptId } from "@/types"
import { FileUtils } from "@/utils/file"
import { StringUtils } from "@/utils/string"
import { createMistral } from "@ai-sdk/mistral"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOllama } from 'ollama-ai-provider';
import { APICallError, type LanguageModelV1, NoObjectGeneratedError, generateObject } from "ai"
import type { z } from "zod"
import { BaseError, AIServiceError, ValidationError, ProcessingError } from '../../../shared/errors/base.js';
import { ErrorCode, ErrorContext } from '../../../shared/errors/types.js';

// ==============================
// Types
// ==============================

type AnalyseFilePathInput<O = z.ZodSchema> = {
  path: string
  prompt: PromptId | AnyString
  output: z.ZodType<O>
}

// ==============================
// Interfaces
// ==============================

export interface IExtractor {
  analyseFile<O>(props: AnalyseFilePathInput<O>): Promise<O>
}

// ==============================
// Abstract class
// ==============================

export abstract class BaseExtractor implements IExtractor {
  public constructor(protected readonly model: LanguageModelV1) { }

  // Public methods
  // ==============================

  async analyseFile<O>(input: AnalyseFilePathInput<O>): Promise<O> {
    const { path, prompt = "EXTRACT_INVOICE", output } = input;
    
    const context: ErrorContext = {
      operation: 'analyseFile',
      module: 'extractor',
      timestamp: new Date().toISOString(),
      metadata: { path, prompt, model: `${this.model.provider}:${this.model.modelId}` }
    };

    try {
      // Get file data
      const file = FileUtils.getMetadata(path);
      const buffer = await FileUtils.readFile(path);
      const fileUrl = new URL(`data:${file.mimeType};base64,${buffer.toString("base64")}`);

      if (file.fileType !== "image" && file.fileType !== "text" && file.fileType !== "file") {
        throw new ValidationError(
          `Unsupported file type: ${file.fileType}. Only image, text and PDF files are supported.`,
          context,
          `File: ${path}, Detected type: ${file.fileType}, MIME: ${file.mimeType}`
        );
      }

      logger.info(`Analyzing ${file.filename}…`);

    // Call LLM
    // ---------------------------
    try {
      const instructions = PROMPTS[prompt as PromptId] || prompt

      logger.debug(`Using instructions: \n${instructions}`)

      const content = [
        file.fileType === "image"
          ? {
            type: "image" as const,
            image: fileUrl,
            mimeType: file.mimeType
          }
          : file.fileType === "text"
            ? {
              type: "text" as const
            }
            : {
              type: "file" as const,
              data: fileUrl,
              mimeType: file.mimeType,
              filename: file.filename
            }
      ]

      logger.debug(
        `Using content: \n${JSON.stringify(
          content.map(c => ({
            type: c.type,
            mimeType: c.mimeType,
            filename: "filename" in c ? c.filename : undefined,
            image: "image" in c ? StringUtils.mask(c.image?.toString() ?? "", 50) : undefined,
            data: "data" in c ? StringUtils.mask(c.prompt?.toString() ?? "", 50) : undefined,
            prompt: buffer.toString() ? buffer.toString() : undefined
          }))
        )}\n`
      )

      if (file.fileType !== "text") {
        const { object } = await generateObject({
          model: this.model,
          schema: output,
          system: instructions,
          messages: [{ role: "user", content }]
        })
        return object
      } else {
        const { object } = await generateObject({
          model: this.model,
          schema: output,
          system: instructions,
          prompt: buffer.toString()
        })
        return object
      }

    } catch (error) {
      if (error instanceof BaseError) {
        throw error; // Re-throw our custom errors
      }
      
      if (APICallError.isInstance(error)) {
        throw new AIServiceError(
          this.model.provider,
          this.model.modelId,
          error.message,
          context
        );
      }

      if (NoObjectGeneratedError.isInstance(error)) {
        logger.debug(`[NoObjectGeneratedError] ${this.model.provider}:${this.model.modelId} returned: \n${error.text}`);
        logger.debug(`[NoObjectGeneratedError] ${this.model.provider}:${this.model.modelId} cause: \n${error.cause}`);
        
        throw new ProcessingError(
          'object generation',
          context,
          `LLM Response: ${error.text}, Cause: ${error.cause}`
        );
      }

      throw new ProcessingError(
        'file analysis',
        context,
        (error as Error).message
      );
    }
  }
}

// ==============================
// Implementations
// ==============================

export class MistralExtractor extends BaseExtractor {
  constructor(model: MistralModelId | AnyString, apiKey: string) {
    logger.debug(`Creating extractor mistral:${model} with apiKey: ${StringUtils.mask(apiKey)}`)
    const mistral = createMistral({ apiKey })
    super(mistral(model))
  }
}

export class AnthropicExtractor extends BaseExtractor {
  constructor(model: AnthropicModelId | AnyString, apiKey: string) {
    logger.debug(`Creating extractor anthropic:${model} with apiKey: ${StringUtils.mask(apiKey)}`)
    const anthropic = createAnthropic({ apiKey })
    super(anthropic(model))
  }
}

export class OpenAIExtractor extends BaseExtractor {
  constructor(model: OpenAIModelId | AnyString, apiKey: string) {
    logger.debug(`Creating extractor openai:${model} with apiKey: ${StringUtils.mask(apiKey)}`)
    const openai = createOpenAI({ apiKey })
    super(openai(model))
  }
}

export class GoogleExtractor extends BaseExtractor {
  constructor(model: GoogleModelId | AnyString, apiKey: string) {
    logger.debug(`Creating extractor google:${model} with apiKey: ${StringUtils.mask(apiKey)}`)
    const google = createGoogleGenerativeAI({ apiKey })
    super(google(model))
  }
}

export class OllamaExtractor extends BaseExtractor {
  constructor(model: AnyString, apiKey: string) {
    logger.debug(`Creating extractor ollama:${model} with apiKey: ${StringUtils.mask(apiKey)}`)
    const ollama = createOllama({ apiKey })
    super(ollama(model))
  }
}

// ==============================
// Factory (entry point)
// ==============================

export class Extractor {
  static create(config: AiConfig): IExtractor {
    switch (config.vendor) {
      case "openai":
        return new OpenAIExtractor(config.model, config.apiKey)
      case "mistral":
        return new MistralExtractor(config.model, config.apiKey)
      case "google":
        return new GoogleExtractor(config.model, config.apiKey)
      case "anthropic":
        return new AnthropicExtractor(config.model, config.apiKey)
      case "ollama":
        return new OllamaExtractor(config.model, config.apiKey)
      default:
        throw new Error(`Unsupported vendor: ${(config as AiConfig).vendor}`)
    }
  }
}
