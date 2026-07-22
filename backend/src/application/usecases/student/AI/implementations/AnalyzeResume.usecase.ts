import { AtsEngine } from "@application/services/ats/AtsEngine";
import { ExperienceDetailRule } from "@application/services/ats/rules/static/ExperienceDetailRule";
import { HasLinkedInRule } from "@application/services/ats/rules/static/HasLinkedInRule";
import { StarImpactRule } from "@application/services/ats/rules/static/StarImpactRule";
import { HasProjectsRule } from "@application/services/ats/rules/static/HasProjectsRule";
import { HasSkillsRule } from "@application/services/ats/rules/static/HasSkillsRule";
import { IAnalyzeResumeUseCase } from "../interfaces/IAnalyzeResume.usecase";
import { IAIService } from "@application/interfaces/IAIService";
import { ExperiencedSoftwareEngineerProfile } from "@application/services/ats/profiles/ExperiencedProfile";
import { EntryLevelStudentProfile } from "@application/services/ats/profiles/EntryLevelProfile";
import { IResumeRepository } from "@domain/repositories/AI/IResumeRepository";
import { AtsReport } from "@application/services/ats/types/ats.types";
import { HasExperienceRule } from "@application/services/ats/rules/static/HasExperienceRule";
import { GeminiAtsRule } from "@application/services/ats/rules/dynamic/GeminiAtsRule";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class AnalyzeResumeUseCase implements IAnalyzeResumeUseCase {
    private _atsEngine: AtsEngine;

    constructor(
        private readonly _resumeRepository: IResumeRepository,
        private readonly _aiService: IAIService,
    ) {
        this._atsEngine = new AtsEngine([
            new HasLinkedInRule(),
            new HasExperienceRule(),
            new ExperienceDetailRule(),
            new StarImpactRule(),
            new HasProjectsRule(),
            new HasSkillsRule(),
            new GeminiAtsRule(this._aiService)
        ]);
    }


    async execute(resumeId: string): Promise<AtsReport> {
        const resume = await this._resumeRepository.findById(resumeId);

        if (!resume) {
            throw new AppError("Resume not found. Please sync your profile to generate your resume.", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        // Dynamically select scoring profile based on career stage
        const scoringProfile = (resume.experience && resume.experience.length >= 2)
            ? ExperiencedSoftwareEngineerProfile
            : EntryLevelStudentProfile;

        const atsReport = await this._atsEngine.evaluate(resume, scoringProfile);
        return atsReport;
    }
}
