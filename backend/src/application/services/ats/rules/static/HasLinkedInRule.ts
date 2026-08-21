import { Resume } from "@domain/entities/resume.entity";
import { IAtsRule } from "../IAtsRule";
import { RuleResult, RuleStatus, AtsSection } from "../../types/ats.types";

export interface LinkedInMetadata {
    hasUrl: boolean;
    isCustomizedUrl: boolean;
}

export class HasLinkedInRule implements IAtsRule {
    public readonly id = 'REQ_LINKEDIN';
    public readonly category = AtsSection.PERSONAL_INFO;
    public readonly dependencies: string[] = [];

    evaluate(resume: Resume): RuleResult<LinkedInMetadata> {
        const url = resume.personalInfo.linkedinUrl;

        if (!url) {
            return {
                ruleId: this.id,
                status: RuleStatus.FAIL,
                feedback: 'Missing LinkedIn profile link.',
                metadata: { hasUrl: false, isCustomizedUrl: false }
            };
        }

        const isCustomized = !url.match(/\-[a-z0-9]{8,}$/i);

        return {
            ruleId: this.id,
            status: isCustomized ? RuleStatus.PASS : RuleStatus.WARNING,
            feedback: isCustomized
                ? 'LinkedIn URL is present and customized.'
                : 'LinkedIn URL is present but looks uncustomized (e.g., contains random characters at the end).',
            metadata: { hasUrl: true, isCustomizedUrl: isCustomized }
        };
    }
}
