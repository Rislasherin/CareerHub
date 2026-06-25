import { VerifyCompanyOtpRequestDto } from "@application/dtos/auth/hr/Request/VerifyCompanyOtpRequest.dto";

export interface IVerifyCompanyOtpUseCase {
  execute(dto: VerifyCompanyOtpRequestDto): Promise<any>;
}
