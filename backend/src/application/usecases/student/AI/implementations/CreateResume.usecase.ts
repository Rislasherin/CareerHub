 import { IResumeRepository } from "@domain/repositories/AI/IResumeRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { Resume } from "@domain/entities/AI/resume.entity";
import { ICreateResumeUseCase } from "../interfaces/ICreateResume.usecase";

export class CreateResumeUseCase implements ICreateResumeUseCase {
    constructor(
        private readonly _studentRepository: IStudentRepository,
        private readonly _resumeRepository: IResumeRepository
    ) {}

    async execute(studentId: string, title?: string): Promise<Resume> {
        const student = await this._studentRepository.findById(studentId);
        if (!student) {
            throw new Error("Student not found");
        }

        const newResume = new Resume(
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

        newResume.resumeName = title || "Untitled Resume";
        newResume.versionId = `v${Date.now()}`;

        // fill in their basic info
        newResume.personalInfo = {
            fullName: `${student.firstName} ${student.lastName}`,
            email: student.email,
            phone: student.phoneNumber || "",
            linkedinUrl: student.linkedinUrl,
            githubUrl: student.githubUrl
        };
        // education section
        newResume.education = [{
            institution: "University", 
            degree: student.degree || "",
            graduationYear: student.graduationYear || 0,
            gpa: student.cgpa?.toString()
        }];
        // work experience
        if (student.experience) {
            newResume.experience = student.experience.map(exp => ({
                company: exp.company,
                role: exp.role,
                startDate: new Date(), 
                isCurrent: (exp.duration || '').toLowerCase().includes('present'),
                bulletPoints: exp.summary ? exp.summary.split('.') : []
            }));
        }
        // their side projects
        if (student.projects) {
            newResume.projects = student.projects.map(proj => ({
                name: proj.name,
                description: proj.description || "",
                technologies: proj.techStack,
                link: proj.liveDemo || proj.github
            }));
        }
        // flatten all skill categories into one array
        if (student.skills) {
            newResume.skills = [
                ...(student.skills.languages || []),
                ...(student.skills.frameworks || []),
                ...(student.skills.cloudDevops || [])
            ];
        }
        newResume.lastSyncedAt = new Date();

        await this._resumeRepository.save(newResume);
        
        const allResumes = await this._resumeRepository.findAllByStudentId(studentId);
        return allResumes[0]; // sorted by updatedAt desc, so first one is the newest
    }
}
