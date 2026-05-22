import { Expose } from "class-transformer";
import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from "class-validator";

export class RegisterStudentRequestDto {
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
  @IsNotEmpty({ message: "College ID is required" })
  @MaxLength(100, { message: "College ID cannot exceed 100 characters" })
  collegeId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: "Proof URL is required" })
  @MaxLength(2000, { message: "Proof URL cannot exceed 2000 characters" })
  proofUrl!: string;
}
