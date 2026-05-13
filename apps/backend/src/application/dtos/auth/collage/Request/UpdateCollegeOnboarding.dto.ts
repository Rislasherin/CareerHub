import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsEmail } from "class-validator";

export class UpdateCollegeOnboardingDto {
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  step!: number;

  // Step 1 fields
  @Expose()
  @IsString()
  @IsOptional()
  name?: string;

  @Expose()
  @IsString()
  @IsOptional()
  shortName?: string;

  @Expose()
  @IsString()
  @IsOptional()
  yearEstablished?: string;

  @Expose()
  @IsString()
  @IsOptional()
  website?: string;

  @Expose()
  @IsString()
  @IsOptional()
  address?: string;

  @Expose()
  @IsString()
  @IsOptional()
  naacGrade?: string;

  @Expose()
  @IsString()
  @IsOptional()
  placementCellName?: string;

  @Expose()
  @IsEmail()
  @IsOptional()
  placementContactEmail?: string;

  @Expose()
  @IsString()
  @IsOptional()
  placementContactPhone?: string;

  @Expose()
  @IsString()
  @IsOptional()
  logoUrl?: string;

  // Step 2 fields
  @Expose()
  @IsArray()
  @IsOptional()
  activeBranches?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  currentAcademicYear?: string;

  @Expose()
  @IsString()
  @IsOptional()
  activePlacementBatch?: string;

  // Step 3 fields
  @Expose()
  @IsString()
  @IsOptional()
  plan?: string;
}
