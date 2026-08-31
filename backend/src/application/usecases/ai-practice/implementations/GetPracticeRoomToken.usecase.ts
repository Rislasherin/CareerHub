import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { IPracticeRoomTokenService } from "@application/interfaces/ai-practice/IPracticeRoomTokenService";
import { IGetPracticeRoomTokenUseCase } from "../interfaces/IGetPracticeRoomToken.usecase";
import { PracticeRoomTokenResponseDto } from "@application/dtos/ai-practice/PracticeRoomTokenResponse.dto";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { PracticeInterviewStatus } from "@domain/enums/PracticeInterviewStatus.enum";
import { env } from "@infrastructure/config/env.validator";

export class GetPracticeRoomTokenUseCase implements IGetPracticeRoomTokenUseCase {
  constructor(
    private readonly _practiceRepository: IAIPracticeInterviewRepository,
    private readonly _roomTokenService: IPracticeRoomTokenService
  ) {}

  async execute(input: {
    sessionId: string;
    studentId: string;
    studentName?: string;
  }): Promise<PracticeRoomTokenResponseDto> {
    const { sessionId, studentId, studentName = "Practice Candidate" } = input;

    const session = await this._practiceRepository.findByIdAndStudentId(sessionId, studentId);
    if (!session) {
      throw new AppError("Practice interview session not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (session.status === PracticeInterviewStatus.COMPLETED || session.status === PracticeInterviewStatus.ABANDONED) {
      throw new AppError(
        `Cannot join practice room. Session is already ${session.status}`,
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const deterministicRoomName = `practice-${sessionId}`;
    const token = await this._roomTokenService.generateStudentToken(
      deterministicRoomName,
      studentId,
      studentName
    );

    return {
      token,
      roomName: deterministicRoomName,
      liveKitUrl: env.LIVEKIT_URL,
      sessionId,
      status: session.status,
    };
  }
}
