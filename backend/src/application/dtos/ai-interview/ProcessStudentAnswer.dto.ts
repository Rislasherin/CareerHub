import { IsString, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class ProcessStudentAnswerInputDTO {
  @Expose()
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  studentId!: string;


  @Expose()
  @IsString()
  @IsNotEmpty()
  answer!: string;

  // Not exposed to HTTP, purely for internal realtime worker usage
  onSentenceGenerated?: (sentence: string) => void;
  abortSignal?: AbortSignal;
}
