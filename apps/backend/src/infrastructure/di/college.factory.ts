import { GetPendingStudentsUseCase } from "@application/usecases/college/student-management/GetPendingStudents.usecase";
import { ApproveStudentUseCase } from "@application/usecases/college/student-management/ApproveStudent.usecase";
import { RejectStudentUseCase } from "@application/usecases/college/student-management/RejectStudent.usecase";
import { BulkInviteStudentsUseCase } from "@application/usecases/college/student-management/BulkInviteStudents.usecase";
import { ApproveAccessRequestUseCase } from "@application/usecases/college/student-management/ApproveAccessRequest.usecase";
import { GetAllStudentsUseCase } from "@application/usecases/college/student-management/GetAllStudents.usecase";
import { ToggleStudentStatusUseCase } from "@application/usecases/college/student-management/ToggleStudentStatus.usecase";
import { GetCollegeDashboardStatsUseCase } from "@application/usecases/college/GetCollegeDashboardStats.usecase";
import { EmailService } from "@infrastructure/services/email/email.service";
import { studentRepository, crossRoleAuthService, jobRepository, organizationRepository } from "@infrastructure/di/infra.container";
import { StudentManagementController } from "@presentation/http/controllers/college/student.management.controller";
import { GetPendingJobsUseCase } from "@application/usecases/college/job-approvals/GetPendingJobs.usecase";
import { ApproveJobUseCase } from "@application/usecases/college/job-approvals/ApproveJob.usecase";
import { RejectJobUseCase } from "@application/usecases/college/job-approvals/RejectJob.usecase";
import { CollegeJobApprovalController } from "@presentation/http/controllers/college/job.approval.controller";
import { CreateNoticeUseCase } from "@application/usecases/college/notices/implementations/CreateNotice.usecase";
import { GetCollegeNoticeUseCase } from "@application/usecases/college/notices/implementations/GetCollegeNotices.usecase";
import { NoticeController } from "@presentation/http/controllers/college/notice.controller";
import { noticeRepository } from "@infrastructure/di/infra.container";
import { UpdateNoticeUseCase } from "@application/usecases/college/notices/implementations/UpdateNotice.usecase";
import { DeleteNoticeUseCase } from "@application/usecases/college/notices/implementations/Delete.notice.UseCase";


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

export const makeGetPendingJobsUseCase = () => {
  return new GetPendingJobsUseCase(jobRepository, organizationRepository);
};

export const makeApproveJobUseCase = () => {
  return new ApproveJobUseCase(jobRepository);
};

export const makeRejectJobUseCase = () => {
  return new RejectJobUseCase(jobRepository);
};

export const makeCollegeJobApprovalController = () => {
  return new CollegeJobApprovalController(
    makeGetPendingJobsUseCase(),
    makeApproveJobUseCase(),
    makeRejectJobUseCase()
  );
};

export const makeCreateNoticeUseCase = () => {
  return new CreateNoticeUseCase(noticeRepository)
};

export const makeGetCollegeNoticeUseCase = () => {
  return new GetCollegeNoticeUseCase(noticeRepository)
};

export const makeUpdateNoticeUseCase = () => {
  return new UpdateNoticeUseCase(noticeRepository)
}
export const makeDeleteNoticeUseCase = () =>{
  return new DeleteNoticeUseCase(noticeRepository)
}

export const makeNoticeController = () => {
  return new NoticeController(
    makeCreateNoticeUseCase(),
    makeGetCollegeNoticeUseCase(),
    makeDeleteNoticeUseCase(),
    makeUpdateNoticeUseCase(),
  )
}