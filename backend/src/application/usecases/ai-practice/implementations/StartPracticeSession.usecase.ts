import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { AIPracticeInterview } from "@domain/entities/ai-practice/AIPracticeInterview";
import { IPracticeQuestionGenerator } from "../../../interfaces/ai-practice/IPracticeQuestionGenerator";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IAICreditService } from "@domain/services/IAICreditService";
import { IEntitlementGuardService } from "@domain/services/IEntitlementGuardService";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { RabbitMQBroker } from "@infrastructure/messaging/RabbitMQBroker";
import { IPracticeInterviewJob } from "../../../interfaces/ai-practice/IPracticeInterviewJob";
import { FeatureKey } from "@domain/enums/FeatureKey.enum";

export class StartPracticeSessionUseCase {
  constructor(
    private readonly _practiceRepository: IAIPracticeInterviewRepository,
    private readonly _questionGenerator: IPracticeQuestionGenerator,
    private readonly _studentRepository: IStudentRepository,
    private readonly _aiCreditService: IAICreditService,
    private readonly _entitlementGuard: IEntitlementGuardService
  ) {}

  async execute(id: string, studentId: string): Promise<AIPracticeInterview> {
    const session = await this._practiceRepository.findByIdAndStudentId(id, studentId);
    if (!session) {
      throw new AppError("Practice interview not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await this._entitlementGuard.assertFeatureEntitlement(student.collegeId!, FeatureKey.MOCK_INTERVIEW);

    // Attempt to consume 5 credits for a practice session
    try {
      await this._aiCreditService.consumeCredits(
        student.collegeId!, 
        student.id!, 
        'mock_interview', 
        5, 
        'livekit'
      );
    } catch (err: any) {
      throw new AppError(err.message, HttpStatus.FORBIDDEN, ErrorCode.INSUFFICIENT_CREDITS);
    }

    session.start();

    // Instead of generating synchronously, we just publish the job and let the worker do it.
    const broker = new RabbitMQBroker();
    await broker.connect();
    const jobPayload: IPracticeInterviewJob = {
      type: 'START_PRACTICE_INTERVIEW',
      sessionId: session.id as string,
      studentId: session.studentId as string
    };
    console.log(`[PRACTICE_FLOW] START_PRACTICE_INTERVIEW job created`, {
      SESSION_ID: session.id,
      ROOM_NAME_EXPECTED: `practice-${session.id}`
    });
    await broker.publish('ai_practice_jobs', jobPayload);

    return await this._practiceRepository.update(id, session);
  }
}
