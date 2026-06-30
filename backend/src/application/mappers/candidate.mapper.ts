import { Student } from "@domain/entities/student";
import { CandidateProfileResponseDTO } from "../dtos/hr/Response/CandidateProfile.response.dto";

export const toCandidateProfileDTO = (student: Student): CandidateProfileResponseDTO => {
  return {
    id: student.id as string,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    phone: student.phoneNumber || "", 
    collegeName: student.collegeId && student.collegeId.length !== 24 ? student.collegeId.toString() : "Unknown College",
    degree: student.degree || "",
    branch: student.branch || "",
    graduationYear: student.graduationYear?.toString() || "",
    cgpa: student.cgpa || 0,
    skills: Object.values(student.skills || {}).flat().filter(Boolean) as string[],
    experience: student.experience || [],
    projects: student.projects || [],
    resumeScore: student.resumeScore,
    resumeUrl: student.resumeUrl,
    preferences: student.preferences || {},
    softSkills: student.softSkills || [],
    spokenLanguages: student.spokenLanguages || [],
    achievements: student.achievements || []
  };
};
