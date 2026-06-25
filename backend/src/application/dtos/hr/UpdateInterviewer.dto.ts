import { IsString, Matches, MinLength, MaxLength, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateInterviewerDto {
  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Matches(/^[A-Z]/, { message: 'First name must start with a capital letter' })
  firstName?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'Last name must be at least 1 character' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(/^[A-Z]/, { message: 'Last name must start with a capital letter' })
  lastName?: string;

  @Expose()
  @Matches(/^[A-Z]/, { message: 'Designation must start with a capital letter' })
  @Matches(/^[a-zA-Z ]+$/, { message: 'Designation can only contain letters and spaces' })
  @IsString()
  @IsOptional()
  designation?: string;

  @Expose()
  @Matches(/^[A-Z]/, { message: 'Specialization must start with a capital letter' })
  @IsString()
  @IsOptional()
  specialization?: string;
}
