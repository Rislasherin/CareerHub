import { InterviewIntegrityEventType } from '@domain/enums/InterviewIntegrityEventType.enum';
import { InterviewIntegrityEvent } from '@domain/entities/ai-interview/InterviewIntegrityEvent';

export interface IRecordInterviewIntegrityEventRequest {
  sessionId: string;
  studentId: string;
  eventType: InterviewIntegrityEventType;
  metadata?: Record<string, any>;
}

export interface IRecordInterviewIntegrityEventUseCase {
  execute(request: IRecordInterviewIntegrityEventRequest): Promise<InterviewIntegrityEvent>;
}
