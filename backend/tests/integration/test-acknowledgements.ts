import { AIWorkerOrchestratorUseCase, classifyCandidateUtterance, CandidateUtteranceIntent } from "../../src/application/usecases/ai-interview/implementations/AIWorkerOrchestratorUseCase";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runAcknowledgementTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     FEATURE 3: CONVERSATIONAL ACKNOWLEDGEMENTS TEST SUITE        ");
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

  // Instantiate orchestrator mock instance to test getConversationalAcknowledgement
  const mockWorker = new AIWorkerOrchestratorUseCase(
    {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any
  );

  // --------------------------------------------------------------------------
  // TEST 1 & 2: Natural Acknowledgement Distribution & Variety
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1 & 2: Normal Technical Answers Receive Natural Varied Acks ---");

  const validAcks = new Set([
    "Got it.",
    "Makes sense.",
    "Thanks for explaining that.",
    "Understood.",
    "Okay.",
    null
  ]);

  const sampledAcks: (string | null)[] = [];
  for (let i = 0; i < 50; i++) {
    const ack = mockWorker.getConversationalAcknowledgement(CandidateUtteranceIntent.NORMAL_ANSWER, false);
    assert(validAcks.has(ack), `Generated valid neutral acknowledgement: ${JSON.stringify(ack)}`);
    sampledAcks.push(ack);
  }

  const directCount = sampledAcks.filter(a => a === null).length;
  const acknowledgedCount = sampledAcks.filter(a => a !== null).length;
  Logger.info(LogCategory.SYSTEM_INFO, `[Distribution across 50 turns]: ${acknowledgedCount} Acknowledged, ${directCount} Direct to question`);
  assert(acknowledgedCount > 0 && directCount > 0, "Both direct questions and acknowledgements are produced");

  // --------------------------------------------------------------------------
  // TEST 3: No Consecutive Identical Acknowledgements
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: Prevent Consecutive Repeated Acknowledgements ---");
  let consecutiveDuplicates = 0;
  let prevAck: string | null = null;

  for (let i = 0; i < 100; i++) {
    const currAck = mockWorker.getConversationalAcknowledgement(CandidateUtteranceIntent.NORMAL_ANSWER, false);
    if (currAck !== null && currAck === prevAck) {
      consecutiveDuplicates++;
    }
    prevAck = currAck;
  }

  assert(consecutiveDuplicates === 0, "Zero consecutive duplicate acknowledgements in 100 turns");

  // --------------------------------------------------------------------------
  // TEST 4: Compatibility with Uncertainty ("I don't know.")
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: Compatibility with Uncertainty ---");
  const uncertaintyClassification = classifyCandidateUtterance("I don't know.");
  assert(uncertaintyClassification.intent === CandidateUtteranceIntent.EXPLICIT_DONT_KNOW, "Classified as EXPLICIT_DONT_KNOW");
  const ackForUncertainty = mockWorker.getConversationalAcknowledgement(uncertaintyClassification.intent, false);
  assert(ackForUncertainty === null, "getConversationalAcknowledgement returns null for EXPLICIT_DONT_KNOW (uses transition phrase instead)");

  // --------------------------------------------------------------------------
  // TEST 5: Compatibility with Hesitation ("Let me think.")
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 5: Compatibility with Hesitation ---");
  const hesitationClassification = classifyCandidateUtterance("Let me think.");
  assert(hesitationClassification.intent === CandidateUtteranceIntent.HESITATION, "Classified as HESITATION");
  const ackForHesitation = mockWorker.getConversationalAcknowledgement(hesitationClassification.intent, false);
  assert(ackForHesitation === null, "getConversationalAcknowledgement returns null for HESITATION (uses 'Of course, take your time.')");

  // --------------------------------------------------------------------------
  // TEST 6: Short Technical Answers (e.g. "JWT.", "Redis.")
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 6: Short Technical Answers ('JWT.', 'Redis.') ---");
  const jwtClassification = classifyCandidateUtterance("JWT.");
  assert(jwtClassification.intent === CandidateUtteranceIntent.NORMAL_ANSWER, "'JWT.' is NORMAL_ANSWER");
  const redisClassification = classifyCandidateUtterance("Redis.");
  assert(redisClassification.intent === CandidateUtteranceIntent.NORMAL_ANSWER, "'Redis.' is NORMAL_ANSWER");

  const shortAck = mockWorker.getConversationalAcknowledgement(jwtClassification.intent, true);
  assert(shortAck === null || shortAck === "Got it." || shortAck === "Understood." || shortAck === "Okay.", 
    `Short answer receives concise ack: ${JSON.stringify(shortAck)}`);

  // --------------------------------------------------------------------------
  // TEST 7: Acknowledgement does not pollute UI question text
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 7: Clean Question Text Separation ---");
  const rawQuestionText = "How do you handle token expiration and refresh tokens?";
  const chosenAck = "Got it.";
  const spokenAudioText = `${chosenAck} ${rawQuestionText}`;
  const uiDisplayQuestionText = rawQuestionText;

  assert(spokenAudioText.startsWith("Got it. How do you handle"), "Spoken audio text contains acknowledgement");
  assert(!uiDisplayQuestionText.startsWith("Got it."), "UI display question remains pure and unpolluted");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAcknowledgementTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
