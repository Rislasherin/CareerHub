import { LangChainPracticeQuestionGenerator } from "../src/infrastructure/services/ai-practice/LangChainPracticeQuestionGenerator";
import { PracticeDifficulty } from "../src/domain/enums/PracticeDifficulty.enum";
import { Runnable } from "@langchain/core/runnables";

class MockChatModel extends Runnable {
  lc_namespace = ["langchain", "chat_models", "mock"];
  public output: string = "";
  public invocations: any[] = [];
  
  async invoke(input: any) {
    this.invocations.push(input);
    return { content: this.output };
  }
}

async function runTests() {
  const mockLLM = new MockChatModel();
  const generator = new LangChainPracticeQuestionGenerator(mockLLM as any);
  
  let passed = 0;
  let total = 0;
  
  const assert = (condition: boolean, msg: string) => {
    total++;
    if (!condition) {
      console.error("X FAILED:", msg);
    } else {
      console.log("OK PASSED:", msg);
      passed++;
    }
  };

  // Test 1: Punctuation-only output is retried
  mockLLM.output = "?";
  mockLLM.invocations = [];
  try {
    await generator.generateQuestion({
      difficulty: PracticeDifficulty.MEDIUM,
      topics: ["React"],
      previousQuestions: ["Context?"],
      previousAnswers: ["Yes. We can start."],
      currentTopic: "React"
    });
    assert(false, "Should have thrown error on retry failure");
  } catch (e) {
    assert(mockLLM.invocations.length === 2, "Should retry once before failing");
    assert((e as Error).message.includes("empty or punctuation-only"), "Should throw correct error message");
  }

  // Test 2: Normal technical answer yields normal generation without retry
  mockLLM.output = "That makes sense. Can you explain closures?";
  mockLLM.invocations = [];
  let result = await generator.generateQuestion({
    difficulty: PracticeDifficulty.MEDIUM,
    topics: ["JavaScript"],
    previousQuestions: ["What is JS?"],
    previousAnswers: ["It is a language."],
    currentTopic: "JavaScript"
  });
  
  assert(mockLLM.invocations.length === 1, "Should not retry valid output");
  assert(result === "That makes sense. Can you explain closures?", "Should return valid output");
  
  // Test 3: LLM generates punctuation initially, but retry succeeds
  mockLLM.invocations = [];
  mockLLM.invoke = async (input: any) => {
    mockLLM.invocations.push(input);
    if (mockLLM.invocations.length === 1) {
      return { content: "." };
    }
    return { content: "Retry success. What is a hook?" };
  };
  
  result = await generator.generateQuestion({
    difficulty: PracticeDifficulty.EASY,
    topics: ["React"],
    previousQuestions: [],
    previousAnswers: [],
    currentTopic: "React"
  });
  
  assert(mockLLM.invocations.length === 2, "Should retry once on period output");
  assert(result === "Retry success. What is a hook?", "Should return successful retry output");

  console.log(`\nTests completed: ${passed}/${total} passed.`);
  if (passed !== total) process.exit(1);
}

runTests().catch(console.error);
