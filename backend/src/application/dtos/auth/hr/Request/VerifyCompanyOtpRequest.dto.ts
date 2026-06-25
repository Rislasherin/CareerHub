import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class VerifyCompanyOtpRequestDto {
  @Expose()
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: "OTP is required" })
  @Length(6, 6, { message: "OTP must be exactly 6 characters long" })
  otp: string;
}
