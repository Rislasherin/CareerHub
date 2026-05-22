import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class SetupPasswordDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  @MaxLength(1000, { message: 'Token cannot exceed 1000 characters' })
  token: string;

  @Expose()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
