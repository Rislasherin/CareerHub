import { IResumeRepository } from "@domain/repositories/IResumeRepository";
import { IAIService, ISectionCoachResult } from "@application/interfaces/IAIService";
import { ICoachResumeSectionUseCase } from "../interfaces/ICoachResumeSection.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Resume } from "@domain/entities/resume.entity";


export class CoachResumeSectionUseCase implements ICoachResumeSectionUseCase {
    constructor(
        private readonly _resumeRepository: IResumeRepository,
        private readonly _aiService: IAIService
    ) { }

    async execute(resumeId: string, sectionName: string, instructions: string, targetRole: string): Promise<ISectionCoachResult> {
        const resume = await this._resumeRepository.findById(resumeId);
        if (!resume) {
            throw new AppError("Resume not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        // grab just the section they want coached
        type ResumeSectionData = Resume['experience'] | Resume['projects'] | Resume['skills'] | Resume['education'] | string;
        let sectionData: ResumeSectionData | undefined;
        switch (sectionName.toLowerCase()) {
            case 'experience': sectionData = resume.experience; break;
            case 'projects': sectionData = resume.projects; break;
            case 'skills': sectionData = resume.skills; break;
            case 'education': sectionData = resume.education; break;
            case 'summary': sectionData = resume.summary; break;
            default: throw new AppError(`Unknown section: ${sectionName}`, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        // don't bother AI if there's nothing to coach
        const isEmpty = !sectionData ||
            (Array.isArray(sectionData) && sectionData.length === 0) ||
            (typeof sectionData === 'string' && sectionData.trim().length === 0);

        if (isEmpty) {
            throw new AppError(`No content found in '${sectionName}' section. Please add at least one entry in your Profile before coaching.`, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const report = await this._aiService.coachSection(sectionName, sectionData, instructions, targetRole);
        return report;
    }
}

