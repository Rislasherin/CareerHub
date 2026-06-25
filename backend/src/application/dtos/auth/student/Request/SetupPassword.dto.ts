import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

export class SetupPasswordDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  @MaxLength(1000, { message: 'Token cannot exceed 1000 characters' })
  @Matches(/^(?!.*\s\s)/, { message: "Token cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Token cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Token cannot start with a space" })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: "Token can only contain letters, numbers, and hyphens" })
  token: string;

  @Expose()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/^(?!.*\s\s)/, { message: "Password cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Password cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Password cannot start with a space" })
  @Matches(/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':",.<>\/?]+$/, { message: "Password can only contain letters, numbers, and special characters" })
  password: string;
}
