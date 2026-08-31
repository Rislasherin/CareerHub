import { AIPracticeInterview } from "@domain/entities/ai-practice/AIPracticeInterview";

export interface IStartPracticeSessionUseCase {
	execute(id: string, studentId: string): Promise<AIPracticeInterview>
}