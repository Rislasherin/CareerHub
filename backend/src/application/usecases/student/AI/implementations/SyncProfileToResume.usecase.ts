import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ISyncProfileToResumeUseCase } from "../interfaces/ISyncProfileToResume.usecase";
import { IResumeRepository } from "@domain/repositories/AI/IResumeRepository";
import { Resume } from "@domain/entities/AI/resume.entity";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class SyncProfileToResumeUseCase implements ISyncProfileToResumeUseCase {
    constructor(
        private readonly _studentRepository: IStudentRepository,
        private readonly _resumeRepository: IResumeRepository
    ){}

    async execute(studentId: string, resumeId?: string): Promise<Resume> {
        const student = await this._studentRepository.findById(studentId);
        let resume = resumeId 
            ? await this._resumeRepository.findById(resumeId) 
            : await this._resumeRepository.findByStudentId(studentId);

        if (!student) {
            throw new AppError("Student profile not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        if (!resume) {
            resume = new Resume(
                null,
                studentId,
                "Software Engineer",
                { fullName: "", email: "", phone: "" },
                "",
                [],
                [],
                [],
                [],
                []
            );
        }
    
        // basic contact stuff first
        resume.personalInfo = {
            fullName: `${student.firstName} ${student.lastName}`.trim(),
            email: student.email,
            phone: student.phoneNumber || "",
            linkedinUrl: student.linkedinUrl || resume.personalInfo?.linkedinUrl,
            githubUrl: student.githubUrl || resume.personalInfo?.githubUrl,
            portfolioUrl: student.portfolioUrl || resume.personalInfo?.portfolioUrl,
            city: student.city || resume.personalInfo?.city
        };

        // only set summary if they haven't written one yet
        if (!resume.summary || resume.summary.trim() === "") {
            resume.summary = student.professionalSummary || "";
        }

        // pull in their degree info
        if (student.degree) {
            resume.education = [{
                institution: "University", 
                degree: student.degree || "",
                graduationYear: student.graduationYear || 0,
                gpa: student.cgpa?.toString()
            }];
        }


        // keep their custom bullet points if they already edited them, otherwise generate from summary
        if (student.experience && student.experience.length > 0) {
            resume.experience = student.experience.map((exp, idx) => {
                const existingExp = resume?.experience?.[idx];
                const bullets = (existingExp?.bulletPoints && existingExp.bulletPoints.length > 0)
                    ? existingExp.bulletPoints
                    : (exp.summary ? exp.summary.split('.').filter((b: string) => b.trim().length > 0) : []);
                    
                return {
                    company: exp.company,
                    role: exp.role,
                    location: exp.location,
                    startDate: new Date(), 
                    isCurrent: exp.duration?.toLowerCase().includes('present') || false,
                    bulletPoints: bullets
                };
            });
        }

        // grab their projects
        if (student.projects && student.projects.length > 0) {
            resume.projects = student.projects.map(proj => ({
                name: proj.name,
                description: proj.description || "",
                technologies: proj.techStack || [],
                link: proj.liveDemo || proj.github || ""
            }));
        }

        // merge skills without duplicates
        if (student.skills) {
            const masterSkills = [
                ...(student.skills.languages || []),
                ...(student.skills.frameworks || []),
                ...(student.skills.cloudDevops || [])
            ];
            const combinedSkills = new Set([...masterSkills, ...(resume.skills || [])]);
            resume.skills = Array.from(combinedSkills);
        }
        
        // split achievements into certs vs regular ones
        if (student.achievements) {
            resume.certifications = student.achievements
                .filter(a => a.type === 'certification')
                .map(a => a.subtitle ? `${a.title} — ${a.subtitle}` : a.title);
            
            resume.achievements = student.achievements
                .filter(a => a.type !== 'certification')
                .map(a => a.subtitle ? `${a.title} — ${a.subtitle}` : a.title);
        }

        if (student.spokenLanguages) {
            resume.languages = student.spokenLanguages.map(l => 
                l.proficiency ? `${l.language} (${l.proficiency})` : l.language
            );
        }

        resume.lastSyncedAt = new Date();
        
        await this._resumeRepository.save(resume);
        
        return resume;
    }
}