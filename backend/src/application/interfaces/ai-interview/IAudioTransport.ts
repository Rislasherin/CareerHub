export interface IAudioTransport {
  connect(url: string, token: string, onParticipantConnected: () => void): Promise<void>;
  publishAudioChunk(chunk: Int16Array): Promise<void>;
  waitForPlayout?(): Promise<void>;
  getIncomingAudioStream(): AsyncIterable<Int16Array>;
  publishDataMessage(payload: Record<string, unknown>): Promise<void>;
  disconnect?(): Promise<void>;
}
