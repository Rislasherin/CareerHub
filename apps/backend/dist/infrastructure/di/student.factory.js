"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeStudentController = exports.makeApplyToJobUseCase = exports.makeGetStudentJobsUseCase = exports.makeUpdateStudentProfileUseCase = exports.makeUploadStudentVerificationUseCase = void 0;
const UploadStudentVerification_usecase_1 = require("@application/usecases/auth/student/implementations/UploadStudentVerification.usecase");
const infra_container_1 = require("@infrastructure/di/infra.container");
const student_controller_1 = require("@presentation/http/controllers/student/student.controller");
const Cloudinary_service_1 = require("@infrastructure/services/cloudinary/Cloudinary.service");
const UpdateStudentProfile_usecase_1 = require("@application/usecases/student/UpdateStudentProfile.usecase");
const GetStudentJobs_usecase_1 = require("@application/usecases/student/GetStudentJobs.usecase");
const ApplyToJob_usecase_1 = require("@application/usecases/student/ApplyToJob.usecase");
const makeUploadStudentVerificationUseCase = () => {
    const cloudinaryService = new Cloudinary_service_1.CloudinaryService();
    return new UploadStudentVerification_usecase_1.UploadStudentVerificationUseCase(infra_container_1.studentRepository, cloudinaryService);
};
exports.makeUploadStudentVerificationUseCase = makeUploadStudentVerificationUseCase;
const makeUpdateStudentProfileUseCase = () => {
    return new UpdateStudentProfile_usecase_1.UpdateStudentProfileUseCase(infra_container_1.studentRepository);
};
exports.makeUpdateStudentProfileUseCase = makeUpdateStudentProfileUseCase;
const makeGetStudentJobsUseCase = () => {
    return new GetStudentJobs_usecase_1.GetStudentJobsUseCase(infra_container_1.studentRepository, infra_container_1.jobRepository, infra_container_1.comptypeRepository);
};
exports.makeGetStudentJobsUseCase = makeGetStudentJobsUseCase;
const makeApplyToJobUseCase = () => {
    return new ApplyToJob_usecase_1.ApplyToJobUseCase(infra_container_1.studentRepository, infra_container_1.jobRepository);
};
exports.makeApplyToJobUseCase = makeApplyToJobUseCase;
const makeStudentController = () => {
    return new student_controller_1.StudentController((0, exports.makeUploadStudentVerificationUseCase)(), (0, exports.makeUpdateStudentProfileUseCase)(), infra_container_1.studentRepository, (0, exports.makeGetStudentJobsUseCase)(), (0, exports.makeApplyToJobUseCase)());
};
exports.makeStudentController = makeStudentController;
