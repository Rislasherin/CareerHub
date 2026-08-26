import { 
  assessCandidateAnswerQuality,
  LangGraphInterviewAIOrchestrator 
} from "../../src/infrastructure/services/ai-interview/LangGraphInterviewAIOrchestrator.service";
import { 
  CandidateAnswerQuality,
  AIOrchestrationAction 
} from "../../src/application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { InterviewPlan } from "../../src/domain/value-objects/InterviewPlan";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runSmartAnswerUnderstandingTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     FEATURE 7: SMART CANDIDATE ANSWER UNDERSTANDING TESTS        ");
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
  // TEST 1: STRONG Open-Ended Technical Answer
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: STRONG Open-Ended Explanation Answer ---");
  const q1 = "Can you explain how Node.js handles asynchronous operations and manages the event loop?";
  const a1 = "In Node.js, asynchronous operations are offloaded to the libuv event loop and worker thread pool, enabling non-blocking I/O execution.";
  const res1 = assessCandidateAnswerQuality(q1, a1);
  assert(res1 === CandidateAnswerQuality.STRONG, "Substantive technical explanation classified as STRONG", res1);

  // --------------------------------------------------------------------------
  // TEST 2: PARTIAL Answer to Explanation Question
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: PARTIAL Answer to Explanation Question ---");
  const a2 = "It uses callbacks and promises.";
  const res2 = assessCandidateAnswerQuality(q1, a2);
  assert(res2 === CandidateAnswerQuality.PARTIAL, "Short explanation missing mechanism classified as PARTIAL", res2);

  // --------------------------------------------------------------------------
  // TEST 3: WEAK Answer to Explanation Question
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: WEAK Answer to Explanation Question ---");
  const a3 = "It works.";
  const res3 = assessCandidateAnswerQuality(q1, a3);
  assert(res3 === CandidateAnswerQuality.WEAK, "Superficial 2-word answer to explanation question classified as WEAK", res3);

  // --------------------------------------------------------------------------
  // TEST 4: UNCLEAR / Gibberish Answer
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: UNCLEAR / Gibberish Answer ---");
  const a4 = "uh hmm whatever thing";
  const res4 = assessCandidateAnswerQuality(q1, a4);
  assert(res4 === CandidateAnswerQuality.UNCLEAR, "Incoherent filler answer classified as UNCLEAR", res4);

  // --------------------------------------------------------------------------
  // TEST 5: Concise Technical Answers (Direct Identification vs Explanation)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 5: Concise Technical Answers ('JWT.', 'Redis.') ---");
  const directQ = "Which authentication mechanism did you use in your backend?";
  const directAns = "JWT.";
  const res5 = assessCandidateAnswerQuality(directQ, directAns);
  assert(res5 === CandidateAnswerQuality.STRONG, "'JWT.' to direct identification question classified as STRONG", res5);

  const explainQ = "Explain how JWT authentication works in your application.";
  const explainAns = "JWT.";
  const res6 = assessCandidateAnswerQuality(explainQ, explainAns);
  assert(res6 === CandidateAnswerQuality.WEAK, "'JWT.' to open-ended explanation question classified as WEAK", res6);

  const redisDirect = "What caching database did you use?";
  const redisAns = "Redis.";
  const res7 = assessCandidateAnswerQuality(redisDirect, redisAns);
  assert(res7 === CandidateAnswerQuality.STRONG, "'Redis.' to direct question classified as STRONG", res7);

  // --------------------------------------------------------------------------
  // TEST 6: LangGraph Action Decision (STRONG -> NEXT_QUESTION)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 6: LangGraph Action with STRONG Answer ---");
  const tracker = {
    generatedFollowUp: false,
    generatedNextQ: false
  };

  const mockGenerator = {
    generateFollowUp: async () => {
      tracker.generatedFollowUp = true;
      return { text: "Follow-up question?", type: QuestionType.FOLLOW_UP, context: "Node.js" };
    },
    generateNextQuestion: async () => {
      tracker.generatedNextQ = true;
      return { text: "Next question?", type: QuestionType.MAIN, context: "React" };
    }
  } as any;
  const mockEvaluator = {} as any;

  const orchestrator = new LangGraphInterviewAIOrchestrator(mockEvaluator, mockGenerator);

  const plan = new InterviewPlan([
    { category: InterviewType.TECHNICAL, skillOrTopic: "Node.js", targetQuestions: 2, questionsAsked: 1 },
    { category: InterviewType.TECHNICAL, skillOrTopic: "React", targetQuestions: 1, questionsAsked: 0 }
  ]);

  const strongTurnResult = await orchestrator.processAnswer({
    sessionId: "sess-1",
    candidateAnswer: a1,
    currentQuestion: { id: "q-1", text: q1, type: QuestionType.MAIN, context: "Node.js" },
    interviewContext: "Full Stack Engineer Evaluation",
    currentTopic: "Node.js",
    coveredTopics: ["Node.js"],
    followUpCount: 0,
    recentQuestions: [q1],
    interviewPlan: plan,
    timeRemainingMs: 600000
  });

  assert(strongTurnResult.action === AIOrchestrationAction.ASK_NEXT_QUESTION, "STRONG answer routes to ASK_NEXT_QUESTION");
  assert(strongTurnResult.answerQuality === CandidateAnswerQuality.STRONG, "Result includes answerQuality: STRONG");
  assert(tracker.generatedNextQ, "Generated next question");
  assert(!tracker.generatedFollowUp, "Did NOT generate follow-up for STRONG answer");

  // --------------------------------------------------------------------------
  // TEST 7: LangGraph Action with PARTIAL Answer (Follow-up bounded)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 7: LangGraph Action with PARTIAL Answer ---");
  tracker.generatedFollowUp = false;
  tracker.generatedNextQ = false;

  const partialTurnResult = await orchestrator.processAnswer({
    sessionId: "sess-1",
    candidateAnswer: a2,
    currentQuestion: { id: "q-1", text: q1, type: QuestionType.MAIN, context: "Node.js" },
    interviewContext: "Full Stack Engineer Evaluation",
    currentTopic: "Node.js",
    coveredTopics: ["Node.js"],
    followUpCount: 0,
    recentQuestions: [q1],
    interviewPlan: plan,
    timeRemainingMs: 600000
  });

  assert(partialTurnResult.action === AIOrchestrationAction.ASK_FOLLOW_UP, "PARTIAL answer routes to ASK_FOLLOW_UP when followUpCount is 0");
  assert(partialTurnResult.answerQuality === CandidateAnswerQuality.PARTIAL, "Result includes answerQuality: PARTIAL");
  assert(tracker.generatedFollowUp, "Generated follow-up for PARTIAL answer");

  // Bounded follow-up test: When followUpCount is already 1, route to ASK_NEXT_QUESTION
  tracker.generatedFollowUp = false;
  tracker.generatedNextQ = false;

  const boundedTurnResult = await orchestrator.processAnswer({
    sessionId: "sess-1",
    candidateAnswer: a2,
    currentQuestion: { id: "q-1", text: q1, type: QuestionType.FOLLOW_UP, context: "Node.js" },
    interviewContext: "Full Stack Engineer Evaluation",
    currentTopic: "Node.js",
    coveredTopics: ["Node.js"],
    followUpCount: 1, // Already asked 1 follow-up
    recentQuestions: [q1, "Follow-up question?"],
    interviewPlan: plan,
    timeRemainingMs: 600000
  });

  assert(boundedTurnResult.action === AIOrchestrationAction.ASK_NEXT_QUESTION, "Follow-up is bounded: routes to ASK_NEXT_QUESTION when followUpCount >= 1");
  assert(tracker.generatedNextQ, "Advanced to next planned question without endless follow-up loops");

  // --------------------------------------------------------------------------
  // TEST 8: Defensive Fallback on Malformed Question/Answer
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 8: Defensive Fallback ---");
  const fallbackRes = assessCandidateAnswerQuality(null as any, undefined as any);
  assert(fallbackRes === CandidateAnswerQuality.UNCLEAR || fallbackRes === CandidateAnswerQuality.STRONG, "Defensive fallback handles null inputs cleanly");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSmartAnswerUnderstandingTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
