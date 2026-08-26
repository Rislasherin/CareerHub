import { LLMProviderFactory } from "../../src/infrastructure/services/ai-interview/LLMProvider.factory";
import { LangChainQuestionGenerator } from "../../src/infrastructure/services/ai-interview/LangChainQuestionGenerator.service";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { InterviewDifficulty } from "../../src/domain/enums/InterviewDifficulty.enum";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runQualityTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     QUESTION GENERATION QUALITY, VALIDATION & DEDUP TEST SUITE   ");
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

  const llm = LLMProviderFactory.createQuestionLLM();
  const generator = new LangChainQuestionGenerator(llm);

  // -------------------------------------------------------------------------
  // UNIT TEST 1: Semantic Question Validator (Deterministic Rules)
  // -------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST UNIT 1: Semantic Question Validator ---");
  
  // Must reject:
  const invalidExamples = [
    "Can you explain a specific Node?",
    "Can you walk me through a Node?",
    "Can you explain a specific?",
    "Can you explain a?",
    "What is a Node?",
    "Tell me about a React?",
    "How do you use?",
    "Walk me through a MongoDB?",
    "Explain a Node.js?",
    "Short?",
    "What is the difference of?",
  ];

  for (const bad of invalidExamples) {
    const isValid = generator.isValidQuestion(bad, "Node.js");
    assert(!isValid, `Properly rejected invalid: "${bad}"`);
  }

  // Must accept:
  const validExamples = [
    "Can you explain how Node.js handles asynchronous operations?",
    "Can you describe a Node.js project you have worked on and explain how you handled concurrency?",
    "How does the Node.js event loop work, and why is it useful for handling concurrent requests?",
    "Describe a time when you had to resolve a conflict between two engineers on your team?",
    "What motivated you to transition into fullstack engineering, and where do you see your career going?"
  ];

  for (const good of validExamples) {
    const isValid = generator.isValidQuestion(good, "Node.js");
    assert(isValid, `Properly accepted valid: "${good}"`);
  }

  // -------------------------------------------------------------------------
  // UNIT TEST 2: Duplicate Detection with Normalization
  // -------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST UNIT 2: Duplicate Detection with Normalization ---");
  const previousHistory = [
    "What inspired you to pursue a career in MERN stack development?",
    "How does Node.js handle asynchronous operations in the event loop?",
    "Can you describe a situation where you optimized a PostgreSQL database query?"
  ];

  // Exact & punctuation variants:
  assert(generator.isDuplicate("What inspired you to pursue a career in MERN stack development?", previousHistory), "Detects exact match duplicate");
  assert(generator.isDuplicate("what inspired you to pursue a career in MERN stack development", previousHistory), "Detects case & punctuation variant duplicate");
  assert(generator.isDuplicate("WHAT INSPIRED YOU TO PURSUE A CAREER IN MERN STACK DEVELOPMENT?", previousHistory), "Detects uppercase variant duplicate");
  assert(generator.isDuplicate("How does Node.js handle asynchronous operations in the event loop?", previousHistory), "Detects 2nd question duplicate");
  assert(!generator.isDuplicate("How do streams and buffers work in Node.js when handling large files?", previousHistory), "Allows novel question");

  // -------------------------------------------------------------------------
  // INTEGRATION TEST 1: Node.js Topic Grounding (Real LLM)
  // -------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- INTEGRATION TEST 1: Node.js Realtime Generation (No Malformed 'a Node') ---");
  const interviewContext = "Role: Senior Backend Engineer. Job: Scalable Node.js microservices and REST APIs.";
  
  for (let i = 1; i <= 3; i++) {
    const q = await generator.generateNextQuestion({
      interviewContext,
      previousQuestions: previousHistory,
      topic: "Node.js",
      interviewType: InterviewType.TECHNICAL,
      difficulty: InterviewDifficulty.SENIOR,
    });

    Logger.info(LogCategory.SYSTEM_INFO, `[Generated Node.js Question ${i}]: "${q.text}"`);
    assert(generator.isValidQuestion(q.text, "Node.js"), `Node.js Question ${i} is semantically valid`);
    assert(!q.text.includes("a Node?") && !q.text.includes("specific Node?") && !q.text.includes("walk me through a Node?"), `Node.js Question ${i} has correct topic grounding`);
    assert(!generator.isDuplicate(q.text, previousHistory), `Node.js Question ${i} is not in previous history`);
  }

  // -------------------------------------------------------------------------
  // INTEGRATION TEST 2: Duplicate Rejection in Stream (Simulated Previous Match)
  // -------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- INTEGRATION TEST 2: Duplicate Rejection & Non-Duplicate Acceptance ---");
  const specificTopic = "React State Management";
  // Generate first question:
  const firstQ = await generator.generateNextQuestion({
    interviewContext: "Role: Senior Frontend Engineer.",
    previousQuestions: [],
    topic: specificTopic,
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.SENIOR,
  });
  Logger.info(LogCategory.SYSTEM_INFO, `[First Question on ${specificTopic}]: "${firstQ.text}"`);

  let ttsQueuedSentences: string[] = [];
  // Generate second question on SAME topic, passing first question as previous:
  const secondQ = await generator.generateNextQuestion({
    interviewContext: "Role: Senior Frontend Engineer.",
    previousQuestions: [firstQ.text],
    topic: specificTopic,
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.SENIOR,
    onSentenceGenerated: (sent) => {
      ttsQueuedSentences.push(sent);
    }
  });

  Logger.info(LogCategory.SYSTEM_INFO, `[Second Question on ${specificTopic}]: "${secondQ.text}"`);
  Logger.info(LogCategory.SYSTEM_INFO, `[TTS Queued]:`, ttsQueuedSentences);
  assert(firstQ.text !== secondQ.text, "Second question is different from first");
  assert(!generator.isDuplicate(secondQ.text, [firstQ.text]), "Second question is not a duplicate");
  assert(!ttsQueuedSentences.includes(firstQ.text), "Duplicate first question was NEVER queued to TTS");

  // -------------------------------------------------------------------------
  // INTEGRATION TEST 3: Multiple Categories (Technical, Behavioral, HR)
  // -------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- INTEGRATION TEST 3: Multi-Category Compliance ---");
  const categories = [
    { type: InterviewType.TECHNICAL, topic: "PostgreSQL Indexing", diff: InterviewDifficulty.SENIOR },
    { type: InterviewType.BEHAVIORAL, topic: "Conflict Resolution", diff: InterviewDifficulty.MID },
    { type: InterviewType.HR, topic: "Career Alignment & Team Fit", diff: InterviewDifficulty.MID },
    { type: InterviewType.CUSTOM, topic: "System Architecture Design", diff: InterviewDifficulty.LEAD },
  ];

  for (const cat of categories) {
    const q = await generator.generateNextQuestion({
      interviewContext: "Role: Full-Stack Engineer.",
      previousQuestions: [],
      topic: cat.topic,
      interviewType: cat.type,
      difficulty: cat.diff,
    });
    Logger.info(LogCategory.SYSTEM_INFO, `[${cat.type} Question - ${cat.topic} (${cat.diff})]: "${q.text}"`);
    assert(generator.isValidQuestion(q.text, cat.topic), `${cat.type} question is valid and properly formed`);
  }

  // -------------------------------------------------------------------------
  // INTEGRATION TEST 4: Follow-Up Generation & Grounding
  // -------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- INTEGRATION TEST 4: Follow-Up Generation ---");
  const followUp = await generator.generateFollowUp({
    interviewContext: "Role: Node.js Engineer.",
    lastQuestion: "How do you manage worker threads in Node.js?",
    lastAnswer: "I use Piscina for worker thread pooling.",
    topic: "Node.js",
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.SENIOR,
  });
  Logger.info(LogCategory.SYSTEM_INFO, `[Follow-Up Question]: "${followUp.text}"`);
  assert(generator.isValidQuestion(followUp.text, "Node.js"), "Follow-up question is valid and properly formed");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runQualityTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
