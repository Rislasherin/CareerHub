import { VerifyEmailChangeDto } from "@application/dtos/hr/settings/hr-settings.dto";

export interface IVerifySuperAdminEmailChangeUseCase {
  execute(id: string, dto: VerifyEmailChangeDto): Promise<void>;
}
