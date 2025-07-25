import { describe, it, expect } from "vitest"
import { CliOptions } from "@/schemas"

describe("CLI Options Validation", () => {
  describe("CliOptions schema", () => {
    it("should validate valid options", () => {
      const validOptions = {
        vendor: "openai" as const,
        model: "gpt-4o",
        key: "sk-123456",
        pretty: true
      }

      const result = CliOptions.safeParse(validOptions)
      expect(result.success).toBe(true)
      
      if (result.success) {
        expect(result.data.vendor).toBe("openai")
        expect(result.data.model).toBe("gpt-4o")
        expect(result.data.key).toBe("sk-123456")
        expect(result.data.pretty).toBe(true)
      }
    })

    it("should validate minimal options", () => {
      const minimalOptions = {}

      const result = CliOptions.safeParse(minimalOptions)
      expect(result.success).toBe(true)
      
      if (result.success) {
        expect(result.data.vendor).toBeUndefined()
        expect(result.data.model).toBeUndefined()
        expect(result.data.key).toBeUndefined()
        expect(result.data.pretty).toBe(false) // default value
      }
    })

    it("should reject invalid vendor", () => {
      const invalidOptions = {
        vendor: "invalid-vendor",
        key: "test-key"
      }

      const result = CliOptions.safeParse(invalidOptions)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1)
        expect(result.error.issues[0].path).toEqual(["vendor"])
        expect(result.error.issues[0].code).toBe("invalid_value")
      }
    })

    it("should accept all valid vendors", () => {
      const validVendors = ["openai", "mistral", "anthropic", "google", "ollama"]
      
      validVendors.forEach(vendor => {
        const options = { vendor }
        const result = CliOptions.safeParse(options)
        
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.vendor).toBe(vendor)
        }
      })
    })

    it("should handle string model names", () => {
      const options = {
        vendor: "openai" as const,
        model: "gpt-4-turbo-preview"
      }

      const result = CliOptions.safeParse(options)
      expect(result.success).toBe(true)
      
      if (result.success) {
        expect(result.data.model).toBe("gpt-4-turbo-preview")
      }
    })

    it("should handle API keys of various formats", () => {
      const apiKeyFormats = [
        "sk-123456789", // OpenAI format
        "sk-ant-123456", // Anthropic format  
        "AIzaSy123456", // Google format
        "simple-key", // Simple format
        "very-long-api-key-with-many-characters-and-numbers-123456789"
      ]

      apiKeyFormats.forEach(key => {
        const options = { key }
        const result = CliOptions.safeParse(options)
        
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.key).toBe(key)
        }
      })
    })

    it("should handle pretty flag variations", () => {
      const prettyValues = [true, false]
      
      prettyValues.forEach(pretty => {
        const options = { pretty }
        const result = CliOptions.safeParse(options)
        
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.pretty).toBe(pretty)
        }
      })
    })

    it("should reject non-boolean pretty values", () => {
      const invalidPrettyValues = ["true", "false", 1, 0, "yes", "no"]
      
      invalidPrettyValues.forEach(pretty => {
        const options = { pretty }
        const result = CliOptions.safeParse(options)
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.some(issue => 
            issue.path.includes("pretty")
          )).toBe(true)
        }
      })
    })

    it("should handle undefined values", () => {
      const options = {
        vendor: undefined,
        model: undefined,
        key: undefined,
        pretty: undefined
      }

      const result = CliOptions.safeParse(options)
      expect(result.success).toBe(true)
      
      if (result.success) {
        expect(result.data.vendor).toBeUndefined()
        expect(result.data.model).toBeUndefined()
        expect(result.data.key).toBeUndefined()
        expect(result.data.pretty).toBe(false) // default
      }
    })

    it("should handle null values", () => {
      const options = {
        vendor: null,
        model: null,
        key: null,
        pretty: null
      }

      const result = CliOptions.safeParse(options)
      expect(result.success).toBe(false) // null should be rejected
    })

    it("should handle empty strings", () => {
      const options = {
        vendor: "",
        model: "",
        key: ""
      }

      const result = CliOptions.safeParse(options)
      expect(result.success).toBe(false) // empty vendor should be rejected
    })

    it("should handle extra properties", () => {
      const options = {
        vendor: "openai" as const,
        extraProperty: "should-be-ignored"
      }

      const result = CliOptions.safeParse(options)
      expect(result.success).toBe(true)
      
      if (result.success) {
        expect(result.data.vendor).toBe("openai")
        expect((result.data as any).extraProperty).toBeUndefined()
      }
    })
  })
})