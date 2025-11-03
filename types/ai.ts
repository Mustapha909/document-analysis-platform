export interface SummaryResult {
  summary_text: string;
}

export interface SentimentResult {
  label: 'POSITIVE' | 'NEGATIVE';
  score: number;
}

export interface EntityResult {
  entity_group: string; // "PER", "ORG", "LOC", etc.
  word: string;
  score: number;
}

export interface AnalysisProgress {
  type:
    | 'progress'
    | 'summary'
    | 'sentiment'
    | 'entities'
    | 'complete'
    | 'error';
  data?: any;
  message?: string;
  progress?: number;
}
