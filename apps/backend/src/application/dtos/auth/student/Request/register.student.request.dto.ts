import { Expose } from "class-transformer";
import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, Matches } from "class-validator";

export class RegisterStudentRequestDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: "First name is required" })
  @MinLength(2, { message: "First name must be at least 2 characters long" })
  @MaxLength(50, { message: "First name cannot exceed 50 characters" })
  @Matches(/^[A-Z]/, { message: "First name must start with a capital letter" })
  @Matches(/^[a-zA-Z ]+$/, { message: "First name can only contain letters and spaces" })
  firstName!: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: "Last name is required" })
  @MinLength(1, { message: "Last name must be at least 1 character long" })
  @MaxLength(50, { message: "Last name cannot exceed 50 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Last name cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Last name cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Last name cannot start with a space" })
  @Matches(/^[a-zA-Z ]+$/, { message: "Last name can only contain letters and spaces" })
  lastName!: string;

  @Expose()
  @IsEmail({}, { message: "Please provide a valid email address" })
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, { message: 'Invalid email address' })
  email!: string;

  @Expose()
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @MaxLength(100, { message: "Password cannot exceed 100 characters" })
  @Matches(/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':",.<>\/?]+$/, { message: "Password can only contain letters, numbers, and special characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Password cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Password cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Password cannot start with a space" })
  password!: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: "College ID is required" })
  @MaxLength(100, { message: "College ID cannot exceed 100 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "College ID cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "College ID cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "College ID cannot start with a space" })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: "College ID can only contain letters, numbers, and hyphens" })
  collegeId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: "Proof URL is required" })
  @MaxLength(2000, { message: "Proof URL cannot exceed 2000 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Proof URL cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Proof URL cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Proof URL cannot start with a space" })
  @Matches(/^(?!.*[\r\n])/, { message: "Proof URL cannot contain newline characters" })
  proofUrl!: string;
}
