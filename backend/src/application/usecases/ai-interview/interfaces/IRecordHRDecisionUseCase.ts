import { AIInterviewEvaluation } from '@domain/entities/ai-interview/AIInterviewEvaluation';
import { HRDecisionAction } from '@domain/enums/HRDecisionAction.enum';

export interface IRecordHRDecisionUseCase {
  execute(params: {
    interviewId: string;
    companyId: string;
    hrId: string;
    action: HRDecisionAction;
    decisionNotes?: string;
    overrideReason?: string;
  }): Promise<AIInterviewEvaluation>;
}
