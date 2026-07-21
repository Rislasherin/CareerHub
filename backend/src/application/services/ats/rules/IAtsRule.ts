import { Resume } from "@domain/entities/AI/resume.entity";
import { RuleResult, AtsSection } from "../types/ats.types";

export interface IAtsRule {
    readonly id: string;
    readonly category: AtsSection;
    readonly dependencies: string[];
    
    evaluate(resume: Resume): RuleResult | Promise<RuleResult>;
}
