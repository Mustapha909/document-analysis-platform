// app/api/documents/[id]/route.ts
import { NextResponse } from 'next/server';
import {
  getDocumentById,
  updateDocument,
  deleteDocument,
} from '@/lib/documents';

// GET /api/documents/[id] - Get single document
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ← Changed to Promise
) {
  try {
    const { id } = await params; // ← Added await
    const document = getDocumentById(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PATCH /api/documents/[id] - Update document
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ← Changed to Promise
) {
  try {
    const { id } = await params; // ← Added await
    const body = await request.json();
    const updatedDocument = updateDocument(id, body);

    if (!updatedDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDocument);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete document
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ← Changed to Promise
) {
  try {
    const { id } = await params; // ← Added await
    const success = deleteDocument(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
