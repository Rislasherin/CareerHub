import { 
  InterviewConfiguration 
} from "../../src/domain/value-objects/InterviewConfiguration";
import { 
  InterviewPlan 
} from "../../src/domain/value-objects/InterviewPlan";
import { 
  AIInterviewSession 
} from "../../src/domain/entities/ai-interview/AIInterviewSession";
import { 
  InterviewQuestion 
} from "../../src/domain/entities/ai-interview/InterviewQuestion";
import { 
  Interview 
} from "../../src/domain/entities/Interview";
import { 
  InterviewContextBuilder 
} from "../../src/application/services/ai-interview/InterviewContextBuilder";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { InterviewDifficulty } from "../../src/domain/enums/InterviewDifficulty.enum";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { InterviewStatus } from "../../src/domain/enums/InterviewStatus.enum";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runFeature14ConfigurationAndMultiTypeTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, " FEATURE 14: INTERVIEW CONFIGURATION & MULTI-TYPE INTERVIEW FLOW ");
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
  // TEST 1-3: Single Type Configurations (TECHNICAL, BEHAVIORAL, HR)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1-3: Single Type Configurations ---");
  const techOnly = new InterviewConfiguration({
    types: [InterviewType.TECHNICAL],
    durationMinutes: 30,
    totalQuestions: 6,
  });
  assert(techOnly.types.length === 1 && techOnly.primaryType === InterviewType.TECHNICAL, "1. Technical only configuration valid");
  assert(techOnly.questionDistribution?.technical === 100, "1. Technical default distribution 100%");

  const behavioralOnly = new InterviewConfiguration({
    types: [InterviewType.BEHAVIORAL],
    durationMinutes: 30,
    totalQuestions: 6,
  });
  assert(behavioralOnly.types.length === 1 && behavioralOnly.primaryType === InterviewType.BEHAVIORAL, "2. Behavioral only configuration valid");
  assert(behavioralOnly.questionDistribution?.behavioral === 100, "2. Behavioral default distribution 100%");

  const hrOnly = new InterviewConfiguration({
    types: [InterviewType.HR],
    durationMinutes: 30,
    totalQuestions: 6,
  });
  assert(hrOnly.types.length === 1 && hrOnly.primaryType === InterviewType.HR, "3. HR only configuration valid");
  assert(hrOnly.questionDistribution?.hr === 100, "3. HR default distribution 100%");

  // --------------------------------------------------------------------------
  // TEST 4-7: Multi-Type Configurations (Pairs & All Three)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4-7: Multi-Type Configurations ---");
  const techBehavioral = new InterviewConfiguration({
    types: [InterviewType.TECHNICAL, InterviewType.BEHAVIORAL],
    durationMinutes: 45,
    totalQuestions: 10,
    questionDistribution: { technical: 70, behavioral: 30 },
  });
  assert(techBehavioral.isMixed && techBehavioral.types.length === 2, "4. Technical + Behavioral configuration valid");

  const techHR = new InterviewConfiguration({
    types: [InterviewType.TECHNICAL, InterviewType.HR],
    durationMinutes: 30,
    totalQuestions: 8,
    questionDistribution: { technical: 60, hr: 40 },
  });
  assert(techHR.isMixed && techHR.types.length === 2, "5. Technical + HR configuration valid");

  const behavioralHR = new InterviewConfiguration({
    types: [InterviewType.BEHAVIORAL, InterviewType.HR],
    durationMinutes: 30,
    totalQuestions: 6,
    questionDistribution: { behavioral: 50, hr: 50 },
  });
  assert(behavioralHR.isMixed && behavioralHR.types.length === 2, "6. Behavioral + HR configuration valid");

  const allThree = new InterviewConfiguration({
    types: [InterviewType.TECHNICAL, InterviewType.BEHAVIORAL, InterviewType.HR],
    durationMinutes: 60,
    totalQuestions: 10,
    questionDistribution: { technical: 50, behavioral: 30, hr: 20 },
  });
  assert(allThree.isMixed && allThree.types.length === 3, "7. Technical + Behavioral + HR configuration valid");

  // --------------------------------------------------------------------------
  // TEST 8-11: Domain Validation Rejections
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 8-11: Configuration Validation Rejections ---");
  let emptyRejected = false;
  try {
    new InterviewConfiguration({ types: [], durationMinutes: 30 });
  } catch (err: any) {
    emptyRejected = true;
  }
  assert(emptyRejected, "8. Empty type selection rejected");

  let duplicateRejected = false;
  try {
    new InterviewConfiguration({ types: [InterviewType.TECHNICAL, InterviewType.TECHNICAL], durationMinutes: 30 });
  } catch (err: any) {
    duplicateRejected = true;
  }
  assert(duplicateRejected, "9. Duplicate types rejected");

  let sumNot100Rejected = false;
  try {
    new InterviewConfiguration({
      types: [InterviewType.TECHNICAL, InterviewType.BEHAVIORAL],
      durationMinutes: 30,
      questionDistribution: { technical: 50, behavioral: 40 }, // sums to 90%
    });
  } catch (err: any) {
    sumNot100Rejected = true;
  }
  assert(sumNot100Rejected, "10. Distribution total != 100% rejected");

  let unselectedDistRejected = false;
  try {
    new InterviewConfiguration({
      types: [InterviewType.TECHNICAL],
      durationMinutes: 30,
      questionDistribution: { technical: 80, hr: 20 }, // HR is unselected!
    });
  } catch (err: any) {
    unselectedDistRejected = true;
  }
  assert(unselectedDistRejected, "11. Unselected category with distribution percentage rejected");

  // --------------------------------------------------------------------------
  // TEST 12: Deterministic Hamilton-Hare Allocation Exact Sum
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 12: Question Allocation Sum Invariant ---");
  const testCases = [
    { total: 10, dist: { technical: 50, behavioral: 30, hr: 20 }, types: [InterviewType.TECHNICAL, InterviewType.BEHAVIORAL, InterviewType.HR] },
    { total: 7, dist: { technical: 33, behavioral: 33, hr: 34 }, types: [InterviewType.TECHNICAL, InterviewType.BEHAVIORAL, InterviewType.HR] },
    { total: 5, dist: { technical: 70, behavioral: 30 }, types: [InterviewType.TECHNICAL, InterviewType.BEHAVIORAL] },
    { total: 13, dist: { technical: 45, behavioral: 35, hr: 20 }, types: [InterviewType.TECHNICAL, InterviewType.BEHAVIORAL, InterviewType.HR] },
  ];

  let allTotalsMatched = true;
  testCases.forEach((tc, idx) => {
    const allocation = InterviewConfiguration.calculateQuestionAllocation(tc.types, tc.total, tc.dist);
    let sum = 0;
    for (const val of allocation.values()) {
      sum += val;
    }
    if (sum !== tc.total) {
      allTotalsMatched = false;
      Logger.error(LogCategory.SYSTEM_ERROR, `Allocation mismatch for case ${idx}: got ${sum}, expected ${tc.total}`);
    }
  });
  assert(allTotalsMatched, "12. Question allocation totals exactly equal totalQuestions with 0 rounding drift");

  // --------------------------------------------------------------------------
  // TEST 13-15: Context Builder Plan Generation & Category Progression
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 13-15: InterviewPlan Generation & Category Progression ---");
  const mockJob = {
    title: "Fullstack Engineer",
    description: "Build robust distributed backend microservices and modern React frontend applications.",
    requiredSkills: ["Node.js", "React", "PostgreSQL", "System Design"],
    preferredSkills: ["Docker", "Redis"],
    experienceLevel: "MID",
  };

  const contextResult = InterviewContextBuilder.build(mockJob as any, allThree);
  const plan = contextResult.interviewPlan;

  assert(plan.getTotalTargetQuestions() === 10, "13. Generated plan total questions equals 10");
  assert(contextResult.initialCategory === InterviewType.TECHNICAL, "13. Initial category is TECHNICAL");

  // Simulate answering all technical questions and verify deterministic progression
  // TECHNICAL (5) -> BEHAVIORAL (3) -> HR (2)
  for (let i = 0; i < 5; i++) {
    const item = plan.getNextItem();
    assert(item?.category === InterviewType.TECHNICAL, `Progression: Question ${i + 1} category is TECHNICAL`);
    plan.recordQuestionAsked();
  }

  const firstBehavioral = plan.getNextItem();
  assert(firstBehavioral?.category === InterviewType.BEHAVIORAL, "13. Progressed to BEHAVIORAL after TECHNICAL completed");

  for (let i = 0; i < 3; i++) {
    const item = plan.getNextItem();
    assert(item?.category === InterviewType.BEHAVIORAL, `Progression: Behavioral Question ${i + 1}`);
    plan.recordQuestionAsked();
  }

  const firstHR = plan.getNextItem();
  assert(firstHR?.category === InterviewType.HR, "13. Progressed to HR after BEHAVIORAL completed");

  for (let i = 0; i < 2; i++) {
    const item = plan.getNextItem();
    assert(item?.category === InterviewType.HR, `Progression: HR Question ${i + 1}`);
    plan.recordQuestionAsked();
  }

  assert(plan.isComplete(), "15. Multi-type InterviewPlan marked complete when all targets reached");
  assert(plan.getNextItem() === null, "15. No remaining items after full completion");

  // --------------------------------------------------------------------------
  // TEST 16: Backward Compatibility with Legacy Single-Type Interviews
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 16: Legacy Backward Compatibility ---");
  const legacyInterview = new Interview({
    id: "legacy-int-1",
    studentId: "student-1",
    jobId: "job-1",
    companyId: "company-1",
    type: InterviewType.TECHNICAL,
    status: InterviewStatus.SCHEDULED,
    scheduledAt: new Date(),
    durationMinutes: 30,
    createdAt: new Date(),
  });

  const legacyConfig = legacyInterview.configuration;
  assert(legacyConfig.types.length === 1 && legacyConfig.primaryType === InterviewType.TECHNICAL, "16. Legacy interview auto-derives valid InterviewConfiguration");
  const legacyBuilt = InterviewContextBuilder.build(mockJob as any, legacyConfig);
  assert(legacyBuilt.interviewPlan.getTotalTargetQuestions() > 0, "16. Legacy interview generates valid InterviewPlan");

  // --------------------------------------------------------------------------
  // TEST 17: Per-Question Category Grounding for Async Evaluation
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 17: Question Category Grounding ---");
  const techQ = new InterviewQuestion({
    id: "q-ground-tech",
    text: "Explain database indexing in PostgreSQL.",
    type: QuestionType.MAIN,
    context: "PostgreSQL",
  });
  techQ.recordAnswer("B-Tree indexes provide logarithmic search for equality and range queries.");

  const behavioralQ = new InterviewQuestion({
    id: "q-ground-beh",
    text: "Tell me about a time you handled a difficult conflict with a peer.",
    type: QuestionType.MAIN,
    context: "Team Collaboration & Communication",
  });
  behavioralQ.recordAnswer("I used data to align our architectural points and reached consensus.");

  assert(techQ.context === "PostgreSQL", "17. Technical question context preserved");
  assert(behavioralQ.context === "Team Collaboration & Communication", "17. Behavioral question context preserved");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runFeature14ConfigurationAndMultiTypeTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
