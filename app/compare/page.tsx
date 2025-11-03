// app/compare/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Document } from '@/types/document';

export default function CompareDocuments() {
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<
    [string | null, string | null]
  >([null, null]);
  const [doc1, setDoc1] = useState<Document | null>(null);
  const [doc2, setDoc2] = useState<Document | null>(null);

  // Pre-select document from URL
  useEffect(() => {
    const doc1Param = searchParams.get('doc1');
    const doc2Param = searchParams.get('doc2');

    if (doc1Param) {
      setSelectedDocs([doc1Param, doc2Param]);
    }
  }, [searchParams]);

  // Fetch documents
  useEffect(() => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then(setDocuments);
  }, []);

  // Load selected documents
  useEffect(() => {
    if (selectedDocs[0]) {
      fetch(`/api/documents/${selectedDocs[0]}`)
        .then((res) => res.json())
        .then(setDoc1);
    }
    if (selectedDocs[1]) {
      fetch(`/api/documents/${selectedDocs[1]}`)
        .then((res) => res.json())
        .then(setDoc2);
    }
  }, [selectedDocs]);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 mb-4 transition-colors"
          >
            ← Back to Documents
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Compare Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Select two documents to compare their analysis results side-by-side
          </p>
        </div>

        {/* Document Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Document 1
            </label>
            <select
              value={selectedDocs[0] || ''}
              onChange={(e) =>
                setSelectedDocs([e.target.value, selectedDocs[1]])
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a document</option>
              {documents
                .filter((doc) => doc.status === 'completed')
                .map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Document 2
            </label>
            <select
              value={selectedDocs[1] || ''}
              onChange={(e) =>
                setSelectedDocs([selectedDocs[0], e.target.value])
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a document</option>
              {documents
                .filter(
                  (doc) =>
                    doc.status === 'completed' && doc.id !== selectedDocs[0]
                )
                .map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Empty State */}
        {!doc1 && !doc2 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              Select two analyzed documents to compare
            </p>
          </div>
        )}

        {/* Side-by-Side Comparison */}
        {doc1 && doc2 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ComparisonCard document={doc1} position={1} />
              <ComparisonCard document={doc2} position={2} />
            </div>

            {/* Comparison Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Comparison Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Word count difference */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Word Count
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.abs(
                      doc1.content.split(/\s+/).length -
                        doc2.content.split(/\s+/).length
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    words difference
                  </p>
                </div>

                {/* Sentiment comparison */}
                {doc1.sentiment && doc2.sentiment && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Sentiment
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          Doc 1:
                        </span>
                        <span
                          className={`font-semibold ${
                            doc1.sentiment.label === 'POSITIVE'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {doc1.sentiment.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          Doc 2:
                        </span>
                        <span
                          className={`font-semibold ${
                            doc2.sentiment.label === 'POSITIVE'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {doc2.sentiment.label}
                        </span>
                      </div>
                    </div>
                    {doc1.sentiment.label === doc2.sentiment.label ? (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        ✓ Same sentiment
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        ✗ Different sentiment
                      </p>
                    )}
                  </div>
                )}

                {/* Entity count */}
                {doc1.entities && doc2.entities && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Entities
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {doc1.entities.length + doc2.entities.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      total entities found
                    </p>
                  </div>
                )}
              </div>

              {/* Unique entities comparison */}
              {doc1.entities && doc2.entities && (
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Unique Entities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Only in "{doc1.title}"
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {doc1.entities
                          .filter(
                            (e1) =>
                              !doc2.entities!.some(
                                (e2) => e2.value === e1.value
                              )
                          )
                          .map((entity, i) => (
                            <span
                              key={i}
                              className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                            >
                              {entity.value}
                              <span className="ml-1 text-xs opacity-70">
                                ({entity.type})
                              </span>
                            </span>
                          ))}
                        {doc1.entities.filter(
                          (e1) =>
                            !doc2.entities!.some((e2) => e2.value === e1.value)
                        ).length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                            No unique entities
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Only in "{doc2.title}"
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {doc2.entities
                          .filter(
                            (e2) =>
                              !doc1.entities!.some(
                                (e1) => e1.value === e2.value
                              )
                          )
                          .map((entity, i) => (
                            <span
                              key={i}
                              className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm"
                            >
                              {entity.value}
                              <span className="ml-1 text-xs opacity-70">
                                ({entity.type})
                              </span>
                            </span>
                          ))}
                        {doc2.entities.filter(
                          (e2) =>
                            !doc1.entities!.some((e1) => e1.value === e2.value)
                        ).length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                            No unique entities
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Common entities */}
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Common Entities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {doc1.entities
                        .filter((e1) =>
                          doc2.entities!.some((e2) => e2.value === e1.value)
                        )
                        .map((entity, i) => (
                          <span
                            key={i}
                            className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm"
                          >
                            {entity.value}
                            <span className="ml-1 text-xs opacity-70">
                              ({entity.type})
                            </span>
                          </span>
                        ))}
                      {doc1.entities.filter((e1) =>
                        doc2.entities!.some((e2) => e2.value === e1.value)
                      ).length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                          No common entities
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ComparisonCard({
  document,
  position,
}: {
  document: Document;
  position: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-purple-200 dark:border-purple-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded mb-2">
            Document {position}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {document.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(document.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Summary
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {document.summary || 'No summary available'}
            </p>
          </div>
        </div>

        {/* Sentiment */}
        {document.sentiment && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sentiment
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-lg font-semibold ${
                    document.sentiment.label === 'POSITIVE'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {document.sentiment.label}
                </span>
                <span className="text-2xl">
                  {document.sentiment.label === 'POSITIVE' ? '😊' : '😞'}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    document.sentiment.label === 'POSITIVE'
                      ? 'bg-green-600 dark:bg-green-500'
                      : 'bg-red-600 dark:bg-red-500'
                  }`}
                  style={{ width: `${document.sentiment.score * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Confidence: {(document.sentiment.score * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Entities */}
        {document.entities && document.entities.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entities ({document.entities.length})
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
              <div className="flex flex-wrap gap-2">
                {document.entities.slice(0, 8).map((entity, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                  >
                    {entity.value}
                  </span>
                ))}
                {document.entities.length > 8 && (
                  <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                    +{document.entities.length - 8} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="pt-4 border-t dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Words</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {document.content.split(/\s+/).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {document.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Entities
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {document.entities?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
