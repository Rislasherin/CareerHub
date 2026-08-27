export interface IQuestionEvaluationAnalysisProps {
  questionId: string;
  questionText: string;
  candidateAnswer: string;
  score: number;
  feedback: string;
  evidence: string[];
  competencyCovered?: string;
}

export class QuestionEvaluationAnalysis {
  private readonly _questionId: string;
  private readonly _questionText: string;
  private readonly _candidateAnswer: string;
  private readonly _score: number;
  private readonly _feedback: string;
  private readonly _evidence: readonly string[];
  private readonly _competencyCovered?: string;

  constructor(props: IQuestionEvaluationAnalysisProps) {
    if (!props.questionId) {
      throw new Error('[QuestionEvaluationAnalysis] Question ID cannot be empty.');
    }
    if (typeof props.score !== 'number' || props.score < 0 || props.score > 100) {
      throw new Error(`[QuestionEvaluationAnalysis] Score must be between 0 and 100, got ${props.score}.`);
    }

    this._questionId = props.questionId;
    this._questionText = props.questionText || '';
    this._candidateAnswer = props.candidateAnswer || '';
    this._score = Math.round(props.score);
    this._feedback = props.feedback || '';
    this._evidence = Object.freeze([...(props.evidence || [])]);
    this._competencyCovered = props.competencyCovered;
  }

  get questionId(): string { return this._questionId; }
  get questionText(): string { return this._questionText; }
  get candidateAnswer(): string { return this._candidateAnswer; }
  get score(): number { return this._score; }
  get feedback(): string { return this._feedback; }
  get evidence(): readonly string[] { return this._evidence; }
  get competencyCovered(): string | undefined { return this._competencyCovered; }

  toJSON(): IQuestionEvaluationAnalysisProps {
    return {
      questionId: this._questionId,
      questionText: this._questionText,
      candidateAnswer: this._candidateAnswer,
      score: this._score,
      feedback: this._feedback,
      evidence: [...this._evidence],
      competencyCovered: this._competencyCovered,
    };
  }
}
