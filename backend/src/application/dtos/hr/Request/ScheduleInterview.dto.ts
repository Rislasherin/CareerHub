import { InterviewType } from "@domain/enums/InterviewType.enum";
import { InterviewDifficulty } from "@domain/enums/InterviewDifficulty.enum";
import { Expose } from "class-transformer";
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class SheduleInterviewDto {
    @Expose()
    @IsString()
    @IsNotEmpty()
    applicationId!: string;

    @Expose()
    @IsEnum(InterviewType)
    @IsNotEmpty()
    type!: InterviewType;

    @Expose()
    @IsOptional()
    @IsArray()
    types?: InterviewType[];

    @Expose()
    @IsOptional()
    @IsArray()
    selectedTypes?: InterviewType[];

    @Expose()
    @IsOptional()
    @IsEnum(InterviewDifficulty)
    difficulty?: InterviewDifficulty;

    @Expose()
    @IsDateString()
    @IsNotEmpty()
    scheduledAt!: string;

    @Expose()
    @IsNumber()
    @IsNotEmpty()
    durationMinutes!: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    totalQuestions?: number;

    @Expose()
    @IsOptional()
    @IsArray()
    skills?: string[];

    @Expose()
    @IsOptional()
    questionDistribution?: {
        technical?: number;
        behavioral?: number;
        hr?: number;
        custom?: number;
    };

    @Expose()
    @IsOptional()
    @IsArray()
    customInstructions?: string[];

    @Expose()
    @IsOptional()
    @IsArray()
    prohibitedTopics?: string[];

    @Expose()
    @IsOptional()
    @IsArray()
    evaluationCriteria?: string[];
}