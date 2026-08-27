import { IInterviewIntegrityEventRepository } from '@domain/repositories/ai-interview/IInterviewIntegrityEventRepository';
import { InterviewIntegrityEvent } from '@domain/entities/ai-interview/InterviewIntegrityEvent';
import { InterviewIntegrityEventModel, IInterviewIntegrityEventDocument } from '@infrastructure/database/models/InterviewIntegrityEvent';
import { InterviewIntegrityEventType } from '@domain/enums/InterviewIntegrityEventType.enum';

export class MongoInterviewIntegrityEventRepository implements IInterviewIntegrityEventRepository {
  
  private toEntity(doc: IInterviewIntegrityEventDocument): InterviewIntegrityEvent {
    return InterviewIntegrityEvent.create({
      id: doc._id.toString(),
      sessionId: doc.sessionId,
      studentId: doc.studentId,
      eventType: doc.eventType as InterviewIntegrityEventType,
      timestamp: doc.timestamp,
      metadata: doc.metadata,
    });
  }

  async save(event: InterviewIntegrityEvent): Promise<InterviewIntegrityEvent> {
    const data = event.toJSON();
    const doc = new InterviewIntegrityEventModel({
      sessionId: data.sessionId,
      studentId: data.studentId,
      eventType: data.eventType,
      timestamp: data.timestamp,
      metadata: data.metadata,
    });
    
    await doc.save();
    return this.toEntity(doc);
  }

  async findBySessionId(sessionId: string): Promise<InterviewIntegrityEvent[]> {
    const docs = await InterviewIntegrityEventModel.find({ sessionId }).sort({ timestamp: 1 }).exec();
    return docs.map(doc => this.toEntity(doc));
  }
}
