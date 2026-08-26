import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class GenerateFollowUpInputDTO {
  @Expose()
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  followUpQuestionId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  followUpText!: string;

  @Expose()
  @IsString()
  @IsOptional()
  context?: string;
}
