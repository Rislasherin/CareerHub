import { Expose } from "class-transformer";
import { IsEmail, IsString, MinLength, MaxLength } from "class-validator";

export class StudentLoginRequestDto {
  @Expose()
  @IsEmail({}, { message: "Please provide a valid email address" })
  email!: string;

  @Expose()
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @MaxLength(100, { message: "Password cannot exceed 100 characters" })
  password!: string;
}
// or64vv@gmail.com