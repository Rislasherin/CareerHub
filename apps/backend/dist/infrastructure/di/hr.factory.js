"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeHRJobController = exports.makeGetHRCandidatesUseCase = exports.makeDeleteJobUseCase = exports.makeCloseJobUseCase = exports.makeGetHRJobsUseCase = exports.makePostJobUseCase = exports.makeHRDashboardController = exports.makeGetHRDashboardStatsUseCase = exports.makeInterviewerManagementController = exports.makeRestoreInterviewerUseCase = exports.makeDeleteInterviewerUseCase = exports.makeUpdateInterviewerUseCase = exports.makeResendInterviewerInviteUseCase = exports.makeToggleInterviewerStatusUseCase = exports.makeGetInterviewersUseCase = exports.makeAddInterviewerUseCase = exports.makeHRAuthController = exports.makeUpdateComptypeOnboardingUseCase = exports.makeVerifyComptypeOtpUseCase = exports.makeRegisterComptypeUseCase = exports.makeLoginHRUseCase = void 0;
const RegisterComptype_usecase_1 = require("@application/usecases/auth/hr/implementations/RegisterComptype.usecase");
const UpdateComptypeOnboarding_usecase_1 = require("@application/usecases/auth/hr/implementations/UpdateComptypeOnboarding.usecase");
const AddInterviewer_usecase_1 = require("@application/usecases/hr/interviewer-management/AddInterviewer.usecase");
const GetInterviewers_usecase_1 = require("@application/usecases/hr/interviewer-management/GetInterviewers.usecase");
const ToggleInterviewerStatus_usecase_1 = require("@application/usecases/hr/interviewer-management/ToggleInterviewerStatus.usecase");
const VerifyComptypeOtp_usecase_1 = require("@application/usecases/auth/hr/implementations/VerifyComptypeOtp.usecase");
const GetHRDashboardStats_usecase_1 = require("@application/usecases/hr/dashboard/GetHRDashboardStats.usecase");
const hr_dashboard_controller_1 = require("@presentation/http/controllers/hr/hr.dashboard.controller");
const PostJob_usecase_1 = require("@application/usecases/hr/job-engine/PostJob.usecase");
const GetHRJobs_usecase_1 = require("@application/usecases/hr/job-engine/GetHRJobs.usecase");
const CloseJob_usecase_1 = require("@application/usecases/hr/job-engine/CloseJob.usecase");
const DeleteJob_usecase_1 = require("@application/usecases/hr/job-engine/DeleteJob.usecase");
const job_controller_1 = require("@presentation/http/controllers/hr/job.controller");
const GetHRCandidates_usecase_1 = require("@application/usecases/hr/job-engine/GetHRCandidates.usecase");
const infra_container_1 = require("@infrastructure/di/infra.container");
const hr_auth_controller_1 = require("@presentation/http/controllers/auth/hr/hr.auth.controller");
const interviewer_management_controller_1 = require("@presentation/http/controllers/hr/interviewer.management.controller");
const email_service_1 = require("@infrastructure/services/email/email.service");
const LoginHR_usecase_1 = require("@application/usecases/auth/hr/implementations/LoginHR.usecase");
const UpdateInterviewer_usecase_1 = require("@application/usecases/hr/interviewer-management/UpdateInterviewer.usecase");
const DeleteInterviewer_usecase_1 = require("@application/usecases/hr/interviewer-management/DeleteInterviewer.usecase");
const RestoreInterviewer_usecase_1 = require("@application/usecases/hr/interviewer-management/RestoreInterviewer.usecase");
const ResendInterviewerInvite_usecase_1 = require("@application/usecases/hr/interviewer-management/ResendInterviewerInvite.usecase");
const emailService = new email_service_1.EmailService();
const makeLoginHRUseCase = () => {
    return new LoginHR_usecase_1.LoginHRUseCase(infra_container_1.hrUserRepository, infra_container_1.comptypeRepository, infra_container_1.jwtService, infra_container_1.bcryptService);
};
exports.makeLoginHRUseCase = makeLoginHRUseCase;
const makeRegisterComptypeUseCase = () => {
    return new RegisterComptype_usecase_1.RegisterComptypeUseCase(infra_container_1.comptypeRepository, infra_container_1.hrUserRepository, infra_container_1.bcryptService, infra_container_1.jwtService, infra_container_1.otpRepository, emailService, infra_container_1.crossRoleAuthService);
};
exports.makeRegisterComptypeUseCase = makeRegisterComptypeUseCase;
const makeVerifyComptypeOtpUseCase = () => {
    return new VerifyComptypeOtp_usecase_1.VerifyComptypeOtpUseCase(infra_container_1.otpRepository, infra_container_1.hrUserRepository, infra_container_1.comptypeRepository, infra_container_1.jwtService);
};
exports.makeVerifyComptypeOtpUseCase = makeVerifyComptypeOtpUseCase;
const makeUpdateComptypeOnboardingUseCase = () => {
    return new UpdateComptypeOnboarding_usecase_1.UpdateComptypeOnboardingUseCase(infra_container_1.comptypeRepository);
};
exports.makeUpdateComptypeOnboardingUseCase = makeUpdateComptypeOnboardingUseCase;
const makeHRAuthController = () => {
    return new hr_auth_controller_1.HRAuthController((0, exports.makeRegisterComptypeUseCase)(), (0, exports.makeUpdateComptypeOnboardingUseCase)(), (0, exports.makeVerifyComptypeOtpUseCase)(), (0, exports.makeLoginHRUseCase)());
};
exports.makeHRAuthController = makeHRAuthController;
const makeAddInterviewerUseCase = () => {
    return new AddInterviewer_usecase_1.AddInterviewerUseCase(infra_container_1.interviewerRepository, emailService, infra_container_1.jwtService, infra_container_1.crossRoleAuthService);
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
const makeResendInterviewerInviteUseCase = () => {
    return new ResendInterviewerInvite_usecase_1.ResendInterviewerInviteUseCase(infra_container_1.interviewerRepository, emailService, infra_container_1.jwtService);
};
exports.makeResendInterviewerInviteUseCase = makeResendInterviewerInviteUseCase;
const makeUpdateInterviewerUseCase = () => {
    return new UpdateInterviewer_usecase_1.UpdateInterviewerUseCase(infra_container_1.interviewerRepository);
};
exports.makeUpdateInterviewerUseCase = makeUpdateInterviewerUseCase;
const makeDeleteInterviewerUseCase = () => {
    return new DeleteInterviewer_usecase_1.DeleteInterviewerUseCase(infra_container_1.interviewerRepository);
};
exports.makeDeleteInterviewerUseCase = makeDeleteInterviewerUseCase;
const makeRestoreInterviewerUseCase = () => {
    return new RestoreInterviewer_usecase_1.RestoreInterviewerUseCase(infra_container_1.interviewerRepository);
};
exports.makeRestoreInterviewerUseCase = makeRestoreInterviewerUseCase;
const makeInterviewerManagementController = () => {
    return new interviewer_management_controller_1.InterviewerManagementController((0, exports.makeAddInterviewerUseCase)(), (0, exports.makeGetInterviewersUseCase)(), (0, exports.makeToggleInterviewerStatusUseCase)(), (0, exports.makeResendInterviewerInviteUseCase)(), (0, exports.makeUpdateInterviewerUseCase)(), (0, exports.makeDeleteInterviewerUseCase)(), (0, exports.makeRestoreInterviewerUseCase)());
};
exports.makeInterviewerManagementController = makeInterviewerManagementController;
const makeGetHRDashboardStatsUseCase = () => {
    return new GetHRDashboardStats_usecase_1.GetHRDashboardStatsUseCase(infra_container_1.interviewerRepository);
};
exports.makeGetHRDashboardStatsUseCase = makeGetHRDashboardStatsUseCase;
const makeHRDashboardController = () => {
    return new hr_dashboard_controller_1.HRDashboardController((0, exports.makeGetHRDashboardStatsUseCase)());
};
exports.makeHRDashboardController = makeHRDashboardController;
const makePostJobUseCase = () => {
    return new PostJob_usecase_1.PostJobUseCase(infra_container_1.jobRepository);
};
exports.makePostJobUseCase = makePostJobUseCase;
const makeGetHRJobsUseCase = () => {
    return new GetHRJobs_usecase_1.GetHRJobsUseCase(infra_container_1.jobRepository);
};
exports.makeGetHRJobsUseCase = makeGetHRJobsUseCase;
const makeCloseJobUseCase = () => {
    return new CloseJob_usecase_1.CloseJobUseCase(infra_container_1.jobRepository);
};
exports.makeCloseJobUseCase = makeCloseJobUseCase;
const makeDeleteJobUseCase = () => {
    return new DeleteJob_usecase_1.DeleteJobUseCase(infra_container_1.jobRepository);
};
exports.makeDeleteJobUseCase = makeDeleteJobUseCase;
const makeGetHRCandidatesUseCase = () => {
    return new GetHRCandidates_usecase_1.GetHRCandidatesUseCase(infra_container_1.jobRepository, infra_container_1.studentRepository);
};
exports.makeGetHRCandidatesUseCase = makeGetHRCandidatesUseCase;
const makeHRJobController = () => {
    return new job_controller_1.HRJobController((0, exports.makePostJobUseCase)(), (0, exports.makeGetHRJobsUseCase)(), (0, exports.makeCloseJobUseCase)(), (0, exports.makeDeleteJobUseCase)(), (0, exports.makeGetHRCandidatesUseCase)());
};
exports.makeHRJobController = makeHRJobController;
