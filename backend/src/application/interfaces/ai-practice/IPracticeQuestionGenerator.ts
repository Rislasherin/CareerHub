import { PracticeDifficulty } from "@domain/enums/PracticeDifficulty.enum";

export interface IPracticeQuestionGenerator {
  generateQuestion(input: {
    difficulty: PracticeDifficulty;
    topics: string[];
    previousQuestions: string[];
    previousAnswers: string[];
    currentTopic: string;
  }): Promise<string>;
}
