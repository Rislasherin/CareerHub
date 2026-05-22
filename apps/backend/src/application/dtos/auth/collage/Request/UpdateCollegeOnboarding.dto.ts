import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsEmail, MinLength, MaxLength, Matches } from "class-validator";

export class UpdateCollegeOnboardingDto {
  @Expose()
  @IsNotEmpty({ message: "Step is required" })
  @IsNumber({}, { message: "Step must be a number" })
  step!: number;

  // Step 1 fields
  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(3, { message: "College name must be at least 3 characters long" })
  @MaxLength(150, { message: "College name cannot exceed 150 characters" })
  name?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(2, { message: "Short name must be at least 2 characters long" })
  @MaxLength(15, { message: "Short name cannot exceed 15 characters" })
  shortName?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}$/, { message: "Year established must be a 4-digit number" })
  yearEstablished?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: "Website URL cannot exceed 255 characters" })
  website?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: "Address cannot exceed 500 characters" })
  address?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(5, { message: "NAAC grade cannot exceed 5 characters" })
  naacGrade?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: "Placement cell name cannot exceed 100 characters" })
  placementCellName?: string;

  @Expose()
  @IsEmail({}, { message: "Please provide a valid placement contact email" })
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
  @MaxLength(2000, { message: "Logo URL cannot exceed 2000 characters" })
  logoUrl?: string;

  // Step 2 fields
  @Expose()
  @IsArray()
  @IsOptional()
  activeBranches?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: "Current academic year cannot exceed 20 characters" })
  currentAcademicYear?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: "Active placement batch cannot exceed 20 characters" })
  activePlacementBatch?: string;

  // Step 3 fields
  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: "Plan cannot exceed 50 characters" })
  plan?: string;
}
