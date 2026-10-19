import { IAudioTransport } from "@application/interfaces/ai-interview/IAudioTransport";
import { ITTSService } from "@application/interfaces/ai-interview/ITTSService";
import { ISTTService } from "@application/interfaces/ai-interview/ISTTService";
import { IQuestionGenerator, AIOrchestrationAction, AnswerRelevanceClassification } from "@application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { ITTSQueue } from "@application/interfaces/ai-interview/ITTSQueue";
import { IAIWorkerOrchestratorUseCase } from "../interfaces/IAIWorkerOrchestratorUseCase";
import { IProcessStudentAnswerUseCase } from "../interfaces/IProcessStudentAnswerUseCase";
import { IAIInterviewRepository } from "@domain/repositories/ai-interview/IAIInterviewRepository";
import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { InterviewPhase } from "@domain/enums/InterviewPhase.enum";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { ILogger, LogCategory } from "../../../interfaces/observability/ILogger";
export { CandidateUtteranceIntent } from "@domain/enums/CandidateUtteranceIntent.enum";
export { classifyCandidateUtterance, getCandidateQuestionResponse } from "../../../services/ai-interview/CandidateUtteranceClassifier";
import { CandidateUtteranceIntent } from "@domain/enums/CandidateUtteranceIntent.enum";
import { classifyCandidateUtterance, getCandidateQuestionResponse } from "../../../services/ai-interview/CandidateUtteranceClassifier";
import { classifyTurnIntent, CandidateTurnIntent } from "../../../../shared/utils/turnIntent.util";
import { assessAnswerRelevance } from "../../../../shared/utils/answerRelevance.util";
import { IMessageBroker } from "@application/interfaces/messaging/IMessageBroker";
import { env } from "@infrastructure/config/env.validator";

export enum TurnState {
  CONNECTING = 'CONNECTING',
  INTRO_SPEAKING = 'INTRO_SPEAKING',
  AI_SPEAKING = 'AI_SPEAKING',
  ASKING_QUESTION = 'ASKING_QUESTION',
  WAITING_FOR_CANDIDATE = 'WAITING_FOR_CANDIDATE',
  CANDIDATE_LISTENING = 'CANDIDATE_LISTENING',
  PROCESSING_ANSWER = 'PROCESSING_ANSWER',
  CANDIDATE_PROCESSING = 'CANDIDATE_PROCESSING',
  FOLLOW_UP_OR_NEXT_QUESTION = 'FOLLOW_UP_OR_NEXT_QUESTION',
  FOLLOW_UP_PENDING = 'FOLLOW_UP_PENDING',
  COMPLETED = 'COMPLETED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  ERROR = 'ERROR'
}

export interface ICandidateTurn {
  readonly turnId: string;
  readonly questionId: string;
  readonly questionText: string;
  readonly turnStartTime: number;
  finalSegments: string[];
  provisionalInterim: string;
  lastSpeechTimestamp: number;
  isFinalized: boolean;
  isEvaluating: boolean;
  finalAnswer: string | null;
}

export class AIWorkerOrchestratorUseCase implements IAIWorkerOrchestratorUseCase {
  private _sessionCompletionResolver: (() => void) | null = null;
  private _sessionCompletionPromise: Promise<void> | null = null;
  private _introStarted = false;
  private _isStopped = false;
  private _lastAcknowledgement: string | null = null;
  private _cleanupFns: Array<() => void> = [];

  public isValidTransition(from: TurnState, to: TurnState): boolean {
    if (from === to) return true;
    const allowedTransitions: Record<TurnState, TurnState[]> = {
      [TurnState.CONNECTING]: [TurnState.INTRO_SPEAKING, TurnState.AI_SPEAKING, TurnState.ASKING_QUESTION, TurnState.WAITING_FOR_CANDIDATE, TurnState.CANDIDATE_LISTENING, TurnState.ERROR],
      [TurnState.INTRO_SPEAKING]: [TurnState.WAITING_FOR_CANDIDATE, TurnState.CANDIDATE_LISTENING, TurnState.ASKING_QUESTION, TurnState.ERROR],
      [TurnState.AI_SPEAKING]: [TurnState.WAITING_FOR_CANDIDATE, TurnState.CANDIDATE_LISTENING, TurnState.COMPLETED, TurnState.INTERVIEW_COMPLETED, TurnState.ERROR],
      [TurnState.ASKING_QUESTION]: [TurnState.WAITING_FOR_CANDIDATE, TurnState.CANDIDATE_LISTENING, TurnState.ERROR],
      [TurnState.WAITING_FOR_CANDIDATE]: [TurnState.PROCESSING_ANSWER, TurnState.CANDIDATE_PROCESSING, TurnState.AI_SPEAKING, TurnState.ASKING_QUESTION, TurnState.COMPLETED, TurnState.INTERVIEW_COMPLETED, TurnState.ERROR],
      [TurnState.CANDIDATE_LISTENING]: [TurnState.PROCESSING_ANSWER, TurnState.CANDIDATE_PROCESSING, TurnState.AI_SPEAKING, TurnState.ASKING_QUESTION, TurnState.COMPLETED, TurnState.INTERVIEW_COMPLETED, TurnState.ERROR],
      [TurnState.PROCESSING_ANSWER]: [TurnState.FOLLOW_UP_OR_NEXT_QUESTION, TurnState.FOLLOW_UP_PENDING, TurnState.AI_SPEAKING, TurnState.ASKING_QUESTION, TurnState.WAITING_FOR_CANDIDATE, TurnState.CANDIDATE_LISTENING, TurnState.COMPLETED, TurnState.INTERVIEW_COMPLETED, TurnState.ERROR],
      [TurnState.CANDIDATE_PROCESSING]: [TurnState.FOLLOW_UP_OR_NEXT_QUESTION, TurnState.FOLLOW_UP_PENDING, TurnState.AI_SPEAKING, TurnState.ASKING_QUESTION, TurnState.WAITING_FOR_CANDIDATE, TurnState.CANDIDATE_LISTENING, TurnState.COMPLETED, TurnState.INTERVIEW_COMPLETED, TurnState.ERROR],
      [TurnState.FOLLOW_UP_OR_NEXT_QUESTION]: [TurnState.WAITING_FOR_CANDIDATE, TurnState.CANDIDATE_LISTENING, TurnState.AI_SPEAKING, TurnState.ASKING_QUESTION, TurnState.ERROR],
      [TurnState.FOLLOW_UP_PENDING]: [TurnState.WAITING_FOR_CANDIDATE, TurnState.CANDIDATE_LISTENING, TurnState.AI_SPEAKING, TurnState.ASKING_QUESTION, TurnState.ERROR],
      [TurnState.COMPLETED]: [],
      [TurnState.INTERVIEW_COMPLETED]: [],
      [TurnState.ERROR]: []
    };
    return allowedTransitions[from]?.includes(to) ?? false;
  }

  public getConversationalAcknowledgement(
    intent: CandidateUtteranceIntent, 
    isShortAnswer: boolean = false,
    relevance?: AnswerRelevanceClassification
  ): string | null {
    if (intent !== CandidateUtteranceIntent.NORMAL_ANSWER) {
      return null;
    }

    // Never acknowledge false, incomplete, or off-topic answers with affirming statements
    if (
      relevance === AnswerRelevanceClassification.IRRELEVANT_OR_UNRELATED ||
      relevance === AnswerRelevanceClassification.INCORRECT_OR_MISCONCEPTION ||
      relevance === AnswerRelevanceClassification.UNCLEAR_OR_TOO_SHORT ||
      relevance === AnswerRelevanceClassification.NO_RESPONSE
    ) {
      return null;
    }

    const standardAcks = [
      "Understood.",
      "Makes sense.",
      "Thanks for explaining that.",
      null
    ];

    const shortAcks = [
      "Understood.",
      "Makes sense.",
      null
    ];

    const pool = isShortAnswer ? shortAcks : standardAcks;
    const candidates = pool.filter(a => a === null || a !== this._lastAcknowledgement);
    const selected = candidates[Math.floor(Math.random() * candidates.length)] ?? null;
    
    if (selected !== null) {
      this._lastAcknowledgement = selected;
    }
    return selected;
  }

  constructor(
    private readonly _audioTransport: IAudioTransport,
    private readonly _ttsService: ITTSService,
    private readonly _sttService: ISTTService, 
    private readonly _ttsQueue: ITTSQueue,
    private readonly _questionGenerator: IQuestionGenerator,
    private readonly _processAnswerUseCase: IProcessStudentAnswerUseCase,
    private readonly _repository: IAIInterviewRepository,
    private readonly _interviewRepository: IInterviewRepository,
    private readonly _studentRepository?: IStudentRepository,
    private readonly _jobRepository?: IJobRepository,
    private readonly _logger?: ILogger,
    private readonly _messageBroker?: IMessageBroker
  ) {}

  private resolveSessionCompletion(): void {
    if (this._sessionCompletionResolver) {
      this._sessionCompletionResolver();
      this._sessionCompletionResolver = null;
    }
  }

  async startWorker(url: string, token: string, sessionId: string): Promise<void> {
    if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Starting`);
    
    if (!url || !token || !sessionId) {
      const errMsg = `[AI_WORKER] Cannot start worker: missing required connection parameters (url, token, or sessionId)`;
      if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, errMsg);
      throw new Error(errMsg);
    }

    if (this._ttsService.connect) {
      await this._ttsService.connect();
    }

    this._sessionCompletionPromise = new Promise<void>((resolve) => {
      this._sessionCompletionResolver = resolve;
    });

    let studentConnectionTimeout: NodeJS.Timeout | null = setTimeout(async () => {
      if (this._logger) this._logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] Load Shedding: Student did not connect within 60 seconds for session ${sessionId}. Terminating worker.`);
      try {
        await this.stopWorker();
      } catch (err) {
        if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Error stopping worker on load shed timeout:`, err);
      }
      this.resolveSessionCompletion();
    }, 60000);

    await this._audioTransport.connect(url, token, async () => {
      if (studentConnectionTimeout) {
        clearTimeout(studentConnectionTimeout);
        studentConnectionTimeout = null;
      }
      if (this._introStarted) return;
      this._introStarted = true;
      if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Student connected`);
      
      const session = await this._repository.findById(sessionId);
      if (session && session.phase !== InterviewPhase.NOT_STARTED && session.phase !== InterviewPhase.INTRO) {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Rejoined active session (Phase: ${session.phase}). Skipping INTRO.`);
          
          if (session.questions.length > 0) {
              const activeQuestion = session.questions[session.questions.length - 1];
              await this._audioTransport.publishDataMessage({
                  type: 'QUESTION_UPDATED',
                  text: activeQuestion.text,
                  questionId: activeQuestion.id,
                  sequenceNumber: session.questions.length,
                  timestamp: Date.now()
              });

              // On reconnect, if the current question has not been answered yet, replay it so candidate hears it!
              if (!activeQuestion.candidateAnswer) {
                if (this._audioTransport.waitForClientReady) {
                  await this._audioTransport.waitForClientReady(6000);
                } else {
                  await new Promise(r => setTimeout(r, 1200));
                }
                const replayPrompt = `Welcome back. Let's continue with our question: ${activeQuestion.text}`;
                await this._audioTransport.publishDataMessage({
                  type: 'AI_STATE_CHANGED',
                  state: TurnState.ASKING_QUESTION,
                  timestamp: Date.now()
                });
                try {
                  const audioStream = this._ttsService.generateAudioStream(replayPrompt);
                  for await (const chunk of audioStream) {
                    await this._audioTransport.publishAudioChunk(chunk);
                  }
                  if (this._audioTransport.waitForPlayout) {
                    await this._audioTransport.waitForPlayout();
                  }
                  await new Promise(r => setTimeout(r, 600));
                  this._audioTransport.clearIncomingBuffer?.();
                } catch (replayErr) {
                  if (this._logger) this._logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] Replay audio on reconnect failed:`, replayErr);
                }
              }
          }
          await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: TurnState.WAITING_FOR_CANDIDATE,
              timestamp: Date.now()
          });
      } else {
          // 1. Run the existing INTRO flow
          const introSuccess = await this.runIntroPhase(sessionId);
          
          if (!introSuccess) {
             if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] INTRO phase failed. Terminating session gracefully without starting STT.`);
             await this.stopWorker();
             return;
          }
      }
      
      // 2. Start the STT flow to listen to the student
      this.startListening(sessionId);
    });

    // Hold startWorker pending until the interview session actually completes, times out, or terminates
    await this._sessionCompletionPromise;
    
    if (studentConnectionTimeout) {
      clearTimeout(studentConnectionTimeout);
    }
  }

  private async runIntroPhase(sessionId: string): Promise<boolean> {
    if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [10] INTRO phase started`);
    try {
      const session = await this._repository.findById(sessionId);
      if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [9] Session loaded`);
      if (!session || session.questions.length === 0) {
        if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Session ${sessionId} not found or has no active question`);
        return false;
      }
      
      const activeQuestion = session.questions[session.questions.length - 1];

      // 1. Resolve candidate first name
      let candidateName = "there";
      if (this._studentRepository && session.studentId) {
        const student = await this._studentRepository.findById(session.studentId);
        if (student?.firstName) {
          candidateName = student.firstName.trim();
        }
      }

      // 2. Resolve job title from JobRepository or InterviewContext
      let jobTitle = "this position";
      if (this._jobRepository && session.jobId) {
        const job = await this._jobRepository.findById(session.jobId);
        if (job?.title) {
          jobTitle = job.title.trim();
        }
      } else if (session.interviewContext) {
        const match = session.interviewContext.match(/Role:\s*([^.\n]+)/i);
        if (match) {
          jobTitle = match[1].trim();
        }
      }

      // Intro playback idempotency check
      if (session.configuration?.metadata?.introPlayed || session.phase === InterviewPhase.ASKING_QUESTION) {
        if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Intro already played, skipping playback`);
        this._audioTransport.clearIncomingBuffer?.();
        return true;
      }

      // Allow candidate audio track negotiation stabilization
      if (this._audioTransport.waitForClientReady) {
        const isClientReady = await this._audioTransport.waitForClientReady(8000);
        if (!isClientReady) {
          if (this._logger) this._logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] Candidate audio readiness not confirmed within 8000ms. Dispatching prompt...`);
          await this._audioTransport.publishDataMessage({
            type: 'AUDIO_READINESS_REQUIRED',
            message: 'Please click Enable Audio if audio does not start automatically.'
          });
          // Wait additional grace period for user to click Enable Audio
          await this._audioTransport.waitForClientReady(4000);
        }
      } else {
        await new Promise(r => setTimeout(r, 1200));
      }

      // 3. Phase 1: Opening Greeting (INTRO_SPEAKING)
      const openingGreeting = `Hello ${candidateName}, welcome to your ${jobTitle} interview. I'm your AI interviewer today.`;
      if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [11] Intro greeting generation started: "${openingGreeting}"`);
      
      await this._audioTransport.publishDataMessage({
        type: 'AI_STATE_CHANGED',
        state: TurnState.INTRO_SPEAKING,
        timestamp: Date.now()
      });

      let introPlayoutSuccess = false;
      const maxRetries = 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [13] Intro TTS generation started (attempt ${attempt})`);
          const audioStream = this._ttsService.generateAudioStream(openingGreeting);
          let chunkCount = 0;
          
          for await (const chunk of audioStream) {
            chunkCount++;
            await this._audioTransport.publishAudioChunk(chunk);
          }

          if (chunkCount === 0) {
            throw new Error('TTS service returned 0 audio chunks for intro greeting');
          }

          if (this._audioTransport.waitForPlayout) {
            await this._audioTransport.waitForPlayout();
          }
          introPlayoutSuccess = true;
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] AUDIO_PIPELINE: Intro greeting TTS chunks=${chunkCount} playout confirmed.`);
          break;
        } catch (playErr) {
          if (this._logger) this._logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] TTS intro attempt ${attempt} failed:`, playErr);
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 500));
          }
        }
      }

      if (!introPlayoutSuccess) {
        if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Intro TTS audio playout failed.`);
        await this._audioTransport.publishDataMessage({
          type: 'AI_STATE_CHANGED',
          state: TurnState.ERROR,
          error: 'Audio playback failed'
        });
        return false;
      }

      // Persist introPlayed in session configuration metadata
      if (session.configuration) {
        session.configuration.metadata = {
          ...(session.configuration.metadata || {}),
          introPlayed: true
        };
        await this._repository.update(session.id, session);
      }

      await new Promise(r => setTimeout(r, 500));

      // 4. Phase 2: First Question (ASKING_QUESTION)
      await this._audioTransport.publishDataMessage({
        type: 'QUESTION_UPDATED',
        text: activeQuestion.text,
        questionId: activeQuestion.id,
        sequenceNumber: 1,
        timestamp: Date.now()
      });
      await this._audioTransport.publishDataMessage({
        type: 'AI_STATE_CHANGED',
        state: TurnState.ASKING_QUESTION,
        timestamp: Date.now()
      });

      const questionPrompt = `Let's get started. ${activeQuestion.text}`;
      let qPlayoutSuccess = false;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] First question TTS generation started (attempt ${attempt})`);
          const audioStream = this._ttsService.generateAudioStream(questionPrompt);
          let chunkCount = 0;
          for await (const chunk of audioStream) {
            chunkCount++;
            await this._audioTransport.publishAudioChunk(chunk);
          }
          if (chunkCount === 0) {
            throw new Error('TTS service returned 0 audio chunks for first question');
          }
          if (this._audioTransport.waitForPlayout) {
            await this._audioTransport.waitForPlayout();
          }
          qPlayoutSuccess = true;
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] AUDIO_PIPELINE: First question TTS chunks=${chunkCount} playout confirmed.`);
          break;
        } catch (qErr) {
          if (this._logger) this._logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] First question TTS attempt ${attempt} failed:`, qErr);
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 500));
          }
        }
      }

      if (!qPlayoutSuccess) {
        if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] First question TTS audio playout failed.`);
        await this._audioTransport.publishDataMessage({
          type: 'AI_STATE_CHANGED',
          state: TurnState.ERROR,
          error: 'Question audio playback failed'
        });
        return false;
      }

      await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));
      this._audioTransport.clearIncomingBuffer?.();
      this._sttService.clearBuffer?.();

      await this._repository.transitionSessionState(
        sessionId,
        [InterviewPhase.INTRO],
        InterviewPhase.ASKING_QUESTION
      );

      // 5. Phase 3: Transition to Candidate Listening (WAITING_FOR_CANDIDATE)
      if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [17] Transition to WAITING_FOR_CANDIDATE`);
      await this._audioTransport.publishDataMessage({
        type: 'AI_STATE_CHANGED',
        state: TurnState.WAITING_FOR_CANDIDATE,
        turnId: `${activeQuestion.id}_turn_1`,
        questionId: activeQuestion.id
      });

      return true;
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('Too Many Requests')) {
        if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] LLM quota exceeded:`, err);
      } else if (errorMsg.includes('50') || errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('unavailable') || errorMsg.includes('Failed to fetch')) {
        if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] LLM provider unavailable:`, err);
      } else {
        if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] LLM generation failed:`, err);
      }
      return false;
    }
  }

  private async startListening(sessionId: string) {
    try {
      const studentAudioStream = this._audioTransport.getIncomingAudioStream();
      const sttStream = this._sttService.transcribeStream(studentAudioStream);

      if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Student audio stream initialized`); 
      
      let currentTurnState = TurnState.WAITING_FOR_CANDIDATE as TurnState;
      let turnSequence = 0;
      let activeTurn: ICandidateTurn | null = null;
      const turnsHistory = new Map<string, ICandidateTurn>();
      const evaluatedTurns = new Set<string>();

      let session = await this._repository.findById(sessionId);
      if (!session) {
         if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Session ${sessionId} not found`);
         return;
      }

      let candidateSpokeDuringPlayback = false;
      let repeatRequestedDuringPlayback = false;

      let silenceTimer: NodeJS.Timeout | null = null;
      let noResponseTimer: NodeJS.Timeout | null = null;
      let maxDurationTimer: NodeJS.Timeout | null = null;

      let isFinalizingTurn = false;
      let completionHandled = false;
      let consecutiveOffTopicCount = 0;
      let abortController: AbortController | null = null;
      let timeoutInterval: NodeJS.Timeout;

      const clearAllTurnTimers = () => {
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }
        if (noResponseTimer) {
          clearTimeout(noResponseTimer);
          noResponseTimer = null;
        }
        if (maxDurationTimer) {
          clearTimeout(maxDurationTimer);
          maxDurationTimer = null;
        }
      };

      this._cleanupFns.push(clearAllTurnTimers);

      const resetNoResponseTimer = () => {
        if (noResponseTimer) {
          clearTimeout(noResponseTimer);
          noResponseTimer = null;
        }
        const noResponseTimeoutMs = env.INTERVIEW_NO_RESPONSE_TIMEOUT_MS || 25000;
        noResponseTimer = setTimeout(async () => {
          if (completionHandled || isFinalizingTurn || this._ttsQueue.isSpeaking()) return;
          if (activeTurn && activeTurn.finalSegments.length === 0 && !activeTurn.provisionalInterim &&
              (currentTurnState === TurnState.WAITING_FOR_CANDIDATE || currentTurnState === TurnState.CANDIDATE_LISTENING)) {
            if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] No response detected after ${noResponseTimeoutMs}ms (turnId: ${activeTurn.turnId})`);
            
            currentTurnState = TurnState.ASKING_QUESTION;
            await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: TurnState.ASKING_QUESTION,
              turnId: activeTurn.turnId,
              questionId: activeTurn.questionId
            });

            const promptMessage = "Whenever you're ready, please share your thoughts on the question.";
            this._ttsQueue.enqueue(promptMessage);
            await this._ttsQueue.waitForDrain();
            await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

            this._audioTransport.clearIncomingBuffer?.();
            const currentQId = activeTurn.questionId;
            await startCandidateListeningTurn(currentQId);
          }
        }, noResponseTimeoutMs);
      };

      const startCandidateListeningTurn = async (targetQuestionId?: string) => {
        clearAllTurnTimers();
        turnSequence++;
        const qId = targetQuestionId || session?.questions[session.questions.length - 1]?.id || 'q';
        const targetQ = session?.questions.find(q => q.id === qId) || session?.questions[session.questions.length - 1];
        if (!targetQ) {
          if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] No active question found when starting listening turn.`);
          return;
        }

        const turnId = `${targetQ.id}_turn_${turnSequence}`;
        const newTurn: ICandidateTurn = {
          turnId,
          questionId: targetQ.id,
          questionText: targetQ.text,
          turnStartTime: Date.now(),
          finalSegments: [],
          provisionalInterim: '',
          lastSpeechTimestamp: Date.now(),
          isFinalized: false,
          isEvaluating: false,
          finalAnswer: null
        };

        activeTurn = newTurn;
        turnsHistory.set(turnId, newTurn);
        isFinalizingTurn = false;
        currentTurnState = TurnState.WAITING_FOR_CANDIDATE;

        // Discard any residual audio buffered during playback
        this._audioTransport.clearIncomingBuffer?.();
        this._sttService.clearBuffer?.();

        // Handle repeat requests made during playback
        if (repeatRequestedDuringPlayback) {
          repeatRequestedDuringPlayback = false;
          candidateSpokeDuringPlayback = false;
          currentTurnState = TurnState.ASKING_QUESTION;
          const repeatText = `Sure, let me repeat the question: ${targetQ.text}`;
          this._ttsQueue.enqueue(repeatText);
          await this._audioTransport.publishDataMessage({
            type: 'AI_STATE_CHANGED',
            state: TurnState.ASKING_QUESTION,
            turnId: newTurn.turnId,
            questionId: newTurn.questionId
          });
          await this._ttsQueue.waitForDrain();
          await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));
          this._audioTransport.clearIncomingBuffer?.();
          this._sttService.clearBuffer?.();
          newTurn.finalSegments = [];
          newTurn.provisionalInterim = '';
          currentTurnState = TurnState.WAITING_FOR_CANDIDATE;
        } else if (candidateSpokeDuringPlayback) {
          candidateSpokeDuringPlayback = false;
          newTurn.finalSegments = [];
          newTurn.provisionalInterim = '';
          this._audioTransport.clearIncomingBuffer?.();
          this._sttService.clearBuffer?.();
        }

        if (this._logger) {
          this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER_DIAGNOSTIC] [STATE_TRANSITION] from=${currentTurnState} to=WAITING_FOR_CANDIDATE sessionId=${sessionId} questionId=${targetQ.id} turnId=${turnId}`);
        }

        await this._audioTransport.publishDataMessage({
          type: 'AI_STATE_CHANGED',
          state: TurnState.WAITING_FOR_CANDIDATE,
          turnId: newTurn.turnId,
          questionId: newTurn.questionId,
          timestamp: Date.now()
        });

        // Set maximum answer duration timer (default 120s)
        const maxDurationMs = env.INTERVIEW_MAX_ANSWER_DURATION_MS || 120000;
        maxDurationTimer = setTimeout(async () => {
          if (!isFinalizingTurn && activeTurn && (activeTurn.finalSegments.length > 0 || activeTurn.provisionalInterim) && 
              (currentTurnState === TurnState.WAITING_FOR_CANDIDATE || currentTurnState === TurnState.CANDIDATE_LISTENING)) {
            if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER_DIAGNOSTIC] [TURN_FINALIZATION] reason="MAX_DURATION_REACHED" turnId=${activeTurn.turnId} questionId=${activeTurn.questionId} durationMs=${maxDurationMs}`);
            await processCandidateTurn(activeTurn.turnId, "MAX_DURATION_REACHED");
          }
        }, maxDurationMs);

        resetNoResponseTimer();
      };

      const triggerHardTimeout = async () => {
         if (!completionHandled) {
            completionHandled = true;
            clearAllTurnTimers();
            if (timeoutInterval) clearInterval(timeoutInterval);
            if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Hard timeout reached for session ${sessionId}`);
            if (abortController) {
              abortController.abort();
            }
            // Mark AIInterviewSession completed cleanly
            if (session && session.phase !== InterviewPhase.COMPLETED) {
                try {
                    const advanced = await this._repository.transitionSessionState(
                        session.id, 
                        [InterviewPhase.INTRO, InterviewPhase.ASKING_QUESTION, InterviewPhase.ASKING_FOLLOW_UP, InterviewPhase.EVALUATING, InterviewPhase.CLOSING],
                        InterviewPhase.COMPLETED
                    );
                    if (advanced) {
                        session.forceCloseDueToTimeout();
                    }
                } catch (err) {
                    if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Failed to force close session on timeout:`, err);
                }
            }
            if (session) {
                try {
                    const parentInterview = await this._interviewRepository.findById(session.interviewId);
                    if (parentInterview && parentInterview.status === InterviewStatus.IN_PROGRESS) {
                        parentInterview.markAsCompleted();
                        await this._interviewRepository.update(parentInterview.id, parentInterview);
                    }
                } catch (err) {
                    if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Failed to update parent interview on timeout:`, err);
                }
            }

            // Resolve candidate first name for personalized closing
            let candidateName = "there";
            if (this._studentRepository && session?.studentId) {
              const student = await this._studentRepository.findById(session.studentId);
              if (student?.firstName) {
                candidateName = student.firstName.trim();
              }
            }

            const timeoutClosing = candidateName !== "there"
              ? `Thank you, ${candidateName}. Our allotted interview time has concluded. I appreciate your time today, and we'll follow up with you regarding the next steps. Have a great day.`
              : `Thank you for your time today. Our allotted interview time has concluded, and we'll follow up with you regarding the next steps. Have a great day.`;

            if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Spoken timeout closing: "${timeoutClosing}"`);

            await this._audioTransport.publishDataMessage({
              type: 'INTERVIEW_PHASE_CHANGED',
              phase: 'CLOSING'
            });
            await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: TurnState.ASKING_QUESTION
            });

            this._ttsQueue.enqueue(timeoutClosing);
            
            await this._ttsQueue.waitForDrain();
            await new Promise(r => setTimeout(r, 1500));

            await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: TurnState.COMPLETED
            });
            await this._audioTransport.publishDataMessage({
              type: 'INTERVIEW_PHASE_CHANGED',
              phase: 'COMPLETED'
            });

            if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, "[AI_WORKER] Final TTS completed");
            if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, "[AI_WORKER] Interview completed");
            if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, "[AI_WORKER] Worker stopped");
            await this.stopWorker();
         }
      };

      timeoutInterval = setInterval(() => {
         if (!session || completionHandled) return;
         const elapsedMs = session.startedAt ? Date.now() - session.startedAt.getTime() : 0;
         const durationMs = session.getDurationMinutes() * 60 * 1000;
         if (elapsedMs >= durationMs && session.phase !== InterviewPhase.CLOSING && session.phase !== InterviewPhase.COMPLETED) {
            triggerHardTimeout();
         }
      }, 1000);
      this._cleanupFns.push(() => clearInterval(timeoutInterval));

      // Start the initial listening turn timers
      resetNoResponseTimer();

      const processCandidateTurn = async (turnIdToProcess: string, finalizationReason: string = "SILENCE_WINDOW_CONFIRMED") => {
        const turn = turnsHistory.get(turnIdToProcess);
        if (!turn || turn.isFinalized || turn.isEvaluating || evaluatedTurns.has(turnIdToProcess)) {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] duplicate_or_stale_turn_ignored (active: ${activeTurn?.turnId}, target: ${turnIdToProcess})`);
          return;
        }

        clearAllTurnTimers();
        isFinalizingTurn = true;

        // Brief settling delay (250ms) to allow in-flight final segments from STT for this turn to arrive
        await new Promise(r => setTimeout(r, 250));

        turn.isFinalized = true;
        turn.isEvaluating = true;
        evaluatedTurns.add(turnIdToProcess);
        currentTurnState = TurnState.PROCESSING_ANSWER;
        activeTurn = null; // Unbind active turn immediately to isolate from late STT arrivals

        // Preserve all segments; if no final segments confirmed, use provisional interim
        let finalAnswer = turn.finalSegments.join(" ").trim();
        if (!finalAnswer && turn.provisionalInterim) {
          finalAnswer = turn.provisionalInterim.trim();
        }
        turn.finalAnswer = finalAnswer;

        if (this._logger) {
          this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER_DIAGNOSTIC] [TURN_FINALIZATION] reason="${finalizationReason}" turnId=${turn.turnId} questionId=${turn.questionId} segmentsCount=${turn.finalSegments.length} text="${finalAnswer}"`);
        }

        if (!finalAnswer) {
          isFinalizingTurn = false;
          currentTurnState = TurnState.WAITING_FOR_CANDIDATE;
          await startCandidateListeningTurn(turn.questionId);
          return;
        }

        const t_endpoint = performance.now();

        // --- NATURAL STUDENT RESPONSE HANDLING ---
        const classification = classifyCandidateUtterance(finalAnswer);

        if (classification.intent === CandidateUtteranceIntent.HESITATION) {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] CANDIDATE_HESITATION detected: "${finalAnswer}" -> Responding patiently.`);
          currentTurnState = TurnState.ASKING_QUESTION;
          this._ttsQueue.enqueue("Of course, take your time.");
          await this._audioTransport.publishDataMessage({
            type: 'AI_STATE_CHANGED',
            state: TurnState.ASKING_QUESTION,
            turnId: turn.turnId,
            questionId: turn.questionId
          });
          
          await this._ttsQueue.waitForDrain();
          await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

          await startCandidateListeningTurn(turn.questionId);
          return;
        }

        if (classification.intent === CandidateUtteranceIntent.REPEAT_QUESTION) {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] REPEAT_QUESTION detected -> Repeating active question: "${turn.questionText}"`);
          currentTurnState = TurnState.ASKING_QUESTION;
          const repeatText = `Sure, let me repeat the question: ${turn.questionText}`;
          this._ttsQueue.enqueue(repeatText);
          await this._audioTransport.publishDataMessage({
            type: 'AI_STATE_CHANGED',
            state: TurnState.ASKING_QUESTION,
            turnId: turn.turnId,
            questionId: turn.questionId
          });

          await this._ttsQueue.waitForDrain();
          await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

          await startCandidateListeningTurn(turn.questionId);
          return;
        }

        if (classification.intent === CandidateUtteranceIntent.PAUSE_REQUEST) {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] PAUSE_REQUEST detected -> Acknowledging pause.`);
          currentTurnState = TurnState.ASKING_QUESTION;
          const pauseAck = "Sure, we can pause for a moment. Whenever you're ready to resume, just let me know or continue with your answer.";
          this._ttsQueue.enqueue(pauseAck);
          await this._audioTransport.publishDataMessage({
            type: 'AI_STATE_CHANGED',
            state: TurnState.ASKING_QUESTION,
            turnId: turn.turnId,
            questionId: turn.questionId
          });

          await this._ttsQueue.waitForDrain();
          await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

          await startCandidateListeningTurn(turn.questionId);
          return;
        }

        if (classification.intent === CandidateUtteranceIntent.CANDIDATE_QUESTION && classification.questionCategory) {
          consecutiveOffTopicCount++;
          const responseText = getCandidateQuestionResponse(
            classification.questionCategory,
            turn.questionText,
            session?.currentTopic,
            consecutiveOffTopicCount
          );

          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] CANDIDATE_QUESTION detected (category: ${classification.questionCategory}, count: ${consecutiveOffTopicCount}) -> Spoken redirect: "${responseText}"`);

          currentTurnState = TurnState.ASKING_QUESTION;
          this._ttsQueue.enqueue(responseText);
          await this._audioTransport.publishDataMessage({
            type: 'AI_STATE_CHANGED',
            state: TurnState.ASKING_QUESTION,
            turnId: turn.turnId,
            questionId: turn.questionId
          });

          await this._ttsQueue.waitForDrain();
          await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

          await startCandidateListeningTurn(turn.questionId);
          return;
        }

        // Assess Answer Relevance to decide if a positive conversational acknowledgement is warranted
        const relevanceAssessment = assessAnswerRelevance(
          turn.questionText,
          finalAnswer,
          session?.currentTopic || "General"
        );

        if (classification.intent === CandidateUtteranceIntent.EXPLICIT_DONT_KNOW) {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] CANDIDATE_UNCERTAINTY detected: "${finalAnswer}" -> Enqueuing transition.`);
          this._ttsQueue.enqueue("No problem, let's move on.");
        }

        consecutiveOffTopicCount = 0;

        // Broadcast final candidate transcript and set state to PROCESSING_ANSWER with stable turnId & questionId
        await this._audioTransport.publishDataMessage({
          type: 'TRANSCRIPT_FINAL',
          speaker: 'STUDENT',
          text: finalAnswer,
          turnId: turn.turnId,
          questionId: turn.questionId,
          timestamp: Date.now()
        });
        await this._audioTransport.publishDataMessage({
          type: 'AI_STATE_CHANGED',
          state: TurnState.PROCESSING_ANSWER,
          turnId: turn.turnId,
          questionId: turn.questionId,
          timestamp: Date.now()
        });

        if (this._logger) {
          this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER_DIAGNOSTIC] [EVALUATION_START] turnId=${turn.turnId} questionId=${turn.questionId} answer="${finalAnswer}"`);
        }
        const t_process = performance.now();
        if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] LATENCY answer_end_to_process_start: ${(t_process - t_endpoint).toFixed(2)}ms`);

        abortController = new AbortController();

        // Natural acknowledgement: ONLY if relevant and sufficient!
        let chosenAck: string | null = null;
        if (relevanceAssessment.classification === AnswerRelevanceClassification.RELEVANT_SUFFICIENT) {
          chosenAck = relevanceAssessment.acknowledgement || this.getConversationalAcknowledgement(classification.intent, false, relevanceAssessment.classification);
        }
        let hasSpokenAcknowledgement = false;

        // Trigger ProcessStudentAnswerUseCase with stable questionId
        const processOutput = await this._processAnswerUseCase.execute({
          sessionId,
          questionId: turn.questionId,
          studentId: session?.studentId || '',
          answer: finalAnswer,
          onSentenceGenerated: async (sentence) => {
            currentTurnState = TurnState.FOLLOW_UP_OR_NEXT_QUESTION;
            let spokenSentence = sentence;
            if (!hasSpokenAcknowledgement && chosenAck) {
              if (!sentence.startsWith(chosenAck)) {
                spokenSentence = `${chosenAck} ${sentence}`;
              }
              hasSpokenAcknowledgement = true;
              if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Spoken question with conversational acknowledgement: "${spokenSentence}"`);
            }
            this._ttsQueue.enqueue(spokenSentence);
            await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: TurnState.ASKING_QUESTION,
              timestamp: Date.now()
            });
          },
          abortSignal: abortController.signal
        });

        abortController = null;

        if (this._logger) {
          this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER_DIAGNOSTIC] [EVALUATION_COMPLETE] turnId=${turn.turnId} questionId=${turn.questionId} action=${processOutput?.action} relevance=${relevanceAssessment.classification}`);
        }

        if (processOutput && !processOutput.success) {
            if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Answer processing rejected/aborted.`);
            await startCandidateListeningTurn(turn.questionId);
            return;
        }

        // Handle REDIRECT action (candidate gave irrelevant/unrelated answer)
        if (processOutput?.action === AIOrchestrationAction.REDIRECT) {
          const redirectSpeech = processOutput.spokenResponse || "Let's focus on the question at hand. Please take another moment to address it.";
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Action is REDIRECT. Spoken redirection: "${redirectSpeech}"`);
          currentTurnState = TurnState.ASKING_QUESTION;
          this._ttsQueue.enqueue(redirectSpeech);
          await this._audioTransport.publishDataMessage({
            type: 'AI_STATE_CHANGED',
            state: TurnState.ASKING_QUESTION,
            turnId: turn.turnId,
            questionId: turn.questionId
          });

          await this._ttsQueue.waitForDrain();
          await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

          await startCandidateListeningTurn(turn.questionId);
          return;
        }

        const updatedSession = await this._repository.findById(sessionId);
        if (updatedSession) {
            session = updatedSession; // Refresh memory state
            if (session.phase === InterviewPhase.CLOSING || session.phase === InterviewPhase.COMPLETED) {
                if (!completionHandled) {
                  completionHandled = true;
                  clearAllTurnTimers();
                  if (timeoutInterval) clearInterval(timeoutInterval);
                  if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Normal interview completion detected`);

                  // Resolve candidate first name for personalized closing
                  let candidateName = "there";
                  if (this._studentRepository && session.studentId) {
                    const student = await this._studentRepository.findById(session.studentId);
                    if (student?.firstName) {
                      candidateName = student.firstName.trim();
                    }
                  }

                  const closingText = candidateName !== "there"
                    ? `Thank you, ${candidateName}. That concludes our interview. I appreciate your time today, and we'll follow up with you regarding the next steps. Have a great day.`
                    : `Thank you for your time today. That concludes our interview, and we'll follow up with you regarding the next steps. Have a great day.`;

                  if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Spoken closing message: "${closingText}"`);

                  await this._audioTransport.publishDataMessage({
                    type: 'INTERVIEW_PHASE_CHANGED',
                    phase: 'CLOSING',
                    timestamp: Date.now()
                  });
                  await this._audioTransport.publishDataMessage({
                    type: 'AI_STATE_CHANGED',
                    state: TurnState.ASKING_QUESTION,
                    timestamp: Date.now()
                  });

                  currentTurnState = TurnState.ASKING_QUESTION;
                  this._ttsQueue.enqueue(closingText);

                  await this._ttsQueue.waitForDrain();
                  await new Promise(r => setTimeout(r, 1500));

                  if (session.phase === InterviewPhase.CLOSING) {
                    const advanced = await this._repository.transitionSessionState(
                        session.id,
                        [InterviewPhase.CLOSING],
                        InterviewPhase.COMPLETED
                    );
                    if (advanced) {
                       session.markAsCompleted();
                    }
                  }
                  const parentInterview = await this._interviewRepository.findById(session.interviewId);
                  if (parentInterview && parentInterview.status === InterviewStatus.IN_PROGRESS) {
                    parentInterview.markAsCompleted();
                    await this._interviewRepository.update(parentInterview.id, parentInterview);
                  }
                  await this._audioTransport.publishDataMessage({
                    type: 'AI_STATE_CHANGED',
                    state: TurnState.COMPLETED,
                    timestamp: Date.now()
                  });
                  await this._audioTransport.publishDataMessage({
                    type: 'INTERVIEW_PHASE_CHANGED',
                    phase: 'COMPLETED',
                    timestamp: Date.now()
                  });

                  if (this._messageBroker && session) {
                       try {
                           await this._messageBroker.publish('ai_interview_evaluations', {
                               type: 'GENERATE_FULL_EVALUATION',
                               sessionId: session.id,
                               interviewId: session.interviewId,
                               enqueuedAt: Date.now()
                           });
                           if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, "[AI_WORKER] Published FULL_EVALUATION job");
                       } catch (e) {
                           if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Failed to publish FULL_EVALUATION job:`, e);
                       }
                  }

                  if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, "[AI_WORKER] Final TTS completed");
                  if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, "[AI_WORKER] Interview completed");
                  if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, "[AI_WORKER] Worker stopped");
                  await this.stopWorker();
                  return;
                }
            } else if (session.questions.length > 0) {
              const nextQuestion = session.questions[session.questions.length - 1];
              if (nextQuestion.id !== turn.questionId) {
                if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER_DIAGNOSTIC] [NEXT_QUESTION] questionId=${nextQuestion.id} text="${nextQuestion.text}"`);
              }
              // Wait for TTS audio to drain completely, then notify frontend to listen
              await this._ttsQueue.waitForDrain();
              await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

              // Publish final complete next question text and id
              await this._audioTransport.publishDataMessage({
                type: 'QUESTION_UPDATED',
                text: nextQuestion.text,
                questionId: nextQuestion.id,
                sequenceNumber: session.questions.length,
                timestamp: Date.now()
              });

              this._audioTransport.clearIncomingBuffer?.();
              this._sttService.clearBuffer?.();

              await startCandidateListeningTurn(nextQuestion.id);
            }
        }
      };

      for await (const result of sttStream) {
        try {
          // 0. Hard Timeout Protection
          const elapsedMs = session.startedAt ? Date.now() - session.startedAt.getTime() : 0;
          const durationMs = session.getDurationMinutes() * 60 * 1000;
          if (elapsedMs >= durationMs && session.phase !== InterviewPhase.CLOSING && session.phase !== InterviewPhase.COMPLETED) {
             await triggerHardTimeout();
             break;
          }

          if (completionHandled) {
            break;
          }

          const currentTurn = activeTurn as ICandidateTurn | null;

          // 1. Half-Duplex Protection: Strictly discard STT while AI is speaking
          const isAiSpeaking = this._ttsQueue.isSpeaking() || 
            currentTurnState === TurnState.AI_SPEAKING || 
            currentTurnState === TurnState.INTRO_SPEAKING || 
            currentTurnState === TurnState.ASKING_QUESTION || 
            currentTurnState === TurnState.FOLLOW_UP_OR_NEXT_QUESTION ||
            currentTurnState === TurnState.FOLLOW_UP_PENDING;

          if (isAiSpeaking) {
             if (result.text && result.text.trim()) {
               candidateSpokeDuringPlayback = true;
               const earlyIntent = classifyCandidateUtterance(result.text);
               if (earlyIntent.intent === CandidateUtteranceIntent.REPEAT_QUESTION) {
                 repeatRequestedDuringPlayback = true;
               }
             }
             if (currentTurn && currentTurn.finalSegments.length > 0) {
                 if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] AI_SPEAKING: Cleared residual STT buffer to prevent echo bleed.`);
                 currentTurn.finalSegments = [];
                 currentTurn.provisionalInterim = '';
             }
             continue;
          }

          // 2. Active Turn & Processing Lock: Do not accept new audio into an answer undergoing evaluation or when no active listening turn exists
          if (!currentTurn || currentTurn.isFinalized || currentTurn.isEvaluating ||
              currentTurnState === TurnState.PROCESSING_ANSWER || 
              currentTurnState === TurnState.CANDIDATE_PROCESSING) {
             if (result.isEndpoint) {
                 if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] duplicate_final_ignored`);
             }
             continue;
          }

          // 3. Listening State Guard: Candidate only speaks when listening state is ready
          if (currentTurnState !== TurnState.WAITING_FOR_CANDIDATE && 
              currentTurnState !== TurnState.CANDIDATE_LISTENING) {
             continue;
          }

          // 4. Session Phase Protection
          if (session.phase !== InterviewPhase.ASKING_QUESTION && session.phase !== InterviewPhase.ASKING_FOLLOW_UP) {
             continue;
          }

          // Realtime Interim partial broadcast
          if (result.isInterim && result.text) {
             if (silenceTimer) {
               clearTimeout(silenceTimer);
               silenceTimer = null;
             }
             if (noResponseTimer) {
               clearTimeout(noResponseTimer);
               noResponseTimer = null;
             }
             currentTurn.lastSpeechTimestamp = Date.now();
             currentTurn.provisionalInterim = result.text.trim();
             currentTurnState = TurnState.CANDIDATE_LISTENING;

             const partial = [...currentTurn.finalSegments, result.text.trim()].join(" ").trim();
             if (this._logger) {
               this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER_DIAGNOSTIC] [STT_EVENT] type=INTERIM text="${result.text}" accepted=true turnId=${currentTurn.turnId} questionId=${currentTurn.questionId}`);
             }
             await this._audioTransport.publishDataMessage({
               type: 'TRANSCRIPT_PARTIAL',
               text: partial,
               turnId: currentTurn.turnId,
               questionId: currentTurn.questionId
             });
             continue;
          }

          // Accumulate confirmed final phrases
          if (result.text && result.text.trim()) {
             if (silenceTimer) {
               clearTimeout(silenceTimer);
               silenceTimer = null;
             }
             if (noResponseTimer) {
               clearTimeout(noResponseTimer);
               noResponseTimer = null;
             }
             currentTurn.lastSpeechTimestamp = Date.now();
             currentTurn.provisionalInterim = '';
             currentTurnState = TurnState.CANDIDATE_LISTENING;

             if (currentTurn.finalSegments.length === 0) {
                 if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] CANDIDATE_SPEAKING: turn_started (turnId: ${currentTurn.turnId})`);
             }
             if (this._logger) {
               this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER_DIAGNOSTIC] [STT_EVENT] type=FINAL text="${result.text}" accepted=true turnId=${currentTurn.turnId} questionId=${currentTurn.questionId} segmentCount=${currentTurn.finalSegments.length + 1}`);
             }
             currentTurn.finalSegments.push(result.text.trim());

             // Broadcast updated confirmed partial transcript
             await this._audioTransport.publishDataMessage({
               type: 'TRANSCRIPT_PARTIAL',
               text: currentTurn.finalSegments.join(" ").trim(),
               turnId: currentTurn.turnId,
               questionId: currentTurn.questionId
             });
          }

          // STT Endpoint / Pause detected
          if (result.isEndpoint) {
             if (currentTurn.finalSegments.length === 0 && !currentTurn.provisionalInterim) {
               continue; // Ignore silent endpoints
             }

             const elapsedListening = Date.now() - currentTurn.turnStartTime;
             const minListeningTime = env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200;

             // If candidate spoke too soon after question finish, ensure minimum listening time
             if (elapsedListening < minListeningTime) {
               if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Endpoint ignored: elapsed listening time (${elapsedListening}ms) < min listening time (${minListeningTime}ms)`);
               continue;
             }

             // Debounce pause before finalizing the turn (default 2500ms)
             const silenceWindowMs = env.INTERVIEW_SILENCE_WINDOW_MS || 2500;
             if (silenceTimer) {
               clearTimeout(silenceTimer);
             }

             const capturedTurnId = currentTurn.turnId;
             silenceTimer = setTimeout(async () => {
               const turnToFinalize = turnsHistory.get(capturedTurnId);
               if (turnToFinalize && !turnToFinalize.isFinalized && !turnToFinalize.isEvaluating &&
                   (turnToFinalize.finalSegments.length > 0 || turnToFinalize.provisionalInterim) && 
                   (currentTurnState === TurnState.WAITING_FOR_CANDIDATE || currentTurnState === TurnState.CANDIDATE_LISTENING)) {
                 if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Silence window of ${silenceWindowMs}ms elapsed. Finalizing turn ${capturedTurnId}`);
                 await processCandidateTurn(capturedTurnId, "SILENCE_WINDOW_CONFIRMED");
               }
             }, silenceWindowMs);
          }
        } catch (err) {
          if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] [TURN_EXECUTION_FAILURE] Error during turn execution for session ${sessionId}:`, err);
          isFinalizingTurn = false;
          currentTurnState = TurnState.WAITING_FOR_CANDIDATE;
          try {
            await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: TurnState.WAITING_FOR_CANDIDATE,
              turnId: (activeTurn as ICandidateTurn | null)?.turnId
            });
          } catch {}
        }
      }
      clearAllTurnTimers();
      if (timeoutInterval) clearInterval(timeoutInterval);
    } catch (err) {
      if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] [STT_FAILURE] STT Stream encountered an error for session ${sessionId}:`, err);
      try {
        await this._audioTransport.publishDataMessage({
          type: 'AI_STATE_CHANGED',
          state: TurnState.WAITING_FOR_CANDIDATE
        });
      } catch {}
      await this.stopWorker();
    }
  }

  async stopWorker(): Promise<void> {
    this.resolveSessionCompletion();
    if (this._isStopped) return;
    this._isStopped = true;
    while (this._cleanupFns.length > 0) {
      try {
        this._cleanupFns.shift()!();
      } catch {}
    }
    try {
      if (this._audioTransport.disconnect) {
        await this._audioTransport.disconnect();
      }
      if (this._ttsService.disconnect) {
        await this._ttsService.disconnect();
      }
    } catch (err) {
      if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Error during stopWorker:`, err);
    }
  }
}
