import { InterviewType } from '../enums/InterviewType.enum';
import { InterviewDifficulty } from '../enums/InterviewDifficulty.enum';

export interface QuestionDistribution {
  technical?: number;
  behavioral?: number;
  hr?: number;
  custom?: number;
}

export interface InterviewConfigurationProps {
  types?: InterviewType[];
  selectedTypes?: InterviewType[];
  difficulty?: InterviewDifficulty;
  durationMinutes: number;

  skills?: string[];
  questionDistribution?: QuestionDistribution;
  customInstructions?: string[];
  prohibitedTopics?: string[];
  evaluationCriteria?: string[];
}

export class InterviewConfiguration {
  private readonly _types: InterviewType[];
  private readonly _difficulty: InterviewDifficulty;
  private readonly _durationMinutes: number;

  private readonly _skills: string[];
  private readonly _questionDistribution?: QuestionDistribution;
  private readonly _customInstructions: string[];
  private readonly _prohibitedTopics: string[];
  private readonly _evaluationCriteria: string[];

  constructor(props: InterviewConfigurationProps) {
    const rawTypes = props.selectedTypes || props.types;
    if (!rawTypes || rawTypes.length === 0) {
      throw new Error('[InterviewConfiguration] At least one InterviewType must be selected.');
    }

    // Check for duplicate types in input
    const typeSet = new Set<InterviewType>();
    for (const t of rawTypes) {
      if (typeSet.has(t)) {
        throw new Error(`[InterviewConfiguration] Duplicate interview type '${t}' is not allowed.`);
      }
      if (!Object.values(InterviewType).includes(t)) {
        throw new Error(`[InterviewConfiguration] Unsupported interview type '${t}'.`);
      }
      typeSet.add(t);
    }

    this._types = Array.from(typeSet);

    if (!props.durationMinutes || props.durationMinutes <= 0) {
      throw new Error('[InterviewConfiguration] durationMinutes must be greater than 0.');
    }


    this._difficulty = props.difficulty ?? InterviewDifficulty.MID;
    this._durationMinutes = props.durationMinutes;
    this._skills = (props.skills ?? []).map(s => s.trim()).filter(Boolean);
    this._customInstructions = (props.customInstructions ?? []).map(i => i.trim()).filter(Boolean);
    this._prohibitedTopics = (props.prohibitedTopics ?? []).map(p => p.trim()).filter(Boolean);
    this._evaluationCriteria = (props.evaluationCriteria ?? []).map(e => e.trim()).filter(Boolean);

    // Validate and normalize question distribution
    this._questionDistribution = this.validateAndNormalizeDistribution(this._types, props.questionDistribution);
  }

  private validateAndNormalizeDistribution(
    types: InterviewType[],
    dist?: QuestionDistribution
  ): QuestionDistribution | undefined {
    if (types.length === 1) {
      const singleType = types[0];
      const key = singleType.toLowerCase() as keyof QuestionDistribution;
      if (dist && dist[key] !== undefined && dist[key] !== 100) {
        throw new Error(`[InterviewConfiguration] Single-type interview (${singleType}) must have 100% distribution.`);
      }
      return { [key]: 100 } as QuestionDistribution;
    }

    // Multi-type interview
    if (!dist) {
      // Create equal default distribution that sums to 100
      const defaultDist: QuestionDistribution = {};
      const basePercentage = Math.floor(100 / types.length);
      let remainder = 100 - (basePercentage * types.length);

      types.forEach((t) => {
        const key = t.toLowerCase() as keyof QuestionDistribution;
        const extra = remainder > 0 ? 1 : 0;
        if (remainder > 0) remainder--;
        defaultDist[key] = basePercentage + extra;
      });
      return defaultDist;
    }

    // Verify unselected types have no distribution entries (> 0)
    const selectedKeySet = new Set(types.map(t => t.toLowerCase()));
    for (const [key, val] of Object.entries(dist)) {
      if (val !== undefined && val > 0 && !selectedKeySet.has(key)) {
        throw new Error(`[InterviewConfiguration] Unselected category '${key.toUpperCase()}' cannot have a question distribution percentage.`);
      }
    }

    // Verify all selected types have positive percentages
    let sum = 0;
    for (const t of types) {
      const key = t.toLowerCase() as keyof QuestionDistribution;
      const val = dist[key];
      if (val === undefined || typeof val !== 'number' || val <= 0) {
        throw new Error(`[InterviewConfiguration] Selected category '${t}' must have a positive distribution percentage (> 0).`);
      }
      sum += val;
    }

    if (Math.round(sum) !== 100) {
      throw new Error(`[InterviewConfiguration] Question distribution percentages must total exactly 100% (currently ${sum}%).`);
    }

    return dist;
  }

  get types(): ReadonlyArray<InterviewType> { return this._types; }
  get selectedTypes(): ReadonlyArray<InterviewType> { return this._types; }
  get primaryType(): InterviewType { return this._types[0]; }
  get isMixed(): boolean { return this._types.length > 1; }
  get difficulty(): InterviewDifficulty { return this._difficulty; }
  get durationMinutes(): number { return this._durationMinutes; }

  get skills(): ReadonlyArray<string> { return this._skills; }
  get questionDistribution(): QuestionDistribution | undefined { return this._questionDistribution; }
  get customInstructions(): ReadonlyArray<string> { return this._customInstructions; }
  get prohibitedTopics(): ReadonlyArray<string> { return this._prohibitedTopics; }
  get evaluationCriteria(): ReadonlyArray<string> { return this._evaluationCriteria; }

  /**
   * Deterministically allocates question counts per InterviewType using the Largest Remainder (Hamilton-Hare) method.
   * Guarantees that the sum of allocated questions equals totalQuestions exactly with zero rounding drift.
   */
  public static calculateQuestionAllocation(
    types: ReadonlyArray<InterviewType>,
    estimatedTotalQuestions: number,
    distribution?: QuestionDistribution
  ): Map<InterviewType, number> {
    const allocation = new Map<InterviewType, number>();

    if (types.length === 0 || estimatedTotalQuestions <= 0) {
      return allocation;
    }

    if (types.length === 1) {
      allocation.set(types[0], estimatedTotalQuestions);
      return allocation;
    }

    // Calculate percentage per type
    const percentages: Array<{ type: InterviewType; pct: number }> = types.map((t) => {
      const key = t.toLowerCase() as keyof QuestionDistribution;
      const pct = (distribution && distribution[key] !== undefined) ? distribution[key]! : (100 / types.length);
      return { type: t, pct };
    });

    // Largest Remainder allocation
    let allocatedTotal = 0;
    const remainders: Array<{ type: InterviewType; remainder: number }> = [];

    percentages.forEach(({ type, pct }) => {
      const raw = (estimatedTotalQuestions * pct) / 100;
      const count = Math.floor(raw);
      allocation.set(type, count);
      allocatedTotal += count;
      remainders.push({ type, remainder: raw - count });
    });

    // Sort by largest remainder descending
    remainders.sort((a, b) => b.remainder - a.remainder);

    let unallocated = estimatedTotalQuestions - allocatedTotal;
    let idx = 0;
    while (unallocated > 0) {
      const item = remainders[idx % remainders.length];
      allocation.set(item.type, (allocation.get(item.type) || 0) + 1);
      unallocated--;
      idx++;
    }

    // If estimatedTotalQuestions >= types.length, ensure every selected type receives at least 1 question
    if (estimatedTotalQuestions >= types.length) {
      for (const t of types) {
        if ((allocation.get(t) || 0) === 0) {
          // Borrow 1 from the type with highest count > 1
          const maxType = [...allocation.entries()].sort((a, b) => b[1] - a[1])[0];
          if (maxType && maxType[1] > 1) {
            allocation.set(maxType[0], maxType[1] - 1);
            allocation.set(t, 1);
          }
        }
      }
    }

    return allocation;
  }

  toJSON(): Record<string, unknown> {
    return {
      types: [...this._types],
      difficulty: this._difficulty,
      durationMinutes: this._durationMinutes,

      skills: [...this._skills],
      questionDistribution: this._questionDistribution ? { ...this._questionDistribution } : undefined,
      customInstructions: [...this._customInstructions],
      prohibitedTopics: [...this._prohibitedTopics],
      evaluationCriteria: [...this._evaluationCriteria],
    };
  }

  static createDefault(type: InterviewType = InterviewType.TECHNICAL, durationMinutes: number = 30): InterviewConfiguration {
    return new InterviewConfiguration({
      types: [type],
      difficulty: InterviewDifficulty.MID,
      durationMinutes,

      skills: [],
      customInstructions: [],
    });
  }
}
