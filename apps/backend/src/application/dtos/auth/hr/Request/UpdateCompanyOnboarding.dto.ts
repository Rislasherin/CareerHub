import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class UpdateCompanyOnboardingDto {
  // Step 2 fields
  @Expose()
  @IsString()
  @IsOptional()
  sector?: string;

  @Expose()
  @IsString()
  @IsOptional()
  size?: string;

  @Expose()
  @IsString()
  @IsOptional()
  location?: string;

  // Step 3 fields
  @Expose()
  @IsString()
  @IsOptional()
  contactName?: string;

  @Expose()
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @Expose()
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @Expose()
  @IsNotEmpty()
  step!: number;
}

import { IsEmail } from "class-validator";
