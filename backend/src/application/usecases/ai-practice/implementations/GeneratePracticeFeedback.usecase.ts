import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { IPracticeInterviewFeedbackGenerator } from "@application/interfaces/ai-practice/IPracticeInterviewFeedbackGenerator";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { PracticeInterviewStatus } from "@domain/enums/PracticeInterviewStatus.enum";

export class GeneratePracticeFeedbackUseCase {
  constructor(
    private readonly _practiceRepository: IAIPracticeInterviewRepository,
    private readonly _feedbackGenerator: IPracticeInterviewFeedbackGenerator
  ) {}

  async execute(sessionId: string, studentId: string): Promise<void> {
    const session = await this._practiceRepository.findByIdAndStudentId(sessionId, studentId);
    if (!session) {
      throw new AppError("Practice interview not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (session.status !== PracticeInterviewStatus.COMPLETED) {
      throw new AppError("Cannot generate feedback for uncompleted session", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    if (session.finalFeedback) {
      // Feedback already exists, no need to regenerate
      return;
    }

    const feedback = await this._feedbackGenerator.generateFeedback(session);
    
    session.attachFinalFeedback(feedback);
    await this._practiceRepository.update(sessionId, session);
  }
}
