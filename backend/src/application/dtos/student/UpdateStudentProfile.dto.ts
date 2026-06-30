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
  resumeUrl?: string;

  @Expose()
  @IsString()
  @IsOptional()
  city?: string;

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
