import Tesseract from 'tesseract.js';

export async function extractTextFromImage(imagePath: string): Promise<string> {
  const result = await Tesseract.recognize(imagePath, 'eng', {
    logger: m => console.log(`[OCR] ${m.status} - ${Math.round(m.progress * 100)}%`)
  });

  return result.data.text.trim();
}
