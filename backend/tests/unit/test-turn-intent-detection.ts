import { classifyTurnIntent, CandidateTurnIntent } from "../../src/shared/utils/turnIntent.util";

function runTurnIntentTests() {
  console.log("==================================================================");
  console.log("   CANDIDATE TURN INTENT & THINKING PAUSE UNIT TESTS              ");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  function assertEqual(actual: unknown, expected: unknown, name: string) {
    if (actual === expected) {
      console.log(`[PASS] ${name} -> Got: ${actual}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} -> Expected: ${expected}, but Got: ${actual}`);
      failed++;
    }
  }

  console.log("\n--- TEST 1: Thinking / Hesitation Intent ---");
  assertEqual(classifyTurnIntent("let me think"), CandidateTurnIntent.THINKING, "let me think");
  assertEqual(classifyTurnIntent("let me think about that"), CandidateTurnIntent.THINKING, "let me think about that");
  assertEqual(classifyTurnIntent("give me a second"), CandidateTurnIntent.THINKING, "give me a second");
  assertEqual(classifyTurnIntent("give me a moment"), CandidateTurnIntent.THINKING, "give me a moment");
  assertEqual(classifyTurnIntent("one second"), CandidateTurnIntent.THINKING, "one second");
  assertEqual(classifyTurnIntent("one moment"), CandidateTurnIntent.THINKING, "one moment");
  assertEqual(classifyTurnIntent("just a second"), CandidateTurnIntent.THINKING, "just a second");
  assertEqual(classifyTurnIntent("can I have a second"), CandidateTurnIntent.THINKING, "can I have a second");
  assertEqual(classifyTurnIntent("let's see"), CandidateTurnIntent.THINKING, "let's see");
  assertEqual(classifyTurnIntent("hmm let me think"), CandidateTurnIntent.THINKING, "hmm let me think");

  console.log("\n--- TEST 2: Explicit Uncertainty / Don't Know ---");
  assertEqual(classifyTurnIntent("I don't know"), CandidateTurnIntent.EXPLICIT_UNKNOWN, "I don't know");
  assertEqual(classifyTurnIntent("I don't know the answer"), CandidateTurnIntent.EXPLICIT_UNKNOWN, "I don't know the answer");
  assertEqual(classifyTurnIntent("I am not sure"), CandidateTurnIntent.EXPLICIT_UNKNOWN, "I am not sure");
  assertEqual(classifyTurnIntent("I'm not sure about that"), CandidateTurnIntent.EXPLICIT_UNKNOWN, "I'm not sure about that");
  assertEqual(classifyTurnIntent("no idea"), CandidateTurnIntent.EXPLICIT_UNKNOWN, "no idea");
  assertEqual(classifyTurnIntent("I have no idea"), CandidateTurnIntent.EXPLICIT_UNKNOWN, "I have no idea");
  assertEqual(classifyTurnIntent("pass"), CandidateTurnIntent.EXPLICIT_UNKNOWN, "pass");
  assertEqual(classifyTurnIntent("can we skip this"), CandidateTurnIntent.EXPLICIT_UNKNOWN, "can we skip this");

  console.log("\n--- TEST 3: Incomplete Starter Phrases ---");
  assertEqual(classifyTurnIntent("and"), CandidateTurnIntent.POSSIBLE_INCOMPLETE, "and");
  assertEqual(classifyTurnIntent("because"), CandidateTurnIntent.POSSIBLE_INCOMPLETE, "because");
  assertEqual(classifyTurnIntent("so"), CandidateTurnIntent.POSSIBLE_INCOMPLETE, "so");
  assertEqual(classifyTurnIntent("like"), CandidateTurnIntent.POSSIBLE_INCOMPLETE, "like");

  console.log("\n--- TEST 4: Normal Substantive Answers ---");
  assertEqual(
    classifyTurnIntent("In Node.js, the event loop handles non-blocking I/O operations using libuv."),
    CandidateTurnIntent.NORMAL_ANSWER,
    "Full technical answer"
  );
  assertEqual(
    classifyTurnIntent("I used Redis for caching session tokens and reducing database latency."),
    CandidateTurnIntent.NORMAL_ANSWER,
    "Past experience answer"
  );
  assertEqual(
    classifyTurnIntent("Microservices communicate via REST APIs and RabbitMQ message queues."),
    CandidateTurnIntent.NORMAL_ANSWER,
    "Architecture answer"
  );

  console.log("\n==================================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTurnIntentTests();
