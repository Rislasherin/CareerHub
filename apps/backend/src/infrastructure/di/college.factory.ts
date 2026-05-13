import { GetPendingStudentsUseCase } from "@application/usecases/college/student-management/GetPendingStudents.usecase";
import { ApproveStudentUseCase } from "@application/usecases/college/student-management/ApproveStudent.usecase";
import { RejectStudentUseCase } from "@application/usecases/college/student-management/RejectStudent.usecase";
import { BulkInviteStudentsUseCase } from "@application/usecases/college/student-management/BulkInviteStudents.usecase";
import { ApproveAccessRequestUseCase } from "@application/usecases/college/student-management/ApproveAccessRequest.usecase";
import { GetAllStudentsUseCase } from "@application/usecases/college/student-management/GetAllStudents.usecase";
import { ToggleStudentStatusUseCase } from "@application/usecases/college/student-management/ToggleStudentStatus.usecase";
import { GetCollegeDashboardStatsUseCase } from "@application/usecases/college/GetCollegeDashboardStats.usecase";
import { EmailService } from "@infrastructure/services/email/email.service";
import { studentRepository, crossRoleAuthService } from "@infrastructure/di/infra.container";
import { StudentManagementController } from "@presentation/http/controllers/college/student.management.controller";

export const makeGetPendingStudentsUseCase = () => {
  return new GetPendingStudentsUseCase(studentRepository);
};

export const makeApproveStudentUseCase = () => {
  return new ApproveStudentUseCase(studentRepository);
};

export const makeRejectStudentUseCase = () => {
  return new RejectStudentUseCase(studentRepository);
};

export const makeBulkInviteStudentsUseCase = () => {
  const emailService = new EmailService();
  return new BulkInviteStudentsUseCase(studentRepository, emailService, crossRoleAuthService);
};

export const makeApproveAccessRequestUseCase = () => {
  const emailService = new EmailService();
  return new ApproveAccessRequestUseCase(studentRepository, emailService);
};

export const makeGetCollegeDashboardStatsUseCase = () => {
  return new GetCollegeDashboardStatsUseCase(studentRepository);
};

export const makeGetAllStudentsUseCase = () => {
  return new GetAllStudentsUseCase(studentRepository);
};

export const makeToggleStudentStatusUseCase = () => {
  return new ToggleStudentStatusUseCase(studentRepository);
};

export const makeStudentManagementController = () => {
  return new StudentManagementController(
    makeGetPendingStudentsUseCase(),
    makeApproveStudentUseCase(),
    makeRejectStudentUseCase(),
    makeBulkInviteStudentsUseCase(),
    makeApproveAccessRequestUseCase(),
    makeGetCollegeDashboardStatsUseCase(),
    makeGetAllStudentsUseCase(),
    makeToggleStudentStatusUseCase()
  );
};
