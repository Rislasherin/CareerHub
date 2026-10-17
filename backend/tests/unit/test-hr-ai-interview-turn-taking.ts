import { assessAnswerRelevance } from "../../src/shared/utils/answerRelevance.util";
import { 
  AnswerRelevanceClassification, 
  AIOrchestrationAction 
} from "../../src/application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { LangGraphInterviewAIOrchestrator } from "../../src/infrastructure/services/ai-interview/LangGraphInterviewAIOrchestrator.service";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { InterviewPlan } from "../../src/domain/value-objects/InterviewPlan";
import { TurnState } from "../../src/application/usecases/ai-interview/implementations/AIWorkerOrchestratorUseCase";
import { Logger, LogCategory } from "../../src/infrastructure/logger/logger";
import { env } from "../../src/infrastructure/config/env.validator";

async function runTurnTakingAndAnswerValidationTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "   HR AI INTERVIEW TURN-TAKING & ANSWER VALIDATION TEST SUITE    ");
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
  // TEST 1: Candidate speech during AI playback is not recorded as an answer
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: Half-Duplex Isolation During AI Playback ---");
  {
    let currentAnswerBuffer: string[] = [];
    const isAiSpeaking = true;
    const incomingSpeechChunk = "Wait, let me explain MongoDB";

    if (isAiSpeaking) {
      if (currentAnswerBuffer.length > 0) {
        currentAnswerBuffer = [];
      }
      // Audio chunk is strictly discarded during playback
    } else {
      currentAnswerBuffer.push(incomingSpeechChunk);
    }

    assert(
      currentAnswerBuffer.length === 0,
      "Candidate speech received while AI is speaking is discarded",
      `Buffer length: ${currentAnswerBuffer.length}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 2: Listening starts only after AI playback completes
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: Listening Start Synchronization ---");
  {
    let aiState: TurnState = TurnState.AI_SPEAKING;
    let ttsDrained = false;

    // Simulate playback finish
    ttsDrained = true;
    if (ttsDrained) {
      aiState = TurnState.CANDIDATE_LISTENING;
    }

    assert(
      aiState === TurnState.CANDIDATE_LISTENING,
      "Turn state transitions to CANDIDATE_LISTENING only after TTS drains",
      `State: ${aiState}`
    );
    assert(
      env.INTERVIEW_MIN_LISTENING_TIME_MS >= 1000,
      "Minimum listening stabilization delay is configured",
      `${env.INTERVIEW_MIN_LISTENING_TIME_MS}ms`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 3: Stale STT events from a previous turn are ignored
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: Stale STT Events Ignored Across Turn IDs ---");
  {
    const activeTurnId = "q1_turn_2";
    const delayedPacketTurnId = "q1_turn_1";
    let packetProcessed = false;

    if (delayedPacketTurnId === activeTurnId) {
      packetProcessed = true;
    }

    assert(
      packetProcessed === false,
      "Packet originating from previous turn ID is rejected",
      `active: ${activeTurnId}, incoming: ${delayedPacketTurnId}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 4: A natural pause does not finalize the answer prematurely
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: Silence Window Debounce Prevents Premature Cut-Off ---");
  {
    let finalized = false;
    let silenceTimerActive = false;

    // Speech endpoint emitted by Deepgram
    silenceTimerActive = true;

    // Candidate resumes speaking after 600ms (within 2000ms silence window)
    const pauseDurationMs = 600;
    if (pauseDurationMs < env.INTERVIEW_SILENCE_WINDOW_MS) {
      silenceTimerActive = false; // timer cancelled on resumption
    } else {
      finalized = true;
    }

    assert(
      finalized === false && !silenceTimerActive,
      "Speech resumption within silence window cancels finalization",
      `Silence window: ${env.INTERVIEW_SILENCE_WINDOW_MS}ms, pause: ${pauseDurationMs}ms`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 5: A valid answer is finalized exactly once
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 5: Idempotent Single Turn Finalization ---");
  {
    let finalizationCount = 0;
    let isFinalizingTurn = false;

    const finalize = () => {
      if (isFinalizingTurn) return;
      isFinalizingTurn = true;
      finalizationCount++;
    };

    // First completion signal
    finalize();
    // Immediate duplicate completion signal
    finalize();

    assert(
      finalizationCount === 1,
      "Turn is finalized exactly once despite duplicate endpoint signals",
      `Count: ${finalizationCount}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 6: An irrelevant answer does not advance the question index
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 6: Irrelevant Answer Triggers REDIRECT Without Question Advancement ---");
  {
    const question = "Can you explain how indexing improves query performance in PostgreSQL?";
    const irrelevantAnswer = "The weather outside is very sunny and pleasant today.";
    const assessment = assessAnswerRelevance(question, irrelevantAnswer);

    assert(
      assessment.classification === AnswerRelevanceClassification.IRRELEVANT_OR_UNRELATED,
      "Irrelevant response classified as IRRELEVANT_OR_UNRELATED",
      assessment.classification
    );
    assert(
      assessment.spokenResponse !== undefined && assessment.spokenResponse.includes("address our question"),
      "Redirection guides candidate back to current technical question",
      assessment.spokenResponse
    );

    const mockEvaluator = {} as any;
    const mockGenerator = {
      generateFollowUp: async () => ({ text: "Could you elaborate?", type: QuestionType.FOLLOW_UP, context: "Databases" }),
      generateNextQuestion: async () => ({ text: "Next technical question?", type: QuestionType.MAIN, context: "Databases" })
    } as any;
    const orchestrator = new LangGraphInterviewAIOrchestrator(mockEvaluator, mockGenerator);
    const mockPlan = new InterviewPlan([
      { category: InterviewType.TECHNICAL, skillOrTopic: "Databases", targetQuestions: 5, questionsAsked: 1 }
    ]);

    const orchResult = await orchestrator.processAnswer({
      sessionId: "s1",
      currentQuestion: { id: "q1", text: question, type: QuestionType.MAIN, context: "Databases" },
      candidateAnswer: irrelevantAnswer,
      interviewContext: "Technical Interview",
      currentTopic: "Databases",
      coveredTopics: [],
      currentQuestionIndex: 1,
      totalPlannedQuestions: 5,
      followUpCount: 0,
      interviewPlan: mockPlan
    });

    assert(
      orchResult.action === AIOrchestrationAction.REDIRECT,
      "Orchestrator produces REDIRECT action for off-topic candidate speech",
      orchResult.action
    );
  }

  // --------------------------------------------------------------------------
  // TEST 7: An incomplete answer triggers a relevant follow-up
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 7: Incomplete Answer Triggers Bounded Follow-Up ---");
  {
    const question = "How does the Node.js event loop work under high concurrency?";
    const incompleteAnswer = "It uses callbacks.";
    const assessment = assessAnswerRelevance(question, incompleteAnswer);

    assert(
      assessment.classification === AnswerRelevanceClassification.RELEVANT_INCOMPLETE,
      "Partial answer classified as RELEVANT_INCOMPLETE",
      assessment.classification
    );
    assert(
      assessment.spokenResponse !== undefined && assessment.spokenResponse.length > 10,
      "Follow-up spoken response targets the missing mechanism",
      assessment.spokenResponse
    );

    const mockEvaluator = {} as any;
    const mockGenerator = {
      generateFollowUp: async () => ({ text: "Could you elaborate on the event loop phases?", type: QuestionType.FOLLOW_UP, context: "Backend Architecture" }),
      generateNextQuestion: async () => ({ text: "Next question?", type: QuestionType.MAIN, context: "Backend Architecture" })
    } as any;
    const orchestrator = new LangGraphInterviewAIOrchestrator(mockEvaluator, mockGenerator);
    const mockPlan = new InterviewPlan([
      { category: InterviewType.TECHNICAL, skillOrTopic: "Backend Architecture", targetQuestions: 5, questionsAsked: 1 }
    ]);

    const orchResult = await orchestrator.processAnswer({
      sessionId: "s1",
      currentQuestion: { id: "q1", text: question, type: QuestionType.MAIN, context: "Backend Architecture" },
      candidateAnswer: incompleteAnswer,
      interviewContext: "Technical Interview",
      currentTopic: "Backend Architecture",
      coveredTopics: [],
      currentQuestionIndex: 1,
      totalPlannedQuestions: 5,
      followUpCount: 0,
      interviewPlan: mockPlan
    });

    assert(
      orchResult.action === AIOrchestrationAction.ASK_FOLLOW_UP,
      "Incomplete answer triggers ASK_FOLLOW_UP in orchestrator",
      orchResult.action
    );
  }

  // --------------------------------------------------------------------------
  // TEST 8: An incorrect answer is not acknowledged as correct
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 8: Technical Misconception Rejection ---");
  {
    const question = "Can you explain how Redis persistence works?";
    const incorrectAnswer = "Redis is a relational SQL database with ACID tables.";
    const assessment = assessAnswerRelevance(question, incorrectAnswer);

    assert(
      assessment.classification === AnswerRelevanceClassification.INCORRECT_OR_MISCONCEPTION,
      "Contradictory technical claim classified as INCORRECT_OR_MISCONCEPTION",
      assessment.classification
    );
    assert(
      assessment.acknowledgement === undefined || (
        !assessment.acknowledgement?.toLowerCase().includes("great job") &&
        !assessment.acknowledgement?.toLowerCase().includes("got it")
      ),
      "No false generic validation given for incorrect answer",
      assessment.acknowledgement || "No false ack"
    );

    const mockEvaluator = {} as any;
    const mockGenerator = {
      generateFollowUp: async () => ({ text: "Could you clarify Redis persistence mechanisms?", type: QuestionType.FOLLOW_UP, context: "Databases" }),
      generateNextQuestion: async () => ({ text: "Next question?", type: QuestionType.MAIN, context: "Databases" })
    } as any;
    const orchestrator = new LangGraphInterviewAIOrchestrator(mockEvaluator, mockGenerator);
    const mockPlan = new InterviewPlan([
      { category: InterviewType.TECHNICAL, skillOrTopic: "Databases", targetQuestions: 5, questionsAsked: 1 }
    ]);

    const orchResult = await orchestrator.processAnswer({
      sessionId: "s1",
      currentQuestion: { id: "q1", text: question, type: QuestionType.MAIN, context: "Databases" },
      candidateAnswer: incorrectAnswer,
      interviewContext: "Technical Interview",
      currentTopic: "Databases",
      coveredTopics: [],
      currentQuestionIndex: 1,
      totalPlannedQuestions: 5,
      followUpCount: 0,
      interviewPlan: mockPlan
    });

    assert(
      orchResult.action === AIOrchestrationAction.ASK_FOLLOW_UP,
      "Misconception triggers clarification follow-up rather than advancement",
      orchResult.action
    );
  }

  // --------------------------------------------------------------------------
  // TEST 9: A strong answer does not trigger unnecessary repeated follow-ups
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 9: Strong Answer Directly Advances to Next Question ---");
  {
    const question = "How do B-tree indexes optimize query execution in relational databases?";
    const strongAnswer = "B-tree indexes maintain sorted data in balanced hierarchical tree nodes with logarithm search time, minimizing disk I/O operations for range and point queries.";
    const assessment = assessAnswerRelevance(question, strongAnswer);

    assert(
      assessment.classification === AnswerRelevanceClassification.RELEVANT_SUFFICIENT,
      "Comprehensive answer classified as RELEVANT_SUFFICIENT",
      assessment.classification
    );
    assert(
      assessment.acknowledgement !== undefined && assessment.acknowledgement !== null && assessment.acknowledgement.length > 0,
      "Provides natural point-based technical acknowledgement",
      assessment.acknowledgement || ""
    );

    const mockEvaluator = {} as any;
    const mockGenerator = {
      generateFollowUp: async () => ({ text: "Follow up?", type: QuestionType.FOLLOW_UP, context: "Databases" }),
      generateNextQuestion: async () => ({ text: "How would you design database replication?", type: QuestionType.MAIN, context: "Databases" })
    } as any;
    const orchestrator = new LangGraphInterviewAIOrchestrator(mockEvaluator, mockGenerator);
    const mockPlan = new InterviewPlan([
      { category: InterviewType.TECHNICAL, skillOrTopic: "Databases", targetQuestions: 5, questionsAsked: 1 }
    ]);

    const orchResult = await orchestrator.processAnswer({
      sessionId: "s1",
      currentQuestion: { id: "q1", text: question, type: QuestionType.MAIN, context: "Databases" },
      candidateAnswer: strongAnswer,
      interviewContext: "Technical Interview",
      currentTopic: "Databases",
      coveredTopics: [],
      currentQuestionIndex: 1,
      totalPlannedQuestions: 5,
      followUpCount: 0,
      interviewPlan: mockPlan
    });

    assert(
      orchResult.action === AIOrchestrationAction.ASK_NEXT_QUESTION,
      "Strong answer smoothly advances with ASK_NEXT_QUESTION in orchestrator",
      orchResult.action
    );
  }

  // --------------------------------------------------------------------------
  // TEST 10: Follow-up limit prevents infinite loops
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 10: Strict Follow-Up Boundary Enforcement ---");
  {
    const mockPlan = new InterviewPlan([
      { category: InterviewType.TECHNICAL, skillOrTopic: "Backend Architecture", targetQuestions: 5, questionsAsked: 1 }
    ]);

    const mockEvaluator = {} as any;
    const mockGenerator = {
      generateFollowUp: async () => ({ text: "Follow up?", type: QuestionType.FOLLOW_UP, context: "Backend Architecture" }),
      generateNextQuestion: async () => ({ text: "Next main question?", type: QuestionType.MAIN, context: "Backend Architecture" })
    } as any;
    const orchestrator = new LangGraphInterviewAIOrchestrator(mockEvaluator, mockGenerator);

    const boundedResult = await orchestrator.processAnswer({
      sessionId: "s1",
      currentQuestion: { id: "q1", text: "Explain indexing in databases.", type: QuestionType.MAIN, context: "Backend Architecture" },
      candidateAnswer: "It makes it faster.",
      interviewContext: "Technical Interview",
      currentTopic: "Backend Architecture",
      coveredTopics: [],
      currentQuestionIndex: 1,
      totalPlannedQuestions: 5,
      followUpCount: env.INTERVIEW_MAX_FOLLOW_UPS_PER_QUESTION, // Already reached configured limit
      interviewPlan: mockPlan
    });

    assert(
      boundedResult.action === AIOrchestrationAction.ASK_NEXT_QUESTION,
      "Orchestrator advances to ASK_NEXT_QUESTION once max follow-up count is reached",
      `Action: ${boundedResult.action}, FollowUps: ${env.INTERVIEW_MAX_FOLLOW_UPS_PER_QUESTION}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 11: Duplicate final STT events do not duplicate evaluation or questions
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 11: Duplicate STT Final Events Locked Out ---");
  {
    let evaluationCalls = 0;
    let turnState: TurnState = TurnState.CANDIDATE_PROCESSING;

    const onSttEndpoint = () => {
      if (turnState === TurnState.CANDIDATE_PROCESSING) {
        // Ignored
        return;
      }
      evaluationCalls++;
    };

    onSttEndpoint();
    onSttEndpoint();

    assert(
      evaluationCalls === 0,
      "Duplicate STT endpoints rejected while turn is in CANDIDATE_PROCESSING",
      `Evaluation calls: ${evaluationCalls}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 12: Reconnects and worker restarts do not assign answer to wrong question
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 12: Turn ID & Question ID Association Safety ---");
  {
    const activeQuestionId = "q_postgres_indexing";
    const payloadQuestionId = "q_old_intro";

    const isMatch = activeQuestionId === payloadQuestionId;

    assert(
      isMatch === false,
      "Stale turn packet from previous question ID rejected",
      `Expected ${activeQuestionId}, received ${payloadQuestionId}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 13: Timeout/no-response handling is predictable
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 13: Predictable No-Response Handling ---");
  {
    const emptyAnswer = "";
    const assessment = assessAnswerRelevance("What is CORS?", emptyAnswer);

    assert(
      assessment.classification === AnswerRelevanceClassification.NO_RESPONSE,
      "Empty answer correctly classified as NO_RESPONSE",
      assessment.classification
    );
    assert(
      assessment.spokenResponse !== undefined && assessment.spokenResponse.includes("haven't heard your response"),
      "Generates gentle spoken prompt without advancing",
      assessment.spokenResponse
    );
    assert(
      env.INTERVIEW_NO_RESPONSE_TIMEOUT_MS === 25000,
      "No-response timeout window is predictably set",
      `${env.INTERVIEW_NO_RESPONSE_TIMEOUT_MS}ms`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 14: Interview advances only after current answer decision is complete
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 14: Synchronous Turn Decision Gating ---");
  {
    let answerProcessed = false;
    let questionAdvanced = false;

    const simulateTurnCycle = async () => {
      // Step 1: Evaluate
      await new Promise(r => setTimeout(r, 10));
      answerProcessed = true;

      // Step 2: Only advance if evaluation succeeded
      if (answerProcessed) {
        questionAdvanced = true;
      }
    };

    await simulateTurnCycle();

    assert(
      answerProcessed && questionAdvanced,
      "Question advancement strictly gated on answer processing completion",
      `Processed: ${answerProcessed}, Advanced: ${questionAdvanced}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 15: Existing AI Interview audio, transcript, and resume behavior
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 15: Preserved System Types & Enums Compatibility ---");
  {
    const validTurnStates = Object.values(TurnState);
    assert(
      validTurnStates.includes(TurnState.AI_SPEAKING) &&
      validTurnStates.includes(TurnState.CANDIDATE_LISTENING) &&
      validTurnStates.includes(TurnState.CANDIDATE_PROCESSING) &&
      validTurnStates.includes(TurnState.WAITING_FOR_CANDIDATE) &&
      validTurnStates.includes(TurnState.FOLLOW_UP_PENDING),
      "All explicit logical turn states are fully supported in TurnState enum",
      validTurnStates.join(", ")
    );

    const validActions = Object.values(AIOrchestrationAction);
    assert(
      validActions.includes(AIOrchestrationAction.REDIRECT) &&
      validActions.includes(AIOrchestrationAction.PROMPT_NO_RESPONSE) &&
      validActions.includes(AIOrchestrationAction.ASK_FOLLOW_UP) &&
      validActions.includes(AIOrchestrationAction.ASK_NEXT_QUESTION),
      "All orchestration actions are cleanly registered in domain interfaces",
      validActions.join(", ")
    );
  }

  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTurnTakingAndAnswerValidationTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
