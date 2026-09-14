import { LangChainPracticeQuestionGenerator } from "../src/infrastructure/services/ai-practice/LangChainPracticeQuestionGenerator";
import { Logger } from "../src/infrastructure/logger/logger";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";

// Mocking required components
const mockLLM = {
  invoke: async (prompt: any) => {
    return { content: "Understood?" };
  }
};

const generator = new LangChainPracticeQuestionGenerator(
  mockLLM as any
);

async function runTests() {
  
  // Test _isValidQuestion indirectly through a mock if possible, 
  // or by making it public temporarily (or using any).
  const isValid = (generator as any)._isValidQuestion.bind(generator);
  
  const testCases = [
    { text: "Can you explain how React works?", expected: true },
    { text: "What is your experience?", expected: true },
    { text: "Understood?", expected: false },
    { text: "Got it.", expected: false },
    { text: "Great? Tell me more.", expected: false },
    { text: "Please answer?", expected: false }, // "Please" is not an interrogative
    { text: "How did you do that?", expected: true }
  ];

  let failed = 0;
  for (const tc of testCases) {
    const sanitized = (generator as any)._sanitizeQuestion(tc.text);
    const result = isValid(sanitized, []);
    if (result !== tc.expected) {
      console.error(`❌ Test failed for: "${tc.text}" - Expected ${tc.expected}, got ${result}`);
      failed++;
    } else {
      console.log(`✅ Test passed for: "${tc.text}"`);
    }
  }

  if (failed > 0) {
    console.error(`${failed} tests failed.`);
    process.exit(1);
  } else {
    console.log("All structural validation tests passed.");
    process.exit(0);
  }
}

runTests().catch(console.error);
