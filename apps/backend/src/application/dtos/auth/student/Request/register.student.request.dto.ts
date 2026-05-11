import { Expose } from "class-transformer";
import { IsEmail, IsString, MinLength, IsNotEmpty } from "class-validator";

export class RegisterStudentRequestDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @Expose()
  @IsEmail()
  email!: string;

  @Expose()
  @IsString()
  @MinLength(6)
  password!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  collegeId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  proofUrl!: string;
}
