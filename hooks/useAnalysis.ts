import { useState, useCallback } from 'react';

interface AnalysisProgress {
  message: string;
  progress: number;
}

interface AnalysisResult {
  summary?: string;
  sentiment?: { label: string; score: number };
  entities?: { type: string; value: string }[];
}

interface AnalysisState {
  isAnalyzing: boolean;
  progress: AnalysisProgress;
  result: AnalysisResult;
  error: string | null;
  isQueued: boolean;
  queuePosition: number | null;
}

export function useAnalysis(documentId: string, onComplete: () => void) {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: { message: '', progress: 0 },
    result: {},
    error: null,
    isQueued: false,
    queuePosition: null,
  });

  const startAnalysis = useCallback(async () => {
    setState({
      isAnalyzing: true,
      progress: { message: 'Starting...', progress: 0 },
      result: {},
      error: null,
      isQueued: false,
      queuePosition: null,
    });

    try {
      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });

      const contentType = response.headers.get('content-type');

      // Check if queued (JSON response)
      if (contentType?.includes('application/json')) {
        const data = await response.json();

        if (data.error) {
          setState((prev) => ({
            ...prev,
            isAnalyzing: false,
            error: data.error,
          }));
          return;
        }

        if (data.queued) {
          setState((prev) => ({
            ...prev,
            isQueued: true,
            queuePosition: data.position,
            progress: {
              message: data.message || `Queued at position ${data.position}`,
              progress: 0,
            },
          }));

          // Show queue message but don't poll - user should manually retry
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              isAnalyzing: false,
            }));
          }, 3000);
          return;
        }
      }

      // If SSE stream
      if (contentType?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No reader available');

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              handleSSEEvent(data);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setState((prev) => ({
        ...prev,
        isAnalyzing: false,
        error: error.message || 'Analysis failed',
      }));
    }
  }, [documentId]);

  const handleSSEEvent = (event: any) => {
    const { type, data } = event;

    switch (type) {
      case 'progress':
        setState((prev) => ({
          ...prev,
          progress: data,
        }));
        break;

      case 'summary':
        setState((prev) => ({
          ...prev,
          result: { ...prev.result, summary: data.summary },
        }));
        break;

      case 'sentiment':
        setState((prev) => ({
          ...prev,
          result: { ...prev.result, sentiment: data.sentiment },
        }));
        break;

      case 'entities':
        setState((prev) => ({
          ...prev,
          result: { ...prev.result, entities: data.entities },
        }));
        break;

      case 'complete':
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          progress: { message: 'Complete!', progress: 100 },
        }));
        onComplete();
        break;

      case 'error':
        console.error('Analysis error:', data);
        setState((prev) => ({
          ...prev,
          error: data.message || 'An error occurred',
        }));
        break;
    }
  };

  const cancelAnalysis = useCallback(() => {
    setState({
      isAnalyzing: false,
      progress: { message: '', progress: 0 },
      result: {},
      error: null,
      isQueued: false,
      queuePosition: null,
    });
  }, []);

  return {
    ...state,
    startAnalysis,
    cancelAnalysis,
  };
}
