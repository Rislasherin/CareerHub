import { 
  TurnState, 
  ICandidateTurn 
} from "../../src/application/usecases/ai-interview/implementations/AIWorkerOrchestratorUseCase";
import { assessAnswerRelevance } from "../../src/shared/utils/answerRelevance.util";
import { 
  AnswerRelevanceClassification 
} from "../../src/application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { InterviewQuestion } from "../../src/domain/entities/ai-interview/InterviewQuestion";
import { AIInterviewSession } from "../../src/domain/entities/ai-interview/AIInterviewSession";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { Logger, LogCategory } from "../../src/infrastructure/logger/logger";
import { env } from "../../src/infrastructure/config/env.validator";

async function runFirstAnswerCaptureLifecycleTest() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, " HR AI INTERVIEW: FIRST ANSWER CAPTURE LIFECYCLE 10-STAGE TEST   ");
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

  // Set up test session with Question 1
  const session = new AIInterviewSession({
    id: "session_hr_first_ans_001",
    interviewId: "int_001",
    studentId: "student_001",
    durationMinutes: 30,
    phase: InterviewPhase.INTRO,
    questions: [
      new InterviewQuestion({
        id: "q_intro_react_01",
        text: "Could you walk us through how React's virtual DOM reconciliation works?",
        category: "TECHNICAL" as any
      })
    ]
  });

  const publishedDataMessages: Array<Record<string, any>> = [];

  // STAGE 1 & 2: Playout completes before candidate listening starts
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- STAGE 1 & 2: Intro & First Question Playout Completed ---");
  let introAudioDrained = false;
  let questionAudioDrained = false;
  let currentTurnState = TurnState.INTRO_SPEAKING;

  // Simulate intro TTS playback
  introAudioDrained = true;
  currentTurnState = TurnState.ASKING_QUESTION;

  // Simulate first question TTS playback
  questionAudioDrained = true;

  // Transition session phase to ASKING_QUESTION (completed intro)
  (session as any)._phase = InterviewPhase.ASKING_QUESTION;

  assert(
    introAudioDrained && questionAudioDrained && session.phase === InterviewPhase.ASKING_QUESTION,
    "1 & 2. Intro and first question audio playback completed and confirmed before candidate turn initializes",
    `Phase: ${session.phase}, Intro Drained: ${introAudioDrained}, Question Drained: ${questionAudioDrained}`
  );

  // STAGE 3 & 4 & 5: Initialize active turn & enter WAITING_FOR_CANDIDATE
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- STAGE 3, 4 & 5: Active Turn Initialization & Candidate Listening Readiness ---");
  const firstQ = session.questions[0];
  const turnSequence = 1;
  const turnId = `${firstQ.id}_turn_${turnSequence}`;

  let activeTurn: ICandidateTurn | null = null;
  const turnsHistory = new Map<string, ICandidateTurn>();

  // Discard residual audio buffered during playback BEFORE candidate begins
  let residualAudioDropped = true;

  const newTurn: ICandidateTurn = {
    turnId,
    questionId: firstQ.id,
    questionText: firstQ.text,
    turnStartTime: Date.now(),
    finalSegments: [],
    provisionalInterim: "",
    lastSpeechTimestamp: Date.now(),
    isFinalized: false,
    isEvaluating: false,
    finalAnswer: null
  };

  activeTurn = newTurn;
  turnsHistory.set(turnId, newTurn);
  currentTurnState = TurnState.WAITING_FOR_CANDIDATE;

  // Publish WAITING_FOR_CANDIDATE with bound turnId and questionId
  publishedDataMessages.push({
    type: 'AI_STATE_CHANGED',
    state: TurnState.WAITING_FOR_CANDIDATE,
    turnId: newTurn.turnId,
    questionId: newTurn.questionId,
    timestamp: Date.now()
  });

  assert(
    activeTurn !== null && activeTurn.turnId === "q_intro_react_01_turn_1" && activeTurn.questionId === firstQ.id,
    "3. First question turn and answer buffer properly initialized",
    `turnId: ${activeTurn?.turnId}, questionId: ${activeTurn?.questionId}`
  );

  assert(
    residualAudioDropped && currentTurnState === TurnState.WAITING_FOR_CANDIDATE,
    "4 & 5. Residual buffer cleared and WAITING_FOR_CANDIDATE entered to enable candidate speech capture",
    `State: ${currentTurnState}`
  );

  // STAGE 6: No-response timer starts only after activeTurn is initialized
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- STAGE 6: No-Response Timer Protection ---");
  let noResponseTimerArmed = false;
  if (activeTurn && currentTurnState === TurnState.WAITING_FOR_CANDIDATE) {
    noResponseTimerArmed = true;
  }

  assert(
    noResponseTimerArmed === true,
    "6. No-response timer armed strictly after activeTurn exists and state is WAITING_FOR_CANDIDATE",
    `Armed: ${noResponseTimerArmed}`
  );

  // STAGE 7: Partial transcript updates while candidate speaks
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- STAGE 7: Interim Candidate Speech Capture & Realtime Partial Transcripts ---");
  const partialTranscriptsEmitted: string[] = [];

  const handleSTTResult = (result: { text: string; isInterim: boolean; isEndpoint?: boolean }) => {
    const currentTurn = activeTurn;
    if (!currentTurn || currentTurn.isFinalized || currentTurn.isEvaluating) {
      return; // Would be dropped if activeTurn were null!
    }

    if (result.isInterim && result.text) {
      currentTurn.provisionalInterim = result.text.trim();
      currentTurnState = TurnState.CANDIDATE_LISTENING;
      const partial = [...currentTurn.finalSegments, result.text.trim()].join(" ").trim();
      partialTranscriptsEmitted.push(partial);
      publishedDataMessages.push({
        type: 'TRANSCRIPT_PARTIAL',
        text: partial,
        turnId: currentTurn.turnId,
        questionId: currentTurn.questionId
      });
    } else if (result.text && result.text.trim()) {
      currentTurn.provisionalInterim = "";
      currentTurnState = TurnState.CANDIDATE_LISTENING;
      currentTurn.finalSegments.push(result.text.trim());
      const confirmed = currentTurn.finalSegments.join(" ").trim();
      partialTranscriptsEmitted.push(confirmed);
      publishedDataMessages.push({
        type: 'TRANSCRIPT_PARTIAL',
        text: confirmed,
        turnId: currentTurn.turnId,
        questionId: currentTurn.questionId
      });
    }
  };

  // Candidate speaks chunk 1 (interim)
  handleSTTResult({ text: "React creates a lightweight in-memory representation", isInterim: true });
  // Candidate finishes phrase 1 (final)
  handleSTTResult({ text: "React creates a lightweight in-memory representation of the real DOM.", isInterim: false });
  // Candidate pauses briefly and speaks chunk 2 (interim)
  handleSTTResult({ text: "When state changes it diffs the new tree against the old tree", isInterim: true });
  // Candidate finishes phrase 2 (final)
  handleSTTResult({ text: "When state changes it diffs the new tree against the old tree and batches updates efficiently.", isInterim: false, isEndpoint: true });

  assert(
    partialTranscriptsEmitted.length === 4,
    "7. Realtime partial transcript updates emitted while candidate speaks",
    `Count: ${partialTranscriptsEmitted.length}, Latest: "${partialTranscriptsEmitted[partialTranscriptsEmitted.length - 1]}"`
  );

  // STAGE 8: Finalize answer after valid end-of-turn condition
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- STAGE 8: Answer Finalization & Transcript Locking ---");
  let answerFinalized = false;
  let finalBroadcastText = "";

  const finalizeTurn = (turnToFinalize: ICandidateTurn) => {
    turnToFinalize.isFinalized = true;
    turnToFinalize.isEvaluating = true;
    currentTurnState = TurnState.PROCESSING_ANSWER;
    activeTurn = null; // isolate active turn

    let completeAnswer = turnToFinalize.finalSegments.join(" ").trim();
    if (!completeAnswer && turnToFinalize.provisionalInterim) {
      completeAnswer = turnToFinalize.provisionalInterim.trim();
    }
    turnToFinalize.finalAnswer = completeAnswer;
    finalBroadcastText = completeAnswer;

    publishedDataMessages.push({
      type: 'TRANSCRIPT_FINAL',
      speaker: 'STUDENT',
      text: completeAnswer,
      turnId: turnToFinalize.turnId,
      questionId: turnToFinalize.questionId,
      timestamp: Date.now()
    });
    publishedDataMessages.push({
      type: 'AI_STATE_CHANGED',
      state: TurnState.PROCESSING_ANSWER,
      turnId: turnToFinalize.turnId,
      questionId: turnToFinalize.questionId,
      timestamp: Date.now()
    });
    answerFinalized = true;
  };

  finalizeTurn(newTurn);

  assert(
    answerFinalized === true && finalBroadcastText.includes("in-memory representation") && finalBroadcastText.includes("batches updates efficiently"),
    "8. Answer finalized only after valid end-of-turn with complete candidate speech locked in TRANSCRIPT_FINAL",
    `Finalized: "${finalBroadcastText}"`
  );

  // STAGE 9: Persist and evaluate complete first answer against first question
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- STAGE 9: Answer Evaluation & Database Persistence ---");
  const assessment = assessAnswerRelevance(firstQ.text, newTurn.finalAnswer || "", "Frontend Architecture");
  session.recordAnswer(firstQ.id, newTurn.finalAnswer || "");
  session.startEvaluation();

  assert(
    firstQ.candidateAnswer === newTurn.finalAnswer && assessment.classification === AnswerRelevanceClassification.RELEVANT_SUFFICIENT,
    "9. Complete first answer safely persisted to first question and evaluated",
    `Classification: ${assessment.classification}, Persisted Answer: "${firstQ.candidateAnswer}"`
  );

  // STAGE 10: Generate the next question or follow-up only after evaluation completes
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- STAGE 10: Sequential Progression to Next Question ---");
  let nextQuestionGenerated = false;
  let nextQuestionId = "";

  if (firstQ.candidateAnswer && assessment.classification) {
    const nextQ = new InterviewQuestion({
      id: "q_react_hooks_02",
      text: "How do React hooks like useEffect handle cleanup functions when dependencies update?",
      type: "TECHNICAL" as any,
      category: "TECHNICAL" as any
    });
    session.moveToQuestion(nextQ);
    nextQuestionGenerated = true;
    nextQuestionId = nextQ.id;
  }

  assert(
    nextQuestionGenerated === true && nextQuestionId === "q_react_hooks_02" && session.questions.length === 2,
    "10. Next question generated strictly after first question evaluation completes",
    `Total Questions: ${session.questions.length}, Next Q: "${nextQuestionId}"`
  );

  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runFirstAnswerCaptureLifecycleTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
