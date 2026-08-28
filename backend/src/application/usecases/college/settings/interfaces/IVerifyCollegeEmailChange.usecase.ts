import { VerifyEmailChangeDto } from "@application/dtos/hr/settings/hr-settings.dto";

export interface IVerifyCollegeEmailChangeUseCase {
  execute(adminId: string, dto: VerifyEmailChangeDto): Promise<void>;
}
