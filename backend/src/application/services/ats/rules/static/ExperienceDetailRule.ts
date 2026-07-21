import { Resume } from "@domain/entities/AI/resume.entity";
import { IAtsRule } from "../IAtsRule";
import { RuleResult, RuleStatus, AtsSection } from "../../types/ats.types";

export interface ExperienceMetadata {
    totalRoles: number;
    weakRoles: number;
}

export class ExperienceDetailRule implements IAtsRule {
    public readonly id = 'EXP_DETAIL';
    public readonly category = AtsSection.EXPERIENCE;
    public readonly dependencies = ['HAS_EXPERIENCE'];

    evaluate(resume: Resume): RuleResult<ExperienceMetadata> {
        const totalRoles = resume.experience.length;
        if (totalRoles === 0) {
             return { ruleId: this.id, status: RuleStatus.SKIPPED, feedback: 'No experience to evaluate.' };
        }

        let weakRoles = 0;
        resume.experience.forEach(exp => {
            if (exp.bulletPoints.length < 3) weakRoles++;
        });

        const status = weakRoles === 0 ? RuleStatus.PASS : (weakRoles < totalRoles ? RuleStatus.WARNING : RuleStatus.FAIL);

        return {
            ruleId: this.id,
            status,
            feedback: status === RuleStatus.PASS 
                ? 'All experience entries have sufficient detail.'
                : `${weakRoles} out of ${totalRoles} experience entries have fewer than 3 bullet points.`,
            metadata: { totalRoles, weakRoles }
        };
    }
}
