import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ISyncProfileToResumeUseCase } from "../interfaces/ISyncProfileToResume.usecase";
import { IResumeRepository } from "@domain/repositories/AI/IResumeRepository";
import { Resume } from "@domain/entities/AI/resume.entity";

export class SyncProfileToResumeUseCase implements ISyncProfileToResumeUseCase {
    constructor(
        private readonly _studentRepository: IStudentRepository,
        private readonly _resumeRepository: IResumeRepository
    ){}

    async execute(studentId: string): Promise<Resume> {
        const student = await this._studentRepository.findById(studentId);
        const resume = await this._resumeRepository.findByStudentId(studentId)

        if(!student) {
            throw new Error("Student not found");
        }
        if(!resume) {
            throw new Error("Resume not found");
        }
    
        //Map personel info
        resume.personalInfo = {
            fullName: `${student.firstName} ${student.lastName}`,
            email: student.email,
            phone: student.phoneNumber || "",
            linkedinUrl: student.linkedinUrl,
            githubUrl: student.githubUrl
        };
        // 3. Map Education
        resume.education = [{
            institution: "University", 
            degree: student.degree || "",
            graduationYear: student.graduationYear || 0,
            gpa: student.cgpa?.toString()
        }];
        // 4. Map Experience
        if (student.experience) {
            resume.experience = student.experience.map(exp => ({
                company: exp.company,
                role: exp.role,
                startDate: new Date(), 
                isCurrent: exp.duration.toLowerCase().includes('present'),
                bulletPoints: exp.summary ? exp.summary.split('.') : []
            }));
        }
        // 5. Map Projects
        if (student.projects) {
            resume.projects = student.projects.map(proj => ({
                name: proj.name,
                description: proj.description || "",
                technologies: proj.techStack,
                link: proj.liveDemo || proj.github
            }));
        }
        // 6. Map Skills Flat Array
        if (student.skills) {
            resume.skills = [
                ...(student.skills.languages || []),
                ...(student.skills.frameworks || []),
                ...(student.skills.cloudDevops || [])
            ];
        }
        resume.lastSyncedAt = new Date();
        
        await this._resumeRepository.save(resume);
        
        return resume;
    }
}