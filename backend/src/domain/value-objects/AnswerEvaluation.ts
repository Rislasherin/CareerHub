import { AnswerQuality } from '../enums/AnswerQuality.enum';

export class AnswerEvaluation {
  private readonly _score: number;
  private readonly _quality: AnswerQuality;
  private readonly _feedback: string;
  private readonly _needsFollowUp: boolean;

  constructor(props: {
    score: number;
    quality: AnswerQuality;
    feedback: string;
    needsFollowUp: boolean;
  }) {
    if (props.score < 0 || props.score > 100) {
      throw new Error('Score must be between 0 and 100.');
    }
    const validQualities = Object.values(AnswerQuality);
    if (!validQualities.includes(props.quality)) {
      throw new Error(`Invalid quality: ${props.quality}`);
    }
    if (!props.feedback || props.feedback.trim() === '') {
      throw new Error('Feedback cannot be empty.');
    }

    this._score = props.score;
    this._quality = props.quality;
    this._feedback = props.feedback.trim();
    this._needsFollowUp = props.needsFollowUp;
  }

  get score() { return this._score; }
  get quality() { return this._quality; }
  get feedback() { return this._feedback; }
  get needsFollowUp() { return this._needsFollowUp; }
}
