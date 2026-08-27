import { IRecordHRDecisionUseCase } from '../interfaces/IRecordHRDecisionUseCase';
import { IAIInterviewEvaluationRepository } from '@domain/repositories/ai-interview/IAIInterviewEvaluationRepository';
import { IInterviewRepository } from '@domain/repositories/IInterviewRepository';
import { IJobApplicationRepository } from '@domain/repositories/IJobApplicationRepository';
import { IUpdateApplicationStatusUseCase } from '@application/usecases/hr/job-engine/interfaces/IUpdateApplicationStatus.usecase';
import { AIInterviewEvaluation } from '@domain/entities/ai-interview/AIInterviewEvaluation';
import { HRDecision } from '@domain/value-objects/HRDecision';
import { HRDecisionAction } from '@domain/enums/HRDecisionAction.enum';
import { AIRecommendation } from '@domain/enums/AIRecommendation.enum';
import { JobApplicationStatus } from '@domain/enums/JobApplicationStatus.enum';
import { AppError } from '@application/errors/AppError';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { ErrorCode } from '@domain/enums/ErrorCodes.enum';
import { Logger, LogCategory } from '../../../../infrastructure/logger/logger';

export class RecordHRDecisionUseCase implements IRecordHRDecisionUseCase {
  constructor(
    private readonly _evaluationRepository: IAIInterviewEvaluationRepository,
    private readonly _interviewRepository: IInterviewRepository,
    private readonly _jobApplicationRepository: IJobApplicationRepository,
    private readonly _updateApplicationStatusUseCase: IUpdateApplicationStatusUseCase
  ) {}

  async execute(params: {
    interviewId: string;
    companyId: string;
    hrId: string;
    action: HRDecisionAction;
    decisionNotes?: string;
    overrideReason?: string;
  }): Promise<AIInterviewEvaluation> {
    const { interviewId, companyId, hrId, action, decisionNotes, overrideReason } = params;

    // 1. Authorization: Fetch Parent Interview and verify companyId
    const parentInterview = await this._interviewRepository.findById(interviewId);
    if (!parentInterview) {
      throw new AppError(`Interview not found: ${interviewId}`, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (parentInterview.companyId !== companyId) {
      Logger.warn(LogCategory.SYSTEM_INFO, `[RecordHRDecisionUseCase] Unauthorized decision attempt on interview ${interviewId} by company ${companyId}`);
      throw new AppError('You are not authorized to record decisions for this interview.', HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    // 2. Fetch evaluation
    const evaluation = await this._evaluationRepository.findByInterviewId(interviewId);
    if (!evaluation) {
      throw new AppError(`Evaluation not found for interview: ${interviewId}. Please generate the evaluation first.`, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // 3. Determine if HR is overriding the AI recommendation
    let overriddenRecommendation = false;
    const aiRec = evaluation.recommendation;

    if (aiRec === AIRecommendation.DO_NOT_PROCEED && (action === HRDecisionAction.SHORTLIST || action === HRDecisionAction.NEXT_ROUND)) {
      overriddenRecommendation = true;
    } else if ((aiRec === AIRecommendation.STRONG_PROCEED || aiRec === AIRecommendation.PROCEED) && action === HRDecisionAction.REJECT) {
      overriddenRecommendation = true;
    }

    if (overriddenRecommendation && (!overrideReason || overrideReason.trim().length === 0)) {
      throw new AppError('An override reason is required when deciding against the AI recommendation.', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // 4. Create HRDecision value object
    const decision = new HRDecision({
      action,
      decisionNotes,
      overriddenRecommendation,
      overrideReason: overriddenRecommendation ? overrideReason : undefined,
      decidedBy: hrId,
      decidedAt: new Date(),
    });

    // 5. Update domain entity and persist
    evaluation.recordHRDecision(decision);
    const updated = await this._evaluationRepository.recordHRDecision(interviewId, decision);
    if (!updated) {
      throw new AppError('Failed to record HR decision.', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    // 6. Update the parent Applicant Pipeline status natively
    const jobApp = await this._jobApplicationRepository.findByJobAndStudent(
      parentInterview.jobId, 
      parentInterview.studentId
    );
    
    if (jobApp) {
      let nextStatus: JobApplicationStatus | null = null;
      switch (action) {
        case HRDecisionAction.HIRE:
          nextStatus = JobApplicationStatus.SELECTED;
          break;
        case HRDecisionAction.NEXT_ROUND:
          nextStatus = JobApplicationStatus.NEXT_ROUND;
          break;
        case HRDecisionAction.HOLD:
          nextStatus = JobApplicationStatus.UNDER_REVIEW;
          break;
        case HRDecisionAction.REJECT:
          nextStatus = JobApplicationStatus.REJECTED;
          break;
        case HRDecisionAction.SHORTLIST:
          nextStatus = JobApplicationStatus.SHORTLISTED;
          break;
      }

      if (nextStatus && jobApp.id) {
        try {
          await this._updateApplicationStatusUseCase.execute(jobApp.id, companyId, nextStatus);
          Logger.info(LogCategory.SYSTEM_INFO, `[RecordHRDecisionUseCase] Updated Application ${jobApp.id} status to ${nextStatus}`);
        } catch (statusErr) {
          Logger.warn(LogCategory.SYSTEM_INFO, `[RecordHRDecisionUseCase] Failed to update Application ${jobApp.id} status`, statusErr);
        }
      }
    }

    Logger.info(LogCategory.SYSTEM_INFO, `[RecordHRDecisionUseCase] HR decision recorded for interview ${interviewId}: Action=${action}, Override=${overriddenRecommendation}`);
    return updated;
  }
}
