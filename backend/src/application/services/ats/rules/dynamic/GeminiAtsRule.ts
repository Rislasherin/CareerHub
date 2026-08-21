//Situation, Task, Action, Result
import { Resume } from "@domain/entities/resume.entity";
import { IAtsRule } from "../IAtsRule";
import { RuleResult, RuleStatus, AtsSection } from "../../types/ats.types";
import { IAIService } from "@application/interfaces/IAIService";

export class GeminiAtsRule implements IAtsRule {
    public readonly id = 'AI_REVIEW';
    public readonly category = AtsSection.AI_ANALYSIS;
    public readonly dependencies: string[] = [];

    constructor(private readonly _aiService: IAIService) { }

    async evaluate(resume: Resume): Promise<RuleResult<string[]>> {
        try {
            const aiResult = await this._aiService.analyzeResume(resume);

            // turn the suggestions into a single feedback string
            const feedbackString = aiResult.suggestions
                .map(s => `[${s.type}] ${s.message}`)
                .join(" | ");

            // score above 70 = pass, below that = warning
            const status = aiResult.atsScore >= 70 ? RuleStatus.PASS : RuleStatus.WARNING;

            // build the full feedback string from all suggestions
            const detailedFeedback = aiResult.suggestions.length > 0
                ? aiResult.suggestions.map(s => s.message).join(" | ")
                : `AI Review complete. Score: ${aiResult.atsScore}/100.`;

            return {
                ruleId: this.id,
                status: status,
                feedback: detailedFeedback,
                metadata: aiResult.suggestions.map(s => `[${s.type}] ${s.message}`)
            };
        } catch (error) {
            return {
                ruleId: this.id,
                status: RuleStatus.SKIPPED,
                feedback: 'AI Analysis failed or timed out.',
            };
        }
    }
}
