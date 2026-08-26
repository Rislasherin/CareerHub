import { IsString, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class StartAIInterviewInputDTO {
  @Expose()
  @IsString()
  @IsNotEmpty()
  interviewId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  studentId!: string;
}
