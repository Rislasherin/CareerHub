import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

export class AddInterviewerDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]/, { message: 'First name must start with a capital letter' })
  firstName: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]/, { message: 'Last name must start with a capital letter' })
  lastName: string;

  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
