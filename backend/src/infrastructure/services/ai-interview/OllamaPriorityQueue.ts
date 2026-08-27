import { Logger, LogCategory } from '../../logger/logger';

export type PriorityLevel = 'HIGH' | 'LOW';

interface QueueItem {
  priority: PriorityLevel;
  resolve: (release: () => void) => void;
}

export class OllamaPriorityQueue {
  private static instance = new OllamaPriorityQueue();
  private isProcessing = false;
  private queue: QueueItem[] = [];

  private constructor() {}

  public static async acquire(priority: PriorityLevel): Promise<() => void> {
    return this.instance._acquire(priority);
  }

  private _acquire(priority: PriorityLevel): Promise<() => void> {
    return new Promise((resolve) => {
      this.queue.push({ priority, resolve });
      // Sort so HIGH priority is at the front (index 0)
      // Array.prototype.sort is stable in modern V8 (Node 12+)
      this.queue.sort((a, b) => {
        if (a.priority === 'HIGH' && b.priority === 'LOW') return -1;
        if (a.priority === 'LOW' && b.priority === 'HIGH') return 1;
        return 0;
      });
      
      this._processNext();
    });
  }

  private _processNext() {
    if (this.isProcessing) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const nextItem = this.queue.shift()!;
    
    // We bind a release function that the caller must call to free the lock
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      this.isProcessing = false;
      this._processNext();
    };

    // Give the lock to the caller
    nextItem.resolve(release);
  }
}
