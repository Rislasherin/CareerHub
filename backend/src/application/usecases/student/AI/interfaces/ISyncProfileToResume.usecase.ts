import { Resume } from "@domain/entities/resume.entity";

export interface ISyncProfileToResumeUseCase {
    execute(studentId: string, resumeId?: string): Promise<Resume>
}