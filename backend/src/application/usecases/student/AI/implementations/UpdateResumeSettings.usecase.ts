import { IResumeRepository } from "@domain/repositories/AI/IResumeRepository";
import { IUpdateResumeSettingsUseCase } from "../interfaces/IUpdateResumeSettings.usecase";
import { IResumeSettings, Resume } from "@domain/entities/AI/resume.entity";

export class UpdateResumeSettingsUseCase implements IUpdateResumeSettingsUseCase {
    constructor(
        private readonly __resumeRepository: IResumeRepository
    ) { }

    async execute(studentId: string, newSettings: Partial<IResumeSettings>): Promise<Resume> {
        const resume = await this.__resumeRepository.findByStudentId(studentId);
        if (!resume) {
            throw new Error("Resume not found for this student");
        }

        resume.settings = {
            ...resume.settings,
            ...newSettings
        };

        await this.__resumeRepository.save(resume)
        return resume;
    }
}