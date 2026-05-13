"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeStudentController = exports.makeUploadStudentVerificationUseCase = void 0;
const UploadStudentVerification_usecase_1 = require("@application/usecases/auth/student/implementations/UploadStudentVerification.usecase");
const infra_container_1 = require("@infrastructure/di/infra.container");
const student_controller_1 = require("@presentation/http/controllers/student/student.controller");
const makeUploadStudentVerificationUseCase = () => {
    return new UploadStudentVerification_usecase_1.UploadStudentVerificationUseCase(infra_container_1.studentRepository);
};
exports.makeUploadStudentVerificationUseCase = makeUploadStudentVerificationUseCase;
const makeStudentController = () => {
    return new student_controller_1.StudentController((0, exports.makeUploadStudentVerificationUseCase)());
};
exports.makeStudentController = makeStudentController;
