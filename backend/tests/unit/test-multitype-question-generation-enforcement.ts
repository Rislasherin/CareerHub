import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { InterviewDifficulty } from "../../src/domain/enums/InterviewDifficulty.enum";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { 
  AIOrchestrationAction, 
  AdaptiveInterviewDifficulty, 
  CandidateAnswerQuality 
} from "../../src/application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { InterviewConfiguration } from "../../src/domain/value-objects/InterviewConfiguration";
import { InterviewPlan, InterviewPlanItem } from "../../src/domain/value-objects/InterviewPlan";
import { InterviewQuestion } from "../../src/domain/entities/ai-interview/InterviewQuestion";
import { AIInterviewSession } from "../../src/domain/entities/ai-interview/AIInterviewSession";
import { InterviewContextBuilder } from "../../src/application/services/ai-interview/InterviewContextBuilder";
import { LangChainQuestionGenerator } from "../../src/infrastructure/services/ai-interview/LangChainQuestionGenerator.service";
import { 
  LangGraphInterviewAIOrchestrator,
  assessCandidateAnswerQuality,
  computeAdaptiveDifficulty
} from "../../src/infrastructure/services/ai-interview/LangGraphInterviewAIOrchestrator.service";
import { LangChainAnswerEvaluator } from "../../src/infrastructure/services/ai-interview/LangChainAnswerEvaluator.service";
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseMessage, AIMessage } from '@langchain/core/messages';
import { RunnableLambda } from '@langchain/core/runnables';
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    Logger.info(LogCategory.SYSTEM_INFO, `[PASS] ${message}`);
    passed++;
  } else {
    Logger.error(LogCategory.SYSTEM_ERROR, `[FAIL] ${message}`);
    failed++;
  }
}

// Mock LLM that returns controllable text streams for deterministic testing
class MockTestLLM extends BaseChatModel {
  public responseText: string = "How does Node.js handle asynchronous operations in the event loop?";

  constructor(responseText?: string) {
    super({});
    if (responseText) this.responseText = responseText;
  }

  _llmType(): string {
    return "mock_test_llm";
  }

  async _generate(messages: BaseMessage[]): Promise<any> {
    return {
      generations: [{ text: this.responseText, message: new AIMessage(this.responseText) }]
    };
  }

  async *_streamResponseChunks(messages: BaseMessage[]): AsyncGenerator<any> {
    yield { text: this.responseText, message: new AIMessage(this.responseText) };
  }
}

async function runFeature15Tests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, " FEATURE 15: MULTI-TYPE QUESTION GENERATION & CATEGORY ENFORCEMENT ");
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  const mockLLM = new MockTestLLM();
  const generator = new LangChainQuestionGenerator(mockLLM);

  // --------------------------------------------------------------------------
  // TEST 1-4: Category-Specific Question Generation & Fallbacks
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1-4: Question Category Enforcement ---");

  // 1. Technical Question Generation
  mockLLM.responseText = "How do you design database indexes for high-throughput queries in PostgreSQL?";
  const techResult = await generator.generateNextQuestion({
    interviewContext: "Senior Backend Developer",
    previousQuestions: [],
    topic: "PostgreSQL",
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.SENIOR,
  });
  assert(techResult.category === InterviewType.TECHNICAL, "1. Technical question category is TECHNICAL");
  assert(techResult.text.toLowerCase().includes("postgresql") || techResult.text.toLowerCase().includes("database"), "1. Technical question grounded in topic");

  // 2. Behavioral Question Generation
  mockLLM.responseText = "Can you describe a situation where you had a conflict with a team member and how you resolved it?";
  const behavioralResult = await generator.generateNextQuestion({
    interviewContext: "Senior Backend Developer",
    previousQuestions: [],
    topic: "Conflict Resolution",
    interviewType: InterviewType.BEHAVIORAL,
    difficulty: InterviewDifficulty.SENIOR,
  });
  assert(behavioralResult.category === InterviewType.BEHAVIORAL, "2. Behavioral question category is BEHAVIORAL");
  assert(generator.isCategoryConsistent(behavioralResult.text, InterviewType.BEHAVIORAL), "2. Behavioral question matches behavioral criteria");

  // 3. HR Question Generation
  mockLLM.responseText = "What inspired you to pursue your current career path and what are your long-term goals?";
  const hrResult = await generator.generateNextQuestion({
    interviewContext: "Senior Backend Developer",
    previousQuestions: [],
    topic: "Career Motivation",
    interviewType: InterviewType.HR,
    difficulty: InterviewDifficulty.SENIOR,
  });
  assert(hrResult.category === InterviewType.HR, "3. HR question category is HR");
  assert(generator.isCategoryConsistent(hrResult.text, InterviewType.HR), "3. HR question matches HR criteria");

  // 4. Custom Question Generation
  mockLLM.responseText = "Explain how you would architect a secure multi-tenant cloud storage microservice?";
  const customResult = await generator.generateNextQuestion({
    interviewContext: "Senior Backend Developer",
    previousQuestions: [],
    topic: "Cloud Architecture",
    interviewType: InterviewType.CUSTOM,
    difficulty: InterviewDifficulty.SENIOR,
  });
  assert(customResult.category === InterviewType.CUSTOM, "4. Custom question category is CUSTOM");

  // --------------------------------------------------------------------------
  // TEST 5: Category Transition After Allocation Exhausted
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 5: Category Transition After Allocation Exhausted ---");

  const multiConfig = new InterviewConfiguration({
    types: [InterviewType.TECHNICAL, InterviewType.BEHAVIORAL, InterviewType.HR],
    difficulty: InterviewDifficulty.MID,
    durationMinutes: 30,
    totalQuestions: 6,
    questionDistribution: {
      technical: 50,  // 3 questions
      behavioral: 33, // 2 questions
      hr: 17          // 1 question
    }
  });

  const mockJob = {
    title: "Fullstack Engineer",
    description: "Node.js and React fullstack role",
    requiredSkills: ["Node.js", "React"],
    preferredSkills: ["PostgreSQL"],
    experienceLevel: "MID",
  };

  const built = InterviewContextBuilder.build(mockJob as any, multiConfig);
  const plan = built.interviewPlan;

  assert(plan.getTotalTargetQuestions() === 6, "5. Total target questions is exactly 6");

  // Record 3 technical questions
  const q1 = plan.getNextItem();
  assert(q1?.category === InterviewType.TECHNICAL, "5. Initial category is TECHNICAL");
  plan.recordQuestionAsked(InterviewType.TECHNICAL, q1!.skillOrTopic);

  const q2 = plan.getNextItem();
  assert(q2?.category === InterviewType.TECHNICAL, "5. Second item is TECHNICAL");
  plan.recordQuestionAsked(InterviewType.TECHNICAL, q2!.skillOrTopic);

  const q3 = plan.getNextItem();
  assert(q3?.category === InterviewType.TECHNICAL, "5. Third item is TECHNICAL");
  plan.recordQuestionAsked(InterviewType.TECHNICAL, q3!.skillOrTopic);

  // Technical is now exhausted (3/3), should transition to BEHAVIORAL
  const q4 = plan.getNextItem();
  assert(q4?.category === InterviewType.BEHAVIORAL, "5. Automatically transitions to BEHAVIORAL after Technical quota reached");
  plan.recordQuestionAsked(InterviewType.BEHAVIORAL, q4!.skillOrTopic);

  const q5 = plan.getNextItem();
  assert(q5?.category === InterviewType.BEHAVIORAL, "5. Fifth item is BEHAVIORAL");
  plan.recordQuestionAsked(InterviewType.BEHAVIORAL, q5!.skillOrTopic);

  // Behavioral is now exhausted (2/2), should transition to HR
  const q6 = plan.getNextItem();
  assert(q6?.category === InterviewType.HR, "5. Automatically transitions to HR after Behavioral quota reached");
  plan.recordQuestionAsked(InterviewType.HR, q6!.skillOrTopic);

  assert(plan.isComplete(), "5. Plan is complete after 6th question recorded");
  assert(plan.getNextItem() === null, "5. No more items returned after full completion");

  // --------------------------------------------------------------------------
  // TEST 6: Follow-Up Remains in Same Category & Topic
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 6: Follow-Up Category Enforcement ---");

  const mockEvalLLM = {
    withStructuredOutput: () => new RunnableLambda({
      func: async () => ({
        score: 88,
        quality: "EXCELLENT",
        feedback: "Demonstrated strong understanding of conflict resolution strategies.",
        needsFollowUp: false
      })
    })
  } as any;

  const evaluator = new LangChainAnswerEvaluator(mockEvalLLM);
  const orchestrator = new LangGraphInterviewAIOrchestrator(evaluator, generator);

  const activePlan = new InterviewPlan([
    { category: InterviewType.BEHAVIORAL, skillOrTopic: "Team Conflict Resolution", targetQuestions: 2, questionsAsked: 0 }
  ]);

  const partialAnswerState = {
    sessionId: "test-session-1",
    interviewContext: "Senior Node.js Developer",
    currentQuestion: new InterviewQuestion({
      id: "q-beh-1",
      text: "Can you describe a time when you had to manage conflicting technical opinions on your team?",
      type: QuestionType.MAIN,
      context: "Team Conflict Resolution",
      category: InterviewType.BEHAVIORAL
    }),
    candidateAnswer: "We had conflicting opinions on REST vs GraphQL.", // Partial answer (7 words < 14)
    currentTopic: "Team Conflict Resolution",
    coveredTopics: ["Team Conflict Resolution"],
    recentQuestions: [],
    followUpCount: 0,
    interviewPlan: activePlan,
    interviewType: InterviewType.BEHAVIORAL,
    difficulty: InterviewDifficulty.MID,
    recentAnswers: [],
    recentAnswerQualities: [],
    mentionedTechnologies: []
  };

  mockLLM.responseText = "How did you facilitate the discussion to reach an agreement on the architecture?";
  const followUpResult = await orchestrator.processAnswer(partialAnswerState);

  assert(followUpResult.action === AIOrchestrationAction.ASK_FOLLOW_UP, "6. Orchestrator triggers ASK_FOLLOW_UP for partial answer");
  assert(followUpResult.nextCategory === InterviewType.BEHAVIORAL, "6. Follow-up preserves active BEHAVIORAL category");
  assert(followUpResult.nextTopic === "Team Conflict Resolution", "6. Follow-up preserves active topic");

  // --------------------------------------------------------------------------
  // TEST 7: Duplicate Question Rejection
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 7: Duplicate Question Rejection ---");

  const existingQuestions = [
    "How does Node.js handle asynchronous operations in the event loop?",
    "What strategies do you use for error handling in Express APIs?"
  ];

  // Exact match
  assert(generator.isDuplicate("How does Node.js handle asynchronous operations in the event loop?", existingQuestions), "7. Exact duplicate rejected");
  // Near-duplicate variation
  assert(generator.isDuplicate("Can you explain how Node.js handles asynchronous operations in its event loop?", existingQuestions), "7. Near-duplicate variation rejected");
  // Distinct question
  assert(!generator.isDuplicate("How do you manage database transactions in PostgreSQL?", existingQuestions), "7. Distinct question accepted");

  // --------------------------------------------------------------------------
  // TEST 8: LLM Category Mismatch Rejection & Fallback
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 8: LLM Category Mismatch Rejection & Fallback ---");

  // LLM generates a coding syntax trivia when category is BEHAVIORAL
  const syntaxTriviaQuestion = "What is the return type of Array.prototype.map in TypeScript?";
  assert(!generator.isCategoryConsistent(syntaxTriviaQuestion, InterviewType.BEHAVIORAL), "8. Syntax trivia detected as inconsistent with BEHAVIORAL");

  // Safe fallback question for behavioral returns valid behavioral question
  mockLLM.responseText = syntaxTriviaQuestion; // LLM keeps outputting syntax trivia
  const fallbackBehavioral = await generator.generateNextQuestion({
    interviewContext: "Senior Backend Developer",
    previousQuestions: [],
    topic: "Team Collaboration",
    interviewType: InterviewType.BEHAVIORAL,
    difficulty: InterviewDifficulty.MID
  });

  assert(fallbackBehavioral.category === InterviewType.BEHAVIORAL, "8. Fallback is in BEHAVIORAL category");
  assert(fallbackBehavioral.text !== syntaxTriviaQuestion, "8. Inconsistent LLM question was rejected and replaced by safe fallback");

  // --------------------------------------------------------------------------
  // TEST 9 & 10: Question Count Invariant & Plan Completion Authority
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 9 & 10: Question Count & Completion Invariant ---");

  const singlePlan = new InterviewPlan([
    { category: InterviewType.TECHNICAL, skillOrTopic: "Node.js", targetQuestions: 2, questionsAsked: 2 }
  ]);

  const completeState = {
    sessionId: "test-session-2",
    interviewContext: "Node.js Developer",
    currentQuestion: new InterviewQuestion({
      id: "q-last",
      text: "How do you profile memory leaks in Node.js?",
      type: QuestionType.MAIN,
      context: "Node.js",
      category: InterviewType.TECHNICAL
    }),
    candidateAnswer: "I use Chrome DevTools and heap snapshots to inspect memory allocation.",
    currentTopic: "Node.js",
    coveredTopics: ["Node.js"],
    recentQuestions: [],
    followUpCount: 0,
    interviewPlan: singlePlan,
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.MID,
    recentAnswers: [],
    recentAnswerQualities: [],
    mentionedTechnologies: []
  };

  const completeResult = await orchestrator.processAnswer(completeState);
  assert(completeResult.action === AIOrchestrationAction.COMPLETE_INTERVIEW, "10. Returns COMPLETE_INTERVIEW when plan is complete");
  assert(!completeResult.nextQuestion, "10. No next question generated after plan completion");

  // --------------------------------------------------------------------------
  // TEST 11: Feature 7 Answer Quality Routing
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 11: Feature 7 Answer Quality Routing ---");

  const strongQuality = assessCandidateAnswerQuality(
    "How does the event loop work in Node.js?",
    "The event loop processes non-blocking I/O operations through phases including timers, pending callbacks, poll, check for setImmediate, and close callbacks using libuv."
  );
  assert(strongQuality === CandidateAnswerQuality.STRONG, "11. Comprehensive technical answer classified as STRONG");

  const weakQuality = assessCandidateAnswerQuality(
    "How does the event loop work in Node.js?",
    "It just runs things."
  );
  assert(weakQuality === CandidateAnswerQuality.WEAK || weakQuality === CandidateAnswerQuality.PARTIAL, "11. Brief answer classified as WEAK or PARTIAL");

  // --------------------------------------------------------------------------
  // TEST 12: Feature 9 Adaptive Difficulty
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 12: Feature 9 Adaptive Difficulty ---");

  const adaptiveChallenging = computeAdaptiveDifficulty([
    CandidateAnswerQuality.STRONG,
    CandidateAnswerQuality.STRONG
  ]);
  assert(adaptiveChallenging === AdaptiveInterviewDifficulty.CHALLENGING, "12. Consecutive strong answers adapt to CHALLENGING");

  const adaptiveSupportive = computeAdaptiveDifficulty([
    CandidateAnswerQuality.WEAK,
    CandidateAnswerQuality.WEAK
  ]);
  assert(adaptiveSupportive === AdaptiveInterviewDifficulty.SUPPORTIVE, "12. Consecutive weak answers adapt to SUPPORTIVE");

  // --------------------------------------------------------------------------
  // TEST 13: Feature 13 Evaluation Category Isolation
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 13: Feature 13 Evaluation Category Isolation ---");

  const evalResult = await evaluator.evaluateAnswer({
    questionText: "How do you handle disagreements on technical design?",
    candidateAnswer: "I schedule a design review, compare trade-offs objectively, and document the consensus.",
    interviewContext: "Engineering Lead",
    interviewType: InterviewType.BEHAVIORAL,
    difficulty: InterviewDifficulty.SENIOR
  });

  assert(evalResult.score === 88, "13. Evaluator parses category score accurately");
  assert(evalResult.quality === "EXCELLENT", "13. Evaluator parses category quality accurately");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runFeature15Tests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test execution failed:", err);
  process.exit(1);
});
