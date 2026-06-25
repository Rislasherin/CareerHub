import { RegisterCompanyRequestDto } from "@application/dtos/auth/hr/Request/RegisterCompanyRequest.dto";

export interface IRegisterCompanyUseCase {
  execute(dto: RegisterCompanyRequestDto): Promise<{ requiresOtp: boolean; email: string; message: string }>;
}
