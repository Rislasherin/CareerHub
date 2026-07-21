import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
  IsNumber
} from "class-validator";
import { Expose, Type } from "class-transformer";

class StudentSkillsDto {
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  frameworks?: string[];

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  databases?: string[];

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cloudDevops?: string[];

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  otherTools?: string[];

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  aiMl?: string[];
}

class StudentExperienceDto {
  @Expose()
  @IsString()
  company!: string;

  @Expose()
  @IsString()
  role!: string;

  @Expose()
  @IsString()
  duration!: string;

  @Expose()
  @IsString()
  @IsOptional()
  location?: string;

  @Expose()
  @IsString()
  @IsOptional()
  summary?: string;
}

class StudentProjectDto {
  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  techStack?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  github?: string;

  @Expose()
  @IsString()
  @IsOptional()
  liveDemo?: string;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string;
}

class StudentSpokenLanguageDto {
  @Expose()
  @IsString()
  language!: string;

  @Expose()
  @IsString()
  proficiency!: string;
}

class StudentAchievementDto {
  @Expose()
  @IsString()
  title!: string;

  @Expose()
  @IsString()
  @IsOptional()
  subtitle?: string;

  @Expose()
  @IsString()
  type!: 'award' | 'certification' | 'coding' | 'other';
}

class StudentPreferencesDto {
  @Expose()
  @IsString()
  @IsOptional()
  preferredRole?: string;

  @Expose()
  @IsString()
  @IsOptional()
  workMode?: string;

  @Expose()
  @IsString()
  @IsOptional()
  location?: string;

  @Expose()
  @IsString()
  @IsOptional()
  expectedCtc?: string;

  @Expose()
  @IsString()
  @IsOptional()
  noticePeriod?: string;

  @Expose()
  @IsString()
  @IsOptional()
  jobType?: string;

  @Expose()
  @IsString()
  @IsOptional()
  startDate?: string;
}

export class UpdateStudentProfileDto {
  @Expose()
  @IsString()
  @IsOptional()
  firstName?: string;

  @Expose()
  @IsString()
  @IsOptional()
  lastName?: string;

  @Expose()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @Expose()
  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @Expose()
  @IsString()
  @IsOptional()
  githubUrl?: string;

  @Expose()
  @IsString()
  @IsOptional()
  portfolioUrl?: string;

  @Expose()
  @IsString()
  @IsOptional()
  city?: string;

  @Expose()
  @IsString()
  @IsOptional()
  professionalSummary?: string;

  @Expose()
  @IsObject()
  @ValidateNested()
  @Type(() => StudentSkillsDto)
  @IsOptional()
  skills?: StudentSkillsDto;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentExperienceDto)
  @IsOptional()
  experience?: StudentExperienceDto[];

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentProjectDto)
  @IsOptional()
  projects?: StudentProjectDto[];

  @Expose()
  @IsObject()
  @ValidateNested()
  @Type(() => StudentPreferencesDto)
  @IsOptional()
  preferences?: StudentPreferencesDto;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  softSkills?: string[];

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentSpokenLanguageDto)
  @IsOptional()
  spokenLanguages?: StudentSpokenLanguageDto[];

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAchievementDto)
  @IsOptional()
  achievements?: StudentAchievementDto[];

  @Expose()
  @IsString()
  @IsOptional()
  degree?: string;

  @Expose()
  @IsString()
  @IsOptional()
  branch?: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  graduationYear?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  cgpa?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  tenthPercentage?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  twelfthPercentage?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  activeBacklogs?: number;
}
