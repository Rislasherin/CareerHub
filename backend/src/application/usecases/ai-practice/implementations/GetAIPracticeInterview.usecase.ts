import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { IGetAIPracticeInterviewUseCase } from "../interfaces/IGetAIPracticeInterview.usecase";
import { AIPracticeInterview } from "@domain/entities/ai-practice/AIPracticeInterview";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class GetAIPracticeInterviewUseCase implements IGetAIPracticeInterviewUseCase {
	constructor(
		private readonly _practiceRepository: IAIPracticeInterviewRepository
	){}

	async execute(id: string, studentId: string): Promise<AIPracticeInterview> {
		const practiceInterview = await this._practiceRepository.findByIdAndStudentId(id,studentId);

		if(!practiceInterview){
			throw new AppError("Practice interview not found or unauthorized", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
		}

		return practiceInterview
	}
}