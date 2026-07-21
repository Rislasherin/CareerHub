import { IResumeRepository } from "@domain/repositories/AI/IResumeRepository";
import { Resume } from "@domain/entities/AI/resume.entity";
import { IGetResumesUseCase } from "../interfaces/IGetResumes.usecase";

export class GetResumesUseCase implements IGetResumesUseCase {
    constructor(private readonly _resumeRepository: IResumeRepository) {}

    async execute(studentId: string): Promise<Resume[]> {
        return await this._resumeRepository.findAllByStudentId(studentId);
    }
}
