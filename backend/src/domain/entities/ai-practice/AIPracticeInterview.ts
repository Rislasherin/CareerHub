import { PracticeDifficulty } from "../../enums/PracticeDifficulty.enum";
import { PracticeInterviewStatus } from "../../enums/PracticeInterviewStatus.enum";

export interface PracticeFeedback {
  overallScore: number;
  strengths: string[];
  weakAreas: string[];
  improvementSuggestions: string[];
  topicFeedback: { topic: string; score: number; observations: string }[];
}

export interface AIPracticeQuestion {
  id: string;
  text: string;
  topic: string;
  isFollowUp?: boolean;
  parentQuestionId?: string;
  candidateAnswer?: string;
  score?: number;
  feedback?: string;
  createdAt: Date;
  answeredAt?: Date;
}

export interface AIPracticeInterviewProps {
  id?: string;
  studentId: string;
  difficulty: PracticeDifficulty;
  topics: string[];
  durationMinutes?: number; // New for phase 5
  startedAt?: Date; // New for phase 5
  completedAt?: Date; // New for phase 5
  finalFeedback?: PracticeFeedback;
  status: PracticeInterviewStatus;
  questions: AIPracticeQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class AIPracticeInterview {
  private readonly _id?: string;
  private readonly _studentId: string;
  private _difficulty: PracticeDifficulty;
  private _topics: string[];
  private _status: PracticeInterviewStatus;
  private _questions: AIPracticeQuestion[];
  private _durationMinutes?: number;
  private _startedAt?: Date;
  private _completedAt?: Date;
  private _finalFeedback?: PracticeFeedback;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(props: AIPracticeInterviewProps) {
    this._id = props.id;
    this._studentId = props.studentId;
    this._difficulty = props.difficulty;
    this._topics = props.topics;
    this._status = props.status;
    this._questions = props.questions || [];
    this._durationMinutes = props.durationMinutes;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._finalFeedback = props.finalFeedback;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: Omit<AIPracticeInterviewProps, "status" | "questions" | "createdAt" | "updatedAt">): AIPracticeInterview {
    return new AIPracticeInterview({
      ...props,
      status: PracticeInterviewStatus.CREATED,
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  get id(): string | undefined {
    return this._id;
  }

  get studentId(): string {
    return this._studentId;
  }

  get difficulty(): PracticeDifficulty {
    return this._difficulty;
  }

  get topics(): string[] {
    return this._topics;
  }

  get status(): PracticeInterviewStatus {
    return this._status;
  }

  // Return a read-only list of questions to enforce encapsulation
  get questions(): ReadonlyArray<AIPracticeQuestion> {
    return this._questions;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  get durationMinutes(): number | undefined {
    return this._durationMinutes;
  }

  get startedAt(): Date | undefined {
    return this._startedAt;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  get finalFeedback(): PracticeFeedback | undefined {
    return this._finalFeedback;
  }

  public getTimeRemainingMs(): number {
    if (!this._startedAt || !this._durationMinutes) {
      return 1000 * 60 * 15; // default 15 min if not set
    }
    const elapsedMs = Date.now() - this._startedAt.getTime();
    const durationMs = this._durationMinutes * 60 * 1000;
    return Math.max(0, durationMs - elapsedMs);
  }

  public isTimeExpired(): boolean {
    if (!this._startedAt || !this._durationMinutes) return false;
    return this.getTimeRemainingMs() <= 0;
  }

  public start(): void {
    if (this._status !== PracticeInterviewStatus.CREATED) {
      throw new Error(`Cannot start session in state: ${this._status}`);
    }
    this._status = PracticeInterviewStatus.IN_PROGRESS;
    this._startedAt = new Date();
    this._updatedAt = new Date();
  }

  public addQuestion(id: string, text: string, topic: string, isFollowUp: boolean = false, parentQuestionId?: string): void {
    if (this._status !== PracticeInterviewStatus.IN_PROGRESS) {
      throw new Error("Cannot add question when session is not active");
    }
    this._questions.push({
      id,
      text,
      topic,
      isFollowUp,
      parentQuestionId,
      createdAt: new Date()
    });
    this._updatedAt = new Date();
  }

  public recordAnswer(questionId: string, answer: string): void {
    if (this._status !== PracticeInterviewStatus.IN_PROGRESS) {
      throw new Error("Cannot submit answer when session is not active");
    }

    const question = this._questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found in this practice session`);
    }

    if (question.candidateAnswer !== undefined) {
      throw new Error(`Answer has already been recorded for question ${questionId}`);
    }

    question.candidateAnswer = answer;
    question.answeredAt = new Date();
    this._updatedAt = new Date();
  }

  public attachEvaluation(questionId: string, score: number, feedback: string): void {
    const question = this._questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found in this practice session`);
    }

    question.score = score;
    question.feedback = feedback;
    this._updatedAt = new Date();
  }

  public complete(feedback?: PracticeFeedback): void {
    if (this._status === PracticeInterviewStatus.COMPLETED) {
      return; // Idempotent: already completed
    }
    if (this._status !== PracticeInterviewStatus.IN_PROGRESS) {
      throw new Error(`Cannot complete session in state: ${this._status}`);
    }
    this._status = PracticeInterviewStatus.COMPLETED;
    this._completedAt = new Date();
    if (feedback) {
      this._finalFeedback = feedback;
    }
    this._updatedAt = new Date();
  }

  public attachFinalFeedback(feedback: PracticeFeedback): void {
    if (this._status !== PracticeInterviewStatus.COMPLETED) {
      throw new Error(`Cannot attach feedback to uncompleted session`);
    }
    this._finalFeedback = feedback;
    this._updatedAt = new Date();
  }

  public abandon(): void {
    if (this._status !== PracticeInterviewStatus.IN_PROGRESS && this._status !== PracticeInterviewStatus.CREATED) {
      throw new Error(`Cannot abandon session in state: ${this._status}`);
    }
    this._status = PracticeInterviewStatus.ABANDONED;
    this._updatedAt = new Date();
  }
}
