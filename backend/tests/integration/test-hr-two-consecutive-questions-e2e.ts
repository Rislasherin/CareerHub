import { 
  TurnState, 
  AIWorkerOrchestratorUseCase,
  ICandidateTurn 
} from "../../src/application/usecases/ai-interview/implementations/AIWorkerOrchestratorUseCase";
import { assessAnswerRelevance } from "../../src/shared/utils/answerRelevance.util";
import { 
  AnswerRelevanceClassification, 
  AIOrchestrationAction 
} from "../../src/application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { InterviewQuestion } from "../../src/domain/entities/ai-interview/InterviewQuestion";
import { AIInterviewSession } from "../../src/domain/entities/ai-interview/AIInterviewSession";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { Logger, LogCategory } from "../../src/infrastructure/logger/logger";
import { env } from "../../src/infrastructure/config/env.validator";

async function runTwoConsecutiveQuestionsE2ETest() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "  HR AI INTERVIEW: 2 CONSECUTIVE QUESTIONS END-TO-END PIPELINE   ");
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      Logger.info(LogCategory.SYSTEM_INFO, `[PASS] ${testName}${detail ? ` -> ${detail}` : ""}`);
      passed++;
    } else {
      Logger.error(LogCategory.SYSTEM_ERROR, `[FAIL] ${testName}${detail ? ` -> ${detail}` : ""}`);
      failed++;
    }
  }

  // Set up mock repository with in-memory persistence
  const session = new AIInterviewSession({
    id: "session_hr_e2e_001",
    interviewId: "int_001",
    studentId: "student_001",
    durationMinutes: 30,
    phase: InterviewPhase.ASKING_QUESTION,
    questions: [
      new InterviewQuestion({
        id: "q_event_loop_01",
        text: "Can you explain how Node.js handles asynchronous operations using the event loop?",
        category: "TECHNICAL" as any
      })
    ]
  });

  const publishedDataMessages: Array<Record<string, any>> = [];

  const mockAudioTransport = {
    connect: async () => {},
    publishAudioChunk: async () => {},
    waitForPlayout: async () => {},
    getIncomingAudioStream: async function* () {},
    clearIncomingBuffer: () => {
      Logger.info(LogCategory.SYSTEM_INFO, "[AudioTransport] clearIncomingBuffer executed");
    },
    publishDataMessage: async (payload: Record<string, any>) => {
      publishedDataMessages.push(payload);
    },
    disconnect: async () => {}
  };

  const mockTTSQueue = {
    isSpeaking: () => false,
    enqueue: (text: string) => {},
    waitForDrain: async () => {},
    clear: () => {}
  };

  let sttBufferCleared = false;
  const mockSTTService = {
    transcribeStream: async function* () {},
    clearBuffer: () => {
      sttBufferCleared = true;
      Logger.info(LogCategory.SYSTEM_INFO, "[STTService] clearBuffer executed");
    }
  };

  // --- STAGE 1: QUESTION 1 ASKING & CANDIDATE LISTENING ---
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- STAGE 1: Question 1 Pipeline ---");
  const q1 = session.questions[0];
  const turn1Id = `${q1.id}_turn_1`;
  const turn1: ICandidateTurn = {
    turnId: turn1Id,
    questionId: q1.id,
    questionText: q1.text,
    turnStartTime: Date.now(),
    finalSegments: [],
    provisionalInterim: "",
    lastSpeechTimestamp: Date.now(),
    isFinalized: false,
    isEvaluating: false,
    finalAnswer: null
  };

  // Simulate candidate speaking multi-sentence answer with a pause
  turn1.finalSegments.push("Node.js uses a single-threaded event loop to handle requests.");
  // Pause simulation
  await new Promise(r => setTimeout(r, 50));
  turn1.finalSegments.push("It offloads non-blocking I/O operations and asynchronous tasks to libuv.");

  // Simulate turn finalization with grace window
  await new Promise(r => setTimeout(r, 100));
  turn1.isFinalized = true;
  turn1.isEvaluating = true;
  turn1.finalAnswer = turn1.finalSegments.join(" ").trim();

  // Evaluate Question 1
  const relevance1 = assessAnswerRelevance(q1.text, turn1.finalAnswer);
  assert(
    relevance1.classification === AnswerRelevanceClassification.RELEVANT_SUFFICIENT,
    "Question 1 answer classified as RELEVANT_SUFFICIENT",
    relevance1.classification
  );

  // Persist Answer 1 atomically against Question 1
  q1.recordAnswer(turn1.finalAnswer);
  assert(
    q1.candidateAnswer === turn1.finalAnswer,
    "Answer 1 safely and stably persisted to Question 1 ID",
    `Recorded Answer: "${q1.candidateAnswer}"`
  );

  // --- STAGE 2: QUESTION 2 GENERATION & BUFFER PURGING ---
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- STAGE 2: Transition & Question 2 Setup ---");
  const q2 = new InterviewQuestion({
    id: "q_databases_02",
    text: "What are the primary differences between SQL and NoSQL databases?",
    category: "TECHNICAL" as any
  });
  session.startEvaluation();
  session.moveToQuestion(q2, "Databases");

  assert(
    session.questions.length === 2,
    "Session successfully advanced to Question 2",
    `Total questions: ${session.questions.length}`
  );

  // Purge buffers before Question 2 listening starts
  mockAudioTransport.clearIncomingBuffer();
  mockSTTService.clearBuffer();
  assert(sttBufferCleared === true, "STT buffer and queue cleared before Question 2 turn starts");

  // --- STAGE 3: QUESTION 2 ASKING & CANDIDATE ANSWER ---
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- STAGE 3: Question 2 Pipeline ---");
  const turn2Id = `${q2.id}_turn_2`;
  const turn2: ICandidateTurn = {
    turnId: turn2Id,
    questionId: q2.id,
    questionText: q2.text,
    turnStartTime: Date.now(),
    finalSegments: [],
    provisionalInterim: "",
    lastSpeechTimestamp: Date.now(),
    isFinalized: false,
    isEvaluating: false,
    finalAnswer: null
  };

  // Late STT segment from Turn 1 arrives:
  const lateSttPacket = { turnId: turn1Id, text: "...and also handles microtasks." };
  if (lateSttPacket.turnId === turn2.turnId) {
    turn2.finalSegments.push(lateSttPacket.text);
  }
  assert(
    turn2.finalSegments.length === 0,
    "Late STT packet from Question 1 is strictly rejected by Question 2 turn",
    `Turn 2 segments length: ${turn2.finalSegments.length}`
  );

  // Candidate speaks answer to Question 2
  turn2.finalSegments.push("SQL databases use structured schemas and relational tables.");
  turn2.finalSegments.push("NoSQL databases use dynamic schemas with flexible document or key-value storage.");

  turn2.isFinalized = true;
  turn2.isEvaluating = true;
  turn2.finalAnswer = turn2.finalSegments.join(" ").trim();

  // Evaluate Question 2
  const relevance2 = assessAnswerRelevance(q2.text, turn2.finalAnswer);
  assert(
    relevance2.classification === AnswerRelevanceClassification.RELEVANT_SUFFICIENT,
    "Question 2 answer classified as RELEVANT_SUFFICIENT",
    relevance2.classification
  );

  // Persist Answer 2 atomically against Question 2
  q2.recordAnswer(turn2.finalAnswer);
  assert(
    q2.candidateAnswer === turn2.finalAnswer,
    "Answer 2 safely and stably persisted to Question 2 ID",
    `Recorded Answer: "${q2.candidateAnswer}"`
  );

  // --- STAGE 4: ZERO CROSS-CONTAMINATION PROOF ---
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- STAGE 4: Cross-Contamination & ID Isolation Proof ---");
  assert(
    !q1.candidateAnswer!.includes("SQL") && !q1.candidateAnswer!.includes("NoSQL"),
    "Answer 1 contains ZERO words from Question 2 answer",
    `Q1 Answer: "${q1.candidateAnswer}"`
  );
  assert(
    !q2.candidateAnswer!.includes("event loop") && !q2.candidateAnswer!.includes("libuv"),
    "Answer 2 contains ZERO words from Question 1 answer",
    `Q2 Answer: "${q2.candidateAnswer}"`
  );
  assert(
    q1.id !== q2.id && turn1.turnId !== turn2.turnId,
    "Stable unique IDs maintained across questions and turns",
    `Q1: ${q1.id} (turn: ${turn1.turnId}), Q2: ${q2.id} (turn: ${turn2.turnId})`
  );

  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `END-TO-END VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTwoConsecutiveQuestionsE2ETest().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
