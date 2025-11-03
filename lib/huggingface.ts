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

// Mock responses with realistic data
const MOCK_RESPONSES = {
  summary: (text: string) => {
    // Generate different summaries based on content length
    if (text.length < 200) {
      return 'This is a brief document containing basic information.';
    } else if (text.length < 500) {
      return 'This document provides a moderate amount of information on the discussed topic, covering key points and essential details.';
    } else {
      return 'This comprehensive document explores various aspects of artificial intelligence, machine learning, and their applications across multiple industries including technology, healthcare, and finance. It discusses recent advances, current implementations, and future potential of AI systems.';
    }
  },

  sentiment: (text: string) => {
    // Simple sentiment detection based on keywords
    const positiveWords = [
      'good',
      'great',
      'excellent',
      'amazing',
      'wonderful',
      'revolutionary',
      'advanced',
      'successful',
    ];
    const negativeWords = [
      'bad',
      'poor',
      'terrible',
      'awful',
      'failed',
      'problem',
      'issue',
      'challenge',
    ];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter((word) =>
      lowerText.includes(word)
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      lowerText.includes(word)
    ).length;

    if (positiveCount > negativeCount) {
      return { label: 'POSITIVE', score: 0.85 + Math.random() * 0.14 };
    } else if (negativeCount > positiveCount) {
      return { label: 'NEGATIVE', score: 0.75 + Math.random() * 0.24 };
    } else {
      return { label: 'POSITIVE', score: 0.55 + Math.random() * 0.2 };
    }
  },

  entities: (text: string) => {
    // Extract capitalized words as potential entities
    const words = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    const entities: { type: string; value: string }[] = [];

    // Common organization names
    const orgs = [
      'Google',
      'Microsoft',
      'Apple',
      'Amazon',
      'OpenAI',
      'Tesla',
      'Meta',
      'Netflix',
      'IBM',
      'Oracle',
    ];
    // Common locations
    const locs = [
      'Stanford',
      'MIT',
      'Cambridge',
      'Oxford',
      'Berkeley',
      'Harvard',
      'Princeton',
      'Yale',
    ];
    // Common person names
    const people = [
      'John',
      'Smith',
      'Jane',
      'Doe',
      'Alice',
      'Bob',
      'Charlie',
      'David',
    ];

    words.forEach((word) => {
      if (orgs.some((org) => word.includes(org))) {
        entities.push({ type: 'ORG', value: word });
      } else if (locs.some((loc) => word.includes(loc))) {
        entities.push({ type: 'LOC', value: word });
      } else if (people.some((person) => word.includes(person))) {
        entities.push({ type: 'PER', value: word });
      } else if (Math.random() > 0.7) {
        // Randomly classify some as entities for demo
        const types = ['ORG', 'LOC', 'PER'];
        entities.push({
          type: types[Math.floor(Math.random() * types.length)],
          value: word,
        });
      }
    });

    // Remove duplicates
    const unique = Array.from(
      new Map(entities.map((e) => [e.value, e])).values()
    );

    return unique.slice(0, 10); // Limit to 10 entities
  },
};

interface HFError {
  error: string;
  estimated_time?: number;
}

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on certain errors
      if (
        error.status === 400 ||
        error.status === 401 ||
        error.status === 403
      ) {
        throw error;
      }

      // If it's the last retry, throw
      if (i === maxRetries - 1) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Generic function to call Hugging Face API
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

    // Check if response is ok FIRST
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;

      // Clone the response so we can read it multiple times if needed
      const responseClone = response.clone();

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;

        // Handle specific status codes
        if (response.status === 503) {
          const estimatedTime = errorData.estimated_time || 20;
          throw {
            status: 503,
            message: `Model is loading, please wait ~${estimatedTime} seconds`,
            estimatedTime,
          };
        }
        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }
        if (response.status === 401) {
          throw { status: 401, message: 'Invalid API token' };
        }
      } catch (jsonError) {
        // If JSON parsing fails, try text from the clone
        try {
          const errorText = await responseClone.text();
          errorMessage = errorText || errorMessage;
        } catch {
          // Use the generic error message
        }
      }

      throw { status: response.status, message: errorMessage };
    }

    // Response is OK, parse the data
    const data = await response.json();
    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle timeout
    if (error.name === 'AbortError') {
      throw { status: 408, message: 'Request timeout' };
    }

    throw error;
  }
}

// Summarization
export async function generateSummary(text: string): Promise<string> {
  if (USE_MOCK) {
    console.log('Using mock summary generation');
    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 1000)
    );
    return MOCK_RESPONSES.summary(text);
  }

  try {
    const result = await retryWithBackoff(async () => {
      const response = await callHuggingFaceAPI<SummaryResult[]>(
        'facebook/bart-large-cnn',
        text
      );
      return response[0].summary_text;
    });

    return result;
  } catch (error: any) {
    console.error('Summary generation failed:', error);
    throw {
      type: 'summary',
      message: error.message || 'Failed to generate summary',
      status: error.status,
    };
  }
}

// Sentiment Analysis
export async function analyzeSentiment(
  text: string
): Promise<{ label: string; score: number }> {
  if (USE_MOCK) {
    console.log('Using mock sentiment analysis');
    await new Promise((resolve) =>
      setTimeout(resolve, 1500 + Math.random() * 1000)
    );
    return MOCK_RESPONSES.sentiment(text);
  }

  try {
    const result = await retryWithBackoff(async () => {
      const response = await callHuggingFaceAPI<SentimentResult[][]>(
        'cardiffnlp/twitter-roberta-base-sentiment-latest',
        text,
        6000
      );

      const sentiment = response[0][0];
      return {
        label: sentiment.label,
        score: Math.round(sentiment.score * 100) / 100,
      };
    });

    return result;
  } catch (error: any) {
    console.error('Sentiment analysis failed:', error);
    throw {
      type: 'sentiment',
      message: error.message || 'Failed to analyze sentiment',
      status: error.status,
    };
  }
}

// Named Entity Recognition
export async function extractEntities(
  text: string
): Promise<{ type: string; value: string }[]> {
  if (USE_MOCK) {
    console.log('Using mock entity extraction');
    await new Promise((resolve) =>
      setTimeout(resolve, 1800 + Math.random() * 1000)
    );
    return MOCK_RESPONSES.entities(text);
  }

  try {
    const result = await retryWithBackoff(async () => {
      const response = await callHuggingFaceAPI<EntityResult[]>(
        'dslim/bert-base-NER',
        text,
        6000
      );

      const entities = response
        .filter((entity) => entity.score > 0.9)
        .map((entity) => ({
          type: entity.entity_group,
          value: entity.word,
        }));

      const unique = Array.from(
        new Map(entities.map((e) => [e.value, e])).values()
      );

      return unique;
    });

    return result;
  } catch (error: any) {
    console.error('Entity extraction failed:', error);
    throw {
      type: 'entities',
      message: error.message || 'Failed to extract entities',
      status: error.status,
    };
  }
}

// Test connection
export async function testHuggingFaceConnection(): Promise<boolean> {
  if (USE_MOCK) return true;

  try {
    await callHuggingFaceAPI<any>(
      'distilbert-base-uncased-finetuned-sst-2-english',
      'test'
    );
    return true;
  } catch (error) {
    return false;
  }
}
