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
  ValidateNested,
  ValidateIf
} from 'class-validator';
import { JobType } from '@domain/enums/JobType.enum';

class EligibilityCriteriaDto {
  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minCGPA?: number;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(0)
  allowedBacklogs?: number;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibleBranches?: string[];

  @Expose()
  @IsOptional()
  @IsInt()
  passingYear?: number;

  @Expose()
  @IsOptional()
  @IsString()
  degreeType?: string;
}

export class InterviewRoundConfigDto {
  @Expose()
  @IsInt()
  @Min(1)
  roundNumber: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsEnum(["APTITUDE", "CODING", "TECHNICAL", "HR", "GROUP_DISCUSSION"])
  type: "APTITUDE" | "CODING" | "TECHNICAL" | "HR" | "GROUP_DISCUSSION";

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;
}

export class PostJobDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: "Job title is required" })
  title: string;

  @Expose()
  @IsOptional()
  @IsEnum(["publish_now", "draft", "schedule"])
  publishOption?: "publish_now" | "draft" | "schedule";

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption === 'schedule')
  @IsNotEmpty({ message: "Scheduled publication date and time is required when scheduling for later" })
  @IsDateString({}, { message: "Invalid scheduled publication date" })
  scheduledPublishAt?: string;

  @Expose()
  @IsOptional()
  @IsString()
  scheduledTimezone?: string;

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsString()
  @IsNotEmpty()
  category?: string;

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsInt()
  @Min(1)
  openings?: number;

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsDateString()
  deadline?: string;

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsEnum(JobType)
  type?: JobType;

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsString()
  @IsNotEmpty()
  noticePeriod?: string;

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsString()
  @IsNotEmpty()
  experienceLevel?: string;

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsEnum(["on-site", "remote", "hybrid"])
  workMode?: "on-site" | "remote" | "hybrid";

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft' && o.workMode !== 'remote')
  @IsString()
  @IsNotEmpty()
  location?: string;

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsEnum(["per_month", "per_year"])
  salaryType?: "per_month" | "per_year";

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsNumber()
  @Min(0)
  maxSalary?: number;

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsEnum(["online", "offline", "hybrid"])
  interviewMode?: "online" | "offline" | "hybrid";

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsString()
  @IsNotEmpty()
  description?: string;

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @Expose()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  preferredSkills?: string[];

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @ValidateNested()
  @Type(() => EligibilityCriteriaDto)
  eligibility?: EligibilityCriteriaDto;

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterviewRoundConfigDto)
  rounds?: InterviewRoundConfigDto[];

  @Expose()
  @ValidateIf((o: PostJobDto) => o.publishOption !== 'draft')
  @IsString()
  @IsNotEmpty()
  collegeId?: string;
}
