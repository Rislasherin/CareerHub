import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class AddInterviewerDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Matches(/^[A-Z]/, { message: 'First name must start with a capital letter' })
  firstName: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Last name must be at least 1 character' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(/^[A-Z]/, { message: 'Last name must start with a capital letter' })
  lastName: string;

  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
