'use client';

import { useState, useEffect } from 'react';

interface QueueStatus {
  processing: string[];
  queued: string[];
  availableSlots: number;
}

export default function QueueStatus() {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Poll queue status every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/documents/analyze');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch queue status:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const hasActivity = status.processing.length > 0 || status.queued.length > 0;

  if (!hasActivity) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Compact indicator */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 dark:bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all relative"
      >
        {/* Activity indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>

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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </button>

      {/* Expanded panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Analysis Queue
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Available slots */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Processing Slots:
              </span>
            </div>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < status.processing.length
                      ? 'bg-blue-600 dark:bg-blue-500 animate-pulse'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Processing */}
          {status.processing.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currently Processing ({status.processing.length})
              </h4>
              <div className="space-y-1">
                {status.processing.map((id) => (
                  <div
                    key={id}
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="truncate">{id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Queued */}
          {status.queued.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Waiting in Queue ({status.queued.length})
              </h4>
              <div className="space-y-1">
                {status.queued.map((id, index) => (
                  <div
                    key={id}
                    className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded flex items-center gap-2"
                  >
                    <span className="text-gray-500 dark:text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="truncate">{id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {status.processing.length === 0 && status.queued.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No active analyses
            </p>
          )}
        </div>
      )}
    </div>
  );
}
