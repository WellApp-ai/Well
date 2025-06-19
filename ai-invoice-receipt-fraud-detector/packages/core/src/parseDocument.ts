import type { DocumentInput } from './types';
import fs from 'fs/promises';
import { extractTextAndMetadata } from './llm/parsePDF.js';
import pdfParse from 'pdf-parse';
import { extractTextFromImage } from './llm/ExtractTextFromImage.js';

export async function parseDocument(input: DocumentInput): Promise<Record<string, any>> {
  if (input.type === 'structured') {
    return input.data;
  }

  const ext = input.path.split('.').pop();
  if (!ext) throw new Error('Extension de fichier introuvable');

  const lowerExt = ext.toLowerCase();

  if (lowerExt === 'pdf') {
    console.log('📥 Lecture du fichier PDF :', input.path);
    const { extracted_text, metadata } = await extractTextAndMetadata(input.path);
  return { extracted_text, metadata };
  }
  if (['png', 'jpg', 'jpeg'].includes(ext)) {
    const extracted_text = await extractTextFromImage(input.path);
    return { extracted_text };
  }
  

  throw new Error(`Type de fichier non supporté : ${lowerExt}`);
}