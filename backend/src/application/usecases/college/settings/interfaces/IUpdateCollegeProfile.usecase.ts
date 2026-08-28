import { UpdateCollegeProfileRequestDto } from "@application/dtos/college/settings/college-settings.dto";

export interface IUpdateCollegeProfileUseCase {
  execute(orgId: string, adminId: string, dto: UpdateCollegeProfileRequestDto): Promise<void>;
}
