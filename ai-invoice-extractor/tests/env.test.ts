import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { DEFAULT_MODEL_ID } from "../src/constants"

// We need to mock the env module since it loads immediately
const originalEnv = process.env

describe("Environment Variables", () => {
  beforeEach(() => {
    // Clear all extractor env vars
    delete process.env.EXTRACTOR_DEBUG
    delete process.env.EXTRACTOR_VENDOR
    delete process.env.EXTRACTOR_MODEL
    delete process.env.EXTRACTOR_API_KEY
  })

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv }
  })

  describe("EXTRACTOR_VENDOR", () => {
    it("should default to 'openai' when not set", async () => {
      // Dynamically import to get fresh env loading
      const modulePath = require.resolve("@/libs/env")
      delete require.cache[modulePath]
      const { env } = await import("@/libs/env")
      
      expect(env.EXTRACTOR_VENDOR).toBe("openai")
    })

    it("should use provided vendor", async () => {
      process.env.EXTRACTOR_VENDOR = "mistral"
      
      delete require.cache[require.resolve("@/libs/env")]
      const { env } = await import("@/libs/env")
      
      expect(env.EXTRACTOR_VENDOR).toBe("mistral")
    })

    const validVendors = ["openai", "mistral", "anthropic", "google", "ollama"]
    validVendors.forEach(vendor => {
      it(`should accept valid vendor: ${vendor}`, async () => {
        process.env.EXTRACTOR_VENDOR = vendor
        
        delete require.cache[require.resolve("@/libs/env")]
        const { env } = await import("@/libs/env")
        
        expect(env.EXTRACTOR_VENDOR).toBe(vendor)
      })
    })
  })

  describe("EXTRACTOR_MODEL", () => {
    it("should use default model for openai when not set", async () => {
      process.env.EXTRACTOR_VENDOR = "openai"
      
      delete require.cache[require.resolve("@/libs/env")]
      const { env } = await import("@/libs/env")
      
      expect(env.EXTRACTOR_MODEL).toBe(DEFAULT_MODEL_ID.openai)
    })

    it("should use default model for mistral when not set", async () => {
      process.env.EXTRACTOR_VENDOR = "mistral"
      
      delete require.cache[require.resolve("@/libs/env")]
      const { env } = await import("@/libs/env")
      
      expect(env.EXTRACTOR_MODEL).toBe(DEFAULT_MODEL_ID.mistral)
    })

    it("should use provided model when set", async () => {
      process.env.EXTRACTOR_VENDOR = "openai"
      process.env.EXTRACTOR_MODEL = "gpt-4o"
      
      delete require.cache[require.resolve("@/libs/env")]
      const { env } = await import("@/libs/env")
      
      expect(env.EXTRACTOR_MODEL).toBe("gpt-4o")
    })

    it("should not set default model for vendors other than openai/mistral", async () => {
      process.env.EXTRACTOR_VENDOR = "anthropic"
      
      delete require.cache[require.resolve("@/libs/env")]
      const { env } = await import("@/libs/env")
      
      // The transform only sets defaults for openai and mistral
      expect(env.EXTRACTOR_MODEL).toBeUndefined()
    })
  })

  describe("EXTRACTOR_API_KEY", () => {
    it("should be undefined when not set", async () => {
      delete require.cache[require.resolve("@/libs/env")]
      const { env } = await import("@/libs/env")
      
      expect(env.EXTRACTOR_API_KEY).toBeUndefined()
    })

    it("should use provided API key", async () => {
      process.env.EXTRACTOR_API_KEY = "test-api-key-123"
      
      delete require.cache[require.resolve("@/libs/env")]
      const { env } = await import("@/libs/env")
      
      expect(env.EXTRACTOR_API_KEY).toBe("test-api-key-123")
    })
  })

  describe("EXTRACTOR_DEBUG", () => {
    it("should default to false when not set", async () => {
      delete require.cache[require.resolve("@/libs/env")]
      const { env } = await import("@/libs/env")
      
      expect(env.EXTRACTOR_DEBUG).toBe(false)
    })

    it("should handle 'true' string", async () => {
      process.env.EXTRACTOR_DEBUG = "true"
      
      delete require.cache[require.resolve("@/libs/env")]
      const { env } = await import("@/libs/env")
      
      expect(env.EXTRACTOR_DEBUG).toBe(true)
    })

    it("should handle '1' as true", async () => {
      process.env.EXTRACTOR_DEBUG = "1"
      
      delete require.cache[require.resolve("@/libs/env")]
      const { env } = await import("@/libs/env")
      
      expect(env.EXTRACTOR_DEBUG).toBe(true)
    })

    it("should handle 'false' string", async () => {
      process.env.EXTRACTOR_DEBUG = "false"
      
      delete require.cache[require.resolve("@/libs/env")]
      const { env } = await import("@/libs/env")
      
      expect(env.EXTRACTOR_DEBUG).toBe(false)
    })

    it("should handle '0' as false", async () => {
      process.env.EXTRACTOR_DEBUG = "0"
      
      delete require.cache[require.resolve("@/libs/env")]
      const { env } = await import("@/libs/env")
      
      expect(env.EXTRACTOR_DEBUG).toBe(false)
    })
  })
})