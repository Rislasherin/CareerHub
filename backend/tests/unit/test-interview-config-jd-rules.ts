import { 
  InterviewPlan 
} from "../../src/domain/value-objects/InterviewPlan";
import { 
  InterviewConfiguration 
} from "../../src/domain/value-objects/InterviewConfiguration";
import { 
  InterviewContextBuilder 
} from "../../src/application/services/ai-interview/InterviewContextBuilder";
import { 
  LangGraphInterviewAIOrchestrator 
} from "../../src/infrastructure/services/ai-interview/LangGraphInterviewAIOrchestrator.service";
import { 
  AIOrchestrationAction, 
  CandidateAnswerQuality, 
  AdaptiveInterviewDifficulty 
} from "../../src/application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { InterviewDifficulty } from "../../src/domain/enums/InterviewDifficulty.enum";
import { Job } from "../../src/domain/entities/Job";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runInterviewConfigAndJDRulesTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     FEATURE 10: INTERVIEW CONFIGURATION & JD RULES TESTS         ");
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
  // TEST 1: Single Type Plans (TECHNICAL, BEHAVIORAL, HR)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: Single Type Plan Generation ---");
  const techConfig = new InterviewConfiguration({
    types: [InterviewType.TECHNICAL],
    durationMinutes: 15, // ~3 questions
    skills: ["Node.js", "PostgreSQL", "Redis"],
    difficulty: InterviewDifficulty.MID
  });

  const techContext = InterviewContextBuilder.build(null, techConfig);
  assert(techContext.interviewPlan.items.length === 3, "Technical plan has 3 skill items");
  assert(techContext.interviewPlan.items.every(i => i.category === InterviewType.TECHNICAL), "All items are TECHNICAL");
  assert(techContext.initialCategory === InterviewType.TECHNICAL, "Initial category is TECHNICAL");

  const behavioralConfig = new InterviewConfiguration({
    types: [InterviewType.BEHAVIORAL],
    durationMinutes: 15,
    difficulty: InterviewDifficulty.MID
  });
  const behavioralContext = InterviewContextBuilder.build(null, behavioralConfig);
  assert(behavioralContext.interviewPlan.items.every(i => i.category === InterviewType.BEHAVIORAL), "All items are BEHAVIORAL");

  const hrConfig = new InterviewConfiguration({
    types: [InterviewType.HR],
    durationMinutes: 10,
    difficulty: InterviewDifficulty.MID
  });
  const hrContext = InterviewContextBuilder.build(null, hrConfig);
  assert(hrContext.interviewPlan.items.every(i => i.category === InterviewType.HR), "All items are HR");

  // --------------------------------------------------------------------------
  // TEST 2: Mixed Type Plan (TECHNICAL + BEHAVIORAL + HR)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: Mixed Type Plan Generation ---");
  const mixedConfig = new InterviewConfiguration({
    types: [InterviewType.TECHNICAL, InterviewType.BEHAVIORAL, InterviewType.HR],
    durationMinutes: 30, // ~7 questions
    skills: ["Node.js", "Docker"],
    questionDistribution: { technical: 50, behavioral: 30, hr: 20 },
    difficulty: InterviewDifficulty.SENIOR
  });

  const mixedContext = InterviewContextBuilder.build(null, mixedConfig);
  const planCategories = mixedContext.interviewPlan.items.map(i => i.category);
  assert(planCategories.includes(InterviewType.TECHNICAL), "Mixed plan contains TECHNICAL");
  assert(planCategories.includes(InterviewType.BEHAVIORAL), "Mixed plan contains BEHAVIORAL");
  assert(planCategories.includes(InterviewType.HR), "Mixed plan contains HR");

  // --------------------------------------------------------------------------
  // TEST 3: Job Description Grounding in Context
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: Job Description Grounding ---");
  const mockJob = new Job({
    id: "job-123",
    companyId: "comp-456",
    title: "Senior Backend Platform Engineer",
    description: "Build high-scale distributed microservices and real-time Kafka event streaming pipelines.",
    location: "Remote",
    type: "FULL_TIME" as any,
    requiredSkills: ["Node.js", "Kafka", "PostgreSQL", "Kubernetes"],
    preferredSkills: ["GraphQL", "gRPC", "Redis"],
    experienceLevel: "SENIOR"
  } as any);

  const jdContext = InterviewContextBuilder.build(mockJob, techConfig);
  assert(jdContext.interviewContext.includes("Senior Backend Platform Engineer"), "Role title grounded from JD");
  assert(jdContext.interviewContext.includes("Kafka"), "Required skill grounded from JD");
  assert(jdContext.interviewContext.includes("gRPC"), "Preferred skill grounded from JD");
  assert(jdContext.interviewContext.includes("distributed microservices"), "Summary grounded from JD");

  // --------------------------------------------------------------------------
  // TEST 4: Plan Progression & Category Sequencing
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: Plan Progression & Authority ---");
  const mixedPlan = new InterviewPlan([
    { category: InterviewType.TECHNICAL, skillOrTopic: "Node.js", targetQuestions: 1, questionsAsked: 0 },
    { category: InterviewType.BEHAVIORAL, skillOrTopic: "Team Collaboration", targetQuestions: 1, questionsAsked: 0 },
    { category: InterviewType.HR, skillOrTopic: "Career Motivation", targetQuestions: 1, questionsAsked: 0 }
  ]);

  let next = mixedPlan.getNextItem();
  assert(next?.category === InterviewType.TECHNICAL && next?.skillOrTopic === "Node.js", "First item is TECHNICAL: Node.js");

  mixedPlan.recordQuestionAsked(InterviewType.TECHNICAL, "Node.js");
  next = mixedPlan.getNextItem();
  assert(next?.category === InterviewType.BEHAVIORAL && next?.skillOrTopic === "Team Collaboration", "Second item is BEHAVIORAL: Team Collaboration");

  mixedPlan.recordQuestionAsked(InterviewType.BEHAVIORAL, "Team Collaboration");
  next = mixedPlan.getNextItem();
  assert(next?.category === InterviewType.HR && next?.skillOrTopic === "Career Motivation", "Third item is HR: Career Motivation");

  mixedPlan.recordQuestionAsked(InterviewType.HR, "Career Motivation");
  assert(mixedPlan.isComplete() === true, "Plan is complete when all target questions asked");

  // --------------------------------------------------------------------------
  // TEST 5: LangGraph Completion Authority (Zero questions after plan complete)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 5: LangGraph Completion Authority ---");
  const mockGenerator = {
    generateFollowUp: async () => ({ text: "Follow-up?", type: QuestionType.FOLLOW_UP, context: "Topic" }),
    generateNextQuestion: async () => ({ text: "Next?", type: QuestionType.MAIN, context: "Topic" })
  } as any;
  const mockEvaluator = {} as any;
  const orchestrator = new LangGraphInterviewAIOrchestrator(mockEvaluator, mockGenerator);

  const completedPlan = new InterviewPlan([
    { category: InterviewType.TECHNICAL, skillOrTopic: "Node.js", targetQuestions: 1, questionsAsked: 1 }
  ]);

  const completionResult = await orchestrator.processAnswer({
    sessionId: "sess-1",
    candidateAnswer: "In Node.js, async operations use the libuv event loop.",
    currentQuestion: { id: "q-1", text: "How does Node.js handle async?", type: QuestionType.MAIN, context: "Node.js" },
    interviewContext: "Backend Evaluation",
    currentTopic: "Node.js",
    coveredTopics: ["Node.js"],
    followUpCount: 0,
    recentQuestions: ["How does Node.js handle async?"],
    interviewPlan: completedPlan,
    timeRemainingMs: 300000
  });

  assert(completionResult.action === AIOrchestrationAction.COMPLETE_INTERVIEW, "Orchestrator emits COMPLETE_INTERVIEW when plan is complete");
  assert(!completionResult.nextQuestion, "No next question generated after completion");

  // --------------------------------------------------------------------------
  // TEST 6: Defensive Validation with Missing JD
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 6: Defensive Fallback on Missing JD ---");
  const fallbackBuilt = InterviewContextBuilder.build(null, InterviewConfiguration.createDefault());
  assert(fallbackBuilt.interviewContext.includes("Software Professional"), "Uses default professional title when JD is null");
  assert(fallbackBuilt.interviewPlan.items.length > 0, "Builds valid plan with defaults");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runInterviewConfigAndJDRulesTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
