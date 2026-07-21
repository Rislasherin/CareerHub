export interface IResumeSettings {
  templateId: string;        
  themeColor: string;        
  fontFamily: string;        
  fontSize: string;          // e.g., "sm", "base", "lg"
  sectionOrder: string[];    // e.g., ["experience", "education", "projects", "skills"]
  hiddenSections: string[];  // Sections the user toggled off
}

export interface IPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface IEducation {
  institution: string;
  degree: string;
  graduationYear: number;
  gpa?: string;
}

export interface IExperience {
  company: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  bulletPoints: string[];
}

export interface IProject {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export class Resume {
  constructor(
    public readonly id: string | null,
    public readonly studentId: string,
    public targetRole: string,
    public personalInfo: IPersonalInfo,
    public summary: string,
    public education: IEducation[],
    public experience: IExperience[],
    public projects: IProject[],
    public skills: string[],
    public certifications: string[],
    public isDeleted: boolean = false,

    public settings: IResumeSettings = {
        templateId: "professional-ats",
        themeColor: "#1b1430",
        fontFamily: "Inter",
        fontSize: "base",
        sectionOrder: ["summary", "experience", "education", "skills", "projects", "certifications"],
        hiddenSections: []
    },

    // --- NEW FIELDS FOR FEATURE 1 & 3 ---
    public versionId: string = "v1",         
    public resumeName: string = "Default",   
    public lastSyncedAt: Date = new Date()   
  ) {}

  // Helper method to trigger the "Your profile changed" UI alert
  public isOutdated(profileUpdatedAt: Date): boolean {
    return profileUpdatedAt.getTime() > this.lastSyncedAt.getTime();
  }

  public isValidForAnalysis(): boolean {
    return this.targetRole !== "" && this.skills.length > 0 && this.experience.length > 0;
  }
}

