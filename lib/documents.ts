import { Document } from '@/types/document';
import fs from 'fs';
import path from 'path';

// Detect if we're running on Vercel (read-only FS)
const isVercel = process.env.VERCEL === '1';

// Use /tmp on Vercel, otherwise local /data folder
const DATA_FILE = isVercel
  ? path.join('/tmp', 'documents.json')
  : path.join(process.cwd(), 'data', 'documents.json');

console.log('📁 Using data file path:', DATA_FILE);

// Helper: read all documents from file
export function getDocuments(): Document[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContents = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(fileContents);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Failed to read documents file:', error);
    return [];
  }
}

// Helper: save documents to file (only works in writable env)
export function saveDocuments(documents: Document[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(documents, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save documents:', error);
  }
}

// Get single document by ID
export function getDocumentById(id: string): Document | null {
  const documents = getDocuments();
  return documents.find((doc) => doc.id === id) || null;
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
  if (filteredDocuments.length === documents.length) return false;

  saveDocuments(filteredDocuments);
  return true;
}
