import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IScheduleInterviewUseCase } from "@application/usecases/hr/interview/interfaces/IScheduleInterview.usecase";
import { IGetHRInterviewsUseCase } from "@application/usecases/hr/interview/interfaces/IGetHRInterviews.usecase";
import { IGetInterviewEvaluationUseCase } from "@application/usecases/ai-interview/interfaces/IGetInterviewEvaluationUseCase";
import { IRecordHRDecisionUseCase } from "@application/usecases/ai-interview/interfaces/IRecordHRDecisionUseCase";
import { IMessageBroker } from "@application/interfaces/messaging/IMessageBroker";
import { IAIInterviewEvaluationRepository } from "@domain/repositories/ai-interview/IAIInterviewEvaluationRepository";
import { MESSAGES } from "@shared/constants/messages.constants";
import { SheduleInterviewDto } from "@application/dtos/hr/Request/ScheduleInterview.dto";
import { RecordHRDecisionDto } from "@application/dtos/ai-interview/RecordHRDecision.dto";
import { IInterviewEvaluationResponseDTO } from "@application/dtos/ai-interview/InterviewEvaluationResponse.dto";
import { AIInterviewEvaluation } from "@domain/entities/ai-interview/AIInterviewEvaluation";

export class HRInterviewController {
  constructor(
    private readonly _scheduleInterviewUseCase: IScheduleInterviewUseCase,
    private readonly _getHRInterviewsUseCase: IGetHRInterviewsUseCase,
    private readonly _getInterviewEvaluationUseCase?: IGetInterviewEvaluationUseCase,
    private readonly _recordHRDecisionUseCase?: IRecordHRDecisionUseCase,
    private readonly _messageBroker?: IMessageBroker,
    private readonly _evaluationRepository?: IAIInterviewEvaluationRepository
  ) {}

  private _mapEvaluationToDTO(evaluation: AIInterviewEvaluation): IInterviewEvaluationResponseDTO {
    return {
      id: evaluation.id,
      interviewId: evaluation.interviewId,
      sessionId: evaluation.sessionId,
      studentId: evaluation.studentId,
      jobId: evaluation.jobId,
      companyId: evaluation.companyId,
      overallScore: evaluation.overallScore,
      overallSummary: evaluation.overallSummary,
      competencies: evaluation.competencies.map(c => c.toJSON()),
      strengths: [...evaluation.strengths],
      developmentAreas: [...evaluation.developmentAreas],
      questionAnalyses: evaluation.questionAnalyses.map(q => q.toJSON()),
      insufficientEvidenceAreas: [...evaluation.insufficientEvidenceAreas],
      recommendation: evaluation.recommendation,
      recommendationReasoning: evaluation.recommendationReasoning,
      confidence: evaluation.confidence,
      confidenceScore: evaluation.confidenceScore,
      confidenceReasoning: evaluation.confidenceReasoning,
      aiSuggestedActions: [...evaluation.aiSuggestedActions],
      hrDecision: evaluation.hrDecision ? {
        action: evaluation.hrDecision.action,
        decisionNotes: evaluation.hrDecision.decisionNotes,
        overriddenRecommendation: evaluation.hrDecision.overriddenRecommendation,
        overrideReason: evaluation.hrDecision.overrideReason,
        decidedBy: evaluation.hrDecision.decidedBy,
        decidedAt: evaluation.hrDecision.decidedAt.toISOString(),
      } : undefined,
      status: evaluation.status,
      failureReason: evaluation.failureReason,
      metadata: {
        evaluationVersion: evaluation.metadata.evaluationVersion,
        model: evaluation.metadata.model,
        provider: evaluation.metadata.provider,
        evaluatedAt: evaluation.metadata.evaluatedAt.toISOString(),
        interviewDurationMinutes: evaluation.metadata.interviewDurationMinutes,
        totalQuestionsAnswered: evaluation.metadata.totalQuestionsAnswered,
      },
      createdAt: evaluation.createdAt.toISOString(),
      updatedAt: evaluation.updatedAt.toISOString(),
    };
  }

  scheduleInterview = asyncHandler(async (req: Request, res: Response) => {
    const hrId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!hrId || !companyId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const payload = req.body as SheduleInterviewDto;
    const interview = await this._scheduleInterviewUseCase.execute(hrId, companyId, payload);
    
    sendSuccess(res, interview, "Interview scheduled successfully");
  });

  getInterviews = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;

    if (!companyId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const interviews = await this._getHRInterviewsUseCase.execute(companyId);
    
    sendSuccess(res, interviews, "Interviews retrieved successfully");
  });

  getInterviewEvaluation = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    const { interviewId } = req.params;

    if (!companyId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    if (!this._getInterviewEvaluationUseCase) {
      throw new AppError("Evaluation service is not configured.", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    const evaluation = await this._getInterviewEvaluationUseCase.execute({
      interviewId,
      companyId,
    });

    if (!evaluation) {
      sendSuccess(res, null, "Evaluation is pending or interview is not yet completed.");
      return;
    }

    const dto = this._mapEvaluationToDTO(evaluation);
    sendSuccess(res, dto, "Interview evaluation retrieved successfully.");
  });

  recordHRDecision = asyncHandler(async (req: Request, res: Response) => {
    const hrId = req.user?.id;
    const companyId = req.user?.companyId;
    const { interviewId } = req.params;

    if (!hrId || !companyId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    if (!this._recordHRDecisionUseCase) {
      throw new AppError("Decision service is not configured.", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    const payload = req.body as RecordHRDecisionDto;
    const evaluation = await this._recordHRDecisionUseCase.execute({
      interviewId,
      companyId,
      hrId,
      action: payload.action,
      decisionNotes: payload.decisionNotes,
      overrideReason: payload.overrideReason,
    });

    const dto = this._mapEvaluationToDTO(evaluation);
    sendSuccess(res, dto, "HR decision recorded successfully.");
  });

  regenerateInterviewEvaluation = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    const { interviewId } = req.params;

    if (!companyId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    if (!this._messageBroker || !this._evaluationRepository) {
      throw new AppError("Message broker or repository is not configured.", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    let evaluation = await this._evaluationRepository.findByInterviewId(interviewId);
    if (evaluation) {
        evaluation.markAsPending();
        await this._evaluationRepository.update(evaluation);
    }

    await this._messageBroker.publish('ai_interview_evaluations', {
      type: 'GENERATE_FULL_EVALUATION',
      sessionId: req.body?.sessionId || (evaluation ? evaluation.sessionId : ''),
      interviewId,
      forceRegenerate: true,
      enqueuedAt: Date.now()
    });

    if (evaluation) {
        const dto = this._mapEvaluationToDTO(evaluation);
        sendSuccess(res, dto, "Interview evaluation regeneration started.");
    } else {
        sendSuccess(res, null, "Interview evaluation regeneration started.");
    }
  });
}
