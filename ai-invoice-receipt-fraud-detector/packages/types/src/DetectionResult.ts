export type IndicatorCategory =
  | 'visual'
  | 'textual'
  | 'metadata'
  | 'behavioral'
  | 'ai_generated';

export interface DetectionIndicator {
  category: IndicatorCategory;
  value: string;
  description: string;
}

export interface DetectionResult {
  is_fake: boolean;
  confidence: number; 
  indicators: DetectionIndicator[];
}
