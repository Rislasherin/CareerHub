import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSubscriptionDTO {
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @IsNumber()
  @IsNotEmpty()
  totalCount!: number;
}

