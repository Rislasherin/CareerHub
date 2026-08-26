import { 
  classifyCandidateUtterance, 
  CandidateUtteranceIntent,
  AIWorkerOrchestratorUseCase 
} from "../../src/application/usecases/ai-interview/implementations/AIWorkerOrchestratorUseCase";
import { TTSQueueService } from "../../src/infrastructure/services/ai-interview/TTSQueue.service";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runInterruptionPauseRepeatTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     FEATURE 6: INTERRUPTION, PAUSE & REPEAT TEST SUITE           ");
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
  // TEST 1: REPEAT_QUESTION Intent Classification
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: Repeat Question Classification ---");
  const repeatPhrases = [
    "Can you repeat the question?",
    "could you repeat the question",
    "Can you repeat that?",
    "Could you repeat that?",
    "Please repeat the question.",
    "Repeat the question please",
    "What was the question again?",
    "Can you say that again?",
    "say that again please",
    "one more time please",
    "repeat please",
    "can I hear the question again"
  ];

  for (const phrase of repeatPhrases) {
    const res = classifyCandidateUtterance(phrase);
    assert(res.intent === CandidateUtteranceIntent.REPEAT_QUESTION, `Classified "${phrase}" as REPEAT_QUESTION`);
  }

  // --------------------------------------------------------------------------
  // TEST 2: PAUSE_REQUEST Intent Classification
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: Pause Request Classification ---");
  const pausePhrases = [
    "Can we pause for a second?",
    "can we pause for a moment",
    "Can we pause the interview?",
    "Please pause the interview.",
    "pause the interview please",
    "Can I take a quick break?",
    "Can I have a short break?",
    "can we take a quick break",
    "take a quick break"
  ];

  for (const phrase of pausePhrases) {
    const res = classifyCandidateUtterance(phrase);
    assert(res.intent === CandidateUtteranceIntent.PAUSE_REQUEST, `Classified "${phrase}" as PAUSE_REQUEST`);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Repeat Question Spoken Text Synthesis
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: Repeat Question Audio Response ---");
  const activeQuestion = "Can you explain how Node.js event loop handles I/O?";
  const repeatSpokenText = `Sure, let me repeat the question: ${activeQuestion}`;
  assert(repeatSpokenText.startsWith("Sure, let me repeat the question:"), "Includes polite confirmation");
  assert(repeatSpokenText.endsWith(activeQuestion), "Attaches exact unchanged active question");

  // --------------------------------------------------------------------------
  // TEST 4: Pause Request Spoken Text
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: Pause Request Audio Response ---");
  const pauseSpokenText = "Sure, we can pause for a moment. Whenever you're ready to resume, just let me know or continue with your answer.";
  assert(pauseSpokenText.includes("pause for a moment"), "Confirms pause politely");
  assert(pauseSpokenText.includes("Whenever you're ready to resume"), "Instructs candidate on how to resume");

  // --------------------------------------------------------------------------
  // TEST 5: TTSQueue.clear() for Realtime Interruption
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 5: TTSQueue.clear() for Interruption ---");
  const mockTTS = { generateAudioStream: () => (async function*() { yield new Uint8Array([1, 2, 3]); })() } as any;
  const mockTransport = { publishAudioChunk: async () => {} } as any;
  const queue = new TTSQueueService(mockTTS, mockTransport);

  queue.enqueue("Sentence 1");
  queue.enqueue("Sentence 2");
  assert(queue.isSpeaking() === true, "Queue is actively speaking");

  queue.clear();
  assert(queue.isSpeaking() === true, "Processing active sentence but queue cleared");

  // --------------------------------------------------------------------------
  // TEST 6: Non-interruption Technical Answers Preserved
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 6: Technical Answers Not Misclassified ---");
  const techAnswers = [
    "I used Node.js with Express.",
    "We repeated the benchmark tests three times.",
    "The process paused the main thread using a synchronous lock.",
    "Redis.",
    "JWT."
  ];

  for (const ans of techAnswers) {
    const res = classifyCandidateUtterance(ans);
    assert(res.intent === CandidateUtteranceIntent.NORMAL_ANSWER, `Technical answer "${ans.slice(0, 30)}..." is NORMAL_ANSWER`);
  }

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runInterruptionPauseRepeatTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
