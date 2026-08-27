import { IGetInterviewEvaluationUseCase } from '../interfaces/IGetInterviewEvaluationUseCase';
import { IAIInterviewEvaluationRepository } from '@domain/repositories/ai-interview/IAIInterviewEvaluationRepository';
import { IInterviewRepository } from '@domain/repositories/IInterviewRepository';
import { IAIInterviewRepository } from '@domain/repositories/ai-interview/IAIInterviewRepository';
import { IMessageBroker } from '@application/interfaces/messaging/IMessageBroker';
import { AIInterviewEvaluation } from '@domain/entities/ai-interview/AIInterviewEvaluation';
import { AppError } from '@application/errors/AppError';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { ErrorCode } from '@domain/enums/ErrorCodes.enum';
import { InterviewStatus } from '@domain/enums/InterviewStatus.enum';
import { InterviewPhase } from '@domain/enums/InterviewPhase.enum';
import { Logger, LogCategory } from '../../../../infrastructure/logger/logger';

export class GetInterviewEvaluationUseCase implements IGetInterviewEvaluationUseCase {
  constructor(
    private readonly _evaluationRepository: IAIInterviewEvaluationRepository,
    private readonly _interviewRepository: IInterviewRepository,
    private readonly _aiInterviewRepository: IAIInterviewRepository,
    private readonly _messageBroker?: IMessageBroker
  ) {}

  async execute(params: {
    interviewId: string;
    companyId: string;
  }): Promise<AIInterviewEvaluation | null> {
    const { interviewId, companyId } = params;

    // 1. Authorization: Fetch Parent Interview and verify companyId
    const parentInterview = await this._interviewRepository.findById(interviewId);
    if (!parentInterview) {
      throw new AppError(`Interview not found: ${interviewId}`, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (parentInterview.companyId !== companyId) {
      Logger.warn(LogCategory.SYSTEM_INFO, `[GetInterviewEvaluationUseCase] Unauthorized access attempt to interview ${interviewId} by company ${companyId}`);
      throw new AppError('You are not authorized to access evaluations for this interview.', HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    // 2. Fetch existing evaluation
    const evaluation = await this._evaluationRepository.findByInterviewId(interviewId);
    if (evaluation) {
      return evaluation;
    }

    // 3. If no evaluation exists, check if session is completed and generate on demand
    const session = await this._aiInterviewRepository.findByInterviewId(interviewId);
    if (session && (session.phase === InterviewPhase.COMPLETED || parentInterview.status === InterviewStatus.COMPLETED)) {
      if (this._messageBroker) {
        Logger.info(LogCategory.SYSTEM_INFO, `[GetInterviewEvaluationUseCase] Enqueueing on-demand evaluation for completed interview ${interviewId}`);
        try {
          await this._messageBroker.publish('ai_interview_evaluations', {
            type: 'GENERATE_FULL_EVALUATION',
            sessionId: session.id,
            interviewId: interviewId,
            enqueuedAt: Date.now()
          });
          return null;
        } catch (evalErr) {
          Logger.warn(LogCategory.SYSTEM_INFO, `[GetInterviewEvaluationUseCase] On-demand evaluation could not be enqueued for ${interviewId}:`, evalErr);
          return null;
        }
      }
    }

    return null;
  }
}
