import { IResumeSettings, Resume } from "@domain/entities/AI/resume.entity";

export interface IUpdateResumeSettingsUseCase {
    execute(studentId:string,newSettings:Partial<IResumeSettings>): Promise<Resume>
}