import { IsString, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class CompleteAIInterviewInputDTO {
  @Expose()
  @IsString()
  @IsNotEmpty()
  sessionId!: string;
}
