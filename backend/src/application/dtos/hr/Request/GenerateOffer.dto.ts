import { IsString, IsNumber, IsDateString, IsNotEmpty } from "class-validator";

export class GenerateOfferDto {
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @IsString()
  @IsNotEmpty()
  role!: string;

  @IsNumber()
  @IsNotEmpty()
  ctc!: number;

  @IsDateString()
  @IsNotEmpty()
  joiningDate!: string;

  @IsDateString()
  @IsNotEmpty()
  expiresAt!: string;
}
