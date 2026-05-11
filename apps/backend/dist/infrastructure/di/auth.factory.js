"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLoginStudentUseCase = void 0;
const login_student_usecase_1 = require("@application/usecases/auth/student/implementations/login.student.usecase");
const infra_container_1 = require("@infrastructure/di/infra.container");
const makeLoginStudentUseCase = () => {
    return new login_student_usecase_1.LoginStudentUseCase(infra_container_1.studentRepository, infra_container_1.jwtService, infra_container_1.bcryptService);
};
exports.makeLoginStudentUseCase = makeLoginStudentUseCase;
