import type { LLMOptions, LLMBackend } from '@fraud-detector/models';
import { callOpenAI } from '@fraud-detector/models';

let currentLLM: LLMBackend | null = null;

export function useLLMBackend(type: 'openai' | 'anthropic' | 'mistral' | 'custom', options: LLMOptions): void {
  if (type === 'openai') {
    if (!options.apiKey) throw new Error('Missing OpenAI API key');

    currentLLM = callOpenAI
  } else {
    throw new Error(`${type} backend not implemented yet`);
  }
}

export function getCurrentLLM(): LLMBackend {
  if (!currentLLM) {
    throw new Error('No LLM backend configured. Call useLLMBackend() first.');
  }
  return currentLLM;
}
