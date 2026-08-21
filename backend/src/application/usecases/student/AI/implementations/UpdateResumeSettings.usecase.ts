import { IResumeRepository } from "@domain/repositories/IResumeRepository";
import { IUpdateResumeSettingsUseCase } from "../interfaces/IUpdateResumeSettings.usecase";
import { IResumeSettings, Resume, IExperience, IProject } from "@domain/entities/resume.entity";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class UpdateResumeSettingsUseCase implements IUpdateResumeSettingsUseCase {
    constructor(
        private readonly __resumeRepository: IResumeRepository
    ) { }

    async execute(resumeId: string, payload: { settings?: Partial<IResumeSettings>, summary?: string, targetRole?: string, experience?: IExperience[], projects?: IProject[], skills?: string[] } | Partial<IResumeSettings>): Promise<Resume> {
        const resume = await this.__resumeRepository.findById(resumeId);
        if (!resume) {
            throw new AppError("Resume not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        // Support direct Partial<IResumeSettings> or nested payload
        if ('settings' in payload || 'summary' in payload || 'targetRole' in payload || 'experience' in payload || 'projects' in payload || 'skills' in payload) {
            const fullPayload = payload as { settings?: Partial<IResumeSettings>, summary?: string, targetRole?: string, experience?: IExperience[], projects?: IProject[], skills?: string[] };
            if (fullPayload.settings) {
                resume.settings = {
                    ...resume.settings,
                    ...fullPayload.settings
                };
            }
            if (fullPayload.summary !== undefined) {
                resume.summary = fullPayload.summary;
            }
            if (fullPayload.targetRole !== undefined) {
                resume.targetRole = fullPayload.targetRole;
            }
            if (fullPayload.experience !== undefined && Array.isArray(fullPayload.experience)) {
                resume.experience = fullPayload.experience;
            }
            if (fullPayload.projects !== undefined && Array.isArray(fullPayload.projects)) {
                resume.projects = fullPayload.projects;
            }
            if (fullPayload.skills !== undefined && Array.isArray(fullPayload.skills)) {
                resume.skills = fullPayload.skills;
            }
        } else {
            resume.settings = {
                ...resume.settings,
                ...(payload as Partial<IResumeSettings>)
            };
        }

        resume.lastSyncedAt = new Date();
        await this.__resumeRepository.save(resume);
        return resume;
    }
}
