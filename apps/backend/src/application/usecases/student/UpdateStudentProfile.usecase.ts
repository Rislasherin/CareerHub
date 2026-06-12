import { Student } from "@domain/entities/student";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { UpdateStudentProfileDto } from "@application/dtos/student/UpdateStudentProfile.dto";

export interface IUpdateStudentProfileUseCase {
  execute(studentId: string, dto: UpdateStudentProfileDto): Promise<Student>;
}

export class UpdateStudentProfileUseCase implements IUpdateStudentProfileUseCase {
  constructor(private readonly _studentRepository: IStudentRepository) { }

  async execute(studentId: string, dto: UpdateStudentProfileDto): Promise<Student> {
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const currentProps = student.toJSON();

    // Map new fields securely, keeping education details and credentials locked!
    const updatedProps = {
      ...currentProps,
      firstName: dto.firstName !== undefined ? dto.firstName : currentProps.firstName,
      lastName: dto.lastName !== undefined ? dto.lastName : currentProps.lastName,
      phoneNumber: dto.phoneNumber !== undefined ? dto.phoneNumber : currentProps.phoneNumber,
      linkedinUrl: dto.linkedinUrl !== undefined ? dto.linkedinUrl : currentProps.linkedinUrl,
      githubUrl: dto.githubUrl !== undefined ? dto.githubUrl : currentProps.githubUrl,
      portfolioUrl: dto.portfolioUrl !== undefined ? dto.portfolioUrl : currentProps.portfolioUrl,
      city: dto.city !== undefined ? dto.city : currentProps.city,
      degree: dto.degree !== undefined ? dto.degree : currentProps.degree,
      branch: dto.branch !== undefined ? dto.branch : currentProps.branch,
      graduationYear: dto.graduationYear !== undefined ? dto.graduationYear : currentProps.graduationYear,
      cgpa: dto.cgpa !== undefined ? dto.cgpa : currentProps.cgpa,
      tenthPercentage: dto.tenthPercentage !== undefined ? dto.tenthPercentage : currentProps.tenthPercentage,
      twelfthPercentage: dto.twelfthPercentage !== undefined ? dto.twelfthPercentage : currentProps.twelfthPercentage,
      activeBacklogs: dto.activeBacklogs !== undefined ? dto.activeBacklogs : currentProps.activeBacklogs,

      // Skills mapping
      skills: dto.skills !== undefined ? {
        languages: dto.skills.languages || currentProps.skills?.languages || [],
        frameworks: dto.skills.frameworks || currentProps.skills?.frameworks || [],
        databases: dto.skills.databases || currentProps.skills?.databases || [],
        cloudDevops: dto.skills.cloudDevops || currentProps.skills?.cloudDevops || [],
        otherTools: dto.skills.otherTools || currentProps.skills?.otherTools || [],
        aiMl: dto.skills.aiMl || currentProps.skills?.aiMl || []
      } : currentProps.skills,

      // Experience mapping
      experience: dto.experience !== undefined ? dto.experience.map(exp => ({
        company: exp.company,
        role: exp.role,
        duration: exp.duration,
        location: exp.location,
        summary: exp.summary
      })) : currentProps.experience,

      // Projects mapping
      projects: dto.projects !== undefined ? dto.projects.map(proj => ({
        name: proj.name,
        techStack: proj.techStack || [],
        github: proj.github,
        liveDemo: proj.liveDemo,
        description: proj.description
      })) : currentProps.projects
    };

    const updatedStudent = Student.create(updatedProps);
    return await this._studentRepository.update(studentId, updatedStudent);
  }
}
