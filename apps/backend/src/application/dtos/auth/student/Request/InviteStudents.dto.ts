import { IsArray, IsEmail, IsNotEmpty, IsString, Matches, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type, Expose } from 'class-transformer';

export class InviteStudentItemDto {
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
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, { message: 'Invalid email address' })
  @IsNotEmpty()
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Roll number must be at least 3 characters' })
  @MaxLength(30, { message: 'Roll number cannot exceed 30 characters' })
  @Matches(/^(?!.*\s\s)/, { message: 'Roll number cannot have consecutive spaces' })
  @Matches(/^(?!.*\s$)/, { message: 'Roll number cannot end with a space' })
  @Matches(/^(?!^\s)/, { message: 'Roll number cannot start with a space' })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Roll number can only contain letters, numbers, and hyphens' })
  rollNumber: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Department name must be at least 2 characters' })
  @MaxLength(100, { message: 'Department name cannot exceed 100 characters' })
  @Matches(/^(?!.*\s\s)/, { message: 'Department name cannot have consecutive spaces' })
  @Matches(/^(?!.*\s$)/, { message: 'Department name cannot end with a space' })
  @Matches(/^(?!^\s)/, { message: 'Department name cannot start with a space' })
  @Matches(/^[a-zA-Z ]+$/, { message: 'Department name can only contain letters and spaces' })
  department: string;
}

export class InviteStudentsDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InviteStudentItemDto)
  students: InviteStudentItemDto[];
}
