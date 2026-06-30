export interface CandidateProfileResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  collegeName: string;
  degree: string;
  branch: string;
  graduationYear: string;
  cgpa: number;
  skills: string[];
  resumeUrl?: string;
  experience?: {
    company: string;
    role: string;
    duration: string;
    location?: string;
    summary?: string;
  }[];
  projects?: {
    name: string;
    techStack?: string[];
    github?: string;
    liveDemo?: string;
    description?: string;
  }[];
  preferences?: {
    preferredRole?: string;
    workMode?: string;
    location?: string;
    expectedCtc?: string;
    noticePeriod?: string;
    jobType?: string;
    startDate?: string;
  };
  softSkills?: string[];
  spokenLanguages?: {
    language: string;
    proficiency: string;
  }[];
  achievements?: {
    title: string;
    subtitle?: string;
    type?: 'award' | 'certification' | 'coding' | 'other';
  }[];
  resumeScore?: number;
  matchScore?: number;
  portfolioUrls?: {
    github?: string;
    linkedin?: string;
  };
}
