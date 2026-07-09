import { InterviewType } from "@domain/enums/InterviewType.enum";
import { Expose } from "class-transformer";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class SheduleInterviewDto {
    @Expose()
    @IsString()
    @IsNotEmpty()
    applicationId!: string

    @Expose()
    @IsString()
    @IsNotEmpty()
    interviewerId!: string

    @Expose()
    @IsString()
    @IsNotEmpty()
    title!: string;

    @Expose()
    @IsEnum(InterviewType)
    @IsNotEmpty()
    type!: InterviewType;

    @Expose()
    @IsDateString()
    @IsNotEmpty()
    scheduledAt!: string;

    @Expose()
    @IsNumber()
    @IsNotEmpty()
    durationMinutes!: number;

    @Expose()
    @IsString()
    @IsOptional()
    meetingLink?: string;


}