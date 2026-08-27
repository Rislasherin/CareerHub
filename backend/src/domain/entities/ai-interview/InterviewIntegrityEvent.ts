import { InterviewIntegrityEventType } from '@domain/enums/InterviewIntegrityEventType.enum';

export interface InterviewIntegrityEventProps {
  id?: string;
  sessionId: string;
  studentId: string;
  eventType: InterviewIntegrityEventType;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class InterviewIntegrityEvent {
  private props: InterviewIntegrityEventProps;

  private constructor(props: InterviewIntegrityEventProps) {
    this.props = props;
  }

  public static create(props: InterviewIntegrityEventProps): InterviewIntegrityEvent {
    return new InterviewIntegrityEvent({
      ...props,
      timestamp: props.timestamp || new Date(),
    });
  }

  get id(): string | undefined { return this.props.id; }
  get sessionId(): string { return this.props.sessionId; }
  get studentId(): string { return this.props.studentId; }
  get eventType(): InterviewIntegrityEventType { return this.props.eventType; }
  get timestamp(): Date { return this.props.timestamp; }
  get metadata(): Record<string, any> | undefined { return this.props.metadata; }

  public toJSON(): InterviewIntegrityEventProps {
    return { ...this.props };
  }
}
