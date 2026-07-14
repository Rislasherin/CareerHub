import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Student } from "@domain/entities/student";
import { JobApplication } from "@domain/entities/JobApplication";
import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";
import { IApplyToJobUseCase } from "../interfaces/IApplyToJob.usecase";
import { ICreateSystemNotificationUseCase } from "@application/usecases/common/notifications/interfaces/ICreateSystemNotification.usecase";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { NotificationType } from "@domain/enums/NotificationType.enum";

export class ApplyToJobUseCase implements IApplyToJobUseCase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _jobRepository: IJobRepository,
    private readonly _jobApplicationRepository: IJobApplicationRepository,
    private readonly _createSystemNotificationUseCase: ICreateSystemNotificationUseCase
  ) {}

  async execute(studentId: string, jobId: string): Promise<void> {
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const job = await this._jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const existingApplication = await this._jobApplicationRepository.findByJobAndStudent(jobId, studentId);
    if (existingApplication) {
      throw new AppError("Already applied to this job", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const applicationsToday = await this._jobApplicationRepository.countByStudentIdSince(studentId, twentyFourHoursAgo);
    
    if (applicationsToday >= 3) {
      throw new AppError(
        'You have reached your daily limit of 3 job applications. Please try again tomorrow.',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const jobApplication = JobApplication.create({
      jobId,
      studentId,
      companyId: job.companyId,
      resumeUrl: student.resume?.url,
      resumeId: student.resume?.publicId,
      status: JobApplicationStatus.APPLIED
    });

    await this._jobApplicationRepository.create(jobApplication);

    // Notify Student — application submitted
    await this._createSystemNotificationUseCase.execute({
      recipientId: studentId,
      role: NotificationRole.STUDENT,
      title: "Application Submitted!",
      message: `Your application for the job has been submitted successfully. Good luck!`,
      type: NotificationType.SUCCESS,
      link: "/student/applications"
    });

    // Keep backwards compatibility for existing queries if they rely on the array
    const appliedJobsList = student.appliedJobs || [];
    if (!appliedJobsList.includes(jobId)) {
      const updatedStudent = Student.create({
        ...student.toJSON(),
        appliedJobs: [...appliedJobsList, jobId]
      });
      await this._studentRepository.update(studentId, updatedStudent);
    }
  }
}
