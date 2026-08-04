import { Resume } from "@domain/entities/AI/resume.entity";

export interface ICreateResumeUseCase {
    execute(studentId: string, title?: string): Promise<Resume>;
}
