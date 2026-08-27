import { AIInterviewEvaluation } from '../../src/domain/entities/ai-interview/AIInterviewEvaluation';
import { CompetencyEvaluation } from '../../src/domain/value-objects/CompetencyEvaluation';
import { QuestionEvaluationAnalysis } from '../../src/domain/value-objects/QuestionEvaluationAnalysis';
import { HRDecision } from '../../src/domain/value-objects/HRDecision';
import { AIRecommendation } from '../../src/domain/enums/AIRecommendation.enum';
import { EvaluationConfidence } from '../../src/domain/enums/EvaluationConfidence.enum';
import { EvaluationStatus } from '../../src/domain/enums/EvaluationStatus.enum';
import { HRDecisionAction } from '../../src/domain/enums/HRDecisionAction.enum';
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runEvaluationEngineTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "   AI INTERVIEW EVALUATION & HR FEEDBACK SYSTEM UNIT TESTS        ");
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
  // TEST 1: CompetencyEvaluation with valid score & evidence
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: CompetencyEvaluation (Evaluated) ---");
  const comp1 = new CompetencyEvaluation({
    name: "Node.js & Express",
    category: "Core Technical",
    score: 85,
    status: "EVALUATED",
    explanation: "Candidate demonstrated solid mastery of event loop and non-blocking I/O.",
    evidence: ["Correctly explained libuv thread pool", "Described Express middleware pipeline accurately"]
  });

  assert(comp1.name === "Node.js & Express", "Competency name preserved");
  assert(comp1.score === 85, "Competency score assigned", `${comp1.score}`);
  assert(comp1.status === "EVALUATED", "Competency status is EVALUATED");
  assert(comp1.evidence.length === 2, "Evidence array populated", `Count: ${comp1.evidence.length}`);

  // --------------------------------------------------------------------------
  // TEST 2: CompetencyEvaluation with Insufficient Evidence
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: CompetencyEvaluation (Insufficient Evidence) ---");
  const comp2 = new CompetencyEvaluation({
    name: "MongoDB Aggregations",
    category: "Database",
    score: null,
    status: "INSUFFICIENT_EVIDENCE",
    explanation: "The interview did not contain enough MongoDB questions to reliably evaluate this competency.",
    evidence: []
  });

  assert(comp2.score === null, "Insufficient evidence competency has null score");
  assert(comp2.status === "INSUFFICIENT_EVIDENCE", "Status is INSUFFICIENT_EVIDENCE");
  assert(comp2.evidence.length === 0, "No false evidence fabricated");

  // Verify that setting a score on INSUFFICIENT_EVIDENCE throws
  let thrown = false;
  try {
    new CompetencyEvaluation({
      name: "React Hooks",
      category: "Frontend",
      score: 70, // Invalid when status is INSUFFICIENT_EVIDENCE
      status: "INSUFFICIENT_EVIDENCE",
      explanation: "Test",
      evidence: []
    });
  } catch {
    thrown = true;
  }
  assert(thrown, "Throws when score is provided for INSUFFICIENT_EVIDENCE status");

  // --------------------------------------------------------------------------
  // TEST 3: QuestionEvaluationAnalysis value object
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: QuestionEvaluationAnalysis ---");
  const qAnalysis = new QuestionEvaluationAnalysis({
    questionId: "q-101",
    questionText: "How does JavaScript handle concurrency despite being single-threaded?",
    candidateAnswer: "JavaScript utilizes an event loop with a microtask and macrotask queue to offload I/O operations.",
    score: 88,
    feedback: "Clear explanation of the event loop mechanism and task queues.",
    evidence: ["Mentioned microtasks and macrotasks", "Explained non-blocking event loop"],
    competencyCovered: "JavaScript Fundamentals"
  });

  assert(qAnalysis.score === 88, "Question score recorded accurately");
  assert(qAnalysis.evidence.length === 2, "Evidence points captured");
  assert(qAnalysis.competencyCovered === "JavaScript Fundamentals", "Linked to competency");

  // --------------------------------------------------------------------------
  // TEST 4: AIInterviewEvaluation Domain Entity Invariants
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: AIInterviewEvaluation Domain Entity ---");
  const evaluation = new AIInterviewEvaluation({
    id: "eval-999",
    interviewId: "int-001",
    sessionId: "sess-001",
    studentId: "stud-001",
    jobId: "job-001",
    companyId: "comp-001",
    overallScore: 82,
    overallSummary: "Candidate showed strong backend architecture understanding with minor gaps in distributed caching.",
    competencies: [comp1, comp2],
    strengths: [
      "Deep understanding of Node.js asynchronous architecture.",
      "Clear articulation of JavaScript concurrency model."
    ],
    developmentAreas: [
      "Needs practical experience with MongoDB aggregation optimization."
    ],
    questionAnalyses: [qAnalysis],
    insufficientEvidenceAreas: ["MongoDB Aggregations"],
    recommendation: AIRecommendation.PROCEED,
    recommendationReasoning: "Candidate meets core backend requirements with demonstrated competence in Node.js and systems.",
    confidence: EvaluationConfidence.HIGH,
    confidenceScore: 85,
    confidenceReasoning: "Candidate answered all technical questions substantively with consistent evidence.",
    aiSuggestedActions: [
      "Proceed to final technical round with a focus on database scaling."
    ],
    status: EvaluationStatus.COMPLETED,
    metadata: {
      evaluationVersion: "1.0.0",
      model: "gemini-2.5-flash",
      provider: "GEMINI",
      evaluatedAt: new Date(),
      interviewDurationMinutes: 15,
      totalQuestionsAnswered: 4
    }
  });

  assert(evaluation.overallScore === 82, "Overall score calculated and stored");
  assert(evaluation.recommendation === AIRecommendation.PROCEED, "Recommendation is PROCEED");
  assert(evaluation.confidence === EvaluationConfidence.HIGH, "Confidence rating is HIGH");
  assert(evaluation.insufficientEvidenceAreas.includes("MongoDB Aggregations"), "Insufficient evidence area tracked");
  assert(!evaluation.hasHROverride(), "Initially has no HR override");

  // --------------------------------------------------------------------------
  // TEST 5: HR Decision Recording & Override Validation
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 5: HR Decision & Recommendation Override ---");
  
  // HR agrees with PROCEED and Shortlists candidate
  const hrDecision1 = new HRDecision({
    action: HRDecisionAction.SHORTLIST,
    decisionNotes: "Strong candidate for the backend team.",
    overriddenRecommendation: false,
    decidedBy: "hr-user-01",
    decidedAt: new Date()
  });

  evaluation.recordHRDecision(hrDecision1);
  assert(evaluation.hrDecision?.action === HRDecisionAction.SHORTLIST, "HR decision recorded as SHORTLIST");
  assert(!evaluation.hasHROverride(), "HR decision aligns with AI recommendation (No override)");

  // HR overrides recommendation: Rejects candidate despite PROCEED recommendation
  const hrDecision2 = new HRDecision({
    action: HRDecisionAction.REJECT,
    decisionNotes: "Candidate salary expectation is outside team budget.",
    overriddenRecommendation: true,
    overrideReason: "Budget constraints for this specific quarter.",
    decidedBy: "hr-user-01",
    decidedAt: new Date()
  });

  evaluation.recordHRDecision(hrDecision2);
  assert(evaluation.hasHROverride(), "Override correctly flagged when HR action contradicts AI recommendation");
  assert(evaluation.hrDecision?.overrideReason === "Budget constraints for this specific quarter.", "Override reason persisted");

  // Verify that creating an override without an overrideReason throws
  let overrideValidationThrown = false;
  try {
    new HRDecision({
      action: HRDecisionAction.REJECT,
      overriddenRecommendation: true,
      overrideReason: "", // Invalid empty reason
      decidedBy: "hr-user-01",
      decidedAt: new Date()
    });
  } catch {
    overrideValidationThrown = true;
  }
  assert(overrideValidationThrown, "Throws when overrideReason is missing for an overridden recommendation");

  // --------------------------------------------------------------------------
  // TEST 6: Evaluation Status Transitions (EVALUATING -> FAILED -> COMPLETED)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 6: Status Transitions & Failure Recovery ---");
  const lifecycleEval = new AIInterviewEvaluation({
    id: "eval-lifecycle-1",
    interviewId: "int-lifecycle-1",
    sessionId: "sess-lifecycle-1",
    studentId: "stud-lifecycle-1",
    jobId: "job-lifecycle-1",
    companyId: "comp-lifecycle-1",
    overallScore: null,
    overallSummary: "Evaluation in progress",
    competencies: [],
    strengths: [],
    developmentAreas: [],
    questionAnalyses: [],
    insufficientEvidenceAreas: [],
    recommendation: AIRecommendation.CONSIDER,
    recommendationReasoning: "Evaluating",
    confidence: EvaluationConfidence.MEDIUM,
    confidenceScore: 50,
    confidenceReasoning: "Pending analysis",
    aiSuggestedActions: [],
    status: EvaluationStatus.EVALUATING,
    metadata: {
      evaluationVersion: "1.0.0",
      model: "evaluating",
      provider: "system",
      evaluatedAt: new Date(),
      interviewDurationMinutes: 10,
      totalQuestionsAnswered: 0,
    }
  });

  assert(lifecycleEval.status === EvaluationStatus.EVALUATING, "Initial status is EVALUATING");
  assert(lifecycleEval.failureReason === undefined, "No failure reason initially");

  lifecycleEval.markAsFailed("LLM timeout aborted after 180s");
  assert(lifecycleEval.status === EvaluationStatus.FAILED, "Transitioned to FAILED status");
  assert(lifecycleEval.failureReason === "LLM timeout aborted after 180s", "Failure reason recorded");

  lifecycleEval.markAsEvaluating();
  assert(lifecycleEval.status === EvaluationStatus.EVALUATING, "Transitioned back to EVALUATING for retry");
  assert(lifecycleEval.failureReason === undefined, "Failure reason cleared on retry");

  lifecycleEval.markAsCompleted();
  assert(lifecycleEval.status === EvaluationStatus.COMPLETED, "Transitioned to COMPLETED status");

  // --------------------------------------------------------------------------
  // TEST SUMMARY
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  TEST RESULTS: ${passed} PASSED, ${failed} FAILED               `);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runEvaluationEngineTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
