import { PracticeDifficulty } from "@domain/enums/PracticeDifficulty.enum";

export interface IPracticeAnswerEvaluation {
  score: number;
  feedback: string;
}

export interface IPracticeAnswerEvaluator {
  evaluateAnswer(input: {
    difficulty: PracticeDifficulty;
    question: string;
    answer: string;
    topic: string;
  }): Promise<IPracticeAnswerEvaluation>;
}
