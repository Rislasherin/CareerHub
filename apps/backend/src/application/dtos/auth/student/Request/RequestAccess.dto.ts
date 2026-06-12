import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

export class RequestAccessDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Matches(/^[A-Z]/, { message: 'First name must start with a capital letter' })
  @Matches(/^[a-zA-Z ]+$/, { message: 'First name can only contain letters and spaces' })
  firstName: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(1, { message: 'Last name must be at least 1 character long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(/^(?!.*\s\s)/, { message: "Last name cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Last name cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Last name cannot start with a space" })
  @Matches(/^[a-zA-Z ]+$/, { message: "Last name can only contain letters and spaces" })
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
  @Matches(/^(?!.*\s\s)/, { message: "Department name cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Department name cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Department name cannot start with a space" })
  @Matches(/^[a-zA-Z ]+$/, { message: "Department name can only contain letters and spaces" })
  department: string;

  @Expose()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, { message: 'Invalid email address' })
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @MinLength(8, { message: 'Phone number must be at least 8 digits' })
  @MaxLength(20, { message: 'Phone number cannot exceed 20 digits' })
  @Matches(/^\+?[0-9\s\-]+$/, { message: 'Please enter a valid phone number' })
  @Matches(/^(?!.*\s\s)/, { message: "Phone number cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "Phone number cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "Phone number cannot start with a space" })
  @Matches(/^[0-9\s\-]+$/, { message: "Phone number can only contain numbers, spaces, and hyphens" })
  phoneNumber: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'College ID is required' })
  @MaxLength(100, { message: 'College ID cannot exceed 100 characters' })
  @Matches(/^(?!.*\s\s)/, { message: "College ID cannot have consecutive spaces" })
  @Matches(/^(?!.*\s$)/, { message: "College ID cannot end with a space" })
  @Matches(/^(?!^\s)/, { message: "College ID cannot start with a space" })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: "College ID can only contain letters, numbers, and hyphens" })
  collegeId: string;
}
