import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { Interview } from "@domain/entities/Interview";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import mongoose from "mongoose";
import { SheduleInterviewDto } from "@application/dtos/hr/Request/ScheduleInterview.dto";

export class ScheduleInterviewUseCase {
  constructor(
    private readonly _interviewRepository: IInterviewRepository,
    private readonly _applicationRepository: IJobApplicationRepository
  ) {}

  async execute(hrId: string, companyId: string, payload: SheduleInterviewDto): Promise<Interview> {
    const application = await this._applicationRepository.findById(payload.applicationId);
    if (!application) {
      throw new AppError("Application not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    if (application.companyId !== companyId) {
      throw new AppError("Unauthorized access to application", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    const interview = new Interview({
      id: new mongoose.Types.ObjectId().toString(),
      studentId: application.studentId,
      jobId: application.jobId,
      companyId: companyId,
      type: InterviewType.TECHNICAL, // Enforced AI technical interview
      status: InterviewStatus.SCHEDULED,
      scheduledAt: new Date(payload.scheduledAt),
      createdAt: new Date(),
    });

    return await this._interviewRepository.create(interview);
  }
}
