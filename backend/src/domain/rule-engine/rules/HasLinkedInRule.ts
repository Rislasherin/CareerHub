import { Resume } from "@domain/entities/AI/resume.entity";
import { IAtsRule, RuleResult } from "../interfaces/IRule";


export class HasLinkedInRule implements IAtsRule {
    evaluate(resume: Resume): RuleResult {
        const passed = !!resume.personalInfo.linkedinUrl;
        return {
            section: 'Personal Info',
            scorePassed: passed ? 5 : 0,
            maxScore: 5,
            type: passed ? 'Good' : 'Critical',
            feedback: passed ? undefined : 'Missing LinkedIn URL.'
        };
    }
}
