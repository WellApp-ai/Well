import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function getFraudDetectionPrompt(documentText: string): Promise<string> {
  const promptPath = path.resolve(__dirname, '../prompts/fraud_detection_prompt.txt');
  const template = await fs.readFile(promptPath, 'utf-8');
  return template.replace('{{document}}', documentText);
}
