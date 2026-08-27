import { AIInterviewEvaluation } from '@domain/entities/ai-interview/AIInterviewEvaluation';
import { HRDecision } from '@domain/value-objects/HRDecision';

export interface IAIInterviewEvaluationRepository {
  save(evaluation: AIInterviewEvaluation): Promise<AIInterviewEvaluation>;
  findByInterviewId(interviewId: string): Promise<AIInterviewEvaluation | null>;
  findBySessionId(sessionId: string): Promise<AIInterviewEvaluation | null>;
  findById(id: string): Promise<AIInterviewEvaluation | null>;
  update(evaluation: AIInterviewEvaluation): Promise<AIInterviewEvaluation>;
  recordHRDecision(interviewId: string, decision: HRDecision): Promise<AIInterviewEvaluation | null>;
}
