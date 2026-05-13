"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeStudentManagementController = exports.makeApproveAccessRequestUseCase = exports.makeBulkInviteStudentsUseCase = exports.makeRejectStudentUseCase = exports.makeApproveStudentUseCase = exports.makeGetPendingStudentsUseCase = void 0;
const GetPendingStudents_usecase_1 = require("@application/usecases/college/student-management/GetPendingStudents.usecase");
const ApproveStudent_usecase_1 = require("@application/usecases/college/student-management/ApproveStudent.usecase");
const RejectStudent_usecase_1 = require("@application/usecases/college/student-management/RejectStudent.usecase");
const BulkInviteStudents_usecase_1 = require("@application/usecases/college/student-management/BulkInviteStudents.usecase");
const ApproveAccessRequest_usecase_1 = require("@application/usecases/college/student-management/ApproveAccessRequest.usecase");
const email_service_1 = require("@infrastructure/services/email/email.service");
const infra_container_1 = require("@infrastructure/di/infra.container");
const student_management_controller_1 = require("@presentation/http/controllers/college/student.management.controller");
const makeGetPendingStudentsUseCase = () => {
    return new GetPendingStudents_usecase_1.GetPendingStudentsUseCase(infra_container_1.studentRepository);
};
exports.makeGetPendingStudentsUseCase = makeGetPendingStudentsUseCase;
const makeApproveStudentUseCase = () => {
    return new ApproveStudent_usecase_1.ApproveStudentUseCase(infra_container_1.studentRepository);
};
exports.makeApproveStudentUseCase = makeApproveStudentUseCase;
const makeRejectStudentUseCase = () => {
    return new RejectStudent_usecase_1.RejectStudentUseCase(infra_container_1.studentRepository);
};
exports.makeRejectStudentUseCase = makeRejectStudentUseCase;
const makeBulkInviteStudentsUseCase = () => {
    const emailService = new email_service_1.EmailService();
    return new BulkInviteStudents_usecase_1.BulkInviteStudentsUseCase(infra_container_1.studentRepository, emailService);
};
exports.makeBulkInviteStudentsUseCase = makeBulkInviteStudentsUseCase;
const makeApproveAccessRequestUseCase = () => {
    const emailService = new email_service_1.EmailService();
    return new ApproveAccessRequest_usecase_1.ApproveAccessRequestUseCase(infra_container_1.studentRepository, emailService);
};
exports.makeApproveAccessRequestUseCase = makeApproveAccessRequestUseCase;
const makeStudentManagementController = () => {
    return new student_management_controller_1.StudentManagementController((0, exports.makeGetPendingStudentsUseCase)(), (0, exports.makeApproveStudentUseCase)(), (0, exports.makeRejectStudentUseCase)(), (0, exports.makeBulkInviteStudentsUseCase)(), (0, exports.makeApproveAccessRequestUseCase)());
};
exports.makeStudentManagementController = makeStudentManagementController;
