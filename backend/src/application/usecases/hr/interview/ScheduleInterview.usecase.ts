import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { Interview } from "@domain/entities/Interview";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";
import { InterviewConfiguration } from "@domain/value-objects/InterviewConfiguration";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import mongoose from "mongoose";
import { SheduleInterviewDto } from "@application/dtos/hr/Request/ScheduleInterview.dto";
import { IScheduleInterviewUseCase } from "./interfaces/IScheduleInterview.usecase";
import { ICreateSystemNotificationUseCase } from "@application/usecases/common/notifications/interfaces/ICreateSystemNotification.usecase";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { NotificationType } from "@domain/enums/NotificationType.enum";

export class ScheduleInterviewUseCase implements IScheduleInterviewUseCase {
  constructor(
    private readonly _interviewRepository: IInterviewRepository,
    private readonly _applicationRepository: IJobApplicationRepository,
    private readonly _createSystemNotificationUseCase: ICreateSystemNotificationUseCase
  ) {}

  async execute(hrId: string, companyId: string, payload: SheduleInterviewDto): Promise<Interview> {
    const application = await this._applicationRepository.findById(payload.applicationId);
    if (!application) {
      throw new AppError("Application not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    if (String(application.companyId) !== String(companyId)) {
      throw new AppError("Unauthorized access to application", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    const rawTypes = (payload.selectedTypes && payload.selectedTypes.length > 0)
      ? payload.selectedTypes
      : (payload.types && payload.types.length > 0 ? payload.types : [payload.type]);

    const configuration = new InterviewConfiguration({
      types: rawTypes,
      difficulty: payload.difficulty,
      durationMinutes: payload.durationMinutes,

      skills: payload.skills,
      questionDistribution: payload.questionDistribution,
      customInstructions: payload.customInstructions,
      prohibitedTopics: payload.prohibitedTopics,
      evaluationCriteria: payload.evaluationCriteria,
    });

    const interview = new Interview({
      id: new mongoose.Types.ObjectId().toString(),
      studentId: application.studentId,
      jobId: application.jobId,
      companyId: companyId,
      type: rawTypes[0],
      status: InterviewStatus.SCHEDULED,
      scheduledAt: new Date(payload.scheduledAt),
      durationMinutes: payload.durationMinutes,
      createdAt: new Date(),
      configuration,
    });

    const savedInterview = await this._interviewRepository.create(interview);

    // Notify Student
    await this._createSystemNotificationUseCase.execute({
      recipientId: application.studentId,
      role: NotificationRole.STUDENT,
      title: "Interview Scheduled",
      message: `An interview has been scheduled for your application on ${new Date(payload.scheduledAt).toLocaleString()}.`,
      type: NotificationType.INFO,
      link: "/student/interviews"
    });

    return savedInterview;
  }
}
