import { vi } from "vitest";

export const getCurrentLLM = () => ({
  generate: vi.fn().mockResolvedValue({
    is_fake: false,
    confidence: 0,
    indicators: [],
  }),
});
