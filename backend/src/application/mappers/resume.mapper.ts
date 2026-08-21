import { Resume } from '@domain/entities/resume.entity';
import { ResumeDocument } from '@infrastructure/database/models/student/resume.model';

export class ResumeMapper {

  // Converts DB Model -> Domain Entity
  public static toDomain(raw: ResumeDocument): Resume {
    return new Resume(
      raw._id.toString(),
      raw.studentId.toString(),
      raw.targetRole,
      {
        fullName: raw.personalInfo?.fullName ?? '',
        email: raw.personalInfo?.email ?? '',
        phone: raw.personalInfo?.phone ?? '',
        linkedinUrl: raw.personalInfo?.linkedinUrl ?? undefined,
        githubUrl: raw.personalInfo?.githubUrl ?? undefined,
        portfolioUrl: raw.personalInfo?.portfolioUrl ?? undefined,
        city: raw.personalInfo?.city ?? undefined
      },
      raw.summary ?? '',
      (raw.education ?? []).map(ed => ({
        institution: ed.institution ?? '',
        degree: ed.degree ?? '',
        graduationYear: ed.graduationYear ?? 0,
        gpa: ed.gpa ?? undefined
      })),
      (raw.experience ?? []).map(exp => ({
        company: exp.company ?? '',
        role: exp.role ?? '',
        location: exp.location ?? undefined,
        startDate: exp.startDate ?? new Date(),
        endDate: exp.endDate ?? undefined,
        isCurrent: exp.isCurrent ?? false,
        bulletPoints: exp.bulletPoints ?? []
      })),
      (raw.projects ?? []).map(proj => ({
        name: proj.name ?? '',
        description: proj.description ?? '',
        technologies: proj.technologies ?? [],
        link: proj.link ?? undefined
      })),
      raw.skills ?? [],
      raw.certifications ?? [],
      raw.achievements ?? [],
      raw.languages ?? [],
      false, // isDeleted
      raw.settings ?? {
        templateId: "professional",
        themeColor: "#1b1430",
        fontFamily: "Inter",
        fontSize: "base",
        sectionOrder: ["summary", "experience", "education", "skills", "projects", "certifications"],
        hiddenSections: []
      },
      raw.versionId ?? "v1",
      raw.resumeName ?? "Default",
      raw.lastSyncedAt ?? new Date()
    );
  }

  // Converts Domain Entity -> DB Object (for saving)
  public static toPersistence(entity: Resume): Record<string, unknown> {
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
