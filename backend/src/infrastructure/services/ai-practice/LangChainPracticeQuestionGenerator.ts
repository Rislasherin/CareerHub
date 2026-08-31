import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { IPracticeQuestionGenerator } from "@application/interfaces/ai-practice/IPracticeQuestionGenerator";
import { PracticeDifficulty } from "@domain/enums/PracticeDifficulty.enum";
import { PRACTICE_QUESTION_PROMPT } from "./prompts";

export class LangChainPracticeQuestionGenerator implements IPracticeQuestionGenerator {
  constructor(private readonly _llm: BaseChatModel) {}

  async generateQuestion(input: {
    difficulty: PracticeDifficulty;
    topics: string[];
    previousQuestions: string[];
    previousAnswers: string[];
    currentTopic: string;
  }): Promise<string> {
    const chain = PRACTICE_QUESTION_PROMPT.pipe(this._llm).pipe(new StringOutputParser());

    const formattedPreviousQuestions =
      input.previousQuestions.length > 0
        ? input.previousQuestions.map((q, idx) => `Q${idx + 1}: ${q}`).join("\n")
        : "None";

    const formattedPreviousAnswers =
      input.previousAnswers.length > 0
        ? input.previousAnswers.map((a, idx) => `A${idx + 1}: ${a}`).join("\n")
        : "None";

    const result = await chain.invoke({
      difficulty: input.difficulty,
      topics: input.topics.join(", "),
      currentTopic: input.currentTopic,
      previousQuestions: formattedPreviousQuestions,
      previousAnswers: formattedPreviousAnswers,
    });

    return this._sanitizeQuestion(result);
  }

  private _sanitizeQuestion(raw: string): string {
    let text = raw.trim();
    // Strip common LLM prefixes
    text = text.replace(
      /^(\d+[\.\)]|\*|-|question:|spoken question:|follow-up:|interviewer:)\s*/i,
      ""
    );
    // Strip surrounding quotes
    text = text.replace(/^["'`]+|["'`]+$/g, "");
    text = text.trim();
    // Ensure question ends with "?"
    if (text.length > 0 && !text.endsWith("?")) {
      text = text.replace(/[.!;,]+$/, "") + "?";
    }
    return text;
  }
}
