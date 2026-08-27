import { InterviewIntegrityEvent } from '@domain/entities/ai-interview/InterviewIntegrityEvent';

export interface IInterviewIntegrityEventRepository {
  save(event: InterviewIntegrityEvent): Promise<InterviewIntegrityEvent>;
  findBySessionId(sessionId: string): Promise<InterviewIntegrityEvent[]>;
}
