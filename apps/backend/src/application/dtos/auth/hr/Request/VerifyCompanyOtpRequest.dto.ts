import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class VerifyCompanyOtpRequestDto {
  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
