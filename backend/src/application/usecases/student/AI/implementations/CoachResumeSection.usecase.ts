import { IResumeRepository } from "@domain/repositories/AI/IResumeRepository";
import { IAIService, ISectionCoachResult } from "@application/interfaces/IAIService";
import { ICoachResumeSectionUseCase } from "../interfaces/ICoachResumeSection.usecase";

export class CoachResumeSectionUseCase implements ICoachResumeSectionUseCase {
    constructor(
        private readonly _resumeRepository: IResumeRepository,
        private readonly _aiService: IAIService
    ) {}

    async execute(resumeId: string, sectionName: string, instructions: string, targetRole: string): Promise<ISectionCoachResult> {
        const resume = await this._resumeRepository.findById(resumeId);
        if (!resume) {
            throw new Error("Resume not found");
        }

        // Extract specific section data
        let sectionData: any;
        switch(sectionName.toLowerCase()) {
            case 'experience': sectionData = resume.experience; break;
            case 'projects': sectionData = resume.projects; break;
            case 'skills': sectionData = resume.skills; break;
            case 'education': sectionData = resume.education; break;
            case 'summary': sectionData = resume.summary; break;
            default: throw new Error(`Unknown section: ${sectionName}`);
        }

        const report = await this._aiService.coachSection(sectionName, sectionData, instructions, targetRole);
        return report;
    }
}
