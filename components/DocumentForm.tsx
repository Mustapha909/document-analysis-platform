'use client';

import { useState, memo } from 'react';

interface DocumentFormProps {
  onDocumentCreated: () => void;
}

function DocumentForm({ onDocumentCreated }: DocumentFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MAX_CONTENT_LENGTH = 5000;
  const MAX_FILE_SIZE = 50 * 1024; // 50KB in bytes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`Content must be less than ${MAX_CONTENT_LENGTH} characters`);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      // Reset form
      setTitle('');
      setContent('');
      onDocumentCreated();
    } catch (err) {
      setError('Failed to create document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate file type
    if (!file.name.endsWith('.txt')) {
      setError('Only .txt files are supported');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than 50KB`);
      return;
    }

    try {
      const text = await file.text();
      setContent(text);

      // Auto-generate title from filename if title is empty
      if (!title) {
        setTitle(file.name.replace('.txt', ''));
      }
    } catch (err) {
      setError('Failed to read file');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Create New Document
      </h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded mb-4 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
          >
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter document title"
          />
        </div>

        {/* File Upload */}
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
          >
            Upload File (.txt, max 50KB)
          </label>
          <input
            id="file"
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 file:cursor-pointer cursor-pointer"
          />
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          <span className="text-gray-500 dark:text-gray-400 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Content Textarea */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
          >
            Content * ({content.length}/{MAX_CONTENT_LENGTH})
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 h-40 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="Paste or type your document content here"
            maxLength={MAX_CONTENT_LENGTH}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Creating...' : 'Create Document'}
        </button>
      </form>
    </div>
  );
}

export default memo(DocumentForm);
