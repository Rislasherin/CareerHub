import { CandidateProfileResponseDTO } from "@application/dtos/hr/Response/CandidateProfile.response.dto";

export interface IGetCandidateProfileUseCase {
    execute(studentId:string): Promise<CandidateProfileResponseDTO>;
}