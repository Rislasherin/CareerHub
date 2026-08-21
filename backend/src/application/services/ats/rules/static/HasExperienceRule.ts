import { Resume } from "@domain/entities/resume.entity";
import { IAtsRule } from "../IAtsRule";
import { RuleResult, RuleStatus, AtsSection } from "../../types/ats.types";

export interface ExperiencePresenceMetadata {
    hasExperience: boolean;
    totalEntries: number;
}

export class HasExperienceRule implements IAtsRule {
    public readonly id = 'HAS_EXPERIENCE';
    public readonly category = AtsSection.EXPERIENCE;
    public readonly dependencies: string[] = [];

    evaluate(resume: Resume): RuleResult<ExperiencePresenceMetadata> {
        const totalEntries = resume.experience.length;
        const hasExperience = totalEntries > 0;

        return {
            ruleId: this.id,
            status: hasExperience ? RuleStatus.PASS : RuleStatus.FAIL,
            feedback: hasExperience
                ? 'Contains work experience section.'
                : 'Missing work experience section. Add relevant internships or jobs.',
            metadata: { hasExperience, totalEntries }
        };
    }
}
