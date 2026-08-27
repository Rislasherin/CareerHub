import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { HRDecisionAction } from '@domain/enums/HRDecisionAction.enum';

export class RecordHRDecisionDto {
  @Expose()
  @IsNotEmpty({ message: 'Action is required' })
  @IsEnum(HRDecisionAction, { message: 'Invalid HR decision action' })
  action!: HRDecisionAction;

  @Expose()
  @IsOptional()
  @IsString()
  decisionNotes?: string;

  @Expose()
  @IsOptional()
  @IsString()
  overrideReason?: string;
}
