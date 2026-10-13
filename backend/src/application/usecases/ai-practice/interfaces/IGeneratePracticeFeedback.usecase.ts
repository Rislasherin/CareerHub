export interface IGeneratePracticeFeedbackUseCase {
  execute(sessionId: string, studentId: string): Promise<void>;
}
