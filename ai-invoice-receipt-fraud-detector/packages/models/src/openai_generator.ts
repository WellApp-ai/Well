import OpenAI from 'openai';
import type { DetectionResult } from '@fraud-detector/types';
import type { LLMBackend } from './base';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chargement du fichier .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const callOpenAI: LLMBackend = {
  name: 'openai',
  generate: async (prompt: string): Promise<DetectionResult> => {
    const chat = await openai.chat.completions.create({
      model: 'gpt-5.6-sol',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = chat.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    try {
      return JSON.parse(content);
    } catch (err) {
      console.error('❌ Failed to parse LLM output:', content);
      throw new Error('Invalid JSON returned by LLM');
    }
  },
};
