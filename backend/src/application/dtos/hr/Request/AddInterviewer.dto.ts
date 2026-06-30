import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class AddInterviewerDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Matches(/^[A-Z]/, { message: 'First name must start with a capital letter' })
  @Matches(/^[a-zA-Z ]+$/, { message: 'First name can only contain letters and spaces' })
  firstName: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Last name must be at least 1 character' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(/^[A-Z]/, { message: 'Last name must start with a capital letter' })
  @Matches(/^[a-zA-Z ]+$/, { message: 'Last name can only contain letters and spaces' })
  lastName: string;

  @Expose()
  @IsEmail()
  @IsNotEmpty()
  @Matches(/^(?!.*\s\s)/, { message: "Email cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Email cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Email cannot start with a space" })
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, { message: 'Invalid email address' })
  email: string;
}



