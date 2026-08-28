import { GetPendingStudentsUseCase } from "@application/usecases/college/student-management/implementations/GetPendingStudents.usecase";;
import { ApproveStudentUseCase } from "@application/usecases/college/student-management/implementations/ApproveStudent.usecase";;
import { RejectStudentUseCase } from "@application/usecases/college/student-management/implementations/RejectStudent.usecase";;
import { BulkInviteStudentsUseCase } from "@application/usecases/college/student-management/implementations/BulkInviteStudents.usecase";;
import { ApproveAccessRequestUseCase } from "@application/usecases/college/student-management/implementations/ApproveAccessRequest.usecase";;
import { GetAllStudentsUseCase } from "@application/usecases/college/student-management/implementations/GetAllStudents.usecase";;
import { ToggleStudentStatusUseCase } from "@application/usecases/college/student-management/implementations/ToggleStudentStatus.usecase";;
import { GetCollegeDashboardStatsUseCase } from "@application/usecases/college/implementations/GetCollegeDashboardStats.usecase";;
import { EmailService } from "@infrastructure/services/email/email.service";
import { studentRepository, crossRoleAuthService, jobRepository, organizationRepository, collegeAdminRepository, otpRepository, bcryptService } from "@infrastructure/di/infra.container";
import { StudentManagementController } from "@presentation/http/controllers/college/student.management.controller";
import { GetPendingJobsUseCase } from "@application/usecases/college/job-approvals/implementations/GetPendingJobs.usecase";;
import { ApproveJobUseCase } from "@application/usecases/college/job-approvals/implementations/ApproveJob.usecase";;
import { RejectJobUseCase } from "@application/usecases/college/job-approvals/implementations/RejectJob.usecase";;
import { CollegeJobApprovalController } from "@presentation/http/controllers/college/job.approval.controller";
import { CreateNoticeUseCase } from "@application/usecases/college/notices/implementations/CreateNotice.usecase";
import { GetCollegeNoticeUseCase } from "@application/usecases/college/notices/implementations/GetCollegeNotices.usecase";
import { NoticeController } from "@presentation/http/controllers/college/notice.controller";
import { noticeRepository } from "@infrastructure/di/infra.container";
import { UpdateNoticeUseCase } from "@application/usecases/college/notices/implementations/UpdateNotice.usecase";
import { DeleteNoticeUseCase } from "@application/usecases/college/notices/implementations/Delete.notice.UseCase";
import { CreateSubscriptionUseCase } from "@application/usecases/college/implementations/CreateSubscription.usecase";
import { HandlePaymentWebhookUseCase } from "@application/usecases/college/implementations/HandlePaymentWebhook.usecase";
import { SubscriptionController } from "@presentation/http/controllers/college/SubscriptionController";
import { subscriptionRepository, paymentGateway } from "@infrastructure/di/infra.container";

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
  return new GetCollegeDashboardStatsUseCase(studentRepository, jobRepository);
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

export const makeCreateSubscriptionUseCase = () => {
  return new CreateSubscriptionUseCase(subscriptionRepository, paymentGateway);
};

export const makeHandlePaymentWebhookUseCase = () => {
  return new HandlePaymentWebhookUseCase(subscriptionRepository, paymentGateway);
};

import { GetCollegeSubscriptionUseCase } from "@application/usecases/college/implementations/GetCollegeSubscription.usecase";

export const makeGetCollegeSubscriptionUseCase = () => {
  return new GetCollegeSubscriptionUseCase();
};

export const makeSubscriptionController = () => {
  return new SubscriptionController(
    makeCreateSubscriptionUseCase(),
    makeHandlePaymentWebhookUseCase(),
    makeGetCollegeSubscriptionUseCase()
  );
};

import { GetCollegeInterviewsUseCase } from "@application/usecases/college/implementations/GetCollegeInterviews.usecase";
import { GetCollegeOffersUseCase } from "@application/usecases/college/implementations/GetCollegeOffers.usecase";
import { CollegePlacementController } from "@presentation/http/controllers/college/placement.controller";
import { interviewRepository, offerRepository } from "@infrastructure/di/infra.container";

export const makeGetCollegeInterviewsUseCase = () => {
  return new GetCollegeInterviewsUseCase(interviewRepository);
};

export const makeGetCollegeOffersUseCase = () => {
  return new GetCollegeOffersUseCase(offerRepository);
};

export const makeCollegePlacementController = () => {
  return new CollegePlacementController(
    makeGetCollegeInterviewsUseCase(),
    makeGetCollegeOffersUseCase()
  );
};

import { GetCollegeReportsAnalyticsUseCase } from "@application/usecases/college/implementations/GetCollegeReportsAnalytics.usecase";
import { GenerateCollegeReportUseCase } from "@application/usecases/college/implementations/GenerateCollegeReport.usecase";
import { CollegeReportsController } from "@presentation/http/controllers/college/reports.controller";
import { collegeAnalyticsRepository } from "@infrastructure/di/infra.container";
import { PdfReportGenerator } from "@infrastructure/services/reports/PdfReportGenerator";
import { ExcelReportGenerator } from "@infrastructure/services/reports/ExcelReportGenerator";
import { CsvReportGenerator } from "@infrastructure/services/reports/CsvReportGenerator";

export const makeGetCollegeReportsAnalyticsUseCase = () => {
  return new GetCollegeReportsAnalyticsUseCase(collegeAnalyticsRepository);
};

export const makeGenerateCollegeReportUseCase = () => {
  const pdfGenerator = new PdfReportGenerator();
  const excelGenerator = new ExcelReportGenerator();
  const csvGenerator = new CsvReportGenerator();
  return new GenerateCollegeReportUseCase(collegeAnalyticsRepository, pdfGenerator, excelGenerator, csvGenerator);
};

export const makeCollegeReportsController = () => {
  return new CollegeReportsController(
    makeGetCollegeReportsAnalyticsUseCase(),
    makeGenerateCollegeReportUseCase()
  );
};

import { GetCollegeProfileUseCase } from "@application/usecases/college/settings/implementations/GetCollegeProfile.usecase";
import { UpdateCollegeProfileUseCase } from "@application/usecases/college/settings/implementations/UpdateCollegeProfile.usecase";
import { ChangeCollegePasswordUseCase } from "@application/usecases/college/settings/implementations/ChangeCollegePassword.usecase";
import { RequestCollegeEmailChangeUseCase } from "@application/usecases/college/settings/implementations/RequestCollegeEmailChange.usecase";
import { VerifyCollegeEmailChangeUseCase } from "@application/usecases/college/settings/implementations/VerifyCollegeEmailChange.usecase";
import { CollegeSettingsController } from "@presentation/http/controllers/college/college-settings.controller";

export const makeGetCollegeProfileUseCase = () => {
  return new GetCollegeProfileUseCase(organizationRepository, collegeAdminRepository);
};

export const makeUpdateCollegeProfileUseCase = () => {
  return new UpdateCollegeProfileUseCase(organizationRepository, collegeAdminRepository);
};

export const makeChangeCollegePasswordUseCase = () => {
  return new ChangeCollegePasswordUseCase(collegeAdminRepository, bcryptService);
};

export const makeRequestCollegeEmailChangeUseCase = () => {
  const emailService = new EmailService();
  return new RequestCollegeEmailChangeUseCase(collegeAdminRepository, otpRepository, emailService, crossRoleAuthService);
};

export const makeVerifyCollegeEmailChangeUseCase = () => {
  return new VerifyCollegeEmailChangeUseCase(collegeAdminRepository, otpRepository, crossRoleAuthService);
};

export const makeCollegeSettingsController = () => {
  return new CollegeSettingsController(
    makeGetCollegeProfileUseCase(),
    makeUpdateCollegeProfileUseCase(),
    makeChangeCollegePasswordUseCase(),
    makeRequestCollegeEmailChangeUseCase(),
    makeVerifyCollegeEmailChangeUseCase()
  );
};