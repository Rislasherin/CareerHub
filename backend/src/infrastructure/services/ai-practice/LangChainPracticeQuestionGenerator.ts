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

    const payload = {
      difficulty: input.difficulty,
      topics: input.topics.join(", "),
      currentTopic: input.currentTopic,
      previousQuestions: formattedPreviousQuestions,
      previousAnswers: formattedPreviousAnswers,
    };

    let result = await chain.invoke(payload);
    let sanitized = this._sanitizeQuestion(result);

    // Validate output
    if (!this._isValidQuestion(sanitized)) {
      // Retry once with a stronger system directive by appending a human correction
      // We can do this by executing the model directly with the same prompt + correction
      const promptValue = await PRACTICE_QUESTION_PROMPT.invoke(payload);
      const messages = promptValue.toChatMessages();
      messages.push({
        _getType: () => "human",
        content: "Your previous output was rejected because it was empty, punctuation-only, or not a real question. You must generate a fully formed interview question now.",
        name: undefined,
        additional_kwargs: {}
      } as any);

      const retryResult = await this._llm.invoke(messages);
      result = retryResult.content as string;
      sanitized = this._sanitizeQuestion(result);

      if (!this._isValidQuestion(sanitized)) {
        throw new Error("Failed to generate a valid question after retry. Output was empty or punctuation-only.");
      }
    }

    return sanitized;
  }

  private _isValidQuestion(text: string): boolean {
    const alphanumeric = text.replace(/[^a-zA-Z0-9]/g, "");
    return alphanumeric.length > 3; // Must have at least a few real characters
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
