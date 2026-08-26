import { AppError } from "@application/errors/AppError";
import { IProcessStudentAnswerUseCase } from "@application/usecases/ai-interview/interfaces/IProcessStudentAnswerUseCase";
import { IStartAIInterviewUseCase } from "@application/usecases/ai-interview/interfaces/IStartAIInterviewUseCase";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { Request, Response } from "express";

import { ILiveKitService } from "@application/interfaces/ai-interview/ILiveKitService";
import { IAIInterviewRepository } from "@domain/repositories/ai-interview/IAIInterviewRepository";

export class AIInterviewController {
	constructor(
		private readonly _startAIInterviewUseCase: IStartAIInterviewUseCase,
		private readonly _processStudentAnswerUseCase: IProcessStudentAnswerUseCase,
		private readonly _liveKitService: ILiveKitService,
		private readonly _aiInterviewRepository: IAIInterviewRepository
	) { }

	public getLiveKitToken = asyncHandler(async (req: Request, res: Response) => {
		const { sessionId } = req.params;
		const authUser = req.user as { id?: string; _id?: string; name?: string; firstName?: string; lastName?: string } | undefined;
		const studentId = authUser?.id || authUser?._id;
		
		if (!studentId) {
			throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
		}
		
		const studentName = authUser?.name || authUser?.firstName || 'Student';
		const session = await this._aiInterviewRepository.findById(sessionId);
		if (!session) {
			throw new AppError("Session not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
		}
		if (session.studentId !== studentId.toString()) {
			throw new AppError("Forbidden: Session does not belong to the requesting student.", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
		}

		const token = await this._liveKitService.generateToken(sessionId, studentId.toString(), studentName);

		sendSuccess(res, { 
			token, 
			durationMinutes: session.getDurationMinutes(),
			startedAt: session.startedAt?.toISOString() || null,
			phase: session.phase
		}, "LiveKit token generated successfully.", HttpStatus.OK);
	});

	public getSessionStatus = asyncHandler(async (req: Request, res: Response) => {
		const { sessionId } = req.params;
		const authUser = req.user as { id?: string; _id?: string } | undefined;
		const studentId = authUser?.id || authUser?._id;
		
		if (!studentId) {
			throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
		}

		const session = await this._aiInterviewRepository.findById(sessionId);
		if (!session) {
			throw new AppError("Session not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
		}
		if (session.studentId !== studentId.toString()) {
			throw new AppError("Forbidden: Session does not belong to the requesting student.", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
		}

		const currentQuestion = session.questions.length > 0 ? session.questions[session.questions.length - 1].text : undefined;
		const transcript = session.questions.map((q) => ({
			id: q.id,
			text: q.text,
			candidateAnswer: q.candidateAnswer
		}));

		const isCompleted = session.phase === 'COMPLETED';

		sendSuccess(res, {
			sessionId: session.id,
			phase: session.phase,
			startedAt: session.startedAt?.toISOString() || null,
			durationMinutes: session.getDurationMinutes(),
			isCompleted,
			currentQuestion,
			transcript
		}, "Session status retrieved successfully.", HttpStatus.OK);
	});

	public startInterview = asyncHandler(async (req: Request, res: Response) => {
		const { interviewId } = req.params;
		const authUser = req.user as { id?: string; _id?: string } | undefined;
		const studentId = authUser?.id || authUser?._id;

		if (!interviewId) {
			throw new AppError("Interview ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
		}

		if (!studentId) {
			throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
		}

		const result = await this._startAIInterviewUseCase.execute({ interviewId, studentId: studentId.toString() });

		sendSuccess(res, result, "AI Interview started successfully.", HttpStatus.OK);
	});
	public processAnswer = asyncHandler(async (req: Request, res: Response) => {
		const authUser = req.user as { id?: string; _id?: string } | undefined;
		const studentId = authUser?.id || authUser?._id;

		if (!studentId) {
			throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
		}

		const { sessionId, questionId } = req.params;
		const { answer } = req.body;
		if (!sessionId || !questionId || !answer) {
			throw new AppError("Session ID, Question ID, and Answer are required.", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
		}

		const result = await this._processStudentAnswerUseCase.execute({
			sessionId,
			questionId,
			answer,
			studentId: studentId.toString()
		});

		sendSuccess(res, result, "Answer processed successfully.", HttpStatus.OK);
	})
}