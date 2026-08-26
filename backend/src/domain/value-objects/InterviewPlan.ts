import { InterviewType } from '../enums/InterviewType.enum';

export interface InterviewPlanItem {
  category: InterviewType;
  skillOrTopic: string;
  targetQuestions: number;
  questionsAsked: number;
}

export class InterviewPlan {
  private readonly _items: InterviewPlanItem[];

  constructor(items: InterviewPlanItem[]) {
    this._items = items.map(item => ({
      category: item.category,
      skillOrTopic: item.skillOrTopic,
      targetQuestions: Math.max(1, item.targetQuestions),
      questionsAsked: Math.max(0, item.questionsAsked ?? 0),
    }));
  }

  get items(): ReadonlyArray<InterviewPlanItem> {
    return this._items;
  }

  getNextItem(): InterviewPlanItem | null {
    // 1. Return next item that hasn't reached its target questions
    const pending = this._items.find(item => item.questionsAsked < item.targetQuestions);
    if (pending) return pending;

    // 2. If all items have reached target, return null to indicate plan target completion
    return null;
  }

  recordQuestionAsked(category?: InterviewType, skillOrTopic?: string): void {
    let item: InterviewPlanItem | undefined;
    if (category && skillOrTopic) {
      item = this._items.find(
        i => i.category === category && i.skillOrTopic.toLowerCase() === skillOrTopic.toLowerCase() && i.questionsAsked < i.targetQuestions
      ) || this._items.find(
        i => i.category === category && i.skillOrTopic.toLowerCase() === skillOrTopic.toLowerCase()
      );
    }

    if (!item && category) {
      item = this._items.find(i => i.category === category && i.questionsAsked < i.targetQuestions)
        || this._items.find(i => i.category === category);
    }

    if (!item) {
      item = this._items.find(i => i.questionsAsked < i.targetQuestions) || this._items[0];
    }

    if (item) {
      item.questionsAsked += 1;
    }
  }

  isComplete(): boolean {
    if (this._items.length === 0) return true;
    return this._items.every(item => item.questionsAsked >= item.targetQuestions);
  }

  getTotalTargetQuestions(): number {
    return this._items.reduce((sum, item) => sum + item.targetQuestions, 0);
  }

  getTotalQuestionsAsked(): number {
    return this._items.reduce((sum, item) => sum + item.questionsAsked, 0);
  }

  toJSON(): Array<Record<string, unknown>> {
    return this._items.map(item => ({
      category: item.category,
      skillOrTopic: item.skillOrTopic,
      targetQuestions: item.targetQuestions,
      questionsAsked: item.questionsAsked,
    }));
  }
}
