export type FileInput = {
  type: "file";
  path: string; // path to .pdf, .jpg, .png...
  mimeType?: string;
};

export type StructuredInput = {
  type: "structured";
  data: Record<string, any>; // ex: JSON from WellApp parser
};

export type DocumentInput = FileInput | StructuredInput;

export type DetectionResult = {
  is_fake: boolean;
  confidence: number;
  indicators: {
    category: string;
    value: string;
    description: string;
  }[];
};
