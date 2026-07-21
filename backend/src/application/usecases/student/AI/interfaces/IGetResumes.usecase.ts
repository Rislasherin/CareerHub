import { Resume } from "@domain/entities/AI/resume.entity";

export interface IGetResumesUseCase {
    execute(studentId: string): Promise<Resume[]>;
}
