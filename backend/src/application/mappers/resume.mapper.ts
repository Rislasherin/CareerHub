import { Resume } from '@domain/entities/AI/resume.entity';
import { ResumeDocument } from '@infrastructure/database/models/student/resume.model';
import { version } from 'os';


export class ResumeMapper {

  // Converts DB Model -> Domain Entity
  public static toDomain(raw: any): Resume {
    return new Resume(
      raw._id.toString(),
      raw.studentId.toString(),
      raw.targetRole,
      {
        fullName: raw.personalInfo?.fullName || '',
        email: raw.personalInfo?.email || '',
        phone: raw.personalInfo?.phone || '',
        linkedinUrl: raw.personalInfo?.linkedinUrl,
        githubUrl: raw.personalInfo?.githubUrl,
        portfolioUrl: raw.personalInfo?.portfolioUrl,
        city: raw.personalInfo?.city
      },
      raw.summary || '',
      (raw.education || []).map((ed: any) => ({
        institution: ed.institution || '',
        degree: ed.degree || '',
        graduationYear: ed.graduationYear || 0,
        gpa: ed.gpa
      })),
      (raw.experience || []).map((exp: any) => ({
        company: exp.company || '',
        role: exp.role || '',
        location: exp.location,
        startDate: exp.startDate || new Date(),
        endDate: exp.endDate,
        isCurrent: exp.isCurrent || false,
        bulletPoints: exp.bulletPoints || []
      })),
      (raw.projects || []).map((proj: any) => ({
        name: proj.name || '',
        description: proj.description || '',
        technologies: proj.technologies || [],
        link: proj.link
      })),
      raw.skills || [],
      raw.certifications || [],
      raw.achievements || [],
      raw.languages || [],
      false, // isDeleted
      raw.settings || { // FEATURE 2 SETTINGS
        templateId: "professional",
        themeColor: "#1b1430",
        fontFamily: "Inter",
        fontSize: "base",
        sectionOrder: ["summary", "experience", "education", "skills", "projects", "certifications"],
        hiddenSections: []
      },
      raw.versionId || "v1", // FEATURE 1 VERSIONING
      raw.resumeName || "Default",
      raw.lastSyncedAt || new Date()
    );
  }

  // Converts Domain Entity -> DB Object (for saving)
  public static toPersistence(entity: Resume): any {
    return {
      studentId: entity.studentId,
      targetRole: entity.targetRole,
      personalInfo: entity.personalInfo,
      summary: entity.summary,
      education: entity.education,
      experience: entity.experience,
      projects: entity.projects,
      skills: entity.skills,
      certifications: entity.certifications,
      achievements: entity.achievements,
      languages: entity.languages,
      settings: entity.settings,
      resumeName: entity.resumeName,
      lastSyncedAt: entity.lastSyncedAt,
    };
  }
}
