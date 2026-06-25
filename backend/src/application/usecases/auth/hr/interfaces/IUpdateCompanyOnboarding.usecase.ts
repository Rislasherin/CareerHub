import { UpdateCompanyOnboardingDto } from "@application/dtos/auth/hr/Request/UpdateCompanyOnboarding.dto";

export interface IUpdateCompanyOnboardingUseCase {
  execute(companyId: string, dto: UpdateCompanyOnboardingDto): Promise<any>;
}
