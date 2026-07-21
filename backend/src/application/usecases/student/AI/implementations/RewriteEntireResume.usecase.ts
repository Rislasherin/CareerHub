import { IAIService } from "@application/interfaces/IAIService";
import { IRewriteEntireResumeUseCase } from "../interfaces/IRewriteEntireResume.usecase";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IResumeRepository } from "@domain/repositories/AI/IResumeRepository";

export class RewriteEntireResumeUseCase implements IRewriteEntireResumeUseCase {
    constructor(
        private readonly _aiService: IAIService,
        private readonly _studentRepository: IStudentRepository,
        private readonly _resumeRepository: IResumeRepository
    ) {}

    async execute(studentId: string, targetRole: string): Promise<any> {
        // We will rewrite the Resume document directly, not the student master profile
        const resume = await this._resumeRepository.findByStudentId(studentId);
        
        if (!resume) {
            throw new Error("Resume not found. Please sync your profile first.");
        }

        // Send to AI for rewrite
        const rewrittenData = await this._aiService.rewriteEntireResume(resume, targetRole);

        // Update the resume entity
        if (rewrittenData.experience) {
            resume.experience = rewrittenData.experience;
        }
        if (rewrittenData.projects) {
            resume.projects = rewrittenData.projects;
        }
        
        // Save the updated resume
        await this._resumeRepository.save(resume);

        return resume;
    }
}
