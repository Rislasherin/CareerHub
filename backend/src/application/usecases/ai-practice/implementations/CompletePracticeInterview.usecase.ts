import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IAICreditService } from "@domain/services/IAICreditService";
import { Logger, LogCategory } from "@infrastructure/logger/logger";

export class CompletePracticeInterviewUseCase {
  constructor(
    private readonly _practiceRepository: IAIPracticeInterviewRepository,
    private readonly _aiCreditService: IAICreditService
  ) {}

  async execute(sessionId: string, studentId: string): Promise<void> {
    const session = await this._practiceRepository.findByIdAndStudentId(sessionId, studentId);
    if (!session) {
      throw new AppError("Practice interview not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    try {
      session.complete();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      throw new AppError(`Cannot complete practice interview: ${errorMsg}`, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    if (session.creditReservationId) {
      try {
        // Commit 5 credits for a completed practice session
        await this._aiCreditService.commitCredits(session.creditReservationId, 5, { sessionId });
      } catch (err) {
        Logger.error(LogCategory.SYSTEM_ERROR, `Failed to commit credits for session ${sessionId}`, err);
      }
    }

    await this._practiceRepository.update(sessionId, session);
  }
}
