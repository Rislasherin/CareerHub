import { Resume } from "@domain/entities/AI/resume.entity";
import { IAtsRule, RuleResult } from "../interfaces/IRule";


export class ExperienceDetailRule implements IAtsRule {
    evaluate(resume: Resume): RuleResult {
        let weakExperiences = 0;
        resume.experience.forEach(exp => {
            if (exp.bulletPoints.length < 3) weakExperiences++;
        });

        const passed = weakExperiences === 0;
        return {
            section: 'Experience',
            scorePassed: passed ? 15 : Math.max(0, 15 - (weakExperiences * 5)),
            maxScore: 15,
            type: passed ? 'Good' : 'Improve',
            feedback: passed ? undefined : `${weakExperiences} roles have fewer than 3 bullet points.`
        };
    }
}
