import { Document } from '@/types/document';

export function exportToCSV(documents: Document[]): void {
  if (documents.length === 0) {
    alert('No documents to export');
    return;
  }

  // CSV Headers
  const headers = [
    'ID',
    'Title',
    'Created At',
    'Status',
    'Word Count',
    'Summary',
    'Sentiment Label',
    'Sentiment Score',
    'Entities Count',
    'Entities List',
  ];

  // Convert documents to CSV rows
  const rows = documents.map((doc) => {
    const wordCount = doc.content.trim().split(/\s+/).length;
    const entitiesList = doc.entities
      ? doc.entities.map((e) => `${e.type}:${e.value}`).join('; ')
      : '';

    return [
      doc.id,
      `"${doc.title.replace(/"/g, '""')}"`, // Escape quotes
      doc.createdAt,
      doc.status,
      wordCount,
      doc.summary ? `"${doc.summary.replace(/"/g, '""')}"` : '',
      doc.sentiment?.label || '',
      doc.sentiment?.score || '',
      doc.entities?.length || 0,
      `"${entitiesList}"`,
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `documents_export_${
    new Date().toISOString().split('T')[0]
  }.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportSingleDocumentToCSV(document: Document): void {
  exportToCSV([document]);
}
