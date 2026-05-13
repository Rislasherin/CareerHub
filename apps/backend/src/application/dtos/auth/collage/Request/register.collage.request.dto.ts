import { Expose } from "class-transformer";
import {
  IsEmail,
  IsString,
  MinLength,
} from "class-validator";

export class RegisterCollegeRequestDto {
  @Expose()
  @IsString()
  firstName!: string;

  @Expose()
  @IsString()
  lastName!: string;

  @Expose()
  @IsEmail()
  email!: string;

  @Expose()
  @IsString()
  @MinLength(8)
  password!: string;
}