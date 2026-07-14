import { UploadStudentVerificationUseCase } from "@application/usecases/auth/student/implementations/UploadStudentVerification.usecase";
import { studentRepository, jobRepository, companyRepository, organizationRepository, jobApplicationRepository, interviewRepository, interviewerRepository, offerRepository, createSystemNotificationUseCase } from "@infrastructure/di/infra.container";
import { StudentController } from "@presentation/http/controllers/student/student.controller";
import { CloudinaryService } from "@infrastructure/services/cloudinary/Cloudinary.service";
import { UpdateStudentProfileUseCase } from "@application/usecases/student/implementations/UpdateStudentProfile.usecase";
import { GetStudentJobsUseCase } from "@application/usecases/student/implementations/GetStudentJobs.usecase";
import { ApplyToJobUseCase } from "@application/usecases/student/implementations/ApplyToJob.usecase";
import { GetStudentFullProfileUseCase } from "@application/usecases/student/implementations/GetStudentFullProfile.usecase";
import { GetStudentNoticesUseCase } from "@application/usecases/student/implementations/GetStudentNotices.usecase";
import { makeGetCollegeNoticeUseCase } from "./college.factory";
import { UploadResumeUseCase } from "@application/usecases/student/Resume/implementations/UploadResume.usecase";
import { DeleteResumeUseCase } from "@application/usecases/student/Resume/implementations/DeleteResume.usecase";
import { GetStudentApplicationsUseCase } from "@application/usecases/student/implementations/GetStudentApplications.usecase";
import { GetStudentInterviewsUseCase } from "@application/usecases/student/implementations/GetStudentInterviews.usecase";
import { GetStudentOffersUseCase } from "@application/usecases/student/implementations/GetStudentOffers.usecase";
import { RespondToOfferUseCase } from "@application/usecases/student/implementations/RespondToOffer.usecase";
import { GenerateOfferPdfUseCase } from "@application/usecases/hr/offer-engine/implementations/GenerateOfferPdf.usecase";

export const makeUploadStudentVerificationUseCase = () => {
  const cloudinaryService = new CloudinaryService();
  return new UploadStudentVerificationUseCase(studentRepository, cloudinaryService);
};

export const makeUpdateStudentProfileUseCase = () => {
  return new UpdateStudentProfileUseCase(studentRepository);
};

export const makeGetStudentJobsUseCase = () => {
  return new GetStudentJobsUseCase(studentRepository, jobRepository, companyRepository);
};

export const makeApplyToJobUseCase = () => {
  return new ApplyToJobUseCase(studentRepository, jobRepository, jobApplicationRepository, createSystemNotificationUseCase);
};

export const makeGetStudentFullProfileUseCase = () => {
  return new GetStudentFullProfileUseCase(studentRepository, organizationRepository);
};

export const makeGetStudentNoticesUseCase = () => {
  return new GetStudentNoticesUseCase(studentRepository, makeGetCollegeNoticeUseCase());
};

export const makeUploadResumeUseCase = () => {
  return new UploadResumeUseCase(studentRepository, new CloudinaryService());
};
export const makeDeleteResumeUseCase = () => {
  return new DeleteResumeUseCase(studentRepository, new CloudinaryService());
};

export const makeGetStudentApplicationsUseCase = () => {
  return new GetStudentApplicationsUseCase(jobApplicationRepository, jobRepository, companyRepository, interviewRepository);
};

export const makeGetStudentInterviewsUseCase = () => {
  return new GetStudentInterviewsUseCase(interviewRepository,companyRepository,interviewerRepository)
}

export const makeGetStudentOffersUseCase = () => {
  return new GetStudentOffersUseCase(offerRepository);
};

export const makeRespondToOfferUseCase = () => {
  return new RespondToOfferUseCase(offerRepository, jobApplicationRepository, createSystemNotificationUseCase);
};

export const makeStudentController = () => {
  return new StudentController(
    makeUploadStudentVerificationUseCase(),
    makeUpdateStudentProfileUseCase(),
    makeGetStudentJobsUseCase(),
    makeApplyToJobUseCase(),
    makeGetStudentFullProfileUseCase(),
    makeGetStudentNoticesUseCase(),
    makeUploadResumeUseCase(),  
    makeDeleteResumeUseCase(),
    makeGetStudentApplicationsUseCase(),
    makeGetStudentInterviewsUseCase(),
    makeGetStudentOffersUseCase(),
    makeRespondToOfferUseCase(),
    new GenerateOfferPdfUseCase(offerRepository, studentRepository, companyRepository)
  );
};
