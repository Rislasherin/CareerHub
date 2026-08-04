import { Resume } from "@domain/entities/AI/resume.entity";

export interface ISyncProfileToResumeUseCase {
    execute(studentId:string, resumeId?: string): Promise<Resume>
}