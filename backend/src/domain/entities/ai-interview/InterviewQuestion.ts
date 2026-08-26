import { QuestionType } from '../../enums/QuestionType.enum';
import { InterviewType } from '../../enums/InterviewType.enum';
import { AnswerEvaluation } from '../../value-objects/AnswerEvaluation';

export interface IInterviewQuestionReadOnly {
  get id(): string;
  get text(): string;
  get type(): QuestionType;
  get context(): string | undefined;
  get category(): InterviewType | undefined;
  get candidateAnswer(): string | undefined;
  get evaluation(): AnswerEvaluation | undefined;
}

export class InterviewQuestion implements IInterviewQuestionReadOnly {
  private _id: string;
  private _text: string;
  private _type: QuestionType;
  private _context?: string;
  private _category?: InterviewType;
  private _candidateAnswer?: string;
  private _evaluation?: AnswerEvaluation;

  constructor(props: {
    id: string;
    text: string;
    type: QuestionType;
    context?: string;
    category?: InterviewType;
    candidateAnswer?: string;
    evaluation?: AnswerEvaluation;
  }) {
    this._id = props.id;
    this._text = props.text;
    this._type = props.type;
    this._context = props.context;
    this._category = props.category;
    this._candidateAnswer = props.candidateAnswer;
    this._evaluation = props.evaluation;
  }

  get id() { return this._id; }
  get text() { return this._text; }
  get type() { return this._type; }
  get context() { return this._context; }
  get category() { return this._category; }
  get candidateAnswer() { return this._candidateAnswer; }
  get evaluation() { return this._evaluation; }

  recordAnswer(answer: string): void {
    if (this._evaluation) {
      throw new Error('Cannot change answer after evaluation is complete.');
    }
    if (!answer || answer.trim() === '') {
      throw new Error('Answer cannot be empty.');
    }
    this._candidateAnswer = answer.trim();
  }

  attachEvaluation(evaluation: AnswerEvaluation): void {
    if (!this._candidateAnswer) {
      throw new Error('Cannot evaluate a question without an answer.');
    }
    if (this._evaluation) {
      throw new Error('Question has already been evaluated.');
    }
    this._evaluation = evaluation;
  }
}
