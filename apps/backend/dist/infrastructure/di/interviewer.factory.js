"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeInterviewerAuthController = exports.makeVerifyInterviewerTokenUseCase = exports.makeLoginInterviewerUseCase = exports.makeActivateInterviewerUseCase = void 0;
const ActivateInterviewer_usecase_1 = require("@application/usecases/auth/interviewer/implementations/ActivateInterviewer.usecase");
const infra_container_1 = require("@infrastructure/di/infra.container");
const interviewer_auth_controller_1 = require("@presentation/http/controllers/auth/interviewer/interviewer.auth.controller");
const LoginInterviewer_usecase_1 = require("@application/usecases/auth/interviewer/implementations/LoginInterviewer.usecase");
const VerifyInterviewerToken_usecase_1 = require("@application/usecases/auth/interviewer/implementations/VerifyInterviewerToken.usecase");
const makeActivateInterviewerUseCase = () => {
    return new ActivateInterviewer_usecase_1.ActivateInterviewerUseCase(infra_container_1.interviewerRepository, infra_container_1.bcryptService, infra_container_1.jwtService);
};
exports.makeActivateInterviewerUseCase = makeActivateInterviewerUseCase;
const makeLoginInterviewerUseCase = () => {
    return new LoginInterviewer_usecase_1.LoginInterviewerUseCase(infra_container_1.interviewerRepository, infra_container_1.companyRepository, infra_container_1.jwtService, infra_container_1.bcryptService, infra_container_1.crossRoleAuthService);
};
exports.makeLoginInterviewerUseCase = makeLoginInterviewerUseCase;
const makeVerifyInterviewerTokenUseCase = () => {
    return new VerifyInterviewerToken_usecase_1.VerifyInterviewerTokenUseCase(infra_container_1.interviewerRepository, infra_container_1.jwtService);
};
exports.makeVerifyInterviewerTokenUseCase = makeVerifyInterviewerTokenUseCase;
const makeInterviewerAuthController = () => {
    return new interviewer_auth_controller_1.InterviewerAuthController((0, exports.makeActivateInterviewerUseCase)(), (0, exports.makeLoginInterviewerUseCase)(), (0, exports.makeVerifyInterviewerTokenUseCase)());
};
exports.makeInterviewerAuthController = makeInterviewerAuthController;
