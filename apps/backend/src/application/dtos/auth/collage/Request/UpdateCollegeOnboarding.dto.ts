import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsEmail, MinLength, MaxLength, Matches } from "class-validator";

export class UpdateCollegeOnboardingDto {
  @Expose()
  @IsNotEmpty({ message: "Step is required" })
  @IsNumber({}, { message: "Step must be a number" })
  @Matches(/^[1-3]$/, { message: "Step must be a number between 1 and 3" })  
  step!: number;

  // Step 1 fields
  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(3, { message: "College name must be at least 3 characters long" })
  @MaxLength(150, { message: "College name cannot exceed 150 characters" })
  @Matches(/^[A-Z]/, { message: "College name must start with a capital letter" })
  @Matches(/^[a-zA-Z ]+$/, { message: "College name can only contain letters and spaces" })
  @Matches(/^(?!.*\s\s)/, { message: "College name cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "College name cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "College name cannot start with a space" })
  name?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(2, { message: "Short name must be at least 2 characters long" })
  @MaxLength(15, { message: "Short name cannot exceed 15 characters" })
  @Matches(/^[A-Z]/, { message: "Short name must start with a capital letter" })
  @Matches(/^[a-zA-Z ]+$/, { message: "Short name can only contain letters and spaces" })
  @Matches(/^(?!.*\s\s)/, { message: "Short name cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Short name cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Short name cannot start with a space" })
  shortName?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}$/, { message: "Year established must be a 4-digit number" })
  
  yearEstablished?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @Matches(/^(?!.*\s\s)/, { message: "Website URL cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Website URL cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Website URL cannot start with a space" })
  @MaxLength(255, { message: "Website URL cannot exceed 255 characters" })
  website?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @Matches(/^(?!.*\s\s)/, { message: "Address cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Address cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Address cannot start with a space" })
  @MaxLength(500, { message: "Address cannot exceed 500 characters" })
  address?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(5, { message: "NAAC grade cannot exceed 5 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "NAAC grade cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "NAAC grade cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "NAAC grade cannot start with a space" })
  naacGrade?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @Matches(/^(?!.*\s\s)/, { message: "Placement cell name cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Placement cell name cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Placement cell name cannot start with a space" })
  @MaxLength(100, { message: "Placement cell name cannot exceed 100 characters" })
  placementCellName?: string;

  @Expose()
  @IsEmail({}, { message: "Please provide a valid placement contact email" })
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, { message: "Invalid email address" })
  @IsOptional()
  placementContactEmail?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(8, { message: "Placement contact phone must be at least 8 digits" })
  @MaxLength(20, { message: "Placement contact phone cannot exceed 20 digits" })
  @Matches(/^\+?[0-9\s\-]+$/, { message: "Please enter a valid placement contact phone number" })
  placementContactPhone?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @Matches(/^(?!.*\s\s)/, { message: "Logo URL cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Logo URL cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Logo URL cannot start with a space" })
  @MaxLength(2000, { message: "Logo URL cannot exceed 2000 characters" })
  logoUrl?: string;

  // Step 2 fields
  @Expose()
  @IsArray()
  @IsOptional()
  @Matches(/^(?!.*\s\s)/, { message: "Branch name cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Branch name cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Branch name cannot start with a space" })
  @MaxLength(100, { message: "Branch name cannot exceed 100 characters" })
  activeBranches?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  @Matches(/^(?!.*\s\s)/, { message: "Current academic year cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Current academic year cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Current academic year cannot start with a space" })
  @MaxLength(20, { message: "Current academic year cannot exceed 20 characters" })
  @Matches(/^(?!\d{4}$)/, { message: "Current academic year cannot be a 4-digit number" })
  currentAcademicYear?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @Matches(/^(?!\d{4}$)/, { message: "Active placement batch cannot be a 4-digit number" })
  @Matches(/^(?!.*\s\s)/, { message: "Active placement batch cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Active placement batch cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Active placement batch cannot start with a space" })
  @MaxLength(20, { message: "Active placement batch cannot exceed 20 characters" })
  activePlacementBatch?: string;

  // Step 3 fields
  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: "Plan cannot exceed 50 characters" })
  @Matches(/^(?![a-zA-Z]$)/, { message: "Plan cannot be a single letter" })
  plan?: string;
}
