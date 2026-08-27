import { HRDecisionAction } from '@domain/enums/HRDecisionAction.enum';

export interface IHRDecisionProps {
  action: HRDecisionAction;
  decisionNotes?: string;
  overriddenRecommendation: boolean;
  overrideReason?: string;
  decidedBy: string;
  decidedAt: Date;
}

export class HRDecision {
  private readonly _action: HRDecisionAction;
  private readonly _decisionNotes?: string;
  private readonly _overriddenRecommendation: boolean;
  private readonly _overrideReason?: string;
  private readonly _decidedBy: string;
  private readonly _decidedAt: Date;

  constructor(props: IHRDecisionProps) {
    if (!props.action) {
      throw new Error('[HRDecision] Action is required.');
    }
    if (!props.decidedBy || props.decidedBy.trim().length === 0) {
      throw new Error('[HRDecision] DecidedBy HR identifier is required.');
    }
    if (props.overriddenRecommendation && (!props.overrideReason || props.overrideReason.trim().length === 0)) {
      throw new Error('[HRDecision] An override reason must be provided when overriding the AI recommendation.');
    }

    this._action = props.action;
    this._decisionNotes = props.decisionNotes?.trim();
    this._overriddenRecommendation = props.overriddenRecommendation;
    this._overrideReason = props.overrideReason?.trim();
    this._decidedBy = props.decidedBy.trim();
    this._decidedAt = props.decidedAt || new Date();
  }

  get action(): HRDecisionAction { return this._action; }
  get decisionNotes(): string | undefined { return this._decisionNotes; }
  get overriddenRecommendation(): boolean { return this._overriddenRecommendation; }
  get overrideReason(): string | undefined { return this._overrideReason; }
  get decidedBy(): string { return this._decidedBy; }
  get decidedAt(): Date { return this._decidedAt; }

  toJSON(): IHRDecisionProps {
    return {
      action: this._action,
      decisionNotes: this._decisionNotes,
      overriddenRecommendation: this._overriddenRecommendation,
      overrideReason: this._overrideReason,
      decidedBy: this._decidedBy,
      decidedAt: this._decidedAt,
    };
  }
}
