import { Resume } from "@domain/entities/resume.entity";

export interface IGetResumesUseCase {
    execute(studentId: string): Promise<Resume[]>;
}
