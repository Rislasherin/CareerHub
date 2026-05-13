import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray } from "class-validator";

export class UpdateCompanyOnboardingDto {
  // Step 1 fields
  @Expose()
  @IsString()
  @IsOptional()
  name?: string;

  @Expose()
  @IsString()
  @IsOptional()
  website?: string;

  @Expose()
  @IsString()
  @IsOptional()
  industry?: string;

  @Expose()
  @IsString()
  @IsOptional()
  headquarters?: string;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  // Step 2 fields
  @Expose()
  @IsString()
  @IsOptional()
  size?: string;

  // Step 3 fields
  @Expose()
  @IsString()
  @IsOptional()
  contactName?: string;

  @Expose()
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @Expose()
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @Expose()
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @Expose()
  @IsArray()
  @IsOptional()
  preferredColleges?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @Expose()
  @IsNotEmpty()
  step!: number;
}
