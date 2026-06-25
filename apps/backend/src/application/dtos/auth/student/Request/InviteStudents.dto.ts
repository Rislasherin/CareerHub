import { IsArray, IsEmail, IsNotEmpty, IsString, Matches, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type, Expose } from 'class-transformer';

export class InviteStudentItemDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'First name must be at least 1 characters' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Last name must be at least 1 character' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName: string;

  @Expose()
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, { message: 'Invalid email address' })
  @IsNotEmpty()
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Roll number must be at least 1 character' })
  @MaxLength(50, { message: 'Roll number cannot exceed 50 characters' })
  rollNumber: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Department name must be at least 2 characters' })
  @MaxLength(100, { message: 'Department name cannot exceed 100 characters' })
  department: string;
}

export class InviteStudentsDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InviteStudentItemDto)
  students: InviteStudentItemDto[];
}
