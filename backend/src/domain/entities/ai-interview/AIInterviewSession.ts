// src/domain/entities/AIInterviewSession.ts
import { InterviewPhase } from '@domain/enums/InterviewPhase.enum';
import { InterviewQuestion, IInterviewQuestionReadOnly } from './InterviewQuestion';

export class AIInterviewSession {
  private _id: string;
  private _interviewId: string;
  private _studentId: string;
  private _phase: InterviewPhase;
  private _questions: InterviewQuestion[];
  private _startedAt?: Date;
  private _completedAt?: Date;

  constructor(props: {
    id: string;
    interviewId: string;
    studentId: string;
    phase?: InterviewPhase;
    questions?: InterviewQuestion[];
    startedAt?: Date;
    completedAt?: Date;
  }) {
    this._id = props.id;
    this._interviewId = props.interviewId;
    this._studentId = props.studentId;
    this._phase = props.phase ?? InterviewPhase.NOT_STARTED;
    this._questions = props.questions ?? [];
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
  }

  get id() { return this._id; }
  get interviewId() { return this._interviewId; }
  get studentId() { return this._studentId; }
  get phase() { return this._phase; }
  get questions(): ReadonlyArray<IInterviewQuestionReadOnly> { return [...this._questions]; } // Protect array and entities

  get startedAt() { return this._startedAt; }
  get completedAt() { return this._completedAt; }

  // ─── Domain Behavior & State Transitions ──────────────────────────────

  startIntro(): void {
    this._assertPhase(InterviewPhase.NOT_STARTED, 'startIntro');
    this._phase = InterviewPhase.INTRO;
    this._startedAt = new Date();
  }

  moveToQuestion(question: InterviewQuestion): void {
    const validPrevPhases = [
      InterviewPhase.INTRO,
      InterviewPhase.EVALUATING, // Moving to next main question after evaluating the last
    ];
    if (!validPrevPhases.includes(this._phase)) {
      throw new Error(`Cannot move to question from phase ${this._phase}`);
    }
    this._questions.push(question);
    this._phase = InterviewPhase.ASKING_QUESTION;
  }

  recordAnswer(questionId: string, answer: string): void {
    const validPhases = [InterviewPhase.ASKING_QUESTION, InterviewPhase.ASKING_FOLLOW_UP];
    if (!validPhases.includes(this._phase)) {
      throw new Error(`Cannot record answer in phase ${this._phase}`);
    }
    const question = this._findQuestion(questionId);
    question.recordAnswer(answer);
  }

  startEvaluation(): void {
    const validPhases = [InterviewPhase.ASKING_QUESTION, InterviewPhase.ASKING_FOLLOW_UP];
    if (!validPhases.includes(this._phase)) {
      throw new Error(`Cannot start evaluation from phase ${this._phase}`);
    }
    this._phase = InterviewPhase.EVALUATING;
  }

  requestFollowUp(question: InterviewQuestion): void {
    this._assertPhase(InterviewPhase.EVALUATING, 'requestFollowUp');
    this._questions.push(question);
    this._phase = InterviewPhase.ASKING_FOLLOW_UP;
  }

  closeInterview(): void {
    // You can close after evaluating the final question
    this._assertPhase(InterviewPhase.EVALUATING, 'closeInterview');
    this._phase = InterviewPhase.CLOSING;
  }

  markAsCompleted(): void {
    this._assertPhase(InterviewPhase.CLOSING, 'markAsCompleted');
    this._phase = InterviewPhase.COMPLETED;
    this._completedAt = new Date();
  }

  // ─── Private Helpers ────────────────────────────────────────────────

  private _assertPhase(expected: InterviewPhase, method: string): void {
    if (this._phase !== expected) {
      throw new Error(`[AIInterviewSession.${method}] Invalid transition. Expected ${expected}, got ${this._phase}.`);
    }
  }

  private _findQuestion(id: string): InterviewQuestion {
    const q = this._questions.find((q) => q.id === id);
    if (!q) throw new Error(`Question ${id} not found in session.`);
    return q;
  }
}
