import { AIPracticeInterview } from "@domain/entities/ai-practice/AIPracticeInterview";

export interface ISubmitPracticeAnswerUseCase {
	execute(input: {
    studentId: string;
    sessionId: string;
    questionId: string;
    answer: string;
  }): Promise<AIPracticeInterview>
}