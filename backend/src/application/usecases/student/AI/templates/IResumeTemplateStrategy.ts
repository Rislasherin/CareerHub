import { Resume } from "@domain/entities/AI/resume.entity";

export interface IResumeTemplateStrategy {
    templateId: string;
    generateHtml(resume: Resume, visibilityMap?: Record<string, boolean>): string;
}
