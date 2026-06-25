import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class VerifyCollegeOtpRequestDto {
  @Expose()
  @IsEmail({}, { message: "Please provide a valid email address" })
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, { message: "Invalid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: "OTP is required" })
  @Length(6, 6, { message: "OTP must be exactly 6 characters long" })
  @Matches(/^[0-9]{6}$/, { message: "OTP must be exactly 6 digits" })
  otp: string;
}
