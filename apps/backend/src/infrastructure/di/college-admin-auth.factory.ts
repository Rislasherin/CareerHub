import { RegisterOrganizationUseCase } from "@application/usecases/auth/organization/implementations/register.organization.usecase";
import { VerifyCollegeOtpUseCase } from "@application/usecases/auth/organization/implementations/VerifyCollegeOtp.usecase";
import { CollegeAdminAuthController } from "@presentation/http/controllers/auth/organization/college.admin.auth.controller";
import { collegeAdminRepository, organizationRepository, bcryptService, jwtService, otpRepository, crossRoleAuthService } from "./infra.container";
import { EmailService } from "@infrastructure/services/email/email.service";

import { LoginCollegeAdminUseCase } from "@application/usecases/auth/organization/implementations/LoginCollegeAdmin.usecase";
import { UpdateCollegeOnboardingUseCase } from "@application/usecases/auth/organization/implementations/UpdateCollegeOnboarding.usecase";

export const makeUpdateCollegeOnboardingUseCase = () => {
    return new UpdateCollegeOnboardingUseCase(organizationRepository);
};

export const makeLoginCollegeAdminUseCase = () => {
    return new LoginCollegeAdminUseCase(collegeAdminRepository, organizationRepository, jwtService, bcryptService);
};

export const makeRegisterOrganizationUseCase = () => {
    return new RegisterOrganizationUseCase(
        collegeAdminRepository,
        organizationRepository,
        bcryptService,
        jwtService,
        otpRepository,
        new EmailService(),
        crossRoleAuthService
    );
};

export const makeVerifyCollegeOtpUseCase = () => {
    return new VerifyCollegeOtpUseCase(
        otpRepository,
        collegeAdminRepository,
        organizationRepository,
        jwtService
    );
};

export const makeCollegeAdminAuthController = () => {
    return new CollegeAdminAuthController(
        makeRegisterOrganizationUseCase(),
        makeVerifyCollegeOtpUseCase(),
        makeLoginCollegeAdminUseCase(),
        makeUpdateCollegeOnboardingUseCase()
    );
};
