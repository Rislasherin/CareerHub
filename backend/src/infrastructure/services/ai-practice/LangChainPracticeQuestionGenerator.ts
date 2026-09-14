import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage } from "@langchain/core/messages";
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
    let retries = 0;
    while (!this._isValidQuestion(sanitized, input.previousQuestions) && retries < 2) {
      retries++;
      // Retry with a stronger system directive by appending a human correction
      const promptValue = await PRACTICE_QUESTION_PROMPT.invoke(payload);
      const messages = promptValue.toChatMessages();
      messages.push(new HumanMessage("The previous generated output was invalid. Generate a meaningful technical interview question related to the selected topic. Do not output acknowledgement, filler, or punctuation-only text."));

      const retryResult = await this._llm.invoke(messages);
      result = retryResult.content as string;
      sanitized = this._sanitizeQuestion(result);
    }

    if (!this._isValidQuestion(sanitized, input.previousQuestions)) {
      throw new Error("Failed to generate a valid question after retry. Output was empty, punctuation-only, or invalid.");
    }

    return sanitized;
  }

  private _isValidQuestion(text: string, previousQuestions: string[]): boolean {
    const alphanumeric = text.replace(/[^a-zA-Z0-9]/g, "");
    if (alphanumeric.length <= 5) return false; // Too short to be a real question

    // Reject if too few words (e.g. "What is?", "Difficulty?")
    const words = text.trim().split(/\s+/);
    if (words.length < 4) return false;

    const lowerText = text.toLowerCase().trim();
    const invalidPhrases = ["great?", "okay?", "ready?", "welcome?", "yes?", "no?", "start?", "begin?", "understood?", "got it?"];
    if (invalidPhrases.some(phrase => lowerText === phrase || lowerText.startsWith(phrase.replace('?', ' ')))) {
      return false;
    }

    if (lowerText.replace(/[^a-z]/g, "") === "welcometo") return false; // "Welcome to?"

    // Structural Check: Ensure it actually asks a question (starts with interrogative or common modal)
    const firstWord = words[0].toLowerCase().replace(/[^a-z]/g, "");
    const interrogatives = new Set(["what", "how", "why", "when", "where", "who", "which", "can", "could", "would", "do", "does", "did", "is", "are", "describe", "explain", "tell", "walk", "share", "give"]);
    if (!interrogatives.has(firstWord) && !lowerText.includes("?")) {
       return false; // Not a question structure
    }

    // Basic semantic duplicate check: compare word sets (ignoring small words)
    const ignoreWords = new Set(["can", "you", "tell", "me", "about", "what", "is", "explain", "describe", "how", "why", "the", "a", "an", "in", "and", "or", "to", "for", "of"]);
    const getMeaningfulWords = (str: string) => {
      const match = str.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
      return new Set(match.filter(w => !ignoreWords.has(w)));
    };

    const currentWords = getMeaningfulWords(text);
    if (currentWords.size > 0) {
      for (const prevQ of previousQuestions) {
        const prevWords = getMeaningfulWords(prevQ);
        if (prevWords.size === 0) continue;
        
        // Calculate Jaccard similarity or simple overlap
        let intersection = 0;
        for (const w of currentWords) {
          if (prevWords.has(w)) intersection++;
        }
        
        const overlapRatioCurrent = intersection / currentWords.size;
        const overlapRatioPrev = intersection / prevWords.size;
        
        // If more than 75% of meaningful words overlap, consider it a duplicate
        if (overlapRatioCurrent >= 0.75 && overlapRatioPrev >= 0.75) {
          return false;
        }
      }
    }
    
    return true;
  }

  private _sanitizeQuestion(raw: string): string {
    let text = raw.trim();
    
    // Strip conversational fillers at the beginning
    text = text.replace(/^(got\s+it|okay|great|sure|that\s+makes\s+sense|nice|good\s+answer|understood)[!.,;?\s]*/i, "");
    text = text.trim();

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
