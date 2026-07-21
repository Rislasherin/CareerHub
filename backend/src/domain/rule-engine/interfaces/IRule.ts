import { Resume } from "@domain/entities/AI/resume.entity";

export interface RuleResult {
    section: string;
    scorePassed: number;
    maxScore: number;
    type: 'Critical' | 'Improve' | 'Good';
    feedback?: string;
}

export interface IAtsRule {
    evaluate(resume: Resume): RuleResult;
}
