import { IsArray, IsEmail, IsNotEmpty, IsString, Matches, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type, Expose } from 'class-transformer';

export class InviteStudentItemDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
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
  @IsNotEmpty()
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Roll number must be at least 3 characters' })
  @MaxLength(30, { message: 'Roll number cannot exceed 30 characters' })
  rollNumber: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Department name must be at least 2 characters' })
  @MaxLength(100, { message: 'Department name cannot exceed 100 characters' })
  @Matches(/^[A-Z]/, { message: 'Department name must start with a capital letter' })
  department: string;
}

export class InviteStudentsDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InviteStudentItemDto)
  students: InviteStudentItemDto[];
}
