import { IAIInterviewRepository } from "@domain/repositories/ai-interview/IAIInterviewRepository";
import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { ICompleteAIInterviewUseCase, CompleteAIInterviewOutput } from "../interfaces/ICompleteAIInterviewUseCase";
import { CompleteAIInterviewInputDTO } from "@application/dtos/ai-interview/CompleteAIInterview.dto";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";

import { InterviewPhase } from "@domain/enums/InterviewPhase.enum";
import { ILiveKitService } from "@application/interfaces/ai-interview/ILiveKitService";
import { ILogger, LogCategory } from "../../../interfaces/observability/ILogger";
import { IAICreditService } from "@domain/services/IAICreditService";
import { AICreditPolicy } from "@infrastructure/config/ai-credit.policy";

export class CompleteAIInterviewUseCase implements ICompleteAIInterviewUseCase {
	constructor(
		private readonly _repository: IAIInterviewRepository,
		private readonly _interviewRepository: IInterviewRepository,
        private readonly _liveKitService?: ILiveKitService,
        private readonly _logger?: ILogger,
        private readonly _aiCreditService?: IAICreditService
	){}

	async execute(input: CompleteAIInterviewInputDTO): Promise<CompleteAIInterviewOutput> {
		const session = await this._repository.findById(input.sessionId);
		if(!session) {
			throw new Error(`AI Interview session with ID ${input.sessionId} not found`);
		}

        const advanced = await this._repository.transitionSessionState(
            session.id,
            [InterviewPhase.NOT_STARTED, InterviewPhase.INTRO, InterviewPhase.ASKING_QUESTION, InterviewPhase.ASKING_FOLLOW_UP, InterviewPhase.EVALUATING, InterviewPhase.CLOSING],
            InterviewPhase.COMPLETED
        );

        if (advanced) {
            // Commit AI Credits if reserved
            if (this._aiCreditService && session.configuration?.metadata?.reservationId) {
                try {
                    const reservationId = session.configuration.metadata.reservationId;
                    const durationMinutes = session.getDurationMinutes();
                    
                    // Product Decision: Use policy configuration to determine final cost
                    const finalCredits = AICreditPolicy.features.ai_interview.calculateFinalCredits(durationMinutes);
                    
                    await this._aiCreditService.commitCredits(reservationId, finalCredits, {
                        durationMinutes,
                        completedAt: new Date()
                    });
                } catch (err) {
                    if (this._logger) {
                        this._logger.error(LogCategory.SYSTEM_ERROR, `Failed to commit AI credits for session ${session.id}`, err);
                    }
                }
            }

		    if (session.phase === InterviewPhase.EVALUATING) {
                session.closeInterview();
            }
		    session.markAsCompleted();
            if (this._liveKitService && this._liveKitService.deleteRoom) {
                try {
                    await this._liveKitService.deleteRoom(session.id);
                    if (this._logger) {
                        this._logger.info(LogCategory.SYSTEM_INFO, `Successfully deleted LiveKit room for session ${session.id}`);
                    }
                } catch (err) {
                    if (this._logger) {
                        this._logger.error(LogCategory.AI_INTERVIEW_LIVEKIT_FAILURE, `Failed to delete LiveKit room for session ${session.id}`, err);
                    }
                }
            }
        }

		const parentInterview = await this._interviewRepository.findById(session.interviewId);
		if (parentInterview && parentInterview.status === InterviewStatus.IN_PROGRESS) {
			parentInterview.markAsCompleted();
			await this._interviewRepository.update(parentInterview.id, parentInterview);
		}

		return {success: true}
	}
}