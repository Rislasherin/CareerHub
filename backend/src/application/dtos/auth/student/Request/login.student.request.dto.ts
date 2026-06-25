import { Expose } from "class-transformer";
import { IsEmail, IsString, MinLength, MaxLength, Matches } from "class-validator";

export class StudentLoginRequestDto {
  @Expose()
  @IsEmail({}, { message: "Please provide a valid email address" })
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
}
// or64vv@gmail.com