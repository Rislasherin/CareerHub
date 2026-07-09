import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { IGetCandidateProfileUseCase } from "../interfaces/IGetCandidateProfile.usecase";
import { CandidateProfileResponseDTO } from "@application/dtos/hr/Response/CandidateProfile.response.dto";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { toCandidateProfileDTO } from "@application/mappers/candidate.mapper";

export class GetCandidateProfileUseCase implements IGetCandidateProfileUseCase {
    constructor(
        private readonly _studentRepository: IStudentRepository,
        private readonly _organizationRepository: IOrganizationRepository
    ){}

    async execute(studentId: string): Promise<CandidateProfileResponseDTO> {
        const student = await this._studentRepository.findById(studentId);

        if(!student) {
            throw new AppError("Candidate not found",HttpStatus.NOT_FOUND,ErrorCode.NOT_FOUND)
        }

        let collegeName = "Unknown College";
        if (student.collegeId) {
            const college = await this._organizationRepository.findById(student.collegeId);
            if (college) collegeName = college.name;
        }

        return toCandidateProfileDTO(student, collegeName)
    }
}