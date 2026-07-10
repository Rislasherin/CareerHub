import { IsString, IsNumber, IsEnum, Min, Max, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { Expose } from 'class-transformer';
import { RecommendationEnum } from '@domain/enums/Recommendation.enum';

export class SubmitFeedbackDto {
  @Expose()
  @IsNumber()
  @Min(1)
  @Max(5)
  dsaScore!: number;

  @Expose()
  @IsString()
  @IsOptional()
  dsaNotes?: string;

  @Expose()
  @IsNumber()
  @Min(1)
  @Max(5)
  codingScore!: number;

  @Expose()
  @IsString()
  @IsOptional()
  codingNotes?: string;

  @Expose()
  @IsNumber()
  @Min(1)
  @Max(5)
  systemDesignScore!: number;

  @Expose()
  @IsString()
  @IsOptional()
  systemDesignNotes?: string;

  @Expose()
  @IsNumber()
  @Min(1)
  @Max(5)
  problemSolvingScore!: number;

  @Expose()
  @IsString()
  @IsOptional()
  problemSolvingNotes?: string;

  @Expose()
  @IsString()
  @IsOptional()
  strengths?: string;

  @Expose()
  @IsString()
  @IsOptional()
  weaknesses?: string;

  @Expose()
  @IsString()
  @IsOptional()
  hrNotes?: string;

  @Expose()
  @IsEnum(RecommendationEnum)
  recommendedAction!: RecommendationEnum;
}
