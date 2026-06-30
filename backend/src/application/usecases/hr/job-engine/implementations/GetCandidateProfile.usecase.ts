import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IGetCandidateProfileUseCase } from "../interfaces/IGetCandidateProfile.usecase";
import { CandidateProfileResponseDTO } from "@application/dtos/hr/Response/CandidateProfile.response.dto";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { toCandidateProfileDTO } from "@application/mappers/candidate.mapper";

export class GetCandidateProfileUseCase implements IGetCandidateProfileUseCase {
    constructor(
        private readonly _studentRepository: IStudentRepository
    ){}

    async execute(studentId: string): Promise<CandidateProfileResponseDTO> {
        const student = await this._studentRepository.findById(studentId);

        if(!student) {
            throw new AppError("Candidate not found",HttpStatus.NOT_FOUND,ErrorCode.NOT_FOUND)
        }

        return toCandidateProfileDTO(student)
    }
}