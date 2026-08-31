import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { CreateAIPracticeInterviewRequestDto } from "@application/dtos/ai-practice/CreateAIPracticeInterviewRequest";
import { AIPracticeInterview } from "@domain/entities/ai-practice/AIPracticeInterview";
import { ICreateAIPracticeInterviewUseCase } from "../interfaces/ICreateAIPracticeInterview.usecase";

export class CreateAIPracticeInterviewUseCase implements ICreateAIPracticeInterviewUseCase {
	constructor(
		private readonly __practiceRepository: IAIPracticeInterviewRepository
	){}

	async execute(studentId: string, dto: CreateAIPracticeInterviewRequestDto): Promise<AIPracticeInterview> {
		const practiceInterview = AIPracticeInterview.create({
			studentId,
			difficulty: dto.difficulty,
			topics: dto.topics,
			durationMinutes: dto.durationMinutes
		})

		return await this.__practiceRepository.create(practiceInterview)
	}
}