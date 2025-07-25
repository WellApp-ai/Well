import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { ConfigUtils } from "../src/utils/config"
import { DEFAULT_MODEL_ID } from "../src/constants"
import type { AiConfig } from "../src/types"

describe("ConfigUtils", () => {
  describe("mergeAiConfig", () => {
    it("should use CLI config when provided", () => {
      const cliAiConfig: Partial<AiConfig> = {
        vendor: "openai",
        model: "gpt-4o",
        apiKey: "cli-key"
      }
      
      const envAiConfig: AiConfig = {
        vendor: "mistral",
        model: "mistral-small-latest",
        apiKey: "env-key"
      }

      const result = ConfigUtils.mergeAiConfig({ cliAiConfig, envAiConfig })

      expect(result.vendor).toBe("openai")
      expect(result.model).toBe("gpt-4o")
      expect(result.apiKey).toBe("cli-key")
    })

    it("should fall back to environment config when CLI not provided", () => {
      const cliAiConfig: Partial<AiConfig> = {}
      
      const envAiConfig: AiConfig = {
        vendor: "mistral",
        model: "mistral-small-latest",
        apiKey: "env-key"
      }

      const result = ConfigUtils.mergeAiConfig({ cliAiConfig, envAiConfig })

      expect(result.vendor).toBe("mistral")
      expect(result.model).toBe("mistral-small-latest")
      expect(result.apiKey).toBe("env-key")
    })

    it("should use default model when CLI vendor provided but no model", () => {
      const cliAiConfig: Partial<AiConfig> = {
        vendor: "anthropic",
        apiKey: "cli-key"
      }
      
      const envAiConfig: AiConfig = {
        vendor: "openai",
        model: "o4-mini",
        apiKey: "env-key"
      }

      const result = ConfigUtils.mergeAiConfig({ cliAiConfig, envAiConfig })

      expect(result.vendor).toBe("anthropic")
      expect(result.model).toBe(DEFAULT_MODEL_ID.anthropic)
      expect(result.apiKey).toBe("cli-key")
    })

    it("should handle partial CLI override (vendor only)", () => {
      const cliAiConfig: Partial<AiConfig> = {
        vendor: "google"
      }
      
      const envAiConfig: AiConfig = {
        vendor: "openai",
        model: "o4-mini",
        apiKey: "env-key"
      }

      const result = ConfigUtils.mergeAiConfig({ cliAiConfig, envAiConfig })

      expect(result.vendor).toBe("google")
      expect(result.model).toBe(DEFAULT_MODEL_ID.google)
      expect(result.apiKey).toBe("env-key")
    })

    it("should handle partial CLI override (API key only)", () => {
      const cliAiConfig: Partial<AiConfig> = {
        apiKey: "cli-key"
      }
      
      const envAiConfig: AiConfig = {
        vendor: "mistral",
        model: "mistral-small-latest",
        apiKey: "env-key"
      }

      const result = ConfigUtils.mergeAiConfig({ cliAiConfig, envAiConfig })

      expect(result.vendor).toBe("mistral")
      expect(result.model).toBe("mistral-small-latest")
      expect(result.apiKey).toBe("cli-key")
    })

    it("should use default models for all vendors", () => {
      const vendors: Array<keyof typeof DEFAULT_MODEL_ID> = ["openai", "mistral", "anthropic", "google", "ollama"]
      
      vendors.forEach(vendor => {
        const cliAiConfig: Partial<AiConfig> = {
          vendor: vendor as any,
          apiKey: "test-key"
        }
        
        const envAiConfig: AiConfig = {
          vendor: "openai",
          model: "o4-mini",
          apiKey: "env-key"
        }

        const result = ConfigUtils.mergeAiConfig({ cliAiConfig, envAiConfig })

        expect(result.vendor).toBe(vendor)
        expect(result.model).toBe(DEFAULT_MODEL_ID[vendor])
        expect(result.apiKey).toBe("test-key")
      })
    })

    it("should preserve CLI model when both vendor and model provided", () => {
      const cliAiConfig: Partial<AiConfig> = {
        vendor: "openai",
        model: "gpt-4-turbo"
      }
      
      const envAiConfig: AiConfig = {
        vendor: "mistral",
        model: "mistral-small-latest",
        apiKey: "env-key"
      }

      const result = ConfigUtils.mergeAiConfig({ cliAiConfig, envAiConfig })

      expect(result.vendor).toBe("openai")
      expect(result.model).toBe("gpt-4-turbo")
      expect(result.apiKey).toBe("env-key")
    })

    it("should handle empty CLI config", () => {
      const cliAiConfig: Partial<AiConfig> = {}
      
      const envAiConfig: AiConfig = {
        vendor: "ollama",
        model: "llama3.2",
        apiKey: undefined as any
      }

      const result = ConfigUtils.mergeAiConfig({ cliAiConfig, envAiConfig })

      expect(result.vendor).toBe("ollama")
      expect(result.model).toBe("llama3.2")
      expect(result.apiKey).toBeUndefined()
    })
  })
})