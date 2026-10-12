import { RegisterOrganizationUseCase } from "@application/usecases/auth/organization/implementations/register.organization.usecase";
import { VerifyCollegeOtpUseCase } from "@application/usecases/auth/organization/implementations/VerifyCollegeOtp.usecase";
import { CollegeAdminAuthController } from "@presentation/http/controllers/auth/organization/college.admin.auth.controller";
import { collegeAdminRepository, organizationRepository, bcryptService, jwtService, otpRepository, crossRoleAuthService } from "./infra.container";
import { EmailService } from "@infrastructure/services/email/email.service";

import { LoginCollegeAdminUseCase } from "@application/usecases/auth/organization/implementations/LoginCollegeAdmin.usecase";
import { UpdateCollegeOnboardingUseCase } from "@application/usecases/auth/organization/implementations/UpdateCollegeOnboarding.usecase";

export const makeUpdateCollegeOnboardingUseCase = () => {
    return new UpdateCollegeOnboardingUseCase(organizationRepository, collegeAdminRepository);
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

import { CloudinaryService } from "@infrastructure/services/cloudinary/Cloudinary.service";
import { UploadCollegeVerificationDocumentUseCase } from "@application/usecases/auth/organization/implementations/UploadCollegeVerificationDocument.usecase";
import { DeleteCollegeVerificationDocumentUseCase } from "@application/usecases/auth/organization/implementations/DeleteCollegeVerificationDocument.usecase";

export const makeUploadCollegeVerificationDocumentUseCase = () => {
    const cloudinaryService = new CloudinaryService();
    return new UploadCollegeVerificationDocumentUseCase(organizationRepository, cloudinaryService);
};

export const makeDeleteCollegeVerificationDocumentUseCase = () => {
    return new DeleteCollegeVerificationDocumentUseCase(organizationRepository);
};

export const makeCollegeAdminAuthController = () => {
    return new CollegeAdminAuthController(
        makeRegisterOrganizationUseCase(),
        makeVerifyCollegeOtpUseCase(),
        makeLoginCollegeAdminUseCase(),
        makeUpdateCollegeOnboardingUseCase(),
        makeUploadCollegeVerificationDocumentUseCase(),
        makeDeleteCollegeVerificationDocumentUseCase()
    );
};
