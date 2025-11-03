'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Document } from '@/types/document';
import DocumentForm from '@/components/DocumentForm';
import DocumentList from '@/components/DocumentList';
import ThemeToggle from '@/components/ThemeToggle';
import ExportButton from '@/components/ExportButton';
import Link from 'next/link';

const SearchAndFilters = dynamic(
  () => import('@/components/SearchAndFilters'),
  {
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function HomePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let result = [...documents];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.content.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((doc) => doc.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange.start) {
      result = result.filter(
        (doc) => new Date(doc.createdAt) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      result = result.filter(
        (doc) =>
          new Date(doc.createdAt) <= new Date(dateRange.end + 'T23:59:59')
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [documents, searchQuery, statusFilter, dateRange, sortBy, sortOrder]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setSortBy('date');
    setSortOrder('desc');
  }, []);

  // Check if any filters are active
  const hasActiveFilters: boolean = !!(
    searchQuery ||
    statusFilter !== 'all' ||
    dateRange.start ||
    dateRange.end
  );

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Document Analysis Platform
          </h1>
          <Link
            href="/compare"
            className="px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
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
            Compare
          </Link>
          <ThemeToggle />
        </div>

        {/* Document Form */}
        <DocumentForm onDocumentCreated={fetchDocuments} />

        {/* Search and Filters */}
        {!loading && (
          <div className="mt-8">
            <SearchAndFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        )}

        {/* Document List Header with Export */}
        <div className="mt-6">
          {!loading && (
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Documents ({filteredAndSortedDocuments.length}
                {filteredAndSortedDocuments.length !== documents.length &&
                  ` of ${documents.length}`}
                )
              </h2>

              {/* Export Button */}
              {filteredAndSortedDocuments.length > 0 && (
                <ExportButton documents={filteredAndSortedDocuments} />
              )}
            </div>
          )}

          <DocumentList
            documents={filteredAndSortedDocuments}
            onDocumentUpdated={fetchDocuments}
            loading={loading}
          />
        </div>
      </div>
    </main>
  );
}
