import type { DetectionResult } from '@fraud-detector/types';

export interface LLMBackend {
  name: string; // e.g. 'openai', 'mistral'
  generate: (prompt: string) => Promise<DetectionResult>;
}

export interface LLMOptions {
  provider: 'openai';
  apiKey: string;
}
