import { Resume } from "@domain/entities/AI/resume.entity";
import { IAtsRule } from "../IAtsRule";
import { RuleResult, RuleStatus, AtsSection } from "../../types/ats.types";
import { IAIService } from "@application/interfaces/IAIService";

export class GeminiAtsRule implements IAtsRule {
    public readonly id = 'AI_REVIEW';
    public readonly category = AtsSection.AI_ANALYSIS;
    public readonly dependencies: string[] = [];

    constructor(private readonly _aiService: IAIService) {}

    async evaluate(resume: Resume): Promise<RuleResult<string[]>> {
        try {
            const aiResult = await this._aiService.analyzeResume(resume);
            
            // Map the old IAtsAnalysisResult suggestions to the new string feedback
            const feedbackString = aiResult.suggestions
                .map(s => `[${s.type}] ${s.message}`)
                .join(" | ");

            // We can consider it a PASS if the AI gave an atsScore > 70
            const status = aiResult.atsScore >= 70 ? RuleStatus.PASS : RuleStatus.WARNING;

            // Send all the rich AI bullet points back as a single joined feedback string.
            // In a more advanced implementation, the AtsEngine could iterate over metadata to extract individual bullet points!
            const detailedFeedback = aiResult.suggestions.length > 0 
                ? aiResult.suggestions.map(s => s.message).join(" | ")
                : `AI Review complete. Score: ${aiResult.atsScore}/100.`;

            return {
                ruleId: this.id,
                status: status,
                feedback: detailedFeedback,
                metadata: aiResult.suggestions // store raw messages in metadata
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
