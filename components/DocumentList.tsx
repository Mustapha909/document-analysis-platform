// components/DocumentList.tsx
'use client';

import { Document } from '@/types/document';
import DocumentItem from './DocumentItem';
import DocumentListSkeleton from './DocumentListSkeleton';

interface DocumentListProps {
  documents: Document[];
  onDocumentUpdated: () => void;
  loading?: boolean;
}

export default function DocumentList({
  documents,
  onDocumentUpdated,
  loading = false,
}: DocumentListProps) {
  // Show skeleton while loading
  if (loading) {
    return <DocumentListSkeleton count={3} />;
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center transition-colors">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          No documents yet. Create your first document above!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <DocumentItem
          key={document.id}
          document={document}
          onUpdate={onDocumentUpdated}
        />
      ))}
    </div>
  );
}
