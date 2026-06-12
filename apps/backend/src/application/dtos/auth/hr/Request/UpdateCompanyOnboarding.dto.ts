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
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: "Website URL cannot exceed 255 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Website URL cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Website URL cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Website URL cannot start with a space" })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: "Website URL can only contain letters, spaces, hyphens, and apostrophes" })
  website?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: "Industry cannot exceed 100 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Industry cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Industry cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Industry cannot start with a space" })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: "Industry can only contain letters, spaces, hyphens, and apostrophes" })
  industry?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: "Headquarters location cannot exceed 200 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Headquarters location cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Headquarters location cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Headquarters location cannot start with a space" })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: "Headquarters location can only contain letters, spaces, hyphens, and apostrophes" })
  headquarters?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: "Description cannot exceed 1000 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Description cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Description cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Description cannot start with a space" })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: "Description can only contain letters, spaces, hyphens, and apostrophes" })
  description?: string;

  // Step 2 fields
  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: "Company size string cannot exceed 50 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Company size string cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Company size string cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Company size string cannot start with a space" })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: "Company size string can only contain letters, spaces, hyphens, and apostrophes" })
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
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: "Job title cannot exceed 100 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Job title cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Job title cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Job title cannot start with a space" })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: "Job title can only contain letters, spaces, hyphens, and apostrophes" })
  jobTitle?: string;

  @Expose()
  @IsEmail({}, { message: "Please provide a valid contact email" })
  @IsOptional()
  contactEmail?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(8, { message: "Contact phone must be at least 8 digits" })
  @MaxLength(20, { message: "Contact phone cannot exceed 20 digits" })
  @Matches(/^\+?[0-9\s\-]+$/, { message: "Please enter a valid contact phone number" })
  @Matches(/^(?!.*\s\s)/, { message: "Contact phone cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Contact phone cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Contact phone cannot start with a space" })
  @Matches(/^[0-9\s\-]+$/, { message: "Contact phone can only contain numbers, spaces, and hyphens" })
  contactPhone?: string;

  @Expose()
  @IsArray()
  @IsOptional()
  preferredColleges?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: "Logo URL cannot exceed 2000 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Logo URL cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Logo URL cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Logo URL cannot start with a space" })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: "Logo URL can only contain letters, spaces, hyphens, and apostrophes" })
  logoUrl?: string;

  @Expose()
  @IsNotEmpty({ message: "Step is required" })
  step!: number;
}
