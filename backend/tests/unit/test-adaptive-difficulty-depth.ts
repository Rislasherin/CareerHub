import { 
  computeAdaptiveDifficulty,
  LangGraphInterviewAIOrchestrator,
  assessCandidateAnswerQuality
} from "../../src/infrastructure/services/ai-interview/LangGraphInterviewAIOrchestrator.service";
import { 
  CandidateAnswerQuality,
  AdaptiveInterviewDifficulty,
  AIOrchestrationAction 
} from "../../src/application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { InterviewPlan } from "../../src/domain/value-objects/InterviewPlan";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runAdaptiveDifficultyDepthTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     FEATURE 9: ADAPTIVE INTERVIEW DIFFICULTY & DEPTH TESTS       ");
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
  // TEST 1: Stability & Hysteresis with Single Answers
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: Stability with Single Answers ---");
  const singleStrong = computeAdaptiveDifficulty([CandidateAnswerQuality.STRONG]);
  assert(singleStrong === AdaptiveInterviewDifficulty.STANDARD, "1 STRONG answer does not immediately increase difficulty", singleStrong);

  const singleWeak = computeAdaptiveDifficulty([CandidateAnswerQuality.WEAK]);
  assert(singleWeak === AdaptiveInterviewDifficulty.STANDARD, "1 WEAK answer does not immediately decrease difficulty", singleWeak);

  const singleUnclear = computeAdaptiveDifficulty([CandidateAnswerQuality.UNCLEAR]);
  assert(singleUnclear === AdaptiveInterviewDifficulty.STANDARD, "1 UNCLEAR answer does not immediately decrease difficulty", singleUnclear);

  // --------------------------------------------------------------------------
  // TEST 2: Sustained Strong Performance (CHALLENGING)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: Sustained Strong Performance ---");
  const twoStrong = computeAdaptiveDifficulty([
    CandidateAnswerQuality.STRONG, 
    CandidateAnswerQuality.STRONG
  ]);
  assert(twoStrong === AdaptiveInterviewDifficulty.CHALLENGING, "2 consecutive STRONG answers produce CHALLENGING", twoStrong);

  const threeStrong = computeAdaptiveDifficulty([
    CandidateAnswerQuality.STRONG, 
    CandidateAnswerQuality.STRONG, 
    CandidateAnswerQuality.STRONG
  ]);
  assert(threeStrong === AdaptiveInterviewDifficulty.CHALLENGING, "3 consecutive STRONG answers produce CHALLENGING", threeStrong);

  // --------------------------------------------------------------------------
  // TEST 3: Sustained Weak / Struggling Performance (SUPPORTIVE)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: Sustained Weak Performance ---");
  const twoWeak = computeAdaptiveDifficulty([
    CandidateAnswerQuality.WEAK, 
    CandidateAnswerQuality.WEAK
  ]);
  assert(twoWeak === AdaptiveInterviewDifficulty.SUPPORTIVE, "2 consecutive WEAK answers produce SUPPORTIVE", twoWeak);

  const mixedWeakUnclear = computeAdaptiveDifficulty([
    CandidateAnswerQuality.UNCLEAR, 
    CandidateAnswerQuality.WEAK
  ]);
  assert(mixedWeakUnclear === AdaptiveInterviewDifficulty.SUPPORTIVE, "UNCLEAR + WEAK answers produce SUPPORTIVE", mixedWeakUnclear);

  // --------------------------------------------------------------------------
  // TEST 4: Mixed Answers & Balanced Recovery (STANDARD)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: Mixed Answers & Recovery ---");
  const mixed1 = computeAdaptiveDifficulty([
    CandidateAnswerQuality.STRONG, 
    CandidateAnswerQuality.WEAK, 
    CandidateAnswerQuality.STRONG
  ]);
  assert(mixed1 === AdaptiveInterviewDifficulty.STANDARD, "STRONG, WEAK, STRONG remains STANDARD", mixed1);

  const mixed2 = computeAdaptiveDifficulty([
    CandidateAnswerQuality.STRONG, 
    CandidateAnswerQuality.PARTIAL
  ]);
  assert(mixed2 === AdaptiveInterviewDifficulty.STANDARD, "STRONG + PARTIAL remains STANDARD", mixed2);

  const recovery = computeAdaptiveDifficulty([
    CandidateAnswerQuality.WEAK, 
    CandidateAnswerQuality.WEAK, 
    CandidateAnswerQuality.STRONG
  ]);
  assert(recovery === AdaptiveInterviewDifficulty.STANDARD, "WEAK, WEAK, followed by STRONG recovers to STANDARD", recovery);

  // --------------------------------------------------------------------------
  // TEST 5: LangGraph Adaptive Difficulty Passing to Generator
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 5: LangGraph Adaptive Difficulty Integration ---");
  let capturedAdaptiveDifficulty: AdaptiveInterviewDifficulty | undefined;

  const mockGenerator = {
    generateFollowUp: async (opts: any) => {
      capturedAdaptiveDifficulty = opts.adaptiveDifficulty;
      return { text: "Follow-up question?", type: QuestionType.FOLLOW_UP, context: "Node.js" };
    },
    generateNextQuestion: async (opts: any) => {
      capturedAdaptiveDifficulty = opts.adaptiveDifficulty;
      return { text: "Next question?", type: QuestionType.MAIN, context: "React" };
    }
  } as any;
  const mockEvaluator = {} as any;

  const orchestrator = new LangGraphInterviewAIOrchestrator(mockEvaluator, mockGenerator);

  const plan = new InterviewPlan([
    { category: InterviewType.TECHNICAL, skillOrTopic: "Node.js", targetQuestions: 2, questionsAsked: 1 },
    { category: InterviewType.TECHNICAL, skillOrTopic: "React", targetQuestions: 1, questionsAsked: 0 }
  ]);

  // Turn with 2 previous strong answers + 1 current strong answer -> CHALLENGING
  const strongTurn = await orchestrator.processAnswer({
    sessionId: "sess-1",
    candidateAnswer: "In Node.js, asynchronous operations are handled using libuv event loop and thread pool for non-blocking I/O.",
    currentQuestion: { id: "q-1", text: "How does Node.js handle async operations?", type: QuestionType.MAIN, context: "Node.js" },
    interviewContext: "Full Stack Engineer Evaluation",
    currentTopic: "Node.js",
    coveredTopics: ["Node.js"],
    followUpCount: 0,
    recentQuestions: ["How does Node.js handle async operations?"],
    recentAnswerQualities: [CandidateAnswerQuality.STRONG, CandidateAnswerQuality.STRONG],
    interviewPlan: plan,
    timeRemainingMs: 600000
  });

  assert(strongTurn.adaptiveDifficulty === AdaptiveInterviewDifficulty.CHALLENGING, "Orchestrator returned adaptiveDifficulty: CHALLENGING");
  assert(capturedAdaptiveDifficulty === AdaptiveInterviewDifficulty.CHALLENGING, "Generator received adaptiveDifficulty: CHALLENGING");

  // Turn with 2 previous weak answers + 1 current partial answer -> SUPPORTIVE
  const strugglingTurn = await orchestrator.processAnswer({
    sessionId: "sess-1",
    candidateAnswer: "It uses callbacks.",
    currentQuestion: { id: "q-1", text: "Can you explain how Node.js handles async operations?", type: QuestionType.MAIN, context: "Node.js" },
    interviewContext: "Full Stack Engineer Evaluation",
    currentTopic: "Node.js",
    coveredTopics: ["Node.js"],
    followUpCount: 0,
    recentQuestions: ["Can you explain how Node.js handles async operations?"],
    recentAnswerQualities: [CandidateAnswerQuality.WEAK, CandidateAnswerQuality.WEAK],
    interviewPlan: plan,
    timeRemainingMs: 600000
  });

  assert(strugglingTurn.adaptiveDifficulty === AdaptiveInterviewDifficulty.SUPPORTIVE, "Orchestrator returned adaptiveDifficulty: SUPPORTIVE");
  assert(capturedAdaptiveDifficulty === AdaptiveInterviewDifficulty.SUPPORTIVE, "Generator received adaptiveDifficulty: SUPPORTIVE");

  // --------------------------------------------------------------------------
  // TEST 6: Defensive Fallbacks
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 6: Defensive Fallbacks ---");
  const fallbackRes = computeAdaptiveDifficulty(null as any);
  assert(fallbackRes === AdaptiveInterviewDifficulty.STANDARD, "Null input safely defaults to STANDARD");

  const emptyRes = computeAdaptiveDifficulty([]);
  assert(emptyRes === AdaptiveInterviewDifficulty.STANDARD, "Empty array safely defaults to STANDARD");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAdaptiveDifficultyDepthTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
