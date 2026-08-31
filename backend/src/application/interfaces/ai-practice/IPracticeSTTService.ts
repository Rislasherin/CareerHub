export interface IPracticeSTTResult {
  text: string;
  isEndpoint: boolean;
  isInterim: boolean;
  reason?: string;
}

export interface IPracticeSTTService {
  transcribeStream(audioStream: AsyncIterable<Int16Array>): AsyncIterable<IPracticeSTTResult>;
  /** Signal the adapter to stop reconnecting. Called when the session ends. */
  stopReconnecting(): void;
}
