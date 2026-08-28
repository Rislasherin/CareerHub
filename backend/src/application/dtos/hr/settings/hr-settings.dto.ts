import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Expose } from "class-transformer";

export class RequestEmailChangeDto {
  @Expose()
  @IsEmail({}, { message: "Invalid email format" })
  @IsNotEmpty({ message: "New email is required" })
  @MaxLength(255, { message: "Email is too long" })
  newEmail!: string;
}

export class VerifyEmailChangeDto {
  @Expose()
  @IsEmail({}, { message: "Invalid email format" })
  @IsNotEmpty({ message: "Email is required" })
  email!: string;

  @Expose()
  @IsString({ message: "OTP must be a string" })
  @IsNotEmpty({ message: "OTP is required" })
  otp!: string;
}

export class ChangePasswordRequestDto {
  @Expose()
  @IsString({ message: "Current password must be a string" })
  @IsNotEmpty({ message: "Current password is required" })
  currentPassword!: string;

  @Expose()
  @IsString({ message: "New password must be a string" })
  @IsNotEmpty({ message: "New password is required" })
  newPassword!: string;
}

export class UpdateHRProfileRequestDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName?: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName?: string;

  @Expose()
  @IsString()
  @MaxLength(50)
  designation?: string;
}

export class UpdateCompanyProfileRequestDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @Expose()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @Expose()
  @IsString()
  @MaxLength(50)
  size?: string;

  @Expose()
  @IsString()
  @MaxLength(100)
  location?: string;

  @Expose()
  @IsString()
  @MaxLength(100)
  website?: string;

  @Expose()
  @IsString()
  @MaxLength(255)
  logoUrl?: string;
}
