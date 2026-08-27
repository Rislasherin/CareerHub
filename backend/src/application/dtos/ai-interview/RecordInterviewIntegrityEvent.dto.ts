import { InterviewIntegrityEventType } from '@domain/enums/InterviewIntegrityEventType.enum';
import { IsEnum, IsObject, IsOptional } from 'class-validator';

export class RecordInterviewIntegrityEventDto {
  @IsEnum(InterviewIntegrityEventType, { message: 'Invalid event type.' })
  eventType!: InterviewIntegrityEventType;

  @IsOptional()
  @IsObject({ message: 'Metadata must be an object if provided.' })
  metadata?: Record<string, any>;
}
