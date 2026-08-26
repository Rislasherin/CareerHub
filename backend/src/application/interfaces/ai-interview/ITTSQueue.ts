export interface ITTSQueue {
  enqueue(sentence: string): void;
  isSpeaking(): boolean;
  waitForDrain(): Promise<void>;
  clear?(): void;
}
