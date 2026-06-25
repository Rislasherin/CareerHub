import { UpdateCollegeOnboardingDto } from "@application/dtos/auth/collage/Request/UpdateCollegeOnboarding.dto";

export interface IUpdateCollegeOnboardingUseCase {
  execute(orgId: string, dto: UpdateCollegeOnboardingDto): Promise<any>;
}
