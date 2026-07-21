import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ISyncProfileToResumeUseCase } from "../interfaces/ISyncProfileToResume.usecase";
import { IResumeRepository } from "@domain/repositories/AI/IResumeRepository";
import { Resume } from "@domain/entities/AI/resume.entity";

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

        if(!student) {
            throw new Error("Student not found");
        }
        if(!resume) {
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
    
        //Map personel info
        resume.personalInfo = {
            fullName: `${student.firstName} ${student.lastName}`,
            email: student.email,
            phone: student.phoneNumber || "",
            linkedinUrl: student.linkedinUrl,
            githubUrl: student.githubUrl,
            portfolioUrl: student.portfolioUrl,
            city: student.city
        };
        resume.summary = student.professionalSummary || "";
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
                location: exp.location,
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
        
        // 7. Map Achievements, Certifications, and Languages
        if (student.achievements) {
            // Certifications are achievements with type === 'certification'
            resume.certifications = student.achievements
                .filter(a => a.type === 'certification')
                .map(a => a.subtitle ? `${a.title} — ${a.subtitle}` : a.title);
            
            // Non-certification achievements (awards, coding competitions, etc.)
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