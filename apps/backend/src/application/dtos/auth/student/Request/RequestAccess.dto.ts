import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

export class RequestAccessDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(1, { message: 'Last name must be at least 1 character long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'Roll number is required' })
  @MinLength(3, { message: 'Roll number must be at least 3 characters long' })
  @MaxLength(30, { message: 'Roll number cannot exceed 30 characters' })
  rollNumber: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'Department is required' })
  @MinLength(2, { message: 'Department name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Department name cannot exceed 100 characters' })
  department: string;

  @Expose()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @MinLength(8, { message: 'Phone number must be at least 8 digits' })
  @MaxLength(20, { message: 'Phone number cannot exceed 20 digits' })
  @Matches(/^\+?[0-9\s\-]+$/, { message: 'Please enter a valid phone number' })
  phoneNumber: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'College ID is required' })
  @MaxLength(100, { message: 'College ID cannot exceed 100 characters' })
  collegeId: string;
}
