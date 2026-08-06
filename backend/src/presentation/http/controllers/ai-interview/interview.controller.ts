import { AppError } from "@application/errors/AppError";
import { IJoinInterviewUseCase } from "@application/usecases/ai-interview/interfaces/IJoinInterview.usecase";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { Request, Response } from "express";

export class AIInterviewController {
	constructor(
		private readonly _joinInterviewUseCase: IJoinInterviewUseCase
	){}

	join = asyncHandler(async (req:Request, res: Response) => {
		const studentId = req.user?.id;
		if(!studentId) {
			throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
		}

		const result = await this._joinInterviewUseCase.execute({
			interviewId: req.params.id,
			studentId
		});

		sendSuccess(res,result, 'Interview joined successfully', HttpStatus.OK);
	});
}