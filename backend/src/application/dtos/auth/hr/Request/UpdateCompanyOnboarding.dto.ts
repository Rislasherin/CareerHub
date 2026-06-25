import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray, MinLength, MaxLength, Matches } from "class-validator";

export class UpdateCompanyOnboardingDto {
  // Step 1 fields
  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(2, { message: "Company name must be at least 2 characters long" })
  @MaxLength(100, { message: "Company name cannot exceed 100 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Company name cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Company name cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Company name cannot start with a space" })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: "Company name can only contain letters, spaces, hyphens, and apostrophes" })
  name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: "Website URL cannot exceed 255 characters" })
  website?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "Industry cannot exceed 100 characters" })
  industry?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: "Headquarters location cannot exceed 200 characters" })
  headquarters?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: "Description cannot exceed 1000 characters" })
  description?: string;

  // Step 2 fields
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: "Company size string cannot exceed 50 characters" })
  size?: string;


  // Step 3 fields
  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(2, { message: "Contact name must be at least 2 characters long" })
  @MaxLength(100, { message: "Contact name cannot exceed 100 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Contact name cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Contact name cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Contact name cannot start with a space" })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: "Contact name can only contain letters, spaces, hyphens, and apostrophes" })
  contactName?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "Job title cannot exceed 100 characters" })
  jobTitle?: string;

  @Expose()
  @IsEmail({}, { message: "Please provide a valid contact email" })
  @IsOptional()
  contactEmail?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: "Contact phone cannot exceed 20 digits" })
  contactPhone?: string;

  @Expose()
  @IsArray()
  @IsOptional()
  preferredColleges?: string[];

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: "Logo URL cannot exceed 2000 characters" })
  logoUrl?: string;

  @Expose()
  @IsNotEmpty({ message: "Step is required" })
  step!: number;
}
