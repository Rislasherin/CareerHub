import { ISectionCoachResult } from "@application/interfaces/IAIService";

export interface ICoachResumeSectionUseCase {
    execute(resumeId: string, sectionName: string, instructions: string, targetRole: string): Promise<ISectionCoachResult>;
}
