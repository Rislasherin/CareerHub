export interface IPracticeTTSService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  generateAudioStream(text: string): AsyncIterable<Int16Array>;
}
