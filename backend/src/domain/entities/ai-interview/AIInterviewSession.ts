// src/domain/entities/AIInterviewSession.ts
import { InterviewPhase } from '@domain/enums/InterviewPhase.enum';
import { InterviewQuestion, IInterviewQuestionReadOnly } from './InterviewQuestion';
import { AnswerEvaluation } from '@domain/value-objects/AnswerEvaluation';
import { InterviewConfiguration } from '@domain/value-objects/InterviewConfiguration';
import { InterviewPlan } from '@domain/value-objects/InterviewPlan';
import { InterviewType } from '@domain/enums/InterviewType.enum';

export class AIInterviewSession {
  private _id: string;
  private _interviewId: string;
  private _studentId: string;
  private _jobId?: string;
  private _phase: InterviewPhase;
  private _questions: InterviewQuestion[];
  private _startedAt?: Date;
  private _completedAt?: Date;

  private _currentTopic?: string;
  private _coveredTopics: string[];
  private _followUpCount: number;
  private readonly durationMinutes: number;
  private _configuration?: InterviewConfiguration;
  private _interviewPlan?: InterviewPlan;
  private _interviewContext?: string;

  constructor(props: {
    id: string;
    interviewId: string;
    studentId: string;
    jobId?: string;
    phase?: InterviewPhase;
    questions?: InterviewQuestion[];
    startedAt?: Date;
    completedAt?: Date;
    currentTopic?: string;
    coveredTopics?: string[];
    followUpCount?: number;
    durationMinutes: number;
    configuration?: InterviewConfiguration;
    interviewPlan?: InterviewPlan;
    interviewContext?: string;
  }) {
    this._id = props.id;
    this._interviewId = props.interviewId;
    this._studentId = props.studentId;
    this._jobId = props.jobId;
    this._phase = props.phase ?? InterviewPhase.NOT_STARTED;
    this._questions = props.questions ?? [];
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._currentTopic = props.currentTopic;
    this._coveredTopics = props.coveredTopics ?? [];
    this._followUpCount = props.followUpCount ?? 0;
    this.durationMinutes = props.durationMinutes;
    this._configuration = props.configuration;
    this._interviewPlan = props.interviewPlan;
    this._interviewContext = props.interviewContext;
  }

  get id() { return this._id; }
  get interviewId() { return this._interviewId; }
  get studentId() { return this._studentId; }
  get jobId() { return this._jobId; }
  get phase() { return this._phase; }
  get questions(): ReadonlyArray<IInterviewQuestionReadOnly> { return [...this._questions]; } // Protect array and entities

  get startedAt() { return this._startedAt; }
  get completedAt() { return this._completedAt; }
  get currentTopic() { return this._currentTopic; }
  get coveredTopics(): ReadonlyArray<string> { return [...this._coveredTopics]; }
  get followUpCount() { return this._followUpCount; }
  getDurationMinutes(): number { return this.durationMinutes; }
  get configuration(): InterviewConfiguration | undefined { return this._configuration; }
  get interviewPlan(): InterviewPlan | undefined { return this._interviewPlan; }
  get interviewContext(): string | undefined { return this._interviewContext; }

  // ─── Domain Behavior & State Transitions ──────────────────────────────

  startIntro(): void {
    this._assertPhase(InterviewPhase.NOT_STARTED, 'startIntro');
    this._phase = InterviewPhase.INTRO;
    this._startedAt = new Date();
  }

  moveToQuestion(question: InterviewQuestion, topic?: string, category?: InterviewType): void {
    const validPrevPhases = [
      InterviewPhase.INTRO,
      InterviewPhase.EVALUATING, // Moving to next main question after evaluating the last
    ];
    if (!validPrevPhases.includes(this._phase)) {
      throw new Error(`Cannot move to question from phase ${this._phase}`);
    }
    this._questions.push(question);
    this._phase = InterviewPhase.ASKING_QUESTION;
    this._followUpCount = 0; // Reset follow-ups when moving to a new main question
    
    if (topic) {
      this._currentTopic = topic;
      if (!this._coveredTopics.includes(topic)) {
        this._coveredTopics.push(topic);
      }
    }

    if (this._interviewPlan && (category || topic)) {
      this._interviewPlan.recordQuestionAsked(category || InterviewType.TECHNICAL, topic || "General");
    }
  }

  recordAnswer(questionId: string, answer: string): void {
    const validPhases = [InterviewPhase.ASKING_QUESTION, InterviewPhase.ASKING_FOLLOW_UP];
    if (!validPhases.includes(this._phase)) {
      throw new Error(`Cannot record answer in phase ${this._phase}`);
    }
    const question = this._findQuestion(questionId);
    if (question.candidateAnswer) {
      throw new Error(`[AIInterviewSession.recordAnswer] Answer already recorded for question ${questionId}.`);
    }
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
    this._followUpCount += 1;
  }

  closeInterview(): void {
    // You can close after evaluating the final question
    this._assertPhase(InterviewPhase.EVALUATING, 'closeInterview');
    this._phase = InterviewPhase.CLOSING;
  }

  markAsCompleted(): void {
    const validPhases = [InterviewPhase.CLOSING, InterviewPhase.ASKING_QUESTION, InterviewPhase.ASKING_FOLLOW_UP, InterviewPhase.EVALUATING];
    if (!validPhases.includes(this._phase) && this._phase !== InterviewPhase.COMPLETED) {
      throw new Error(`[AIInterviewSession.markAsCompleted] Invalid transition. Expected CLOSING or active phase, got ${this._phase}.`);
    }
    if (this._phase === InterviewPhase.COMPLETED) {
      return; // Idempotent
    }
    this._phase = InterviewPhase.COMPLETED;
    this._completedAt = new Date();
  }

  forceCloseDueToTimeout(): void {
    const invalidPhases = [InterviewPhase.NOT_STARTED, InterviewPhase.COMPLETED];
    if (invalidPhases.includes(this._phase)) {
      if (this._phase === InterviewPhase.COMPLETED) return; // Idempotent
      throw new Error(`[AIInterviewSession.forceCloseDueToTimeout] Cannot force close from phase ${this._phase}.`);
    }
    this._phase = InterviewPhase.COMPLETED;
    this._completedAt = new Date();
  }

    evaluateQuestion(questionId: string, evaluation: AnswerEvaluation): void {
    const validPhases = [InterviewPhase.EVALUATING, InterviewPhase.ASKING_QUESTION, InterviewPhase.ASKING_FOLLOW_UP, InterviewPhase.CLOSING, InterviewPhase.COMPLETED];
    if (!validPhases.includes(this._phase)) {
      throw new Error(`[AIInterviewSession.evaluateQuestion] Invalid transition. Expected EVALUATING, ASKING_QUESTION, or ASKING_FOLLOW_UP, got ${this._phase}.`);
    }
    const question = this._findQuestion(questionId);
    
    // Idempotency guard: Ignore if already evaluated
    if (question.evaluation) {
       return;
    }
    
    question.attachEvaluation(evaluation);
  }

  calculateFinalResult(): FinalInterviewResult {
    const evaluatedQuestions = this._questions.filter(q => q.evaluation !== undefined);
    
    if (evaluatedQuestions.length === 0) {
      return {
        sessionId: this._id,
        interviewId: this._interviewId,
        studentId: this._studentId,
        overallScore: 0,
        categoryScores: {},
        evaluatedQuestionCount: 0,
        totalQuestions: this._questions.length,
        strengths: [],
        weaknesses: ["No evaluated answers found for this session."],
        recommendation: 'NO_HIRE',
        completedAt: this._completedAt
      };
    }

    const categorySums: Record<string, { total: number; count: number }> = {};
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const q of evaluatedQuestions) {
      const evalItem = q.evaluation!;
      const cat = q.context || "General";
      
      if (!categorySums[cat]) {
        categorySums[cat] = { total: 0, count: 0 };
      }
      categorySums[cat].total += evalItem.score;
      categorySums[cat].count += 1;

      if (evalItem.score >= 75) {
        if (evalItem.feedback && !strengths.includes(evalItem.feedback)) {
          strengths.push(evalItem.feedback);
        }
      } else if (evalItem.score < 65) {
        if (evalItem.feedback && !weaknesses.includes(evalItem.feedback)) {
          weaknesses.push(evalItem.feedback);
        }
      }
    }

    const categoryScores: Record<string, number> = {};
    let weightedScoreSum = 0;
    let totalEvalCount = 0;

    for (const [cat, data] of Object.entries(categorySums)) {
      const avg = Math.round(data.total / data.count);
      categoryScores[cat] = avg;
      weightedScoreSum += data.total;
      totalEvalCount += data.count;
    }

    const overallScore = totalEvalCount > 0 ? Math.round(weightedScoreSum / totalEvalCount) : 0;

    let recommendation: 'STRONG_HIRE' | 'HIRE' | 'NEEDS_REVIEW' | 'NO_HIRE';
    if (overallScore >= 85) {
      recommendation = 'STRONG_HIRE';
    } else if (overallScore >= 70) {
      recommendation = 'HIRE';
    } else if (overallScore >= 55) {
      recommendation = 'NEEDS_REVIEW';
    } else {
      recommendation = 'NO_HIRE';
    }

    return {
      sessionId: this._id,
      interviewId: this._interviewId,
      studentId: this._studentId,
      overallScore,
      categoryScores,
      evaluatedQuestionCount: evaluatedQuestions.length,
      totalQuestions: this._questions.length,
      strengths: strengths.slice(0, 5),
      weaknesses: weaknesses.slice(0, 5),
      recommendation,
      completedAt: this._completedAt
    };
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

export interface FinalInterviewResult {
  sessionId: string;
  interviewId: string;
  studentId: string;
  overallScore: number;
  categoryScores: Record<string, number>;
  evaluatedQuestionCount: number;
  totalQuestions: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'NEEDS_REVIEW' | 'NO_HIRE';
  completedAt?: Date;
}
