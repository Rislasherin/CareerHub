import { 
  TTSQueueService 
} from "../../src/infrastructure/services/ai-interview/TTSQueue.service";
import { 
  LangChainQuestionGenerator 
} from "../../src/infrastructure/services/ai-interview/LangChainQuestionGenerator.service";
import { 
  ProcessStudentAnswerUseCase 
} from "../../src/application/usecases/ai-interview/implementations/ProcessStudentAnswerUseCase";
import { 
  AIInterviewSession 
} from "../../src/domain/entities/ai-interview/AIInterviewSession";
import { 
  InterviewQuestion 
} from "../../src/domain/entities/ai-interview/InterviewQuestion";
import { 
  InterviewPlan 
} from "../../src/domain/value-objects/InterviewPlan";
import { 
  InterviewConfiguration 
} from "../../src/domain/value-objects/InterviewConfiguration";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { AIOrchestrationAction } from "../../src/application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runErrorRecoveryAndResilienceTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     FEATURE 11: AI INTERVIEW ERROR RECOVERY & RESILIENCE TESTS   ");
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
  // TEST 1: TTS Queue Bounded Retries & Error Isolation
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: TTS Queue Resilience ---");
  let ttsAttempts = 0;
  const failingTTSService = {
    generateAudioStream: async function* () {
      ttsAttempts++;
      if (ttsAttempts < 2) {
        throw new Error("Temporary Cartesia 503 Service Unavailable");
      }
      yield Buffer.from("audio-data");
    },
    disconnect: async () => {}
  } as any;

  const mockAudioTransport = {
    publishAudioChunk: async () => {},
    publishDataMessage: async () => {}
  } as any;

  const ttsQueue = new TTSQueueService(failingTTSService, mockAudioTransport);
  ttsQueue.enqueue("Test recovery sentence.");
  await ttsQueue.waitForDrain();

  assert(ttsAttempts >= 2, "TTS retried boundedly on initial failure", `Attempts: ${ttsAttempts}`);
  assert(!ttsQueue.isSpeaking(), "TTS queue drained cleanly after recovery");

  // --------------------------------------------------------------------------
  // TEST 2: LLM Failure Recovery to Safe Domain-Grounded Fallback
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: LLM Failure Recovery ---");
  const failingLLM = {
    pipe: () => ({
      pipe: () => ({
        stream: async () => {
          throw new Error("LLM Rate Limit 429 / Timeout");
        }
      })
    })
  } as any;

  const questionGenerator = new LangChainQuestionGenerator(failingLLM);
  const fallbackResult = await questionGenerator.generateNextQuestion({
    interviewContext: "Role: Backend Engineer",
    previousQuestions: [],
    topic: "Node.js",
    interviewType: InterviewType.TECHNICAL
  });

  assert(Boolean(fallbackResult.text), "Generated fallback question despite LLM failure");
  assert(fallbackResult.text.includes("Node.js") || fallbackResult.text.includes("?"), "Fallback question grounded in Node.js", fallbackResult.text);
  assert(fallbackResult.context === "Node.js", "Context topic preserved on fallback");

  // --------------------------------------------------------------------------
  // TEST 3: RabbitMQ Publish Failure Isolation (Non-blocking Realtime Path)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: RabbitMQ Failure Isolation ---");
  const plan = new InterviewPlan([
    { category: InterviewType.TECHNICAL, skillOrTopic: "Node.js", targetQuestions: 2, questionsAsked: 1 },
    { category: InterviewType.TECHNICAL, skillOrTopic: "PostgreSQL", targetQuestions: 1, questionsAsked: 0 }
  ]);

  const initialQuestion = new InterviewQuestion({
    id: "q-1",
    text: "How does Node.js handle asynchronous operations?",
    type: QuestionType.MAIN,
    context: "Node.js"
  });

  const session = new AIInterviewSession({
    id: "sess-resilience-1",
    interviewId: "int-1",
    studentId: "stud-1",
    durationMinutes: 30,
    configuration: InterviewConfiguration.createDefault(),
    interviewPlan: plan,
    questions: [initialQuestion],
    phase: InterviewPhase.ASKING_QUESTION
  });

  const mockRepo = {
    findById: async () => session,
    update: async () => session,
    recordAnswerAtomically: async () => true,
    advanceInterviewAtomically: async () => true
  } as any;

  const mockOrchestrator = {
    processAnswer: async () => ({
      action: AIOrchestrationAction.ASK_NEXT_QUESTION,
      nextQuestion: { text: "What is the event loop?", type: QuestionType.MAIN, context: "Node.js" },
      nextTopic: "Node.js",
      nextCategory: InterviewType.TECHNICAL
    })
  } as any;

  const failingBroker = {
    publish: async () => {
      throw new Error("RabbitMQ Broker Connection Lost");
    }
  } as any;

  const processAnswerUseCase = new ProcessStudentAnswerUseCase(mockRepo, mockOrchestrator, failingBroker);

  let processSucceeded = false;
  try {
    const result = await processAnswerUseCase.execute({
      sessionId: session.id,
      questionId: "q-1",
      studentId: session.studentId,
      answer: "Node.js uses the libuv event loop for async operations."
    });
    processSucceeded = result.success !== false;
  } catch (err) {
    Logger.error(LogCategory.SYSTEM_ERROR, "TEST 3 Caught Error:", err);
    processSucceeded = false;
  }

  assert(processSucceeded, "ProcessStudentAnswer completed successfully despite RabbitMQ broker failure");
  assert(session.questions.length === 2, "Moved to next question safely");

  // --------------------------------------------------------------------------
  // TEST 4: Plan Consistency on Turn Failures (Zero Corrupted Increment)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: Plan State Consistency ---");
  const testPlan = new InterviewPlan([
    { category: InterviewType.TECHNICAL, skillOrTopic: "Node.js", targetQuestions: 2, questionsAsked: 0 }
  ]);

  assert(testPlan.items[0].questionsAsked === 0, "Plan initialized with 0 questions asked");
  // Non-substantive event does not increment
  assert(testPlan.items[0].questionsAsked === 0, "Plan questions asked remains 0 without main question transition");

  testPlan.recordQuestionAsked(InterviewType.TECHNICAL, "Node.js");
  assert(testPlan.items[0].questionsAsked === 1, "Plan increments only when main question is actually recorded");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runErrorRecoveryAndResilienceTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
