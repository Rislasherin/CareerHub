import { AIPracticeInterview, PracticeFeedback } from "@domain/entities/ai-practice/AIPracticeInterview";

export interface IPracticeInterviewFeedbackGenerator {
  generateFeedback(session: AIPracticeInterview): Promise<PracticeFeedback>;
}
