import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class SetupPasswordDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  token: string;

  @Expose()
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
