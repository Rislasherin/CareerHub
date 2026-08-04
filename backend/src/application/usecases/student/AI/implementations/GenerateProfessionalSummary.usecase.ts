import { IGenerateProfessionalSummaryUseCase } from "../interfaces/IGenerateProfessionalSummary.usecase";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { AIServiceFactory } from "@infrastructure/factories/AIServiceFactory";

export class GenerateProfessionalSummaryUseCase implements IGenerateProfessionalSummaryUseCase {
    private readonly _aiService = AIServiceFactory.createdService();

    constructor(private readonly _studentRepository: IStudentRepository) { }

    async execute(studentId: string): Promise<string> {
        if (!studentId) {
            throw new AppError("Student ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const student = await this._studentRepository.findById(studentId);
        if (!student) {
            throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }

        // only send what Gemini actually needs, no extra noise
        const profileData = {
            firstName: student.firstName,
            lastName: student.lastName,
            degree: student.degree,
            branch: student.branch,
            graduationYear: student.graduationYear,
            skills: student.skills,
            experience: student.experience,
            projects: student.projects,
            certifications: student.achievements?.filter(a => a.type === 'certification'),
            careerInterests: student.preferences?.preferredRole
        };

        const summary = await this._aiService.generateProfessionalSummary(profileData);
        return summary;
    }
}
