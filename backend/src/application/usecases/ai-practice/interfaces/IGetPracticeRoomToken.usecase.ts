import { PracticeRoomTokenResponseDto } from "@application/dtos/ai-practice/PracticeRoomTokenResponse.dto";

export interface IGetPracticeRoomTokenUseCase {
  execute(input: {
    sessionId: string;
    studentId: string;
    studentName?: string;
  }): Promise<PracticeRoomTokenResponseDto>;
}
