import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';
import { JobType } from '@domain/enums/JobType.enum';

class EligibilityCriteriaDto {
  @Expose()
  @IsNumber()
  @Min(0)
  minCGPA: number;

  @Expose()
  @IsInt()
  @Min(0)
  allowedBacklogs: number;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  eligibleBranches: string[];

  @Expose()
  @IsInt()
  passingYear: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  degreeType: string;
}

class InterviewRoundConfigDto {
  @Expose()
  @IsInt()
  @Min(1)
  roundNumber: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsEnum(["aptitude", "coding", "technical", "hr", "group_discussion"])
  type: "aptitude" | "coding" | "technical" | "hr" | "group_discussion";

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;
}

export class PostJobDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  category: string;

  @Expose()
  @IsInt()
  @Min(1)
  openings: number;

  @Expose()
  @IsDateString()
  deadline: string;

  @Expose()
  @IsEnum(JobType)
  type: JobType;

  @Expose()
  @IsString()
  @IsNotEmpty()
  noticePeriod: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  experienceLevel: string;

  @Expose()
  @IsEnum(["on-site", "remote", "hybrid"])
  workMode: "on-site" | "remote" | "hybrid";

  @Expose()
  @IsString()
  @IsNotEmpty()
  location: string;

  @Expose()
  @IsEnum(["per_month", "per_year"])
  salaryType: "per_month" | "per_year";

  @Expose()
  @IsNumber()
  @Min(0)
  minSalary: number;

  @Expose()
  @IsNumber()
  @Min(0)
  maxSalary: number;

  @Expose()
  @IsEnum(["online", "offline", "hybrid"])
  interviewMode: "online" | "offline" | "hybrid";

  @Expose()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[];

  @Expose()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  preferredSkills?: string[];

  @Expose()
  @ValidateNested()
  @Type(() => EligibilityCriteriaDto)
  eligibility: EligibilityCriteriaDto;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterviewRoundConfigDto)
  rounds: InterviewRoundConfigDto[];

  @Expose()
  @IsString()
  @IsNotEmpty()
  collegeId: string;
}
