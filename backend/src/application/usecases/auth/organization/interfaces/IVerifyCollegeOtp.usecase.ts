import { VerifyCollegeOtpRequestDto } from "@application/dtos/auth/collage/Request/VerifyCollegeOtpRequest.dto";

export interface IVerifyCollegeOtpUseCase {
  execute(dto: VerifyCollegeOtpRequestDto): Promise<any>;
}
