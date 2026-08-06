import { InterviewStatus } from '@domain/enums/InterviewStatus.enum';
import { InterviewType } from '@domain/enums/InterviewType.enum';


export class Interview {
  private _id: string;
  private _studentId: string;
  private _jobId: string;
  private _companyId: string;
  private _type: InterviewType;
  private _status: InterviewStatus;
  private _liveKitRoomName: string | null;
  private _scheduledAt: Date;
  private _startedAt: Date | null;
  private _completedAt: Date | null;
  private _createdAt: Date;

  constructor(props: {
    id: string;
    studentId: string;
    jobId: string;
    companyId: string;
    type: InterviewType;
    status: InterviewStatus;
    liveKitRoomName?: string | null;
    scheduledAt: Date;
    startedAt?: Date | null;
    completedAt?: Date | null;
    createdAt: Date;
  }) {
    this._id = props.id;
    this._studentId = props.studentId;
    this._jobId = props.jobId;
    this._companyId = props.companyId;
    this._type = props.type;
    this._status = props.status;
    this._liveKitRoomName = props.liveKitRoomName ?? null;
    this._scheduledAt = props.scheduledAt;
    this._startedAt = props.startedAt ?? null;
    this._completedAt = props.completedAt ?? null;
    this._createdAt = props.createdAt;
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  get id() { return this._id; }
  get studentId() { return this._studentId; }
  get jobId() { return this._jobId; }
  get companyId() { return this._companyId; }
  get type() { return this._type; }
  get status() { return this._status; }
  get liveKitRoomName() { return this._liveKitRoomName; }
  get scheduledAt() { return this._scheduledAt; }
  get startedAt() { return this._startedAt; }
  get completedAt() { return this._completedAt; }
  get createdAt() { return this._createdAt; }

  // ─── State Transition Methods ────────────────────────────────────────────────

  /** Student has arrived at the waiting room. */
  markAsWaiting(): void {
    this._assertStatus(InterviewStatus.SCHEDULED, 'markAsWaiting');
    this._status = InterviewStatus.WAITING;
  }

  /** System has created the LiveKit room and is loading AI context. */
  markAsPreparing(liveKitRoomName: string): void {
    this._assertStatus(InterviewStatus.WAITING, 'markAsPreparing');
    this._status = InterviewStatus.PREPARING;
    this._liveKitRoomName = liveKitRoomName;
  }

  /** AI Worker has joined the room. Interview is now live. */
  markAsInProgress(): void {
    this._assertStatus(InterviewStatus.PREPARING, 'markAsInProgress');
    this._status = InterviewStatus.IN_PROGRESS;
    this._startedAt = new Date();
  }

  /** Conversation has ended, report generation has begun. */
  markAsGenerating(): void {
    this._assertStatus(InterviewStatus.IN_PROGRESS, 'markAsGenerating');
    this._status = InterviewStatus.GENERATING;
  }

  /** Report is saved. Interview is fully complete. */
  markAsCompleted(): void {
    this._assertStatus(InterviewStatus.GENERATING, 'markAsCompleted');
    this._status = InterviewStatus.COMPLETED;
    this._completedAt = new Date();
  }

  /** HR or Student cancelled before completion. */
  cancel(): void {
    const cancellableStates = [InterviewStatus.SCHEDULED, InterviewStatus.WAITING];
    if (!cancellableStates.includes(this._status)) {
      throw new Error(`Cannot cancel an interview with status: ${this._status}`);
    }
    this._status = InterviewStatus.CANCELLED;
  }

  /** System marks as failed on an unrecoverable error. */
  markAsFailed(): void {
    this._status = InterviewStatus.FAILED;
  }

  /** Convenience: checks if the interview can currently be joined. */
  isJoinable(): boolean {
    return this._status === InterviewStatus.SCHEDULED;
  }

  toJSON() {
    return {
      id: this._id,
      studentId: this._studentId,
      jobId: this._jobId,
      companyId: this._companyId,
      type: this._type,
      status: this._status,
      liveKitRoomName: this._liveKitRoomName,
      scheduledAt: this._scheduledAt,
      startedAt: this._startedAt,
      completedAt: this._completedAt,
      createdAt: this._createdAt,
    };
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private _assertStatus(expected: InterviewStatus, callerMethod: string): void {
    if (this._status !== expected) {
      throw new Error(
        `[Interview.${callerMethod}] Invalid transition. ` +
        `Expected status "${expected}", but current status is "${this._status}".`
      );
    }
  }
}
