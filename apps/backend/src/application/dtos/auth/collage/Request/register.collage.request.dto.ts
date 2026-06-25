import { Expose } from "class-transformer";
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";

export class RegisterCollegeRequestDto {
  @Expose()
  @IsString()
  @MinLength(2, { message: "First name must be at least 2 characters long" })
  @MaxLength(50, { message: "First name cannot exceed 50 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "First name cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "First name cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "First name cannot start with a space" })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: "First name can only contain letters, spaces, hyphens, and apostrophes" })
  firstName!: string;

  @Expose()
  @IsString()
  @MinLength(1, { message: "Last name must be at least 1 character long" })
  @MaxLength(50, { message: "Last name cannot exceed 50 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Last name cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Last name cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Last name cannot start with a space" })
  @Matches(/^[a-zA-Z\s'-]*$/, { message: "Last name can only contain letters, spaces, hyphens, and apostrophes" })
  lastName!: string;

  @Expose()
  @IsEmail({}, { message: "Please provide a valid email address" })
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, { message: "Invalid email address" })
  email!: string;

  @Expose()
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(100, { message: "Password cannot exceed 100 characters" })
  @Matches(/^(?!.*\s\s)/, { message: "Password cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Password cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Password cannot start with a space" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/, { message: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character" })
  password!: string;
}