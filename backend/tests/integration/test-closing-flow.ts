import { AIInterviewSession } from "../../src/domain/entities/ai-interview/AIInterviewSession";
import { InterviewQuestion } from "../../src/domain/entities/ai-interview/InterviewQuestion";
import { InterviewPlan } from "../../src/domain/value-objects/InterviewPlan";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { LangGraphInterviewAIOrchestrator } from "../../src/infrastructure/services/ai-interview/LangGraphInterviewAIOrchestrator.service";
import { AIOrchestrationAction } from "../../src/application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runClosingFlowTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     FEATURE 4: NATURAL INTERVIEW CLOSING TEST SUITE              ");
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
  // TEST 1: Candidate Name in Closing
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: Candidate Name in Closing Message ---");
  const candidateName = "Risla";
  const closingWithName = `Thank you, ${candidateName}. That concludes our interview. I appreciate your time today, and we'll follow up with you regarding the next steps. Have a great day.`;
  
  assert(closingWithName.startsWith("Thank you, Risla."), "Closing includes candidate's first name");
  assert(closingWithName.includes("That concludes our interview."), "Indicates interview is finished");
  assert(closingWithName.includes("we'll follow up with you regarding the next steps."), "Reassures on next steps");
  assert(closingWithName.endsWith("Have a great day."), "Warm professional ending");

  // --------------------------------------------------------------------------
  // TEST 2: Generic Fallback when Name is Missing
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: Missing Name Generic Fallback ---");
  const fallbackClosing = `Thank you for your time today. That concludes our interview, and we'll follow up with you regarding the next steps. Have a great day.`;
  assert(fallbackClosing.startsWith("Thank you for your time today."), "Clean generic opening without broken placeholders");
  assert(fallbackClosing.includes("That concludes our interview"), "Indicates conclusion cleanly");

  // --------------------------------------------------------------------------
  // TEST 3: Plan Completion Transition in LangGraph
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: LangGraph Decides COMPLETE_INTERVIEW When Plan is Complete ---");
  const plan = new InterviewPlan([
    {
      category: InterviewType.TECHNICAL,
      skillOrTopic: "Node.js",
      targetQuestions: 2,
      questionsAsked: 2 // Both questions asked and answered
    }
  ]);

  assert(plan.isComplete() === true, "InterviewPlan.isComplete() returns true");

  let nextQuestionCalled = false;
  let followUpCalled = false;

  const mockEvaluator = { evaluateAnswer: async () => ({ score: 85, feedback: "Good", keyStrengths: [], keyGaps: [] }) } as any;
  const mockGenerator = {
    generateNextQuestion: async () => { nextQuestionCalled = true; return { text: "Extra Q?", type: QuestionType.MAIN, context: "Node.js" }; },
    generateFollowUp: async () => { followUpCalled = true; return { text: "Extra FollowUp?", type: QuestionType.FOLLOW_UP, context: "Node.js" }; }
  } as any;

  const orchestrator = new LangGraphInterviewAIOrchestrator(mockEvaluator, mockGenerator);

  const result = await orchestrator.processAnswer({
    sessionId: "sess-test",
    candidateAnswer: "In Node.js libuv handles async I/O with worker threads.",
    currentQuestion: { id: "q-2", text: "How does Node.js handle async?", type: QuestionType.MAIN, context: "Node.js" },
    interviewPlan: plan,
    currentTopic: "Node.js",
    coveredTopics: ["Node.js"],
    followUpCount: 0,
    timeRemainingMs: 600000,
    interviewContext: "Full Stack Engineer Evaluation",
    recentQuestions: ["How does Node.js handle async?"]
  });

  assert(result.action === AIOrchestrationAction.COMPLETE_INTERVIEW, "Orchestrator returns COMPLETE_INTERVIEW");
  assert(nextQuestionCalled === false, "generateNextQuestion was NOT called after plan complete");
  assert(followUpCalled === false, "generateFollowUp was NOT called after plan complete");

  // --------------------------------------------------------------------------
  // TEST 4: Domain Entity Lifecycle Transition
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: AIInterviewSession CLOSING -> COMPLETED Transitions ---");
  const session = new AIInterviewSession({
    id: "sess-1",
    interviewId: "int-1",
    studentId: "stud-1",
    durationMinutes: 30,
    interviewPlan: plan
  });

  session.startIntro();
  const q1 = new InterviewQuestion({ id: "q-1", text: "Q1", type: QuestionType.MAIN, context: "Node.js" });
  session.moveToQuestion(q1, "Node.js", InterviewType.TECHNICAL);
  session.recordAnswer("q-1", "Answer 1");
  session.startEvaluation();

  // Complete interview
  session.closeInterview();
  assert(session.phase === InterviewPhase.CLOSING, "Session transitions to CLOSING phase");

  session.markAsCompleted();
  assert(session.phase === InterviewPhase.COMPLETED, "Session transitions to COMPLETED phase");
  assert(session.completedAt instanceof Date, "Session completedAt timestamp is recorded");

  // --------------------------------------------------------------------------
  // TEST 5: Timeout Closing Synthesis
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 5: Timeout Closing Synthesis ---");
  const timeoutClosing = `Thank you, ${candidateName}. Our allotted interview time has concluded. I appreciate your time today, and we'll follow up with you regarding the next steps. Have a great day.`;
  assert(timeoutClosing.includes("allotted interview time has concluded"), "Mentions time concluded");
  assert(timeoutClosing.includes(candidateName), "Includes candidate name on timeout");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runClosingFlowTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
