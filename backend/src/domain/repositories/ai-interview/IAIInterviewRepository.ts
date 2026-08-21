import { AIInterviewSession } from '@domain/entities/ai-interview/AIInterviewSession';
import { IBaseRepository } from '../IBaseRepository';

export interface IAIInterviewRepository extends IBaseRepository<AIInterviewSession> {
  findByInterviewId(interviewId: string): Promise<AIInterviewSession | null>;
}