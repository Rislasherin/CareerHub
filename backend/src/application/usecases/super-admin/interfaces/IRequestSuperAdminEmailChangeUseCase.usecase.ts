import { RequestEmailChangeDto } from "@application/dtos/hr/settings/hr-settings.dto";

export interface IRequestSuperAdminEmailChangeUseCase {
  execute(id: string, dto: RequestEmailChangeDto): Promise<void>;
}
