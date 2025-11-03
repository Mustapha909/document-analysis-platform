export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  summary: string | null;
  sentiment: { label: string; score: number } | null;
  entities: { type: string; value: string }[] | null;
}
