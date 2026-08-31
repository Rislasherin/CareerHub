export interface IPracticeRoomTokenService {
  generateStudentToken(sessionId: string, studentId: string, studentName: string): Promise<string>;
  generateWorkerToken(sessionId: string, workerName: string): Promise<string>;
}
