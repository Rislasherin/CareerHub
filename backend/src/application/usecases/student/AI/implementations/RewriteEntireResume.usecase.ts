import { IAIService } from "@application/interfaces/IAIService";
import { IRewriteEntireResumeUseCase } from "../interfaces/IRewriteEntireResume.usecase";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IResumeRepository } from "@domain/repositories/IResumeRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class RewriteEntireResumeUseCase implements IRewriteEntireResumeUseCase {
    constructor(
        private readonly _aiService: IAIService,
        private readonly _studentRepository: IStudentRepository,
        private readonly _resumeRepository: IResumeRepository
    ) { }

    async execute(resumeId: string, targetRole: string): Promise<Record<string, unknown>> {
        // touching the resume snapshot only, not the master profile
        const resume = await this._resumeRepository.findById(resumeId);

        if (!resume) {
            throw new AppError("Resume not found. Please sync your profile first.", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        const hasExperience = resume.experience && resume.experience.length > 0;
        const hasProjects = resume.projects && resume.projects.length > 0;
        const hasSkills = resume.skills && resume.skills.length > 0;

        if (!hasExperience && !hasProjects && !hasSkills) {
            throw new AppError("Resume has no experience, projects, or skills entries to rewrite. Please sync your profile first.", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const cleanData = {
            targetRole: resume.targetRole || targetRole,
            summary: resume.summary || "",
            experience: (resume.experience || []).map(exp => ({
                company: exp.company,
                role: exp.role,
                location: exp.location,
                bulletPoints: exp.bulletPoints || []
            })),
            projects: (resume.projects || []).map(proj => ({
                name: proj.name,
                description: proj.description,
                technologies: proj.technologies || []
            })),
            skills: resume.skills || []
        };

        // hand it off to AI
        const rewrittenData = await this._aiService.rewriteEntireResume(cleanData, targetRole) as {
            summary?: string;
            experience?: Array<{ company?: string; role?: string; location?: string; bulletPoints?: string[]; descriptionBullets?: string[]; description?: string }>;
            projects?: Array<{ name?: string; description?: string; technologies?: string[] }>;
        };

        const suggestedExp: Array<{ company?: string; role?: string; location?: string; bulletPoints?: string[]; descriptionBullets?: string[]; description?: string }> = Array.isArray(rewrittenData.experience) ? rewrittenData.experience : cleanData.experience;
        const suggestedProj: Array<{ name?: string; description?: string; technologies?: string[] }> = Array.isArray(rewrittenData.projects) ? rewrittenData.projects : cleanData.projects;

        return {
            original: cleanData,
            suggested: {
                summary: rewrittenData.summary || cleanData.summary,
                experience: suggestedExp.map((exp, i) => ({
                    company: exp.company || cleanData.experience[i]?.company || "Company",
                    role: exp.role || cleanData.experience[i]?.role || targetRole,
                    location: exp.location || cleanData.experience[i]?.location || "Remote",
                    bulletPoints: exp.bulletPoints || exp.descriptionBullets || (exp.description ? exp.description.split('.') : [])
                })),
                projects: suggestedProj.map((proj, i) => ({
                    name: proj.name || cleanData.projects[i]?.name || "Project",
                    description: proj.description || cleanData.projects[i]?.description || "",
                    technologies: proj.technologies || cleanData.projects[i]?.technologies || []
                }))
            }
        };


    }
}


