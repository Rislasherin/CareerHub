import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray, MinLength, MaxLength, Matches } from "class-validator";

export class UpdateCompanyOnboardingDto {
  // Step 1 fields
  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(2, { message: "Company name must be at least 2 characters long" })
  @MaxLength(100, { message: "Company name cannot exceed 100 characters" })
  name?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: "Website URL cannot exceed 255 characters" })
  website?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: "Industry cannot exceed 100 characters" })
  industry?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: "Headquarters location cannot exceed 200 characters" })
  headquarters?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: "Description cannot exceed 1000 characters" })
  description?: string;

  // Step 2 fields
  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: "Company size string cannot exceed 50 characters" })
  size?: string;

  // Step 3 fields
  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(2, { message: "Contact name must be at least 2 characters long" })
  @MaxLength(100, { message: "Contact name cannot exceed 100 characters" })
  contactName?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: "Job title cannot exceed 100 characters" })
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
  contactPhone?: string;

  @Expose()
  @IsArray()
  @IsOptional()
  preferredColleges?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: "Logo URL cannot exceed 2000 characters" })
  logoUrl?: string;

  @Expose()
  @IsNotEmpty({ message: "Step is required" })
  step!: number;
}
