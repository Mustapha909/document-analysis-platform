'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Document } from '@/types/document';
import { useAnalysis } from '@/hooks/useAnalysis';
import ExportButton from '@/components/ExportButton';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedEntity, setHighlightedEntity] = useState<string | null>(
    null
  );
  const [selectedEntityType, setSelectedEntityType] = useState<string | null>(
    null
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  // Analysis hook
  const { isAnalyzing, progress, startAnalysis } = useAnalysis(
    documentId,
    fetchDocument
  );

  // Fetch document
  async function fetchDocument() {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${documentId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Document not found');
          return;
        }
        throw new Error('Failed to fetch document');
      }

      const data = await response.json();
      setDocument(data);
      setTitleValue(data.title);
    } catch (err: any) {
      setError(err.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  // Update title
  const handleUpdateTitle = async () => {
    if (!document || titleValue.trim() === document.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleValue.trim() }),
      });

      if (!response.ok) throw new Error('Failed to update title');

      await fetchDocument();
      setIsEditingTitle(false);
    } catch (err) {
      alert('Failed to update title');
      setTitleValue(document.title);
    }
  };

  // Delete document
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      router.push('/');
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  // Highlight entity in text
  const getHighlightedText = () => {
    if (!document) return '';

    let text = document.content;
    const entities = document.entities || [];

    // Filter by type if selected
    const filteredEntities = selectedEntityType
      ? entities.filter((e) => e.type === selectedEntityType)
      : entities;

    // Sort by length (longest first) to avoid partial matches
    const sortedEntities = [...filteredEntities].sort(
      (a, b) => b.value.length - a.value.length
    );

    sortedEntities.forEach((entity) => {
      const isHighlighted = highlightedEntity === entity.value;
      const bgColor = isHighlighted
        ? 'bg-yellow-300 dark:bg-yellow-600'
        : getEntityColor(entity.type);

      const regex = new RegExp(`\\b${entity.value}\\b`, 'gi');
      text = text.replace(
        regex,
        (match) =>
          `<mark class="${bgColor} px-1 rounded cursor-pointer" data-entity="${entity.value}">${match}</mark>`
      );
    });

    return text;
  };

  // Entity type colors
  const getEntityColor = (type: string) => {
    const colors: Record<string, string> = {
      PER: 'bg-blue-200 dark:bg-blue-900/50',
      ORG: 'bg-green-200 dark:bg-green-900/50',
      LOC: 'bg-purple-200 dark:bg-purple-900/50',
      MISC: 'bg-orange-200 dark:bg-orange-900/50',
    };
    return colors[type] || 'bg-gray-200 dark:bg-gray-700';
  };

  // Get unique entity types
  const entityTypes = document?.entities
    ? Array.from(new Set(document.entities.map((e) => e.type)))
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading document...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !document) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">
              {error || 'Document not found'}
            </h2>
            <Link
              href="/"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Back to Documents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 mb-4 transition-colors"
          >
            ← Back to Documents
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              {/* Title */}
              {isEditingTitle ? (
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <input
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    className="text-3xl font-bold border border-gray-300 dark:border-gray-600 rounded px-3 py-2 flex-1 min-w-[200px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateTitle();
                      if (e.key === 'Escape') {
                        setTitleValue(document.title);
                        setIsEditingTitle(false);
                      }
                    }}
                  />
                  <button
                    onClick={handleUpdateTitle}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setTitleValue(document.title);
                      setIsEditingTitle(false);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <h1
                  className="text-3xl font-bold mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-gray-900 dark:text-white transition-colors break-words"
                  onClick={() => setIsEditingTitle(true)}
                  title="Click to edit"
                >
                  {document.title}
                </h1>
              )}
              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                <span>{new Date(document.createdAt).toLocaleString()}</span>
                <span>•</span>
                <span>{document.content.trim().split(/\s+/).length} words</span>
                <span>•</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    document.status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : document.status === 'processing'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : document.status === 'failed'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isAnalyzing ? 'processing' : document.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => startAnalysis()}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
              </button>

              <ExportButton documents={[document]} single />

              <button
                onClick={handleDelete}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Analyzing...
            </h2>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {progress.message}
            </p>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Analysis Results */}
          <div className="lg:col-span-1 space-y-6">
            {/* Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
              <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Summary
              </h2>
              {document.summary ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {document.summary}
                </p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  No summary available. Click `Re-analyze to generate.
                </p>
              )}
            </div>

            {/* Sentiment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
              <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Sentiment Analysis
              </h2>
              {document.sentiment ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-2xl font-bold ${
                        document.sentiment.label === 'POSITIVE'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {document.sentiment.label}
                    </span>
                    <span className="text-3xl">
                      {document.sentiment.label === 'POSITIVE' ? '😊' : '😞'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        document.sentiment.label === 'POSITIVE'
                          ? 'bg-green-600 dark:bg-green-500'
                          : 'bg-red-600 dark:bg-red-500'
                      }`}
                      style={{ width: `${document.sentiment.score * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Confidence: {(document.sentiment.score * 100).toFixed(1)}%
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  No sentiment data available.
                </p>
              )}
            </div>

            {/* Entities */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
              <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Named Entities
              </h2>

              {document.entities && document.entities.length > 0 ? (
                <>
                  {/* Entity Type Filter */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setSelectedEntityType(null)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        selectedEntityType === null
                          ? 'bg-blue-600 dark:bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      All ({document.entities.length})
                    </button>
                    {entityTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedEntityType(type)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          selectedEntityType === type
                            ? 'bg-blue-600 dark:bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type} (
                        {
                          document.entities!.filter((e) => e.type === type)
                            .length
                        }
                        )
                      </button>
                    ))}
                  </div>

                  {/* Entity List */}
                  <div className="space-y-2">
                    {document.entities
                      .filter(
                        (e) =>
                          !selectedEntityType || e.type === selectedEntityType
                      )
                      .map((entity, index) => (
                        <div
                          key={index}
                          onClick={() =>
                            setHighlightedEntity(
                              highlightedEntity === entity.value
                                ? null
                                : entity.value
                            )
                          }
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            highlightedEntity === entity.value
                              ? 'bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-400 dark:border-yellow-600'
                              : getEntityColor(entity.type)
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {entity.value}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {entity.type}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  No entities found.
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Original Document */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Original Document
              </h2>

              {/* Legend */}
              {document.entities && document.entities.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Entity Highlighting:
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-200 dark:bg-blue-900/50 text-gray-900 dark:text-gray-100 rounded">
                      Person
                    </span>
                    <span className="px-2 py-1 bg-green-200 dark:bg-green-900/50 text-gray-900 dark:text-gray-100 rounded">
                      Organization
                    </span>
                    <span className="px-2 py-1 bg-purple-200 dark:bg-purple-900/50 text-gray-900 dark:text-gray-100 rounded">
                      Location
                    </span>
                    <span className="px-2 py-1 bg-yellow-300 dark:bg-yellow-600 text-gray-900 dark:text-gray-100 rounded">
                      Selected
                    </span>
                  </div>
                </div>
              )}

              {/* Document Text with Highlighted Entities */}
              <div
                className="prose dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap text-gray-900 dark:text-gray-100"
                dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'MARK') {
                    const entityValue = target.getAttribute('data-entity');
                    setHighlightedEntity(
                      highlightedEntity === entityValue ? null : entityValue
                    );
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
