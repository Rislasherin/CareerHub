import { IResumeRepository } from "@domain/repositories/AI/IResumeRepository";
import { IAIService, IJobMatchReport } from "@application/interfaces/IAIService";
import { IMatchJobDescriptionUseCase } from "../interfaces/IMatchJobDescription.usecase";

export class MatchJobDescriptionUseCase implements IMatchJobDescriptionUseCase {
    constructor(
        private readonly _resumeRepository: IResumeRepository,
        private readonly _aiService: IAIService
    ) {}

    async execute(resumeId: string, jobDescription: string): Promise<IJobMatchReport> {
        const resume = await this._resumeRepository.findById(resumeId);
        if (!resume) {
            throw new Error("Resume not found");
        }

        const report = await this._aiService.matchJobDescription(resume, jobDescription);
        return report;
    }
}
