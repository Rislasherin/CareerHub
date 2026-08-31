import { Expose } from "class-transformer";
import { IsEnum, IsArray, ArrayMinSize, ArrayMaxSize, IsInt, Min, Max, IsString, MaxLength } from "class-validator";
import { PracticeDifficulty } from "@domain/enums/PracticeDifficulty.enum";
import { PracticeTopic } from "@domain/enums/PracticeTopic.enum";

export class CreateAIPracticeInterviewRequestDto {
  @Expose()
  @IsEnum(PracticeDifficulty, {
    message: "Difficulty must be one of: EASY, MEDIUM, HARD"
  })
  difficulty!: PracticeDifficulty;

  @Expose()
  @IsArray()
  @ArrayMinSize(1, { message: "At least one topic must be selected" })
  @ArrayMaxSize(5, { message: "At most 5 topics can be selected" })
  @IsString({ each: true, message: "Each topic must be a string" })
  @MaxLength(50, { each: true, message: "Topic must be 50 characters or less" })
  topics!: string[];

  @Expose()
  @IsInt()
  @Min(5, { message: "Minimum duration is 5 minutes" })
  @Max(60, { message: "Maximum duration is 60 minutes" })
  durationMinutes!: number;
}
