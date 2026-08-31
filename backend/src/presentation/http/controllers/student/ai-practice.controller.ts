import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { ICreateAIPracticeInterviewUseCase } from "@application/usecases/ai-practice/interfaces/ICreateAIPracticeInterview.usecase";
import { IGetAIPracticeInterviewUseCase } from "@application/usecases/ai-practice/interfaces/IGetAIPracticeInterview.usecase";
import { IStartPracticeSessionUseCase } from "@application/usecases/ai-practice/interfaces/IStartPracticeSession.usecase";
import { ISubmitPracticeAnswerUseCase } from "@application/usecases/ai-practice/interfaces/ISubmitPracticeAnswer.usecase";
import { IGetPracticeRoomTokenUseCase } from "@application/usecases/ai-practice/interfaces/IGetPracticeRoomToken.usecase";
import { CreateAIPracticeInterviewRequestDto } from "@application/dtos/ai-practice/CreateAIPracticeInterviewRequest";
import { SubmitAnswerRequestDto } from "@application/dtos/ai-practice/SubmitAnswerRequest.dto";
import { AIPracticeInterview } from "@domain/entities/ai-practice/AIPracticeInterview";
import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { GeneratePracticeFeedbackUseCase } from "@application/usecases/ai-practice/implementations/GeneratePracticeFeedback.usecase";
import { PracticeInterviewStatus } from "@domain/enums/PracticeInterviewStatus.enum";

export class AIPracticeController {
  constructor(
    private readonly _createAIPracticeInterviewUseCase: ICreateAIPracticeInterviewUseCase,
    private readonly _getAIPracticeInterviewUseCase: IGetAIPracticeInterviewUseCase,
    private readonly _startPracticeSessionUseCase: IStartPracticeSessionUseCase,
    private readonly _submitPracticeAnswerUseCase: ISubmitPracticeAnswerUseCase,
    private readonly _getPracticeRoomTokenUseCase: IGetPracticeRoomTokenUseCase,
    private readonly _practiceRepository: IAIPracticeInterviewRepository,
    private readonly _generateFeedbackUseCase: GeneratePracticeFeedbackUseCase
  ) {}

  /**
   * Maps a domain entity to a safe public DTO — strips internal state and exposes only
   * what the student UI needs. Never expose MongoDB _id internals or isDeleted flag.
   */
  private _mapToDTO(practice: AIPracticeInterview) {
    return {
      id: practice.id,
      studentId: practice.studentId,
      difficulty: practice.difficulty,
      topics: practice.topics,
      status: practice.status,
      questions: practice.questions.map((q) => ({
        id: q.id,
        text: q.text,
        topic: q.topic,
        candidateAnswer: q.candidateAnswer,
        score: q.score,
        feedback: q.feedback,
        createdAt: q.createdAt.toISOString(),
        answeredAt: q.answeredAt?.toISOString(),
      })),
      createdAt: practice.createdAt?.toISOString(),
      updatedAt: practice.updatedAt?.toISOString(),
      finalFeedback: practice.finalFeedback,
      durationMinutes: practice.durationMinutes,
      startedAt: practice.startedAt?.toISOString(),
    };
  }

  createPracticeInterview = asyncHandler(async (req: Request, res: Response) => {
    // Always derive studentId from the verified JWT context — never trust the request body
    const studentId = req.user?.id;
    if (!studentId || req.user?.role !== "student") {
      throw new AppError("Unauthorized access", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const dto = req.body as CreateAIPracticeInterviewRequestDto;
    const practice = await this._createAIPracticeInterviewUseCase.execute(studentId, dto);

    sendSuccess(res, this._mapToDTO(practice), "Practice interview session created successfully", HttpStatus.CREATED);
  });

  getPracticeInterview = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId || req.user?.role !== "student") {
      throw new AppError("Unauthorized access", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const { id } = req.params;
    if (!id) {
      throw new AppError("Practice Interview ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    let practice = await this._getAIPracticeInterviewUseCase.execute(id, studentId);

    // Robust Feedback Generation: If it is marked completed but doesn't have feedback (e.g. timeout), generate it now.
    if (practice.status === PracticeInterviewStatus.COMPLETED && !practice.finalFeedback) {
      await this._generateFeedbackUseCase.execute(id, studentId);
      practice = await this._getAIPracticeInterviewUseCase.execute(id, studentId);
    }

    sendSuccess(res, this._mapToDTO(practice), "Practice interview session retrieved successfully");
  });

  startPracticeInterview = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId || req.user?.role !== "student") {
      throw new AppError("Unauthorized access", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const { id } = req.params;
    if (!id) {
      throw new AppError("Practice Interview ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const practice = await this._startPracticeSessionUseCase.execute(id, studentId);

    sendSuccess(res, this._mapToDTO(practice), "Practice session started and first question generated");
  });

  submitPracticeAnswer = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId || req.user?.role !== "student") {
      throw new AppError("Unauthorized access", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const { id: sessionId } = req.params;
    if (!sessionId) {
      throw new AppError("Session ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const dto = req.body as SubmitAnswerRequestDto;

    const practice = await this._submitPracticeAnswerUseCase.execute({
      studentId,
      sessionId,
      questionId: dto.questionId,
      answer: dto.answer,
    });

    sendSuccess(res, this._mapToDTO(practice), "Answer submitted and processed successfully");
  });

  getPracticeRoomToken = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId || req.user?.role !== "student") {
      throw new AppError("Unauthorized access", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const { id: sessionId } = req.params;
    if (!sessionId) {
      throw new AppError("Session ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const authUser = req.user as { name?: string; firstName?: string; lastName?: string } | undefined;
    const studentName = authUser?.name || (authUser?.firstName ? `${authUser.firstName} ${authUser.lastName || ""}`.trim() : "Practice Candidate");

    const tokenData = await this._getPracticeRoomTokenUseCase.execute({
      sessionId,
      studentId,
      studentName,
    });

    sendSuccess(res, tokenData, "Practice room token generated successfully", HttpStatus.OK);
  });

  getLatestCompletedPractice = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId || req.user?.role !== "student") {
      throw new AppError("Unauthorized access", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const practice = await this._practiceRepository.findLatestCompletedByStudentId(studentId);
    if (!practice) {
      throw new AppError("No completed practice sessions found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Robust Feedback Generation
    if (!practice.finalFeedback) {
      await this._generateFeedbackUseCase.execute(practice.id!, studentId);
      const updated = await this._getAIPracticeInterviewUseCase.execute(practice.id!, studentId);
      sendSuccess(res, this._mapToDTO(updated), "Latest practice session retrieved successfully");
      return;
    }

    sendSuccess(res, this._mapToDTO(practice), "Latest practice session retrieved successfully");
  });
}

