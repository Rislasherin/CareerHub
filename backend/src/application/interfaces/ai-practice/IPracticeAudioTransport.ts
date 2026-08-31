export interface IPracticeAudioTransport {
  connect(url: string, token: string, onParticipantConnected: () => void): Promise<void>;
  publishAudioChunk(buffer: Int16Array): Promise<void>;
  waitForPlayout(): Promise<void>;
  getIncomingAudioStream(): AsyncIterable<Int16Array>;
  publishDataMessage(payload: Record<string, unknown>): Promise<void>;
  disconnect(): Promise<void>;
}
