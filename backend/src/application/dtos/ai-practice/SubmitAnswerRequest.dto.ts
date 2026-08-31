import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, MinLength, MaxLength } from "class-validator";

export class SubmitAnswerRequestDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: "Question ID is required" })
  questionId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: "Answer is required" })
  @MinLength(5, { message: "Answer must be at least 5 characters long" })
  @MaxLength(2000, { message: "Answer cannot exceed 2000 characters" })
  answer!: string;
}
