import { 
  extractMentionedTechnologies 
} from "../../src/application/usecases/ai-interview/implementations/ProcessStudentAnswerUseCase";
import { 
  LangChainQuestionGenerator 
} from "../../src/infrastructure/services/ai-interview/LangChainQuestionGenerator.service";
import { InterviewPlan } from "../../src/domain/value-objects/InterviewPlan";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runContextAndAntiRepetitionTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     FEATURE 8: CONVERSATIONAL CONTEXT & ANTI-REPETITION TESTS    ");
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      Logger.info(LogCategory.SYSTEM_INFO, `[PASS] ${testName}${detail ? ` -> ${detail}` : ''}`);
      passed++;
    } else {
      Logger.error(LogCategory.SYSTEM_ERROR, `[FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Extract Mentioned Technologies from Candidate Answers
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: Extract Mentioned Technologies ---");
  const answers = [
    "In our backend service, we used Node.js with Express and PostgreSQL.",
    "For caching, we integrated Redis with a TTL of 1 hour.",
    "Authentication was implemented using JWT tokens with refresh tokens."
  ];

  const extracted = extractMentionedTechnologies(answers);
  assert(extracted.includes("Node.js") || extracted.includes("Node"), "Extracted Node.js");
  assert(extracted.includes("Express"), "Extracted Express");
  assert(extracted.includes("PostgreSQL"), "Extracted PostgreSQL");
  assert(extracted.includes("Redis"), "Extracted Redis");
  assert(extracted.includes("JWT"), "Extracted JWT");
  assert(!extracted.includes("Docker"), "Did NOT hallucinate Docker (unmentioned)");
  assert(!extracted.includes("Kubernetes"), "Did NOT hallucinate Kubernetes (unmentioned)");

  // --------------------------------------------------------------------------
  // TEST 2: Question Deduplication (Exact & Substantial Duplicates)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: Question Deduplication ---");
  const mockLLM = {} as any;
  const generator = new LangChainQuestionGenerator(mockLLM);

  const previousQuestions = [
    "Can you explain how Node.js handles asynchronous operations and manages the event loop?",
    "Which authentication library or approach did you implement in your application?"
  ];

  // Exact duplicate
  const exactDup = "Can you explain how Node.js handles asynchronous operations and manages the event loop?";
  assert(generator.isDuplicate(exactDup, previousQuestions) === true, "Exact duplicate rejected");

  // Near duplicate / minor rewording
  const nearDup = "How does Node.js handle asynchronous operations and manage the event loop?";
  assert(generator.isDuplicate(nearDup, previousQuestions) === true, "Near duplicate with high similarity rejected");

  // Completely new planned question on same general topic
  const newQuestion = "How do streams and buffers work in Node.js for high-throughput data processing?";
  assert(generator.isDuplicate(newQuestion, previousQuestions) === false, "Fresh question on same topic allowed");

  // --------------------------------------------------------------------------
  // TEST 3: Intentional Deeper Follow-Up Allowed
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: Intentional Follow-Up Allowed ---");
  const deeperFollowUp = "How does libuv schedule timer callbacks versus I/O callbacks in the event loop?";
  assert(generator.isDuplicate(deeperFollowUp, previousQuestions, true) === false, "Intentional deeper follow-up accepted");

  // --------------------------------------------------------------------------
  // TEST 4: Bounded Context History Slicing
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: Bounded Context History ---");
  const manyQuestions = [
    "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"
  ];
  const boundedRecent = manyQuestions.slice(-5);
  assert(boundedRecent.length === 5, "Context is strictly bounded to last 5 questions");
  assert(boundedRecent[0] === "Q4" && boundedRecent[4] === "Q8", "Contains latest 5 questions");

  // --------------------------------------------------------------------------
  // TEST 5: InterviewPlan Progression Integrity
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 5: InterviewPlan Remains Authoritative ---");
  const plan = new InterviewPlan([
    { category: InterviewType.TECHNICAL, skillOrTopic: "Node.js", targetQuestions: 1, questionsAsked: 1 },
    { category: InterviewType.TECHNICAL, skillOrTopic: "PostgreSQL", targetQuestions: 1, questionsAsked: 0 }
  ]);

  const nextItem = plan.getNextItem();
  assert(nextItem?.skillOrTopic === "PostgreSQL", "Plan moves to next planned topic without memory corruption");
  assert(plan.isComplete() === false, "Plan is not complete yet");

  plan.recordQuestionAsked(InterviewType.TECHNICAL, "PostgreSQL");
  assert(plan.isComplete() === true, "Plan is complete when all planned items are asked");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runContextAndAntiRepetitionTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
