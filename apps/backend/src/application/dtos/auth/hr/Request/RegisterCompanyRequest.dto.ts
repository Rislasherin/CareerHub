import { Expose } from "class-transformer";
import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from "class-validator";

export class RegisterCompanyRequestDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: "First name is required" })
  @MinLength(2, { message: "First name must be at least 2 characters long" })
  @MaxLength(50, { message: "First name cannot exceed 50 characters" })
  firstName!: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: "Last name is required" })
  @MinLength(1, { message: "Last name must be at least 1 character long" })
  @MaxLength(50, { message: "Last name cannot exceed 50 characters" })
  lastName!: string;

  @Expose()
  @IsEmail({}, { message: "Please provide a valid email address" })
  email!: string;

  @Expose()
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @MaxLength(100, { message: "Password cannot exceed 100 characters" })
  password!: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: "Job title is required" })
  @MinLength(2, { message: "Job title must be at least 2 characters long" })
  @MaxLength(100, { message: "Job title cannot exceed 100 characters" })
  jobTitle!: string;
}
