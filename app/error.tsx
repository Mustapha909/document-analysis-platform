'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Error Icon */}
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                Error Details (Dev Only)
              </summary>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {error.stack}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
            >
              Go Home
            </Link>
          </div>
        </div>

        {/* Support Message */}
        <p className="text-center text-sm text-gray-500 mt-4">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
