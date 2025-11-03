import { SummaryResult, SentimentResult, EntityResult } from '@/types/ai';

const HF_API_URL = 'https://router.huggingface.co/hf-inference/models';
const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

// Toggle between mock and real API
const USE_MOCK = false; // Set to false to try real API

if (!HF_TOKEN && !USE_MOCK) {
  console.warn(
    'Warning: HUGGINGFACE_API_TOKEN not found in environment variables'
  );
}

// Mock responses
const MOCK_RESPONSES = {
  summary: (text: string) => {
    if (text.length < 200) {
      return 'This is a brief document containing basic information.';
    } else if (text.length < 500) {
      return 'This document provides a moderate amount of information on the discussed topic, covering key points and essential details.';
    } else {
      return 'This comprehensive document explores various aspects of artificial intelligence, machine learning, and their applications across multiple industries.';
    }
  },

  sentiment: (text: string) => {
    const positiveWords = [
      'good',
      'great',
      'excellent',
      'amazing',
      'wonderful',
    ];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'failed'];
    const lower = text.toLowerCase();
    const pos = positiveWords.filter((w) => lower.includes(w)).length;
    const neg = negativeWords.filter((w) => lower.includes(w)).length;

    if (pos > neg) return { label: 'POSITIVE', score: 0.9 };
    if (neg > pos) return { label: 'NEGATIVE', score: 0.85 };
    return { label: 'NEUTRAL', score: 0.7 };
  },

  entities: (text: string) => {
    const words = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    return words.slice(0, 10).map((w) => ({ type: 'MISC', value: w }));
  },
};

// Generic function to call Hugging Face API once
async function callHuggingFaceAPI<T>(
  modelId: string,
  inputs: string,
  timeout: number = 60000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${HF_API_URL}/${modelId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const err = await response.json();
        message = err.error || message;
      } catch {}
      throw new Error(message);
    }

    const data = await response.json();
    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error('Request timeout');
    throw new Error(error.message || 'Network request failed');
  }
}

// Summarization
export async function generateSummary(text: string): Promise<string> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000));
    return MOCK_RESPONSES.summary(text);
  }

  try {
    const response = await callHuggingFaceAPI<SummaryResult[]>(
      'facebook/bart-large-cnn',
      text
    );
    return response[0].summary_text;
  } catch (error: any) {
    console.error('Summary error:', error);
    throw new Error(error.message || 'Failed to generate summary');
  }
}

// Sentiment
export async function analyzeSentiment(
  text: string
): Promise<{ label: string; score: number }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000));
    return MOCK_RESPONSES.sentiment(text);
  }

  try {
    const response = await callHuggingFaceAPI<SentimentResult[][]>(
      'cardiffnlp/twitter-roberta-base-sentiment-latest',
      text
    );

    const sentiment = response[0][0];
    return {
      label: sentiment.label,
      score: Math.round(sentiment.score * 100) / 100,
    };
  } catch (error: any) {
    console.error('Sentiment error:', error);
    throw new Error(error.message || 'Failed to analyze sentiment');
  }
}

// Entity extraction
export async function extractEntities(
  text: string
): Promise<{ type: string; value: string }[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000));
    return MOCK_RESPONSES.entities(text);
  }

  try {
    const response = await callHuggingFaceAPI<EntityResult[]>(
      'dslim/bert-base-NER',
      text
    );

    const entities = response
      .filter((e) => e.score > 0.9)
      .map((e) => ({ type: e.entity_group, value: e.word }));

    const unique = Array.from(
      new Map(entities.map((e) => [e.value, e])).values()
    );
    return unique;
  } catch (error: any) {
    console.error('Entity extraction error:', error);
    throw new Error(error.message || 'Failed to extract entities');
  }
}

// Connection test
export async function testHuggingFaceConnection(): Promise<boolean> {
  if (USE_MOCK) return true;
  try {
    await callHuggingFaceAPI<any>(
      'distilbert-base-uncased-finetuned-sst-2-english',
      'test'
    );
    return true;
  } catch {
    return false;
  }
}
