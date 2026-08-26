import { AIInterviewSession } from '@domain/entities/ai-interview/AIInterviewSession';
import { IBaseRepository } from '../IBaseRepository';
import { InterviewPhase } from '@domain/enums/InterviewPhase.enum';
import { InterviewQuestion } from '@domain/entities/ai-interview/InterviewQuestion';
import { AnswerEvaluation } from '@domain/value-objects/AnswerEvaluation';
import { InterviewPlan } from '@domain/value-objects/InterviewPlan';

export interface IAIInterviewRepository extends IBaseRepository<AIInterviewSession> {
  findByInterviewId(interviewId: string): Promise<AIInterviewSession | null>;

  recordAnswerAtomically(
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<boolean>;

  advanceInterviewAtomically(
    sessionId: string,
    nextQuestion: InterviewQuestion,
    newPhase: InterviewPhase,
    currentTopic: string,
    coveredTopics: string[],
    followUpCount: number,
    interviewPlan?: InterviewPlan
  ): Promise<boolean>;

  attachEvaluationAtomically(
    sessionId: string,
    questionId: string,
    evaluation: AnswerEvaluation
  ): Promise<boolean>;

  transitionSessionState(
    sessionId: string,
    fromPhases: InterviewPhase[],
    toPhase: InterviewPhase
  ): Promise<boolean>;
}