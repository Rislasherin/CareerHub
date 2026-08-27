import { IAIInterviewRepository } from '@domain/repositories/ai-interview/IAIInterviewRepository';
import { IInterviewIntegrityEventRepository } from '@domain/repositories/ai-interview/IInterviewIntegrityEventRepository';
import { IRecordInterviewIntegrityEventRequest, IRecordInterviewIntegrityEventUseCase } from '../interfaces/IRecordInterviewIntegrityEventUseCase';
import { InterviewIntegrityEvent } from '@domain/entities/ai-interview/InterviewIntegrityEvent';
import { AppError } from '@application/errors/AppError';
import { ErrorCode } from '@domain/enums/ErrorCodes.enum';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { Logger, LogCategory } from '../../../../infrastructure/logger/logger';

export class RecordInterviewIntegrityEventUseCase implements IRecordInterviewIntegrityEventUseCase {
  constructor(
    private readonly _aiInterviewRepository: IAIInterviewRepository,
    private readonly _interviewIntegrityEventRepository: IInterviewIntegrityEventRepository
  ) {}

  async execute(request: IRecordInterviewIntegrityEventRequest): Promise<InterviewIntegrityEvent> {
    const { sessionId, studentId, eventType, metadata } = request;

    // Validate the session exists and belongs to the student
    const session = await this._aiInterviewRepository.findById(sessionId);
    if (!session) {
      throw new AppError('Interview session not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    
    if (session.studentId !== studentId) {
      throw new AppError('Forbidden: Session does not belong to the requesting student.', HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    const event = InterviewIntegrityEvent.create({
      sessionId,
      studentId,
      eventType,
      timestamp: new Date(),
      metadata,
    });

    try {
      await this._interviewIntegrityEventRepository.save(event);
      Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_INTEGRITY] Event recorded: ${eventType} for session ${sessionId}`);
    } catch (err: unknown) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[INTERVIEW_INTEGRITY] Failed to record event: ${eventType} for session ${sessionId}`, err);
      // We do NOT want to throw an error here that would disrupt the student's interview.
      // The requirement says: "If the integrity API fails: The AI interview MUST continue normally."
      // Since this is the use case layer, we can throw so the controller returns a 500, but the frontend will catch it.
      // Or we can just succeed softly. We will throw so the controller handles it, but it doesn't break LiveKit.
      throw new AppError('Failed to record integrity event', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    return event;
  }
}
