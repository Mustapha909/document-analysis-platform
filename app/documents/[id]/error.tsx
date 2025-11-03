'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DocumentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Document page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to Load Document
            </h2>
            <p className="text-gray-600 mb-6">
              {error.message ||
                'Unable to load the document. It may have been deleted or moved.'}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Documents
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
