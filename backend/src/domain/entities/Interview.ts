import { InterviewStatus } from "../enums/InterviewStatus.enum";
import { InterviewType } from "../enums/InterviewType.enum";
import { RecommendationEnum } from "@domain/enums/Recommendation.enum";

export interface InterviewFeedback {
  dsaScore?: number;
  dsaNotes?: string;
  codingScore?: number;
  codingNotes?: string;
  systemDesignScore?: number;
  systemDesignNotes?: string;
  problemSolvingScore?: number;
  problemSolvingNotes?: string;
  strengths?: string;
  weaknesses?: string;
  hrNotes?: string;
  recommendedAction?: RecommendationEnum;
}

export interface RescheduleRequest {
  reason: string;
  preferredDate: Date;
  preferredTime: string;
  noteToHr?: string;
  requestedAt: Date;
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
  roundNumber: number;
  status: InterviewStatus;
  scheduledAt: Date;
  durationMinutes: number;
  meetingLink?: string;
  feedback?: InterviewFeedback;
  rescheduleRequest?: RescheduleRequest;
  cancellationReason?: string;
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
  get roundNumber(): number { return this._props.roundNumber; }
  get status(): InterviewStatus { return this._props.status; }
  get scheduledAt(): Date { return this._props.scheduledAt; }
  get durationMinutes(): number { return this._props.durationMinutes; }
  get meetingLink(): string | undefined { return this._props.meetingLink; }
  get feedback(): InterviewFeedback | undefined { return this._props.feedback; }
  get rescheduleRequest(): RescheduleRequest | undefined { return this._props.rescheduleRequest; }
  get cancellationReason(): string | undefined { return this._props.cancellationReason; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  

  submitFeedback(feedback: InterviewFeedback): void {
    if (this._props.status !== InterviewStatus.SCHEDULED) {
      throw new Error("Cannot submit feedback for an interview that is not scheduled.");
    }
    this._props.feedback = feedback;
    this._props.status = InterviewStatus.COMPLETED;
  }

  requestReschedule(request: Omit<RescheduleRequest, 'requestedAt'>): void {
    this._props.rescheduleRequest = {
      ...request,
      requestedAt: new Date()
    };
    this._props.status = InterviewStatus.RESCHEDULE_REQUESTED;
  }

  resolveReschedule(approve: boolean, newDate?: Date, newTime?: string): void {
    if (this._props.status !== InterviewStatus.RESCHEDULE_REQUESTED) {
      throw new Error("No pending reschedule request found.");
    }
    
    if (approve) {
      if (!newDate) throw new Error("New date must be provided when approving a reschedule.");
      this._props.scheduledAt = newDate;
      this._props.status = InterviewStatus.SCHEDULED;
    } else {
      // If rejected, it stays at the old scheduled date, or gets cancelled based on HR action
      // Standard behavior: returns to SCHEDULED at old time, HR handles communication
      this._props.status = InterviewStatus.SCHEDULED;
    }
    
    // Clear the request after resolving
    this._props.rescheduleRequest = undefined;
  }

  // Interviewer requests cancellation — goes to HR for approval
  requestCancellation(reason: string): void {
    if (this._props.status !== InterviewStatus.SCHEDULED) {
      throw new Error("Only scheduled interviews can request cancellation.");
    }
    this._props.status = InterviewStatus.CANCELLATION_REQUESTED;
    this._props.cancellationReason = reason;
  }

  // HR approves the cancellation
  approveCancellation(): void {
    this._props.status = InterviewStatus.CANCELLED;
  }

  toJSON(): InterviewProps {
    return { ...this._props };
  }
}
