import fs from 'fs/promises';
// pdfjs-dist 4 ships the legacy (Node-compatible) build as an ES module only.
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function extractTextAndMetadata(path: string): Promise<{
  extracted_text: string;
  metadata: { producer?: string; creator?: string; created?: string };
}> {
  const buffer = await fs.readFile(path);
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdfDocument = await loadingTask.promise;

  // 🔍 Extraction texte
  let fullText = '';
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => (item as any).str).join(' ');
    fullText += pageText + '\n';
  }

  // 📑 Extraction métadonnées (fallback bas niveau)
  const meta = await pdfDocument.getMetadata();
  const info = meta.info || {};

  return {
    extracted_text: fullText.trim(),
    metadata: info
  };
}
