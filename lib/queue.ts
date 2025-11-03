// lib/queue.ts
interface QueueItem {
  documentId: string;
  status: 'waiting' | 'processing' | 'completed' | 'failed';
  addedAt: Date;
}

class AnalysisQueue {
  private queue: QueueItem[] = [];
  private processing: Set<string> = new Set();
  private readonly MAX_CONCURRENT = 3;

  // Add document to queue
  add(documentId: string): number {
    // Check if already in queue or processing
    if (this.isInQueue(documentId) || this.processing.has(documentId)) {
      return -1; // Already queued
    }

    this.queue.push({
      documentId,
      status: 'waiting',
      addedAt: new Date(),
    });

    return this.queue.length;
  }

  // Check if can start processing
  canProcess(): boolean {
    return this.processing.size < this.MAX_CONCURRENT;
  }

  // Start processing a document
  startProcessing(documentId: string): boolean {
    if (!this.canProcess()) {
      return false;
    }

    // Remove from queue if it's there
    const index = this.queue.findIndex(
      (item) => item.documentId === documentId
    );
    if (index !== -1) {
      this.queue.splice(index, 1);
    }

    this.processing.add(documentId);
    return true;
  }

  // Complete processing
  completeProcessing(documentId: string): void {
    this.processing.delete(documentId);
    // Don't auto-process next - let user click analyze
  }

  // Get queue position for a document
  getPosition(documentId: string): number {
    const index = this.queue.findIndex(
      (item) => item.documentId === documentId
    );
    return index === -1 ? -1 : index + 1;
  }

  // Check if document is in queue
  isInQueue(documentId: string): boolean {
    return this.queue.some((item) => item.documentId === documentId);
  }

  // Check if document is processing
  isProcessing(documentId: string): boolean {
    return this.processing.has(documentId);
  }

  // Get queue status
  getStatus() {
    return {
      processing: Array.from(this.processing),
      queued: this.queue.map((item) => item.documentId),
      availableSlots: this.MAX_CONCURRENT - this.processing.size,
    };
  }

  // Remove from queue (cancel)
  remove(documentId: string): boolean {
    const index = this.queue.findIndex(
      (item) => item.documentId === documentId
    );
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Singleton instance
export const analysisQueue = new AnalysisQueue();
