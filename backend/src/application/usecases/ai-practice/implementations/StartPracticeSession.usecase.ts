import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { AIPracticeInterview } from "@domain/entities/ai-practice/AIPracticeInterview";
import { IPracticeQuestionGenerator } from "../../../interfaces/ai-practice/IPracticeQuestionGenerator";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { RabbitMQBroker } from "@infrastructure/messaging/RabbitMQBroker";
import { IPracticeInterviewJob } from "../../../interfaces/ai-practice/IPracticeInterviewJob";

export class StartPracticeSessionUseCase {
  constructor(
    private readonly _practiceRepository: IAIPracticeInterviewRepository,
    private readonly _questionGenerator: IPracticeQuestionGenerator
  ) {}

  async execute(id: string, studentId: string): Promise<AIPracticeInterview> {
    const session = await this._practiceRepository.findByIdAndStudentId(id, studentId);
    if (!session) {
      throw new AppError("Practice interview not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
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
