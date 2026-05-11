import { Expose } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class StudentLoginRequestDto {
  @Expose()
  @IsEmail()
  email!: string;

  @Expose()
  @IsString()
  @MinLength(6)
  password!: string;
}
// or64vv@gmail.com