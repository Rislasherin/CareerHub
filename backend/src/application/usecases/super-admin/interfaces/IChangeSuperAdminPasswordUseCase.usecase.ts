import { ChangePasswordRequestDto } from "@application/dtos/hr/settings/hr-settings.dto";

export interface IChangeSuperAdminPasswordUseCase {
  execute(id: string, dto: ChangePasswordRequestDto): Promise<void>;
}
