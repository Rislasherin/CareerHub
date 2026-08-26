import { IAIInterviewRepository } from "@domain/repositories/ai-interview/IAIInterviewRepository";
import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IStartAIInterviewUseCase, StartAIInterviewOutput } from "../interfaces/IStartAIInterviewUseCase";
import { StartAIInterviewInputDTO } from "@application/dtos/ai-interview/StartAIInterview.dto";
import { IQuestionGenerator } from "@application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { InterviewQuestion } from "@domain/entities/ai-interview/InterviewQuestion";
import { AIInterviewSession } from "@domain/entities/ai-interview/AIInterviewSession";
import { InterviewPhase } from "@domain/enums/InterviewPhase.enum";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { ILiveKitService } from "@application/interfaces/ai-interview/ILiveKitService";
import { IMessageBroker } from "@application/interfaces/messaging/IMessageBroker";
import { InterviewContextBuilder } from "@application/services/ai-interview/InterviewContextBuilder";

import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Types } from "mongoose";
import * as crypto from "crypto";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ILogger, LogCategory } from "../../../interfaces/observability/ILogger";

export class StartAIInterviewUseCase implements IStartAIInterviewUseCase {
  constructor(
    private readonly _repository: IAIInterviewRepository,
    private readonly _interviewRepository: IInterviewRepository,
    private readonly _questionGenerator: IQuestionGenerator,
    private readonly _liveKitService: ILiveKitService,
    private readonly _messageBroker: IMessageBroker,
    private readonly _jobRepository?: IJobRepository,
    private readonly _studentRepository?: IStudentRepository,
    private readonly _logger?: ILogger,
    private readonly _liveKitUrl: string = ''
  ) { }

  async execute(input: StartAIInterviewInputDTO): Promise<StartAIInterviewOutput> {
    // 1. Validate Parent Interview
    const interview = await this._interviewRepository.findById(input.interviewId);
    if (!interview) {
      throw new AppError(`Interview with ID ${input.interviewId} not found`, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (interview.studentId.toString() !== input.studentId) {
      throw new AppError(`Unauthorized: Interview does not belong to student`, HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    if (!interview.isJoinable()) {
      throw new AppError(`Interview is not in a joinable state. Current status: ${interview.status}`, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // 2. State Transition on Parent Interview (Idempotent)
    if (interview.status === InterviewStatus.SCHEDULED) {
      interview.markAsWaiting();
      interview.markAsInProgress();
      await this._interviewRepository.update(interview.id, interview);
    } else if (interview.status === InterviewStatus.WAITING) {
      interview.markAsInProgress();
      await this._interviewRepository.update(interview.id, interview);
    }

    // 3. Create or Retrieve the Runtime AI Session
    let session = await this._repository.findByInterviewId(interview.id);
    let savedSession;

    if (session && session.phase !== InterviewPhase.COMPLETED && session.phase !== InterviewPhase.CLOSING && session.phase !== InterviewPhase.NOT_STARTED) {
        if (this._logger) {
            this._logger.info(LogCategory.SYSTEM_INFO, `[StartAIInterviewUseCase] Reusing existing session ${session.id} at phase ${session.phase}`);
        }
        savedSession = session;
    } else {
        // Fetch Job context if available
        const job = this._jobRepository ? await this._jobRepository.findById(interview.jobId) : null;
        const config = interview.configuration;
        const built = InterviewContextBuilder.build(job, config);

        // 4. AI Abstraction: Generate the very first question from JD and Interview Plan
        const generatedQuestion = await this._questionGenerator.generateNextQuestion({
          interviewContext: built.interviewContext,
          previousQuestions: [],
          topic: built.initialTopic,
          interviewType: built.initialCategory,
          difficulty: config.difficulty,
          customInstructions: [...config.customInstructions],
          prohibitedTopics: [...config.prohibitedTopics],
        });

        // 5. Domain Logic: Create entity for the first question
        const firstQuestion = new InterviewQuestion({
          id: crypto.randomUUID(),
          text: generatedQuestion.text,
          type: generatedQuestion.type,
          context: built.initialTopic,
          category: built.initialCategory,
        });

        // 6. Create session in INTRO phase containing the first question
        session = new AIInterviewSession({
          id: new Types.ObjectId().toString(),
          interviewId: interview.id,
          studentId: interview.studentId.toString(),
          jobId: interview.jobId,
          phase: InterviewPhase.INTRO,
          questions: [firstQuestion],
          startedAt: new Date(),
          durationMinutes: interview.getDurationMinutes(),
          configuration: config,
          interviewPlan: built.interviewPlan,
          interviewContext: built.interviewContext,
          currentTopic: built.initialTopic,
          coveredTopics: [built.initialTopic],
        });

        // 7. Infrastructure: Save new session
        savedSession = await this._repository.create(session);
    }

    // 8. Generate LiveKit token for the student
    let studentName = "Candidate";
    if (this._studentRepository) {
      const student = await this._studentRepository.findById(input.studentId);
      if (student?.firstName) {
        studentName = `${student.firstName} ${student.lastName || ''}`.trim();
      }
    }
    const token = await this._liveKitService.generateToken(savedSession.id, input.studentId, studentName);
    
    // 9. Publish job to worker
    await this._messageBroker.publish('ai_interview_jobs', {
      type: 'START_AI_INTERVIEW',
      sessionId: savedSession.id
    });

    return {
      success: true,
      phase: savedSession.phase,
      sessionId: savedSession.id,
      token,
      livekitUrl: this._liveKitUrl,
      durationMinutes: savedSession.getDurationMinutes()
    };
  }
}
