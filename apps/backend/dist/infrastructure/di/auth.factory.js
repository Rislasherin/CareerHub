"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeForgotPasswordController = exports.makeStudentAuthController = exports.makeSetupStudentPasswordUseCase = exports.makeRequestAccessUseCase = exports.makeLoginStudentUseCase = void 0;
const login_student_usecase_1 = require("@application/usecases/auth/student/implementations/login.student.usecase");
const infra_container_1 = require("@infrastructure/di/infra.container");
const student_auth_controller_1 = require("@presentation/http/controllers/auth/student/student.auth.controller");
const ForgotPassword_usecase_1 = require("@application/usecases/auth/shared/ForgotPassword.usecase");
const ForgotPassword_controller_1 = require("@presentation/http/controllers/auth/ForgotPassword.controller");
const email_service_1 = require("@infrastructure/services/email/email.service");
const RequestAccess_usecase_1 = require("@application/usecases/auth/student/implementations/RequestAccess.usecase");
const SetupStudentPassword_usecase_1 = require("@application/usecases/auth/student/implementations/SetupStudentPassword.usecase");
const makeLoginStudentUseCase = () => {
    return new login_student_usecase_1.LoginStudentUseCase(infra_container_1.studentRepository, infra_container_1.jwtService, infra_container_1.bcryptService);
};
exports.makeLoginStudentUseCase = makeLoginStudentUseCase;
const makeRequestAccessUseCase = () => {
    return new RequestAccess_usecase_1.RequestAccessUseCase(infra_container_1.studentRepository);
};
exports.makeRequestAccessUseCase = makeRequestAccessUseCase;
const makeSetupStudentPasswordUseCase = () => {
    return new SetupStudentPassword_usecase_1.SetupStudentPasswordUseCase(infra_container_1.studentRepository, infra_container_1.bcryptService, infra_container_1.jwtService);
};
exports.makeSetupStudentPasswordUseCase = makeSetupStudentPasswordUseCase;
const makeStudentAuthController = () => {
    return new student_auth_controller_1.StudentAuthController((0, exports.makeLoginStudentUseCase)(), (0, exports.makeRequestAccessUseCase)(), (0, exports.makeSetupStudentPasswordUseCase)());
};
exports.makeStudentAuthController = makeStudentAuthController;
const ResetPassword_usecase_1 = require("@application/usecases/auth/shared/ResetPassword.usecase");
const makeForgotPasswordController = () => {
    const emailService = new email_service_1.EmailService();
    const forgotPasswordUseCase = new ForgotPassword_usecase_1.ForgotPasswordUseCase(emailService, infra_container_1.jwtService, infra_container_1.studentRepository, infra_container_1.hrUserRepository, infra_container_1.interviewerRepository, infra_container_1.collegeAdminRepository, infra_container_1.superAdminRepository);
    const resetPasswordUseCase = new ResetPassword_usecase_1.ResetPasswordUseCase(infra_container_1.jwtService, infra_container_1.bcryptService, infra_container_1.studentRepository, infra_container_1.hrUserRepository, infra_container_1.interviewerRepository, infra_container_1.collegeAdminRepository, infra_container_1.superAdminRepository);
    return new ForgotPassword_controller_1.ForgotPasswordController(forgotPasswordUseCase, resetPasswordUseCase);
};
exports.makeForgotPasswordController = makeForgotPasswordController;
