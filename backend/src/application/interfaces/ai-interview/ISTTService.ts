export interface ISTTResult {
  text: string;
  isEndpoint: boolean;
  isInterim?: boolean;
  reason?: string;
}

export interface ISTTService {
  transcribeStream(audioStream: AsyncIterable<Int16Array>): AsyncIterable<ISTTResult>;
}
