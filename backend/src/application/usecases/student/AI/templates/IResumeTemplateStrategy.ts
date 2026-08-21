import { Resume } from "@domain/entities/resume.entity";

export interface IResumeTemplateStrategy {
    templateId: string;
    generateHtml(resume: Resume, visibilityMap?: Record<string, boolean>): string;
}
