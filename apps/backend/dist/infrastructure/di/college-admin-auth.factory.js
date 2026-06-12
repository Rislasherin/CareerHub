"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCollegeAdminAuthController = exports.makeVerifyCollegeOtpUseCase = exports.makeRegisterOrganizationUseCase = exports.makeLoginCollegeAdminUseCase = exports.makeUpdateCollegeOnboardingUseCase = void 0;
const register_organization_usecase_1 = require("@application/usecases/auth/organization/implementations/register.organization.usecase");
const VerifyCollegeOtp_usecase_1 = require("@application/usecases/auth/organization/implementations/VerifyCollegeOtp.usecase");
const college_admin_auth_controller_1 = require("@presentation/http/controllers/auth/organization/college.admin.auth.controller");
const infra_container_1 = require("./infra.container");
const email_service_1 = require("@infrastructure/services/email/email.service");
const LoginCollegeAdmin_usecase_1 = require("@application/usecases/auth/organization/implementations/LoginCollegeAdmin.usecase");
const UpdateCollegeOnboarding_usecase_1 = require("@application/usecases/auth/organization/implementations/UpdateCollegeOnboarding.usecase");
const makeUpdateCollegeOnboardingUseCase = () => {
    return new UpdateCollegeOnboarding_usecase_1.UpdateCollegeOnboardingUseCase(infra_container_1.organizationRepository);
};
exports.makeUpdateCollegeOnboardingUseCase = makeUpdateCollegeOnboardingUseCase;
const makeLoginCollegeAdminUseCase = () => {
    return new LoginCollegeAdmin_usecase_1.LoginCollegeAdminUseCase(infra_container_1.collegeAdminRepository, infra_container_1.organizationRepository, infra_container_1.jwtService, infra_container_1.bcryptService);
};
exports.makeLoginCollegeAdminUseCase = makeLoginCollegeAdminUseCase;
const makeRegisterOrganizationUseCase = () => {
    return new register_organization_usecase_1.RegisterOrganizationUseCase(infra_container_1.collegeAdminRepository, infra_container_1.organizationRepository, infra_container_1.bcryptService, infra_container_1.jwtService, infra_container_1.otpRepository, new email_service_1.EmailService(), infra_container_1.crossRoleAuthService);
};
exports.makeRegisterOrganizationUseCase = makeRegisterOrganizationUseCase;
const makeVerifyCollegeOtpUseCase = () => {
    return new VerifyCollegeOtp_usecase_1.VerifyCollegeOtpUseCase(infra_container_1.otpRepository, infra_container_1.collegeAdminRepository, infra_container_1.organizationRepository, infra_container_1.jwtService);
};
exports.makeVerifyCollegeOtpUseCase = makeVerifyCollegeOtpUseCase;
const makeCollegeAdminAuthController = () => {
    return new college_admin_auth_controller_1.CollegeAdminAuthController((0, exports.makeRegisterOrganizationUseCase)(), (0, exports.makeVerifyCollegeOtpUseCase)(), (0, exports.makeLoginCollegeAdminUseCase)(), (0, exports.makeUpdateCollegeOnboardingUseCase)());
};
exports.makeCollegeAdminAuthController = makeCollegeAdminAuthController;
