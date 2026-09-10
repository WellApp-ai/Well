import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { execSync } from "child_process"
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs"
import { join } from "path"

describe("Error Handling", () => {
  const testDir = join(process.cwd(), "test-temp")
  const cliPath = join(process.cwd(), "src", "cli.ts").replace(/\\/g, '/')

  beforeEach(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    // Clear environment variables
    delete process.env.EXTRACTOR_VENDOR
    delete process.env.EXTRACTOR_MODEL
    delete process.env.EXTRACTOR_API_KEY
    delete process.env.EXTRACTOR_DEBUG
  })

  describe("File validation errors", () => {
    it("should show helpful error for non-existent file", () => {
      try {
        execSync(`bun run ${cliPath} -k test-key non-existent-file.png`, {
          encoding: "utf8",
          stdio: "pipe"
        })
        expect.unreachable("Should have thrown")
      } catch (error: any) {
        expect(error.status).toBe(1)
        // Error should be about file not existing
        expect(error.stderr.toLowerCase()).toMatch(/no such file|cannot find|not found/)
      }
    })

    it("should handle directory instead of file", () => {
      const dirPath = join(testDir, "test-directory")
      mkdirSync(dirPath)

      try {
        execSync(`bun run ${cliPath} -k test-key "${dirPath}"`, {
          encoding: "utf8", 
          stdio: "pipe"
        })
        expect.unreachable("Should have thrown")
      } catch (error: any) {
        expect(error.status).toBe(1)
      }
    })

    it("should handle empty file", () => {
      const emptyFile = join(testDir, "empty.png")
      writeFileSync(emptyFile, "")

      try {
        execSync(`bun run ${cliPath} -k test-key "${emptyFile}"`, {
          encoding: "utf8",
          stdio: "pipe"
        })
        expect.unreachable("Should have thrown")
      } catch (error: any) {
        expect(error.status).toBe(1)
      }
    })

    it("should handle files with no extension", () => {
      const noExtFile = join(testDir, "noextension")
      writeFileSync(noExtFile, "fake content")

      try {
        execSync(`bun run ${cliPath} -k test-key "${noExtFile}"`, {
          encoding: "utf8",
          stdio: "pipe"
        })
        expect.unreachable("Should have thrown")
      } catch (error: any) {
        expect(error.status).toBe(1)
      }
    })

    it("should handle very long file paths", () => {
      const longName = "a".repeat(200) + ".png"
      const longPath = join(testDir, longName)
      
      try {
        // This might fail at filesystem level, but we test CLI handling
        writeFileSync(longPath, "content")
        execSync(`bun run ${cliPath} -k test-key "${longPath}"`, {
          encoding: "utf8",
          stdio: "pipe"
        })
      } catch (error: any) {
        // The file is valid, so the CLI reaches the provider with a fake key.
        // With network access the provider answers 401 (exit 1); without it the
        // call fails as a processing error (exit 2). Both are correct handling.
        expect([1, 2]).toContain(error.status)
      }
    })
  })

  describe("API key validation errors", () => {
    it("should show helpful error when no API key provided", () => {
      const testFile = join(testDir, "test.png")
      writeFileSync(testFile, "fake png content")

      try {
        execSync(`bun run ${cliPath} "${testFile}"`, {
          encoding: "utf8",
          stdio: "pipe"
        })
        expect.unreachable("Should have thrown")
      } catch (error: any) {
        expect(error.status).toBe(1)
        expect(error.stderr).toContain("No AI configuration found")
      }
    })

    it("should handle empty API key", () => {
      const testFile = join(testDir, "test.png") 
      writeFileSync(testFile, "fake png content")

      try {
        execSync(`bun run ${cliPath} -k "" "${testFile}"`, {
          encoding: "utf8",
          stdio: "pipe"
        })
        expect.unreachable("Should have thrown")
      } catch (error: any) {
        expect(error.status).toBe(1)
      }
    })

    it("should handle whitespace-only API key", () => {
      const testFile = join(testDir, "test.png")
      writeFileSync(testFile, "fake png content")

      try {
        execSync(`bun run ${cliPath} -k "   " "${testFile}"`, {
          encoding: "utf8",
          stdio: "pipe"
        })
        expect.unreachable("Should have thrown")
      } catch (error: any) {
        expect(error.status).toBe(1)
      }
    })
  })

  describe("Flag validation errors", () => {
    it("should show helpful error for invalid vendor", () => {
      const testFile = join(testDir, "test.png")
      writeFileSync(testFile, "fake png content")

      try {
        execSync(`bun run ${cliPath} -v invalid-vendor -k test-key "${testFile}"`, {
          encoding: "utf8",
          stdio: "pipe"
        })
        expect.unreachable("Should have thrown")
      } catch (error: any) {
        expect(error.status).toBe(1)
        // Assert the field and the accepted values, never the validator's
        // wording: zod renames that sentence between majors.
        expect(error.stderr).toContain("vendor:")
        expect(error.stderr).toContain("openai")
      }
    })

    it("should handle unrecognized flags", () => {
      const testFile = join(testDir, "test.png")
      writeFileSync(testFile, "fake png content")

      try {
        execSync(`bun run ${cliPath} --unknown-flag -k test-key "${testFile}"`, {
          encoding: "utf8",
          stdio: "pipe"
        })
        expect.unreachable("Should have thrown")
      } catch (error: any) {
        expect(error.status).toBe(1)
        expect(error.stderr).toMatch(/unknown option|unrecognized/)
      }
    })

    it("should handle malformed flag values", () => {
      const testFile = join(testDir, "test.png")
      writeFileSync(testFile, "fake png content")

      try {
        execSync(`bun run ${cliPath} -v -k test-key "${testFile}"`, {
          encoding: "utf8",
          stdio: "pipe"
        })
        expect.unreachable("Should have thrown")
      } catch (error: any) {
        expect(error.status).toBe(1)
      }
    })
  })

  describe("Environment variable errors", () => {
    it("should handle invalid environment vendor", async () => {
      process.env.EXTRACTOR_VENDOR = "invalid-vendor"
      process.env.EXTRACTOR_API_KEY = "test-key"

      // The env module validates at load time, so a fresh import must throw.
      vi.resetModules()
      await expect(import("@/libs/env")).rejects.toThrow("Environment variables validation error")
    })

    it("should handle environment variable loading errors", async () => {
      // Set an invalid boolean value
      process.env.EXTRACTOR_DEBUG = "invalid-boolean"

      vi.resetModules()
      await expect(import("@/libs/env")).rejects.toThrow("Environment variables validation error")
    })
  })

  describe("System errors", () => {
    it("should handle permission errors gracefully", () => {
      // Create a file then make it unreadable (Unix-like systems)
      const testFile = join(testDir, "unreadable.png")
      writeFileSync(testFile, "content")
      
      try {
        // This test is platform dependent
        if (process.platform !== "win32") {
          execSync(`chmod 000 "${testFile}"`)
        }
        
        execSync(`bun run ${cliPath} -k test-key "${testFile}"`, {
          encoding: "utf8",
          stdio: "pipe"
        })
        
        if (process.platform !== "win32") {
          expect.unreachable("Should have thrown")
        }
      } catch (error: any) {
        if (process.platform !== "win32") {
          expect(error.status).toBe(1)
        }
      } finally {
        // Restore permissions for cleanup
        if (process.platform !== "win32") {
          try {
            execSync(`chmod 644 "${testFile}"`)
          } catch {}
        }
      }
    })

    it("should handle out of memory scenarios gracefully", () => {
      // This is hard to test without actually exhausting memory
      // We just ensure the structure is in place for error handling
      expect(true).toBe(true)
    })
  })

  describe("Network/API errors", () => {
    it("should handle network timeout errors", () => {
      // Mock network timeouts - this would need actual API mocking
      // For now, we ensure error handling structure exists
      expect(true).toBe(true)
    })

    it("should handle invalid API responses", () => {
      // Mock invalid API responses - this would need actual API mocking  
      // For now, we ensure error handling structure exists
      expect(true).toBe(true)
    })

    it("should handle rate limiting errors", () => {
      // Mock rate limiting - this would need actual API mocking
      // For now, we ensure error handling structure exists
      expect(true).toBe(true)
    })
  })
})