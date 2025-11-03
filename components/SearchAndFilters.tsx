'use client';

import { useState, useEffect, useRef, memo } from 'react';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  sortBy: 'date' | 'title' | 'status';
  onSortByChange: (sort: 'date' | 'title' | 'status') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

function SearchAndFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  hasActiveFilters,
}: SearchAndFiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Debounced search (300ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(localSearchQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localSearchQuery, onSearchChange]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
      <div className="space-y-4">
        {/* Search Bar */}
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Search Documents
          </label>
          <input
            id="search"
            type="text"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            placeholder="Search by title or content..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          {localSearchQuery && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Searching... (debounced 300ms)
            </p>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            >
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="idle">Idle</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <label
              htmlFor="dateStart"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            >
              From Date
            </label>
            <input
              id="dateStart"
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                onDateRangeChange({ ...dateRange, start: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Date Range End */}
          <div>
            <label
              htmlFor="dateEnd"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            >
              To Date
            </label>
            <input
              id="dateEnd"
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                onDateRangeChange({ ...dateRange, end: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label
              htmlFor="sortBy"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            >
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) =>
                onSortByChange(e.target.value as 'date' | 'title' | 'status')
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="date">Date Created</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="sortOrder"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            >
              Order
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) =>
                onSortOrderChange(e.target.value as 'asc' | 'desc')
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(SearchAndFilters);
