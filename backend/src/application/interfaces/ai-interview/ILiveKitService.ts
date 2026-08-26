export interface ILiveKitService {
  generateToken(sessionId: string, studentId: string, studentName: string): Promise<string>;
  generateWorkerToken(sessionId: string): Promise<string>;
  deleteRoom?(sessionId: string): Promise<void>;
}
