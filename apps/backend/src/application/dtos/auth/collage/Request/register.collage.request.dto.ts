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
  @Matches(/^[a-zA-Z\s'-]+$/, { message: "First name can only contain letters, spaces, hyphens, and apostrophes" })
  firstName!: string;

  @Expose()
  @IsString()
  @MinLength(1, { message: "Last name must be at least 1 character long" })
  @MaxLength(50, { message: "Last name cannot exceed 50 characters" })
  @Matches(/^[a-zA-Z\s'-]*$/, { message: "Last name can only contain letters, spaces, hyphens, and apostrophes" })
  lastName!: string;

  @Expose()
  @IsEmail({}, { message: "Please provide a valid email address" })
  email!: string;

  @Expose()
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(100, { message: "Password cannot exceed 100 characters" })
  password!: string;
}