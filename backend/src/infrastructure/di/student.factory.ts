import { UploadStudentVerificationUseCase } from "@application/usecases/auth/student/implementations/UploadStudentVerification.usecase";
import { studentRepository, jobRepository, companyRepository } from "@infrastructure/di/infra.container";
import { StudentController } from "@presentation/http/controllers/student/student.controller";
import { CloudinaryService } from "@infrastructure/services/cloudinary/Cloudinary.service";
import { UpdateStudentProfileUseCase } from "@application/usecases/student/implementations/UpdateStudentProfile.usecase";
import { GetStudentJobsUseCase } from "@application/usecases/student/implementations/GetStudentJobs.usecase";
import { ApplyToJobUseCase } from "@application/usecases/student/implementations/ApplyToJob.usecase";
import { makeGetCollegeNoticeUseCase } from "./college.factory";

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
  return new ApplyToJobUseCase(studentRepository, jobRepository);
};


export const makeStudentController = () => {
  return new StudentController(
    makeUploadStudentVerificationUseCase(),
    makeUpdateStudentProfileUseCase(),
    studentRepository,
    makeGetStudentJobsUseCase(),
    makeApplyToJobUseCase(),
    makeGetCollegeNoticeUseCase(),

  );
};
