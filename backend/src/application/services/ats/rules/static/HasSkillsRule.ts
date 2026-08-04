import { Resume } from "@domain/entities/AI/resume.entity";
import { IAtsRule } from "../IAtsRule";
import { RuleResult, RuleStatus, AtsSection } from "../../types/ats.types";

export interface SkillsMetadata {
    totalSkills: number;
}

export class HasSkillsRule implements IAtsRule {
    public readonly id = 'HAS_SKILLS';
    public readonly category = AtsSection.SKILLS;
    public readonly dependencies = [];

    evaluate(resume: Resume): RuleResult<SkillsMetadata> {
        const totalSkills = resume.skills ? resume.skills.length : 0;
        
        if (totalSkills === 0) {
            return {
                ruleId: this.id,
                status: RuleStatus.FAIL,
                feedback: 'No technical or soft skills listed. List at least 5-10 key technical skills for ATS keyword matching.',
                metadata: { totalSkills: 0 }
            };
        }

        if (totalSkills < 5) {
            return {
                ruleId: this.id,
                status: RuleStatus.WARNING,
                feedback: `Only ${totalSkills} skill(s) listed. We recommend listing 8+ relevant technical skills, frameworks, and tools.`,
                metadata: { totalSkills }
            };
        }

        return {
            ruleId: this.id,
            status: RuleStatus.PASS,
            feedback: `Excellent skill coverage with ${totalSkills} technical skill(s) listed.`,
            metadata: { totalSkills }
        };
    }
}
