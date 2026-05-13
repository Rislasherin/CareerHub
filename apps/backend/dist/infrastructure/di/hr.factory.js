"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeInterviewerManagementController = exports.makeToggleInterviewerStatusUseCase = exports.makeGetInterviewersUseCase = exports.makeAddInterviewerUseCase = exports.makeHRAuthController = exports.makeUpdateCompanyOnboardingUseCase = exports.makeVerifyCompanyOtpUseCase = exports.makeRegisterCompanyUseCase = exports.makeLoginHRUseCase = void 0;
const RegisterCompany_usecase_1 = require("@application/usecases/auth/hr/implementations/RegisterCompany.usecase");
const UpdateCompanyOnboarding_usecase_1 = require("@application/usecases/auth/hr/implementations/UpdateCompanyOnboarding.usecase");
const AddInterviewer_usecase_1 = require("@application/usecases/hr/interviewer-management/AddInterviewer.usecase");
const GetInterviewers_usecase_1 = require("@application/usecases/hr/interviewer-management/GetInterviewers.usecase");
const ToggleInterviewerStatus_usecase_1 = require("@application/usecases/hr/interviewer-management/ToggleInterviewerStatus.usecase");
const VerifyCompanyOtp_usecase_1 = require("@application/usecases/auth/hr/implementations/VerifyCompanyOtp.usecase");
const infra_container_1 = require("@infrastructure/di/infra.container");
const hr_auth_controller_1 = require("@presentation/http/controllers/auth/hr/hr.auth.controller");
const interviewer_management_controller_1 = require("@presentation/http/controllers/hr/interviewer.management.controller");
const email_service_1 = require("@infrastructure/services/email/email.service");
const LoginHR_usecase_1 = require("@application/usecases/auth/hr/implementations/LoginHR.usecase");
const emailService = new email_service_1.EmailService();
const makeLoginHRUseCase = () => {
    return new LoginHR_usecase_1.LoginHRUseCase(infra_container_1.hrUserRepository, infra_container_1.jwtService, infra_container_1.bcryptService);
};
exports.makeLoginHRUseCase = makeLoginHRUseCase;
const makeRegisterCompanyUseCase = () => {
    return new RegisterCompany_usecase_1.RegisterCompanyUseCase(infra_container_1.companyRepository, infra_container_1.hrUserRepository, infra_container_1.bcryptService, infra_container_1.jwtService, infra_container_1.otpRepository, emailService);
};
exports.makeRegisterCompanyUseCase = makeRegisterCompanyUseCase;
const makeVerifyCompanyOtpUseCase = () => {
    return new VerifyCompanyOtp_usecase_1.VerifyCompanyOtpUseCase(infra_container_1.otpRepository, infra_container_1.hrUserRepository, infra_container_1.companyRepository, infra_container_1.jwtService);
};
exports.makeVerifyCompanyOtpUseCase = makeVerifyCompanyOtpUseCase;
const makeUpdateCompanyOnboardingUseCase = () => {
    return new UpdateCompanyOnboarding_usecase_1.UpdateCompanyOnboardingUseCase(infra_container_1.companyRepository);
};
exports.makeUpdateCompanyOnboardingUseCase = makeUpdateCompanyOnboardingUseCase;
const makeHRAuthController = () => {
    return new hr_auth_controller_1.HRAuthController((0, exports.makeRegisterCompanyUseCase)(), (0, exports.makeUpdateCompanyOnboardingUseCase)(), (0, exports.makeVerifyCompanyOtpUseCase)(), (0, exports.makeLoginHRUseCase)());
};
exports.makeHRAuthController = makeHRAuthController;
const makeAddInterviewerUseCase = () => {
    return new AddInterviewer_usecase_1.AddInterviewerUseCase(infra_container_1.interviewerRepository, emailService, infra_container_1.jwtService);
};
exports.makeAddInterviewerUseCase = makeAddInterviewerUseCase;
const makeGetInterviewersUseCase = () => {
    return new GetInterviewers_usecase_1.GetInterviewersUseCase(infra_container_1.interviewerRepository);
};
exports.makeGetInterviewersUseCase = makeGetInterviewersUseCase;
const makeToggleInterviewerStatusUseCase = () => {
    return new ToggleInterviewerStatus_usecase_1.ToggleInterviewerStatusUseCase(infra_container_1.interviewerRepository);
};
exports.makeToggleInterviewerStatusUseCase = makeToggleInterviewerStatusUseCase;
const makeInterviewerManagementController = () => {
    return new interviewer_management_controller_1.InterviewerManagementController((0, exports.makeAddInterviewerUseCase)(), (0, exports.makeGetInterviewersUseCase)(), (0, exports.makeToggleInterviewerStatusUseCase)());
};
exports.makeInterviewerManagementController = makeInterviewerManagementController;
