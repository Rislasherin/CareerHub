export type CompetencyStatus = 'EVALUATED' | 'INSUFFICIENT_EVIDENCE';

export interface ICompetencyEvaluationProps {
  name: string;
  category: string;
  score: number | null;
  status: CompetencyStatus;
  explanation: string;
  evidence: string[];
}

export class CompetencyEvaluation {
  private readonly _name: string;
  private readonly _category: string;
  private readonly _score: number | null;
  private readonly _status: CompetencyStatus;
  private readonly _explanation: string;
  private readonly _evidence: readonly string[];

  constructor(props: ICompetencyEvaluationProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('[CompetencyEvaluation] Name cannot be empty.');
    }
    if (!props.category || props.category.trim().length === 0) {
      throw new Error('[CompetencyEvaluation] Category cannot be empty.');
    }
    if (props.status === 'EVALUATED') {
      if (props.score === null || typeof props.score !== 'number' || props.score < 0 || props.score > 100) {
        throw new Error(`[CompetencyEvaluation] Evaluated competency "${props.name}" must have score between 0 and 100.`);
      }
    } else {
      if (props.score !== null) {
        throw new Error(`[CompetencyEvaluation] Insufficient evidence competency "${props.name}" must have null score.`);
      }
    }

    this._name = props.name.trim();
    this._category = props.category.trim();
    this._score = props.score !== null ? Math.round(props.score) : null;
    this._status = props.status;
    this._explanation = props.explanation || 'No explanation provided.';
    this._evidence = Object.freeze([...(props.evidence || [])]);
  }

  get name(): string { return this._name; }
  get category(): string { return this._category; }
  get score(): number | null { return this._score; }
  get status(): CompetencyStatus { return this._status; }
  get explanation(): string { return this._explanation; }
  get evidence(): readonly string[] { return this._evidence; }

  toJSON(): ICompetencyEvaluationProps {
    return {
      name: this._name,
      category: this._category,
      score: this._score,
      status: this._status,
      explanation: this._explanation,
      evidence: [...this._evidence],
    };
  }
}
