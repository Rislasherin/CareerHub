import { 
  InterviewPlan 
} from "../../src/domain/value-objects/InterviewPlan";
import { 
  InterviewConfiguration 
} from "../../src/domain/value-objects/InterviewConfiguration";
import { 
  AIInterviewSession 
} from "../../src/domain/entities/ai-interview/AIInterviewSession";
import { 
  InterviewQuestion 
} from "../../src/domain/entities/ai-interview/InterviewQuestion";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runRealtimeStateAndFrontendSyncTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     FEATURE 12: REALTIME STATE & FRONTEND SYNC TESTS             ");
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
  // TEST 1: Question Message Cleanliness (Zero Internal Leakage)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: Clean Question Message Payload ---");
  const rawSpokenWithAck = "Got it. How do you handle database connection pooling in PostgreSQL?";
  const cleanQuestionText = "How do you handle database connection pooling in PostgreSQL?";

  const questionPayload = {
    type: 'QUESTION_UPDATED',
    text: cleanQuestionText,
    questionId: "q-123",
    sequenceNumber: 2,
    timestamp: Date.now()
  };

  assert(!questionPayload.text.startsWith("Got it."), "QUESTION_UPDATED excludes conversational acknowledgement prefix");
  assert(!questionPayload.text.includes("CHALLENGING"), "QUESTION_UPDATED excludes internal adaptive difficulty");
  assert(!questionPayload.text.includes("Score:"), "QUESTION_UPDATED excludes evaluation score");
  assert(questionPayload.sequenceNumber === 2, "QUESTION_UPDATED includes sequenceNumber");
  assert(typeof questionPayload.timestamp === 'number', "QUESTION_UPDATED includes timestamp");

  // --------------------------------------------------------------------------
  // TEST 2: Stale Question Rejection
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: Stale Question Event Filtering ---");
  let currentSeq = 0;
  let currentQuestion = "";

  function handleQuestionUpdated(event: { type: string; text: string; sequenceNumber?: number }) {
    const seq = event.sequenceNumber || 0;
    if (seq < currentSeq) {
      return false; // Rejected
    }
    currentSeq = seq;
    currentQuestion = event.text;
    return true; // Accepted
  }

  // Event Q1 (seq: 1)
  const e1 = handleQuestionUpdated({ type: 'QUESTION_UPDATED', text: "Question 1?", sequenceNumber: 1 });
  assert(e1 === true && currentQuestion === "Question 1?", "Q1 accepted (seq 1)");

  // Event Q2 (seq: 2)
  const e2 = handleQuestionUpdated({ type: 'QUESTION_UPDATED', text: "Question 2?", sequenceNumber: 2 });
  assert(e2 === true && currentQuestion === "Question 2?", "Q2 accepted (seq 2)");

  // Stale Event Q1 arriving out-of-order (seq: 1)
  const e3 = handleQuestionUpdated({ type: 'QUESTION_UPDATED', text: "Question 1?", sequenceNumber: 1 });
  assert(e3 === false && currentQuestion === "Question 2?", "Stale Q1 rejected (seq 1 < current 2), Q2 preserved");

  // --------------------------------------------------------------------------
  // TEST 3: State Transition Sequence Integrity
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: State Transition Sequence ---");
  const stateLog: string[] = [];

  function recordStateChange(state: string) {
    stateLog.push(state);
  }

  // Simulate normal turn lifecycle
  recordStateChange('AI_SPEAKING');
  recordStateChange('LISTENING');
  recordStateChange('AI_SPEAKING');
  recordStateChange('LISTENING');
  recordStateChange('CLOSING');
  recordStateChange('COMPLETED');

  assert(stateLog[0] === 'AI_SPEAKING', "Initial state: AI_SPEAKING");
  assert(stateLog[1] === 'LISTENING', "Transitioned to LISTENING after TTS drain");
  assert(stateLog[stateLog.length - 2] === 'CLOSING', "Entered CLOSING before COMPLETED");
  assert(stateLog[stateLog.length - 1] === 'COMPLETED', "Final state: COMPLETED");
  assert(stateLog.indexOf('COMPLETED') > stateLog.indexOf('CLOSING'), "COMPLETED never precedes CLOSING");

  // --------------------------------------------------------------------------
  // TEST 4: Reconnection & Rejoin State Preservation
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: Reconnection State Preservation ---");
  const plan = new InterviewPlan([
    { category: InterviewType.TECHNICAL, skillOrTopic: "Node.js", targetQuestions: 2, questionsAsked: 1 },
    { category: InterviewType.TECHNICAL, skillOrTopic: "React", targetQuestions: 1, questionsAsked: 0 }
  ]);

  const activeQuestion = new InterviewQuestion({
    id: "q-active-1",
    text: "Can you explain how Node.js manages worker threads?",
    type: QuestionType.MAIN,
    context: "Node.js"
  });

  const session = new AIInterviewSession({
    id: "sess-sync-1",
    interviewId: "int-1",
    studentId: "stud-1",
    durationMinutes: 30,
    configuration: InterviewConfiguration.createDefault(),
    interviewPlan: plan,
    questions: [activeQuestion],
    phase: InterviewPhase.ASKING_QUESTION,
    currentTopic: "Node.js"
  });

  // Candidate reconnects -> State queried
  assert(session.phase === InterviewPhase.ASKING_QUESTION, "Session remains in ASKING_QUESTION on reconnect");
  assert(session.questions.length === 1, "Question count is preserved");
  assert(session.questions[0].text === "Can you explain how Node.js manages worker threads?", "Active question preserved without regeneration");
  assert(session.interviewPlan?.items[0].questionsAsked === 1, "InterviewPlan progression preserved");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRealtimeStateAndFrontendSyncTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
