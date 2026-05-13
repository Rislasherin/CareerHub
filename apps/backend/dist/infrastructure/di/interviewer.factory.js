"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeInterviewerAuthController = exports.makeLoginInterviewerUseCase = exports.makeActivateInterviewerUseCase = void 0;
const ActivateInterviewer_usecase_1 = require("@application/usecases/auth/interviewer/implementations/ActivateInterviewer.usecase");
const infra_container_1 = require("@infrastructure/di/infra.container");
const interviewer_auth_controller_1 = require("@presentation/http/controllers/auth/interviewer/interviewer.auth.controller");
const LoginInterviewer_usecase_1 = require("@application/usecases/auth/interviewer/implementations/LoginInterviewer.usecase");
const makeActivateInterviewerUseCase = () => {
    return new ActivateInterviewer_usecase_1.ActivateInterviewerUseCase(infra_container_1.interviewerRepository, infra_container_1.bcryptService, infra_container_1.jwtService);
};
exports.makeActivateInterviewerUseCase = makeActivateInterviewerUseCase;
const makeLoginInterviewerUseCase = () => {
    return new LoginInterviewer_usecase_1.LoginInterviewerUseCase(infra_container_1.interviewerRepository, infra_container_1.jwtService, infra_container_1.bcryptService);
};
exports.makeLoginInterviewerUseCase = makeLoginInterviewerUseCase;
const makeInterviewerAuthController = () => {
    return new interviewer_auth_controller_1.InterviewerAuthController((0, exports.makeActivateInterviewerUseCase)(), (0, exports.makeLoginInterviewerUseCase)());
};
exports.makeInterviewerAuthController = makeInterviewerAuthController;
