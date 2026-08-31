import { AIPracticeInterview } from "@domain/entities/ai-practice/AIPracticeInterview";

export interface IGetAIPracticeInterviewUseCase {
	execute(id: string, studentId: string): Promise<AIPracticeInterview>
}