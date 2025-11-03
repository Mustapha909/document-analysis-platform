// app/api/documents/analyze/route.ts
import { NextRequest } from 'next/server';
import { getDocumentById, updateDocument } from '@/lib/documents';
import { analysisQueue } from '@/lib/queue';
import {
  generateSummary,
  analyzeSentiment,
  extractEntities,
} from '@/lib/huggingface';

export const dynamic = 'force-dynamic';

// POST /api/documents/analyze - Start analysis
export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return Response.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get document
    const document = getDocumentById(documentId);
    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if already processing
    if (analysisQueue.isProcessing(documentId)) {
      return Response.json(
        { error: 'Document is already being analyzed' },
        { status: 409 }
      );
    }

    // Check if can process
    if (!analysisQueue.canProcess()) {
      return Response.json(
        {
          error:
            'All analysis slots are full. Please wait for an analysis to complete.',
          availableSlots: 0,
        },
        { status: 503 }
      );
    }

    // Start processing
    analysisQueue.startProcessing(documentId);
    updateDocument(documentId, { status: 'processing' });

    // Create SSE stream
    const stream = createAnalysisStream(documentId, document.content);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Analysis request failed:', error);
    return Response.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    );
  }
}

// Create SSE stream for analysis
function createAnalysisStream(
  documentId: string,
  content: string
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const sendEvent = (type: string, data: any) => {
        const message = `data: ${JSON.stringify({ type, data })}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      try {
        sendEvent('progress', {
          message: 'Starting analysis...',
          progress: 0,
        });

        // Step 1: Generate Summary
        try {
          sendEvent('progress', {
            message: 'Generating summary...',
            progress: 10,
          });

          const summary = await generateSummary(content);
          updateDocument(documentId, { summary });

          sendEvent('summary', { summary });
          sendEvent('progress', {
            message: 'Summary complete',
            progress: 40,
          });
        } catch (error: any) {
          console.error('Summary failed:', error);
          sendEvent('error', {
            type: 'summary',
            message: error.message || 'Failed to generate summary',
          });
        }

        // Step 2: Analyze Sentiment
        try {
          sendEvent('progress', {
            message: 'Analyzing sentiment...',
            progress: 50,
          });

          const sentiment = await analyzeSentiment(content);
          updateDocument(documentId, { sentiment });

          sendEvent('sentiment', { sentiment });
          sendEvent('progress', {
            message: 'Sentiment analysis complete',
            progress: 70,
          });
        } catch (error: any) {
          console.error('Sentiment analysis failed:', error);
          sendEvent('error', {
            type: 'sentiment',
            message: error.message || 'Failed to analyze sentiment',
          });
        }

        // Step 3: Extract Entities
        try {
          sendEvent('progress', {
            message: 'Extracting entities...',
            progress: 80,
          });

          const entities = await extractEntities(content);
          updateDocument(documentId, { entities });

          sendEvent('entities', { entities });
          sendEvent('progress', {
            message: 'Entity extraction complete',
            progress: 95,
          });
        } catch (error: any) {
          console.error('Entity extraction failed:', error);
          sendEvent('error', {
            type: 'entities',
            message: error.message || 'Failed to extract entities',
          });
        }

        // Complete
        updateDocument(documentId, { status: 'completed' });
        sendEvent('complete', {
          message: 'Analysis complete!',
          progress: 100,
        });

        // Mark as complete in queue
        analysisQueue.completeProcessing(documentId);
      } catch (error: any) {
        console.error('Analysis stream error:', error);
        updateDocument(documentId, { status: 'failed' });
        analysisQueue.completeProcessing(documentId);

        sendEvent('error', {
          type: 'general',
          message: error.message || 'Analysis failed',
        });
      } finally {
        controller.close();
      }
    },
  });
}

// GET /api/documents/analyze - Get queue status
export async function GET() {
  const status = analysisQueue.getStatus();
  return Response.json(status);
}
