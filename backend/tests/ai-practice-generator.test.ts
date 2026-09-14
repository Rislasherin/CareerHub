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

  // Case 4: LLM returns "?" -> reject and regenerate
  mockLLM.output = "?";
  mockLLM.invocations = [];
  try {
    await generator.generateQuestion({
      difficulty: PracticeDifficulty.MEDIUM,
      topics: ["React"],
      previousQuestions: ["Context?"],
      previousAnswers: ["Yes, we can start."],
      currentTopic: "React"
    });
    assert(false, "Should have thrown error on retry failure for '?'");
  } catch (e) {
    assert(mockLLM.invocations.length === 3, "Case 4: Should retry twice for '?'");
    assert((e as Error).message.includes("punctuation-only"), "Case 4: Should throw correct error");
  }

  // Case 5: LLM returns "Great?" -> reject and regenerate
  mockLLM.output = "Great?";
  mockLLM.invocations = [];
  try {
    await generator.generateQuestion({
      difficulty: PracticeDifficulty.MEDIUM,
      topics: ["React"],
      previousQuestions: ["Context?"],
      previousAnswers: ["Yeah. I'm ready."],
      currentTopic: "React"
    });
    assert(false, "Should have thrown error on retry failure for 'Great?'");
  } catch (e) {
    assert(mockLLM.invocations.length === 3, "Case 5: Should retry twice for 'Great?'");
    
    // Verify the pushed message is an actual HumanMessage (or BaseMessage) to prevent "Unknown author" error
    const retryMessages = mockLLM.invocations[1];
    const retryMsg = retryMessages[retryMessages.length - 1];
    assert(retryMsg.constructor.name === "HumanMessage" || (retryMsg._getType && retryMsg._getType() === "human"), "Case 5: Retry message must be a valid HumanMessage");
    assert(retryMsg.content && retryMsg.content.includes("invalid"), "Case 5: Retry message must contain invalid output warning");
  }

  // Case 6: LLM returns a valid technical question -> accept immediately
  mockLLM.output = "That makes sense. Can you explain closures?";
  mockLLM.invocations = [];
  let result = await generator.generateQuestion({
    difficulty: PracticeDifficulty.MEDIUM,
    topics: ["JavaScript"],
    previousQuestions: ["What is JS?"],
    previousAnswers: ["It is a language."],
    currentTopic: "JavaScript"
  });
  
  assert(mockLLM.invocations.length === 1, "Case 6: Should not retry valid output");
  assert(result === "Can you explain closures?", "Case 6: Should return valid output without filler");
  
  // Cases 1, 2, 3 rely on the prompt structure itself, which we can verify by checking the prompt payload
  // in the mock LLM invocations.
  mockLLM.output = "What is a hook?";
  mockLLM.invocations = [];
  await generator.generateQuestion({
    difficulty: PracticeDifficulty.MEDIUM,
    topics: ["React"],
    previousQuestions: [],
    previousAnswers: [],
    currentTopic: "React"
  });
  const firstCallInput = mockLLM.invocations[0];
  const promptStr = JSON.stringify(firstCallInput);
  assert(promptStr.includes("Do NOT treat it as a technical answer"), "Prompt includes rules to ignore filler");
  assert(promptStr.includes("NEVER respond with \\\"Great?\\\"") || promptStr.includes("NEVER respond with \"Great?\""), "Prompt explicitly rejects conversational filler");

  // Case 7: LLM returns short fragments -> reject and regenerate
  mockLLM.output = "What is?";
  mockLLM.invocations = [];
  try {
    await generator.generateQuestion({
      difficulty: PracticeDifficulty.MEDIUM,
      topics: ["React"],
      previousQuestions: [],
      previousAnswers: [],
      currentTopic: "React"
    });
    assert(false, "Should reject 'What is?'");
  } catch(e) {
    assert(mockLLM.invocations.length === 3, "Case 7: Should retry twice for 'What is?' (3 total calls)");
  }

  mockLLM.output = "Difficulty?";
  mockLLM.invocations = [];
  try {
    await generator.generateQuestion({
      difficulty: PracticeDifficulty.MEDIUM,
      topics: ["React"],
      previousQuestions: [],
      previousAnswers: [],
      currentTopic: "React"
    });
    assert(false, "Should reject 'Difficulty?'");
  } catch(e) {}

  // Case 8: Duplicate question -> reject
  mockLLM.output = "Can you explain how closures work in JavaScript?";
  mockLLM.invocations = [];
  try {
    await generator.generateQuestion({
      difficulty: PracticeDifficulty.MEDIUM,
      topics: ["JavaScript"],
      previousQuestions: ["Explain how closures work in JavaScript, please."],
      previousAnswers: ["Yes"],
      currentTopic: "JavaScript"
    });
    assert(false, "Should reject duplicate question");
  } catch (e) {
    assert(mockLLM.invocations.length === 3, "Case 8: Should retry for duplicate question");
  }

  // Case 9: Sanitizer removes conversational filler
  mockLLM.output = "Got it. Can you explain closures?";
  mockLLM.invocations = [];
  result = await generator.generateQuestion({
    difficulty: PracticeDifficulty.MEDIUM,
    topics: ["JavaScript"],
    previousQuestions: [],
    previousAnswers: [],
    currentTopic: "JavaScript"
  });
  assert(result === "Can you explain closures?", "Case 9: Should remove 'Got it.' filler");

  console.log(`\nTests completed: ${passed}/${total} passed.`);
  if (passed !== total) process.exit(1);
}

runTests().catch(console.error);
