import { IPracticeInterviewFeedbackGenerator } from "@application/interfaces/ai-practice/IPracticeInterviewFeedbackGenerator";
import { AIPracticeInterview, PracticeFeedback } from "@domain/entities/ai-practice/AIPracticeInterview";
import { LLMProviderFactory } from "@infrastructure/services/ai-interview/LLMProvider.factory";
import { Logger, LogCategory } from "@infrastructure/logger/logger";
import { z } from "zod";

const FeedbackSchema = z.object({
  overallScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weakAreas: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  topicFeedback: z.array(
    z.object({
      topic: z.string(),
      score: z.number().min(0).max(100),
      observations: z.string()
    })
  )
});

export class LangChainPracticeInterviewFeedbackGenerator implements IPracticeInterviewFeedbackGenerator {
  constructor(private readonly _llmFactory: typeof LLMProviderFactory) {}

  async generateFeedback(session: AIPracticeInterview): Promise<PracticeFeedback> {
    const model = this._llmFactory.createFullEvaluationLLM().withStructuredOutput(FeedbackSchema);

    let conversationHistory = "";
    session.questions.forEach((q, idx) => {
      conversationHistory += `Turn ${idx + 1}:\n`;
      conversationHistory += `AI (${q.topic}): ${q.text}\n`;
      conversationHistory += `Candidate: ${q.candidateAnswer || "(No answer recorded)"}\n\n`;
    });

    const prompt = `You are an expert technical interviewer evaluating a practice interview.
The candidate practiced the following topics: ${session.topics.join(", ")}.
Difficulty level: ${session.difficulty}.

Here is the transcript of the practice session:
${conversationHistory}

Based on the candidate's answers, evaluate their performance and provide structured feedback.
Your evaluation must strictly follow the schema provided.

Guidelines:
- overallScore: A number from 0-100 reflecting their total performance across all topics.
- strengths: A list of 2-4 key things the candidate did well (e.g., "Strong understanding of React state", "Clear communication").
- weakAreas: A list of 2-4 areas where the candidate struggled or gave vague answers.
- improvementSuggestions: Actionable, specific advice for how the candidate can improve their weak areas.
- topicFeedback: An array of objects for each topic discussed, providing a topic-specific score (0-100) and brief observations.

Important:
- Evaluate based ONLY on the provided transcript.
- If the candidate did not answer questions well or the answers were too short, reflect that in the scores.
- Be constructive but honest.`;

    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FEEDBACK] Generating feedback for session ${session.id}...`);

    try {
      const response = await model.invoke([{ role: "user", content: prompt }]);
      
      const feedback: PracticeFeedback = {
        overallScore: response.overallScore,
        strengths: response.strengths,
        weakAreas: response.weakAreas,
        improvementSuggestions: response.improvementSuggestions,
        topicFeedback: response.topicFeedback
      };

      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FEEDBACK] Successfully generated feedback for session ${session.id}. Overall Score: ${feedback.overallScore}`);
      return feedback;

    } catch (err: unknown) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[PRACTICE_FEEDBACK] Error generating feedback:`, err);
      throw new Error("Failed to generate practice feedback");
    }
  }
}
