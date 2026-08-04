import { IResumeSettings, Resume, IExperience, IProject } from "@domain/entities/AI/resume.entity";

export interface IUpdateResumeSettingsUseCase {
    execute(resumeId: string, payload: { settings?: Partial<IResumeSettings>, summary?: string, targetRole?: string, experience?: IExperience[], projects?: IProject[], skills?: string[] }): Promise<Resume>;
}