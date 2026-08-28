import { ChangePasswordRequestDto } from "@application/dtos/hr/settings/hr-settings.dto";

export interface IChangeCollegePasswordUseCase {
  execute(adminId: string, dto: ChangePasswordRequestDto): Promise<void>;
}
