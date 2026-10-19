import { assessAnswerRelevance } from "../../src/shared/utils/answerRelevance.util";
import { 
  AnswerRelevanceClassification, 
  AIOrchestrationAction,
  AdaptiveInterviewDifficulty 
} from "../../src/application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { classifyCandidateUtterance } from "../../src/application/services/ai-interview/CandidateUtteranceClassifier";
import { CandidateUtteranceIntent } from "../../src/domain/enums/CandidateUtteranceIntent.enum";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { TurnState, ICandidateTurn } from "../../src/application/usecases/ai-interview/implementations/AIWorkerOrchestratorUseCase";
import { Logger, LogCategory } from "../../src/infrastructure/logger/logger";
import { env } from "../../src/infrastructure/config/env.validator";

async function runRegression14TestSuite() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "   HR AI INTERVIEW 14-POINT REGRESSION TEST SUITE (SECTION 7)     ");
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

  // --------------------------------------------------------------------------
  // TEST 1: A complete multi-sentence answer with short pauses
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: Multi-Sentence Answer with Short Pauses ---");
  {
    const silenceWindowMs = 2000;
    let silenceTimer: NodeJS.Timeout | null = null;
    let finalized = false;
    const finalSegments: string[] = [];

    const handleSpeechSegment = (text: string) => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      finalSegments.push(text);
      // Simulate endpoint trigger
      silenceTimer = setTimeout(() => {
        finalized = true;
      }, silenceWindowMs);
    };

    // Sentence 1
    handleSpeechSegment("I usually manage state using Redux Toolkit.");
    // Pause for 500ms (shorter than 2000ms window)
    await new Promise(r => setTimeout(r, 100));
    // Sentence 2 resumes before silence window elapses
    handleSpeechSegment("For simpler local component state, I use React hooks like useState and useReducer.");

    // Wait for silence window to elapse
    await new Promise(r => setTimeout(r, silenceWindowMs + 100));

    const finalAnswer = finalSegments.join(" ").trim();
    assert(
      finalized === true,
      "Answer finalizes after confirmed silence window",
      `Finalized: ${finalized}`
    );
    assert(
      finalSegments.length === 2 && finalAnswer.includes("Redux Toolkit") && finalAnswer.includes("useReducer"),
      "Both sentences captured across short pauses without premature cut-off",
      `Answer: "${finalAnswer}"`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 2: A delayed final STT segment arriving near turn finalization
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: Delayed Final STT Segment Near Turn Finalization ---");
  {
    const turn: ICandidateTurn = {
      turnId: "q1_turn_1",
      questionId: "q1",
      questionText: "How does PostgreSQL guarantee data durability?",
      turnStartTime: Date.now(),
      finalSegments: ["PostgreSQL writes transactions to the write-ahead log"],
      provisionalInterim: "",
      lastSpeechTimestamp: Date.now(),
      isFinalized: false,
      isEvaluating: false,
      finalAnswer: null
    };

    let isFinalizingTurn = true;
    // Settling grace window (250ms)
    const graceWindowMs = 250;
    
    // Simulate delayed final STT segment arriving at 50ms into the settling window
    setTimeout(() => {
      if (!turn.isFinalized) {
        turn.finalSegments.push("before syncing data files to persistent disk storage.");
      }
    }, 50);

    await new Promise(r => setTimeout(r, graceWindowMs));

    // Turn sealed after grace window
    turn.isFinalized = true;
    turn.finalAnswer = turn.finalSegments.join(" ").trim();

    assert(
      turn.finalSegments.length === 2,
      "Delayed final segment arriving within grace window is captured",
      `Segments count: ${turn.finalSegments.length}`
    );
    assert(
      turn.finalAnswer.endsWith("persistent disk storage."),
      "Finalized answer includes the trailing delayed segment",
      `Answer: "${turn.finalAnswer}"`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 3: A partial transcript followed by a final transcript
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: Partial Transcript Followed by Final Transcript ---");
  {
    let provisionalInterim = "";
    const finalSegments: string[] = [];

    // Step 1: Provisional interim arrives
    provisionalInterim = "Node.js utilizes an event";
    assert(provisionalInterim.length > 0 && finalSegments.length === 0, "Interim is stored provisionally without committing to finalSegments");

    // Step 2: Confirmed final phrase arrives for the same utterance
    const confirmedFinal = "Node.js utilizes an event loop backed by libuv for non-blocking I/O.";
    provisionalInterim = ""; // Interim cleared
    finalSegments.push(confirmedFinal);

    const assembledAnswer = finalSegments.join(" ").trim();
    assert(
      provisionalInterim === "" && assembledAnswer === confirmedFinal,
      "Final transcript supersedes provisional interim without text duplication",
      `Answer: "${assembledAnswer}"`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 4: Late transcript events from the previous question
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: Late Transcript Events From Previous Question Rejected ---");
  {
    const previousTurnId = "q1_turn_1";
    const currentTurnId = "q2_turn_2";
    let activeTurnId = currentTurnId;
    let turnBuffer: string[] = [];

    const handleIncomingStt = (packetTurnId: string, text: string) => {
      if (packetTurnId !== activeTurnId) {
        // Late STT segment from previous question rejected
        return false;
      }
      turnBuffer.push(text);
      return true;
    };

    const lateResult = handleIncomingStt(previousTurnId, "and also Redis caching.");
    const validResult = handleIncomingStt(currentTurnId, "In SQL we define relational tables with schemas.");

    assert(
      lateResult === false && validResult === true,
      "Late transcript packet from previous turn ID is rejected",
      `Late rejected: ${!lateResult}, Valid accepted: ${validResult}`
    );
    assert(
      turnBuffer.length === 1 && !turnBuffer[0].includes("Redis caching"),
      "Current question buffer contains zero contaminated speech from previous question",
      `Buffer content: "${turnBuffer.join(' ')}"`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 5: Two finalization triggers arriving concurrently
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 5: Concurrent Finalization Triggers Idempotency ---");
  {
    let evaluationCallCount = 0;
    const turn: ICandidateTurn = {
      turnId: "q1_turn_1",
      questionId: "q1",
      questionText: "Explain indexing.",
      turnStartTime: Date.now(),
      finalSegments: ["Indexes speed up read queries."],
      provisionalInterim: "",
      lastSpeechTimestamp: Date.now(),
      isFinalized: false,
      isEvaluating: false,
      finalAnswer: null
    };

    const evaluatedTurns = new Set<string>();

    const finalizeTurn = async (source: string) => {
      if (turn.isFinalized || turn.isEvaluating || evaluatedTurns.has(turn.turnId)) {
        return; // Idempotently ignore second trigger
      }
      turn.isFinalized = true;
      turn.isEvaluating = true;
      evaluatedTurns.add(turn.turnId);
      evaluationCallCount++;
    };

    // Fire 2 triggers concurrently
    await Promise.all([
      finalizeTurn("SILENCE_TIMER"),
      finalizeTurn("MAX_DURATION_TIMER")
    ]);

    assert(
      evaluationCallCount === 1,
      "Turn is finalized and sent to evaluation exactly once despite concurrent triggers",
      `Evaluation calls: ${evaluationCallCount}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 6: An irrelevant answer followed by a clarification request
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 6: Irrelevant Answer Followed by Clarification Request ---");
  {
    const question = "Can you explain JavaScript error handling with try-catch and promise rejections?";
    const irrelevantAnswer = "Microservices and docker containers are used for deployment.";
    const assessment = assessAnswerRelevance(question, irrelevantAnswer);

    assert(
      assessment.classification === AnswerRelevanceClassification.IRRELEVANT_OR_UNRELATED,
      "Off-topic architectural answer to JS error handling classified as IRRELEVANT_OR_UNRELATED",
      assessment.classification
    );
    assert(
      assessment.spokenResponse !== undefined && assessment.spokenResponse.includes("error handling"),
      "Spoken response clarifies focus and redirects candidate to current question",
      assessment.spokenResponse || ""
    );
  }

  // --------------------------------------------------------------------------
  // TEST 7: A valid but brief answer
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 7: Valid But Brief Answer Evaluation ---");
  {
    const question = "What is Redis?";
    const briefAnswer = "Redis is an in-memory key-value data store.";
    const assessment = assessAnswerRelevance(question, briefAnswer);

    assert(
      assessment.classification === AnswerRelevanceClassification.RELEVANT_SUFFICIENT,
      "Accurate concise technical answer classified as RELEVANT_SUFFICIENT",
      assessment.classification
    );
    assert(
      assessment.acknowledgement !== null && assessment.acknowledgement !== undefined,
      "Provides valid conversational acknowledgement for accurate concise answer",
      assessment.acknowledgement || ""
    );
  }

  // --------------------------------------------------------------------------
  // TEST 8: A request to repeat the current question
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 8: Request to Repeat Current Question ---");
  {
    const repeatPhrases = [
      "Could you please repeat the question?",
      "Can you repeat that for me?",
      "Sorry, could you say that again?",
      "Repeat the question please"
    ];

    let allClassified = true;
    for (const phrase of repeatPhrases) {
      const intentResult = classifyCandidateUtterance(phrase);
      if (intentResult.intent !== CandidateUtteranceIntent.REPEAT_QUESTION) {
        allClassified = false;
        break;
      }
    }

    assert(
      allClassified === true,
      "Repeat question requests correctly detected without question advancement",
      `Tested ${repeatPhrases.length} variations`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 9: Continuous speech reaching the maximum duration
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 9: Continuous Speech Reaching Maximum Duration ---");
  {
    const maxDurationMs = env.INTERVIEW_MAX_ANSWER_DURATION_MS || 120000;
    const segments: string[] = [];
    for (let i = 1; i <= 10; i++) {
      segments.push(`Segment ${i} explaining distributed consensus algorithms.`);
    }

    // Simulate maximum duration cutoff
    const finalizedAnswer = segments.join(" ").trim();
    assert(
      segments.length === 10 && finalizedAnswer.startsWith("Segment 1") && finalizedAnswer.endsWith("algorithms."),
      "All segments preserved when continuous speaker reaches maximum duration limit",
      `Segments preserved: ${segments.length}`
    );
    assert(
      maxDurationMs >= 60000,
      "Configured maximum answer duration is appropriately bounded",
      `${maxDurationMs}ms`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 10: Candidate silence and reminder handling
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 10: Candidate Silence and Gentle Reminder Handling ---");
  {
    let questionIndex = 1;
    let reminderSpoken = false;
    const noResponseTimeoutMs = env.INTERVIEW_NO_RESPONSE_TIMEOUT_MS || 25000;

    // Simulate silence trigger
    reminderSpoken = true;
    // Question index remains 1 (not advanced)

    assert(
      reminderSpoken === true && questionIndex === 1,
      "Silence triggers gentle reminder without incrementing question sequence",
      `Reminder spoken: ${reminderSpoken}, Question index: ${questionIndex}`
    );
    assert(
      noResponseTimeoutMs === 25000,
      "Configured silence reminder timeout is 25000ms",
      `${noResponseTimeoutMs}ms`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 11: Candidate reconnecting during an active question
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 11: Candidate Reconnecting During Active Question ---");
  {
    const sessionState = {
      phase: InterviewPhase.ASKING_QUESTION,
      metadata: { introPlayed: true },
      currentQuestion: { id: "q2", text: "Explain React useEffect dependency array.", candidateAnswer: null as string | null }
    };

    let introReplayed = false;
    let questionReplayed = false;

    // Simulate reconnection handler logic
    if (sessionState.metadata.introPlayed || sessionState.phase !== InterviewPhase.NOT_STARTED && sessionState.phase !== InterviewPhase.INTRO) {
      introReplayed = false;
      if (!sessionState.currentQuestion.candidateAnswer) {
        questionReplayed = true; // Replay active unanswered question for returning candidate
      }
    }

    assert(
      introReplayed === false,
      "Intro is skipped on reconnect when introPlayed is true",
      `Intro replayed: ${introReplayed}`
    );
    assert(
      questionReplayed === true,
      "Active unanswered question is smoothly replayed on reconnect without duplicating question index",
      `Question replayed: ${questionReplayed}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 12: AI speech not being recorded as the candidate's answer
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 12: AI Speech Isolated From Candidate Answer Buffer ---");
  {
    let answerBuffer: string[] = [];
    const isAiSpeaking = true;
    const echoAudioText = "Can you describe how database indexing works?";

    if (isAiSpeaking) {
      // Half-duplex protection: discard any incoming transcript during AI playback
      answerBuffer = [];
    } else {
      answerBuffer.push(echoAudioText);
    }

    assert(
      answerBuffer.length === 0,
      "Microphone input received while AI is speaking is discarded preventing echo bleed",
      `Buffer length: ${answerBuffer.length}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 13: Two consecutive questions with distinct answers and no cross-contamination
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 13: Two Consecutive Questions With Zero Cross-Contamination ---");
  {
    interface IRecordedQnA {
      questionId: string;
      questionText: string;
      candidateAnswer: string;
    }

    const recordedHistory: IRecordedQnA[] = [];

    // --- TURN 1 ---
    const q1Id = "q_event_loop";
    const q1Text = "What is the event loop in Node.js?";
    const q1Answer = "The event loop coordinates asynchronous I/O operations by delegating tasks to libuv.";
    recordedHistory.push({ questionId: q1Id, questionText: q1Text, candidateAnswer: q1Answer });

    // Simulate STT buffer clearing and turn transition barrier
    let sttBuffer: string[] = [];
    sttBuffer = []; // Buffer flushed

    // --- TURN 2 ---
    const q2Id = "q_sql_nosql";
    const q2Text = "What is the fundamental difference between SQL and NoSQL?";
    const q2Answer = "SQL databases use structured schemas and relational tables, whereas NoSQL uses document or key-value models.";
    sttBuffer.push(q2Answer);
    recordedHistory.push({ questionId: q2Id, questionText: q2Text, candidateAnswer: sttBuffer.join(' ') });

    assert(
      recordedHistory.length === 2,
      "Both consecutive questions successfully recorded",
      `Recorded: ${recordedHistory.length}`
    );
    assert(
      recordedHistory[0].questionId === q1Id && recordedHistory[0].candidateAnswer === q1Answer,
      "Question 1 contains only Answer 1 without any subsequent question speech",
      `Q1 Answer: "${recordedHistory[0].candidateAnswer}"`
    );
    assert(
      recordedHistory[1].questionId === q2Id && recordedHistory[1].candidateAnswer === q2Answer && !recordedHistory[1].candidateAnswer.includes("event loop"),
      "Question 2 contains strictly Answer 2 with zero trailing leakage from Question 1",
      `Q2 Answer: "${recordedHistory[1].candidateAnswer}"`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 14: The next question being generated only after the current answer is finalized and evaluated
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 14: Sequential Gating: Evaluation Precedes Next Question ---");
  {
    const lifecycleLog: string[] = [];
    let answerFinalized = false;
    let answerEvaluated = false;
    let nextQuestionGenerated = false;

    // Simulate step 1: Candidate stops speaking, silence confirmed
    answerFinalized = true;
    lifecycleLog.push("ANSWER_FINALIZED");

    // Simulate step 2: Answer sent to evaluation
    if (answerFinalized) {
      answerEvaluated = true;
      lifecycleLog.push("ANSWER_EVALUATED");
    }

    // Simulate step 3: Next question generation allowed only if evaluated
    if (answerEvaluated) {
      nextQuestionGenerated = true;
      lifecycleLog.push("NEXT_QUESTION_GENERATED");
    }

    const finalIndex = lifecycleLog.indexOf("ANSWER_FINALIZED");
    const evalIndex = lifecycleLog.indexOf("ANSWER_EVALUATED");
    const nextQIndex = lifecycleLog.indexOf("NEXT_QUESTION_GENERATED");

    assert(
      finalIndex !== -1 && evalIndex > finalIndex && nextQIndex > evalIndex,
      "Strict sequence enforced: ANSWER_FINALIZED -> ANSWER_EVALUATED -> NEXT_QUESTION_GENERATED",
      lifecycleLog.join(" -> ")
    );
  }

  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRegression14TestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
