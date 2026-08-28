import { RequestEmailChangeDto } from "@application/dtos/hr/settings/hr-settings.dto";

export interface IRequestCollegeEmailChangeUseCase {
  execute(adminId: string, dto: RequestEmailChangeDto): Promise<void>;
}
