import { CreateAIPracticeInterviewRequestDto } from "@application/dtos/ai-practice/CreateAIPracticeInterviewRequest";
import { AIPracticeInterview } from "@domain/entities/ai-practice/AIPracticeInterview";

export interface ICreateAIPracticeInterviewUseCase{
	
	execute(studentId: string, dto: CreateAIPracticeInterviewRequestDto): Promise<AIPracticeInterview>
}