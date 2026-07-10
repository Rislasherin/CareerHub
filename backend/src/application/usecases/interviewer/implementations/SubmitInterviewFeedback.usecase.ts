import { ISubmitInterviewFeedbackUseCase } from "../interfaces/ISubmitInterviewFeedback.usecase";
import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { SubmitFeedbackDto } from "../../../dtos/interviewer/SubmitFeedback.dto";
import { AppError } from "../../../errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Interview } from "@domain/entities/Interview";
import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { MESSAGES } from "@shared/constants/messages.constants";
import { JobApplication } from "@domain/entities/JobApplication";

export class SubmitInterviewFeedbackUseCase implements ISubmitInterviewFeedbackUseCase {
  constructor(
    private readonly _interviewRepository: IInterviewRepository,
    private readonly _jobApplicationRepository: IJobApplicationRepository
  ) {}

  async execute(interviewerId: string, interviewId: string, data: SubmitFeedbackDto): Promise<Interview> {
    const interview = await this._interviewRepository.findById(interviewId);
    
    if (!interview) {
      throw new AppError(MESSAGES.ERROR.NOT_FOUND, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (interview.interviewerId !== interviewerId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.FORBIDDEN, ErrorCode.UNAUTHORIZED);
    }

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new AppError("Feedback has already been submitted for this interview", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // 1. Update Interview Status & Feedback
    interview.submitFeedback({
      dsaScore: data.dsaScore,
      dsaNotes: data.dsaNotes,
      codingScore: data.codingScore,
      codingNotes: data.codingNotes,
      systemDesignScore: data.systemDesignScore,
      systemDesignNotes: data.systemDesignNotes,
      problemSolvingScore: data.problemSolvingScore,
      problemSolvingNotes: data.problemSolvingNotes,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      hrNotes: data.hrNotes,
      recommendedAction: data.recommendedAction
    });

    const updatedInterview = await this._interviewRepository.update(interviewId, interview);

    if (!updatedInterview) {
      throw new AppError(MESSAGES.ERROR.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    // 2. Update the Job Application status so HR knows it is ready for review
    if (updatedInterview.applicationId) {
      const application = await this._jobApplicationRepository.findById(updatedInterview.applicationId);
      if (application) {
        application.updateStatus(JobApplicationStatus.UNDER_REVIEW);
        await this._jobApplicationRepository.update(updatedInterview.applicationId, application);
      }
    }

    return updatedInterview;
  }
}
