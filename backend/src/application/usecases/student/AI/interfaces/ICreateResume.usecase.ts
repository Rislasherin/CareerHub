import { Resume } from "@domain/entities/resume.entity";

export interface ICreateResumeUseCase {
    execute(studentId: string, title?: string): Promise<Resume>;
}
