import { apiClient } from '@/services/api/api.client';

export interface StudentExperience {
  company: string;
  role: string;
  duration: string;
  location?: string;
  summary?: string;
}

export interface StudentProject {
  name: string;
  techStack: string[];
  github?: string;
  liveDemo?: string;
  description?: string;
}

export interface StudentSkills {
  languages?: string[];
  frameworks?: string[];
  databases?: string[];
  cloudDevops?: string[];
  otherTools?: string[];
  aiMl?: string[];
}

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  rollNumber?: string;
  department?: string;
  collegeName?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  city?: string;

  // Academic (Locked)
  degree?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  activeBacklogs?: number;

  // Arrays
  skills?: StudentSkills;
  experience?: StudentExperience[];
  projects?: StudentProject[];
}

export const getStudentProfile = async (): Promise<StudentProfile> => {
  const response = (await apiClient.get('/student/profile')) as type;
  return response.data;
};

export const updateStudentProfile = async (payload: Partial<StudentProfile>): Promise<StudentProfile> => {
  const response = (await apiClient.put('/student/profile', payload)) as type;
  return response.data;
};
