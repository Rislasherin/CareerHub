import { IsArray, IsEmail, IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator';
import { Type, Expose } from 'class-transformer';

export class InviteStudentItemDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  rollNumber: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
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
