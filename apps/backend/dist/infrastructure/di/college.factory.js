"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCollegeJobApprovalController = exports.makeRejectJobUseCase = exports.makeApproveJobUseCase = exports.makeGetPendingJobsUseCase = exports.makeStudentManagementController = exports.makeToggleStudentStatusUseCase = exports.makeGetAllStudentsUseCase = exports.makeGetCollegeDashboardStatsUseCase = exports.makeApproveAccessRequestUseCase = exports.makeBulkInviteStudentsUseCase = exports.makeRejectStudentUseCase = exports.makeApproveStudentUseCase = exports.makeGetPendingStudentsUseCase = void 0;
const GetPendingStudents_usecase_1 = require("@application/usecases/college/student-management/GetPendingStudents.usecase");
const ApproveStudent_usecase_1 = require("@application/usecases/college/student-management/ApproveStudent.usecase");
const RejectStudent_usecase_1 = require("@application/usecases/college/student-management/RejectStudent.usecase");
const BulkInviteStudents_usecase_1 = require("@application/usecases/college/student-management/BulkInviteStudents.usecase");
const ApproveAccessRequest_usecase_1 = require("@application/usecases/college/student-management/ApproveAccessRequest.usecase");
const GetAllStudents_usecase_1 = require("@application/usecases/college/student-management/GetAllStudents.usecase");
const ToggleStudentStatus_usecase_1 = require("@application/usecases/college/student-management/ToggleStudentStatus.usecase");
const GetCollegeDashboardStats_usecase_1 = require("@application/usecases/college/GetCollegeDashboardStats.usecase");
const email_service_1 = require("@infrastructure/services/email/email.service");
const infra_container_1 = require("@infrastructure/di/infra.container");
const student_management_controller_1 = require("@presentation/http/controllers/college/student.management.controller");
const GetPendingJobs_usecase_1 = require("@application/usecases/college/job-approvals/GetPendingJobs.usecase");
const ApproveJob_usecase_1 = require("@application/usecases/college/job-approvals/ApproveJob.usecase");
const RejectJob_usecase_1 = require("@application/usecases/college/job-approvals/RejectJob.usecase");
const job_approval_controller_1 = require("@presentation/http/controllers/college/job.approval.controller");
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
    return new BulkInviteStudents_usecase_1.BulkInviteStudentsUseCase(infra_container_1.studentRepository, emailService, infra_container_1.crossRoleAuthService);
};
exports.makeBulkInviteStudentsUseCase = makeBulkInviteStudentsUseCase;
const makeApproveAccessRequestUseCase = () => {
    const emailService = new email_service_1.EmailService();
    return new ApproveAccessRequest_usecase_1.ApproveAccessRequestUseCase(infra_container_1.studentRepository, emailService);
};
exports.makeApproveAccessRequestUseCase = makeApproveAccessRequestUseCase;
const makeGetCollegeDashboardStatsUseCase = () => {
    return new GetCollegeDashboardStats_usecase_1.GetCollegeDashboardStatsUseCase(infra_container_1.studentRepository);
};
exports.makeGetCollegeDashboardStatsUseCase = makeGetCollegeDashboardStatsUseCase;
const makeGetAllStudentsUseCase = () => {
    return new GetAllStudents_usecase_1.GetAllStudentsUseCase(infra_container_1.studentRepository);
};
exports.makeGetAllStudentsUseCase = makeGetAllStudentsUseCase;
const makeToggleStudentStatusUseCase = () => {
    return new ToggleStudentStatus_usecase_1.ToggleStudentStatusUseCase(infra_container_1.studentRepository);
};
exports.makeToggleStudentStatusUseCase = makeToggleStudentStatusUseCase;
const makeStudentManagementController = () => {
    return new student_management_controller_1.StudentManagementController((0, exports.makeGetPendingStudentsUseCase)(), (0, exports.makeApproveStudentUseCase)(), (0, exports.makeRejectStudentUseCase)(), (0, exports.makeBulkInviteStudentsUseCase)(), (0, exports.makeApproveAccessRequestUseCase)(), (0, exports.makeGetCollegeDashboardStatsUseCase)(), (0, exports.makeGetAllStudentsUseCase)(), (0, exports.makeToggleStudentStatusUseCase)());
};
exports.makeStudentManagementController = makeStudentManagementController;
const makeGetPendingJobsUseCase = () => {
    return new GetPendingJobs_usecase_1.GetPendingJobsUseCase(infra_container_1.jobRepository, infra_container_1.organizationRepository);
};
exports.makeGetPendingJobsUseCase = makeGetPendingJobsUseCase;
const makeApproveJobUseCase = () => {
    return new ApproveJob_usecase_1.ApproveJobUseCase(infra_container_1.jobRepository);
};
exports.makeApproveJobUseCase = makeApproveJobUseCase;
const makeRejectJobUseCase = () => {
    return new RejectJob_usecase_1.RejectJobUseCase(infra_container_1.jobRepository);
};
exports.makeRejectJobUseCase = makeRejectJobUseCase;
const makeCollegeJobApprovalController = () => {
    return new job_approval_controller_1.CollegeJobApprovalController((0, exports.makeGetPendingJobsUseCase)(), (0, exports.makeApproveJobUseCase)(), (0, exports.makeRejectJobUseCase)());
};
exports.makeCollegeJobApprovalController = makeCollegeJobApprovalController;
