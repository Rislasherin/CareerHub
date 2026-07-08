import { InterviewStatus } from "../enums/InterviewStatus.enum";
import { InterviewType } from "../enums/InterviewType.enum";

export interface InterviewFeedback {
  technicalScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  finalRemarks?: string;
  recommendedAction?: 'HIRE' | 'NEXT_ROUND' | 'HOLD' | 'REJECT';
}

export interface InterviewProps {
  id?: string;
  jobId: string;
  applicationId: string;
  studentId: string;
  companyId: string;
  interviewerId: string;
  title: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: Date;
  durationMinutes: number;
  meetingLink?: string;
  feedback?: InterviewFeedback;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Interview {
  constructor(private readonly _props: InterviewProps) {}

  static create(props: InterviewProps): Interview {
    return new Interview(props);
  }

  get id(): string | undefined { return this._props.id; }
  get jobId(): string { return this._props.jobId; }
  get applicationId(): string { return this._props.applicationId; }
  get studentId(): string { return this._props.studentId; }
  get companyId(): string { return this._props.companyId; }
  get interviewerId(): string { return this._props.interviewerId; }
  get title(): string { return this._props.title; }
  get type(): InterviewType { return this._props.type; }
  get status(): InterviewStatus { return this._props.status; }
  get scheduledAt(): Date { return this._props.scheduledAt; }
  get durationMinutes(): number { return this._props.durationMinutes; }
  get meetingLink(): string | undefined { return this._props.meetingLink; }
  get feedback(): InterviewFeedback | undefined { return this._props.feedback; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  submitFeedback(feedback: InterviewFeedback): void {
    if (this._props.status !== InterviewStatus.SCHEDULED) {
      throw new Error("Cannot submit feedback for an interview that is not scheduled.");
    }
    this._props.feedback = feedback;
    this._props.status = InterviewStatus.COMPLETED;
  }

  cancel(): void {
    this._props.status = InterviewStatus.CANCELLED;
  }

  toJSON(): InterviewProps {
    return { ...this._props };
  }
}
