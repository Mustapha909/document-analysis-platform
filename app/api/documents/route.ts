// app/api/documents/route.ts
import { NextResponse } from 'next/server';
import { getDocuments, addDocument } from '@/lib/documents';
import { Document } from '@/types/document';

// GET /api/documents - Get all documents
export async function GET() {
  try {
    const documents = getDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create new document
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create new document
    const newDocument: Document = {
      id: crypto.randomUUID(),
      title: body.title,
      content: body.content,
      createdAt: new Date().toISOString(),
      status: 'idle',
      summary: null,
      sentiment: null,
      entities: null,
    };

    const savedDocument = addDocument(newDocument);
    return NextResponse.json(savedDocument, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
