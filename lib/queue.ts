class AnalysisQueue {
  private processing: Set<string> = new Set();
  private readonly MAX_CONCURRENT = 3;

  // Check if can start processing
  canProcess(): boolean {
    return this.processing.size < this.MAX_CONCURRENT;
  }

  // Start processing a document
  startProcessing(documentId: string): boolean {
    if (!this.canProcess()) {
      return false;
    }

    this.processing.add(documentId);
    return true;
  }

  // Complete processing
  completeProcessing(documentId: string): void {
    this.processing.delete(documentId);
  }

  // Check if document is processing
  isProcessing(documentId: string): boolean {
    return this.processing.has(documentId);
  }

  // Get queue status
  getStatus() {
    return {
      processing: Array.from(this.processing),
      queued: [], // We don't queue anymore
      availableSlots: this.MAX_CONCURRENT - this.processing.size,
    };
  }
}

// Singleton instance
export const analysisQueue = new AnalysisQueue();
