import { IsString, IsNotEmpty, IsNumber, Min, Max, IsIn, IsBoolean, IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';
import { AnswerQuality } from '@domain/enums/AnswerQuality.enum';

export class EvaluateAnswerInputDTO {
  @Expose()
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @Expose()
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;

  @Expose()
  @IsEnum(AnswerQuality)
  quality!: AnswerQuality;

  @Expose()
  @IsString()
  @IsNotEmpty()
  feedback!: string;

  @Expose()
  @IsBoolean()
  needsFollowUp!: boolean;
}
