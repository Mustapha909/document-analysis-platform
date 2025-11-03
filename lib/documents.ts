import { Document } from '@/types/document';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'documents.json');

// Read all documents from JSON file
export function getDocuments(): Document[] {
  try {
    const fileContents = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
  }
}

// Get single document by ID
export function getDocumentById(id: string): Document | null {
  const documents = getDocuments();
  return documents.find((doc) => doc.id === id) || null;
}

// Save documents to JSON file
export function saveDocuments(documents: Document[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(documents, null, 2), 'utf8');
}

// Add new document
export function addDocument(document: Document): Document {
  const documents = getDocuments();
  documents.push(document);
  saveDocuments(documents);
  return document;
}

// Update existing document
export function updateDocument(
  id: string,
  updates: Partial<Document>
): Document | null {
  const documents = getDocuments();
  const index = documents.findIndex((doc) => doc.id === id);

  if (index === -1) return null;

  documents[index] = { ...documents[index], ...updates };
  saveDocuments(documents);
  return documents[index];
}

// Delete document
export function deleteDocument(id: string): boolean {
  const documents = getDocuments();
  const filteredDocuments = documents.filter((doc) => doc.id !== id);

  if (filteredDocuments.length === documents.length) {
    return false; // Document not found
  }

  saveDocuments(filteredDocuments);
  return true;
}
