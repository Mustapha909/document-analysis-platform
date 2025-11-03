'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { Document } from '@/types/document';
import Link from 'next/link';
import { useAnalysis } from '@/hooks/useAnalysis';

interface DocumentItemProps {
  document: Document;
  onUpdate: () => void;
}

function DocumentItem({ document, onUpdate }: DocumentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(document.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<HTMLDivElement>(null);

  // Use the analysis hook
  const {
    isAnalyzing,
    progress,
    result,
    error: analysisError,
    startAnalysis,
    cancelAnalysis,
  } = useAnalysis(document.id, onUpdate);

  // Calculate word count
  const wordCount = document.content.trim().split(/\s+/).length;

  // Format date
  const formattedDate = new Date(document.createdAt).toLocaleString();

  // Status badge colors
  const statusColors = {
    idle: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    processing:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    completed:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  // Handle title update
  const handleTitleSave = async () => {
    if (title.trim() === document.title) {
      setIsEditing(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      alert('Failed to update title');
      setTitle(document.title);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      onUpdate();
    } catch (error) {
      alert('Failed to delete document');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle analyze
  const handleAnalyze = () => {
    startAnalysis();
  };

  // Determine display status
  const displayStatus = isAnalyzing ? 'processing' : document.status;

  // Focus trap for delete dialog
  useEffect(() => {
    if (!showDeleteConfirm) return;

    const firstButton = deleteDialogRef.current?.querySelector('button');
    firstButton?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDeleteConfirm(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDeleteConfirm]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
      <div className="flex items-start justify-between">
        {/* Left side - Title and metadata */}
        <div className="flex-1">
          {/* Title - Editable */}
          {isEditing ? (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') {
                    setTitle(document.title);
                    setIsEditing(false);
                  }
                }}
              />
              <button
                onClick={handleTitleSave}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTitle(document.title);
                  setIsEditing(false);
                }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <h3
              className="text-xl font-semibold mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-gray-900 dark:text-white transition-colors"
              onClick={() => setIsEditing(true)}
              title="Click to edit"
            >
              {document.title}
            </h3>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{wordCount} words</span>
            <span>•</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${statusColors[displayStatus]}`}
            >
              {displayStatus}
            </span>
          </div>

          {/* Content Preview */}
          <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
            {document.content}
          </p>

          {/* Progress Indicator */}
          {isAnalyzing && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {progress.message}
              </p>
            </div>
          )}

          {/* Real-time Results Preview */}
          {isAnalyzing && (
            <div className="mb-4 space-y-2">
              {result.summary && (
                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                    ✓ Summary
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {result.summary}
                  </p>
                </div>
              )}

              {result.sentiment && (
                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                    ✓ Sentiment
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {result.sentiment.label} (
                    {(result.sentiment.score * 100).toFixed(0)}%)
                  </p>
                </div>
              )}

              {result.entities && result.entities.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                    ✓ Entities
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Found {result.entities.length} entities
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Analysis Error */}
          {analysisError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {analysisError}
              </p>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex flex-col gap-2 ml-4">
          <Link
            href={`/documents/${document.id}`}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-600 text-center transition-colors"
            aria-label={`View details for ${document.title}`}
          >
            View Details
          </Link>
          <Link
            href={`/compare?doc1=${document.id}`}
            className="px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded text-sm hover:bg-purple-700 dark:hover:bg-purple-600 text-center transition-colors"
          >
            Compare
          </Link>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || loading}
            className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded text-sm hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            aria-label={
              isAnalyzing ? 'Analysis in progress' : `Analyze ${document.title}`
            }
            aria-busy={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>

          {isAnalyzing && (
            <button
              onClick={cancelAnalysis}
              className="px-4 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded text-sm hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded text-sm hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            aria-label={`Delete ${document.title}`}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 transition-opacity"
          role="dialog"
          aria-labelledby="delete-dialog-title"
          aria-modal="true"
        >
          <div
            ref={deleteDialogRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h3
              id="delete-dialog-title"
              className="text-lg font-semibold mb-2 text-gray-900 dark:text-white"
            >
              Delete Document?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete `{document.title}`? This action
              cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                aria-label={`Confirm delete ${document.title}`}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(DocumentItem);
