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
      "Makes sense, thank you.",
      "Right.",
      null
    ];

    const shortAcks = [
      "Understood.",
      "Right.",
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
                  await this._audioTransport.waitForClientReady(2000);
                } else {
                  await new Promise(r => setTimeout(r, 1000));
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
        await this._audioTransport.waitForClientReady(2500);
      } else {
        await new Promise(r => setTimeout(r, 1200));
      }

      // 3. Construct professional opening greeting
      if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [11] Greeting generation started`);
      const openingGreeting = `Hello ${candidateName}, welcome to your ${jobTitle} interview. I'm your AI interviewer today. Let's get started. ${activeQuestion.text}`;
      if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [12] Greeting generation completed: "${openingGreeting}"`);

      // Publish initial state and question to student browser immediately
      await this._audioTransport.publishDataMessage({
        type: 'QUESTION_UPDATED',
        text: activeQuestion.text,
        questionId: activeQuestion.id,
        sequenceNumber: 1,
        timestamp: Date.now()
      });
      await this._audioTransport.publishDataMessage({
        type: 'AI_STATE_CHANGED',
        state: TurnState.INTRO_SPEAKING,
        timestamp: Date.now()
      });

      // Intro audio generation and playout with safe retry
      let playoutSuccess = false;
      const maxRetries = 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [13] TTS generation started (attempt ${attempt})`);
          const audioStream = this._ttsService.generateAudioStream(openingGreeting);
          let hasChunks = false;
          
          for await (const chunk of audioStream) {
            if (!hasChunks) {
              if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [14] TTS first audio/chunk received`);
              if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [15] Audio publication started`);
              hasChunks = true;
            }
            await this._audioTransport.publishAudioChunk(chunk);
          }

          if (hasChunks && this._audioTransport.waitForPlayout) {
            await this._audioTransport.waitForPlayout();
          }
          playoutSuccess = true;
          break;
        } catch (playErr) {
          if (this._logger) this._logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] TTS intro attempt ${attempt} failed:`, playErr);
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 500));
          }
        }
      }

      if (!playoutSuccess) {
        if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Intro TTS audio playout failed.`);
        await this._audioTransport.publishDataMessage({
          type: 'AI_STATE_CHANGED',
          state: TurnState.ERROR,
          error: 'Audio playback failed'
        });
        return false;
      }
      
      await new Promise(r => setTimeout(r, 600));
      this._audioTransport.clearIncomingBuffer?.();

      // Persist introPlayed in session configuration metadata
      if (session.configuration) {
        session.configuration.metadata = {
          ...(session.configuration.metadata || {}),
          introPlayed: true
        };
        await this._repository.update(session.id, session);
      }

      await this._repository.transitionSessionState(
        sessionId,
        [InterviewPhase.INTRO],
        InterviewPhase.ASKING_QUESTION
      );

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
      
      let currentAnswerBuffer: string[] = [];

      let session = await this._repository.findById(sessionId);
      if (!session) {
         if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Session ${sessionId} not found`);
         return;
      }

      let currentTurnState = TurnState.WAITING_FOR_CANDIDATE as TurnState;
      let activeTurnCounter = 1;
      let activeQuestionId = session.questions[session.questions.length - 1]?.id || 'q';
      let activeTurnId = `${activeQuestionId}_turn_${activeTurnCounter}`;
      let turnStartTime = Date.now();
      let lastSpeechTimestamp = Date.now();

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
          if (currentAnswerBuffer.length === 0 && 
              (currentTurnState === TurnState.WAITING_FOR_CANDIDATE || currentTurnState === TurnState.CANDIDATE_LISTENING)) {
            if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] No response detected after ${noResponseTimeoutMs}ms`);
            
            currentTurnState = TurnState.ASKING_QUESTION;
            await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: TurnState.ASKING_QUESTION
            });

            const promptMessage = "Whenever you're ready, please share your thoughts on the question.";
            this._ttsQueue.enqueue(promptMessage);
            await this._ttsQueue.waitForDrain();
            await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

            this._audioTransport.clearIncomingBuffer?.();
            currentAnswerBuffer = [];
            currentTurnState = TurnState.WAITING_FOR_CANDIDATE;
            turnStartTime = Date.now();
            await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: TurnState.WAITING_FOR_CANDIDATE,
              turnId: activeTurnId,
              questionId: activeQuestionId
            });
            resetNoResponseTimer();
          }
        }, noResponseTimeoutMs);
      };

      const startCandidateListeningTurn = async (newQuestionOrFollowUpId?: string) => {
        clearAllTurnTimers();
        activeTurnCounter++;
        const qId = newQuestionOrFollowUpId || session?.questions[session.questions.length - 1]?.id || 'q';
        activeQuestionId = qId;
        activeTurnId = `${qId}_turn_${activeTurnCounter}`;
        currentAnswerBuffer = [];
        isFinalizingTurn = false;
        turnStartTime = Date.now();
        lastSpeechTimestamp = Date.now();
        currentTurnState = TurnState.WAITING_FOR_CANDIDATE;

        // Discard any residual audio buffered during playback
        this._audioTransport.clearIncomingBuffer?.();

        // Handle repeat requests made during playback
        if (repeatRequestedDuringPlayback) {
          repeatRequestedDuringPlayback = false;
          candidateSpokeDuringPlayback = false;
          const activeQ = session?.questions.find(q => q.id === qId) || session?.questions[session.questions.length - 1];
          if (activeQ) {
            currentTurnState = TurnState.ASKING_QUESTION;
            const repeatText = `Sure, let me repeat the question: ${activeQ.text}`;
            this._ttsQueue.enqueue(repeatText);
            await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: TurnState.ASKING_QUESTION
            });
            await this._ttsQueue.waitForDrain();
            await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));
            this._audioTransport.clearIncomingBuffer?.();
            currentAnswerBuffer = [];
            currentTurnState = TurnState.WAITING_FOR_CANDIDATE;
          }
        } else if (candidateSpokeDuringPlayback) {
          candidateSpokeDuringPlayback = false;
          currentAnswerBuffer = [];
        }

        await this._audioTransport.publishDataMessage({
          type: 'AI_STATE_CHANGED',
          state: TurnState.WAITING_FOR_CANDIDATE,
          turnId: activeTurnId,
          questionId: qId
        });

        // Set maximum answer duration timer (default 120s)
        const maxDurationMs = env.INTERVIEW_MAX_ANSWER_DURATION_MS || 120000;
        maxDurationTimer = setTimeout(async () => {
          if (!isFinalizingTurn && currentAnswerBuffer.length > 0 && 
              (currentTurnState === TurnState.WAITING_FOR_CANDIDATE || currentTurnState === TurnState.CANDIDATE_LISTENING)) {
            if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Max answer duration reached (${maxDurationMs}ms). Finalizing captured turn.`);
            await processCandidateTurn(activeTurnId);
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

      const processCandidateTurn = async (turnIdToProcess: string) => {
        if (isFinalizingTurn || turnIdToProcess !== activeTurnId) {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] duplicate_or_stale_turn_ignored (active: ${activeTurnId}, target: ${turnIdToProcess})`);
          return;
        }

        clearAllTurnTimers();
        isFinalizingTurn = true;
        currentTurnState = TurnState.PROCESSING_ANSWER;

        const activeQuestion = session?.questions[session.questions.length - 1];
        if (!activeQuestion) {
          isFinalizingTurn = false;
          currentTurnState = TurnState.WAITING_FOR_CANDIDATE;
          return;
        }

        const t_endpoint = performance.now();
        const finalAnswer = currentAnswerBuffer.join(" ").trim();
        currentAnswerBuffer = []; // Reset answer buffer immediately to prevent duplicate ingestion

        if (!finalAnswer) {
          isFinalizingTurn = false;
          currentTurnState = TurnState.WAITING_FOR_CANDIDATE;
          resetNoResponseTimer();
          return;
        }

        if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] turn_finalized: "${finalAnswer}" (turnId: ${turnIdToProcess})`);

        // --- NATURAL STUDENT RESPONSE HANDLING ---
        const classification = classifyCandidateUtterance(finalAnswer);

        if (classification.intent === CandidateUtteranceIntent.HESITATION) {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] CANDIDATE_HESITATION detected: "${finalAnswer}" -> Responding patiently.`);
          currentTurnState = TurnState.ASKING_QUESTION;
          this._ttsQueue.enqueue("Of course, take your time.");
          await this._audioTransport.publishDataMessage({
            type: 'AI_STATE_CHANGED',
            state: TurnState.ASKING_QUESTION
          });
          
          await this._ttsQueue.waitForDrain();
          await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

          await startCandidateListeningTurn();
          return;
        }

        if (classification.intent === CandidateUtteranceIntent.REPEAT_QUESTION) {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] REPEAT_QUESTION detected -> Repeating active question: "${activeQuestion.text}"`);
          currentTurnState = TurnState.ASKING_QUESTION;
          const repeatText = `Sure, let me repeat the question: ${activeQuestion.text}`;
          this._ttsQueue.enqueue(repeatText);
          await this._audioTransport.publishDataMessage({
            type: 'AI_STATE_CHANGED',
            state: TurnState.ASKING_QUESTION
          });

          await this._ttsQueue.waitForDrain();
          await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

          await startCandidateListeningTurn();
          return;
        }

        if (classification.intent === CandidateUtteranceIntent.PAUSE_REQUEST) {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] PAUSE_REQUEST detected -> Acknowledging pause.`);
          currentTurnState = TurnState.ASKING_QUESTION;
          const pauseAck = "Sure, we can pause for a moment. Whenever you're ready to resume, just let me know or continue with your answer.";
          this._ttsQueue.enqueue(pauseAck);
          await this._audioTransport.publishDataMessage({
            type: 'AI_STATE_CHANGED',
            state: TurnState.ASKING_QUESTION
          });

          await this._ttsQueue.waitForDrain();
          await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

          await startCandidateListeningTurn();
          return;
        }

        if (classification.intent === CandidateUtteranceIntent.CANDIDATE_QUESTION && classification.questionCategory) {
          consecutiveOffTopicCount++;
          const responseText = getCandidateQuestionResponse(
            classification.questionCategory,
            activeQuestion.text,
            session?.currentTopic,
            consecutiveOffTopicCount
          );

          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] CANDIDATE_QUESTION detected (category: ${classification.questionCategory}, count: ${consecutiveOffTopicCount}) -> Spoken redirect: "${responseText}"`);

          currentTurnState = TurnState.ASKING_QUESTION;
          this._ttsQueue.enqueue(responseText);
          await this._audioTransport.publishDataMessage({
            type: 'AI_STATE_CHANGED',
            state: TurnState.ASKING_QUESTION
          });

          await this._ttsQueue.waitForDrain();
          await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

          await startCandidateListeningTurn();
          return;
        }

        // Assess Answer Relevance to decide if a positive conversational acknowledgement is warranted
        const relevanceAssessment = assessAnswerRelevance(
          activeQuestion.text,
          finalAnswer,
          session?.currentTopic || "General"
        );

        if (classification.intent === CandidateUtteranceIntent.EXPLICIT_DONT_KNOW) {
          if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] CANDIDATE_UNCERTAINTY detected: "${finalAnswer}" -> Enqueuing transition.`);
          this._ttsQueue.enqueue("No problem, let's move on.");
        }

        consecutiveOffTopicCount = 0;

        // Broadcast final candidate transcript and set state to PROCESSING_ANSWER
        await this._audioTransport.publishDataMessage({
          type: 'TRANSCRIPT_FINAL',
          speaker: 'STUDENT',
          text: finalAnswer,
          turnId: turnIdToProcess
        });
        await this._audioTransport.publishDataMessage({
          type: 'AI_STATE_CHANGED',
          state: TurnState.PROCESSING_ANSWER
        });

        if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] PROCESSING_ANSWER: Process student answer (turnId: ${turnIdToProcess})`);
        const t_process = performance.now();
        if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] LATENCY answer_end_to_process_start: ${(t_process - t_endpoint).toFixed(2)}ms`);

        abortController = new AbortController();

        // Natural acknowledgement: ONLY if relevant and sufficient!
        let chosenAck: string | null = null;
        if (relevanceAssessment.classification === AnswerRelevanceClassification.RELEVANT_SUFFICIENT) {
          chosenAck = relevanceAssessment.acknowledgement || this.getConversationalAcknowledgement(classification.intent, false, relevanceAssessment.classification);
        }
        let hasSpokenAcknowledgement = false;

        // Trigger ProcessStudentAnswerUseCase
        const processOutput = await this._processAnswerUseCase.execute({
          sessionId,
          questionId: activeQuestion.id,
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
              type: 'QUESTION_UPDATED',
              text: sentence,
              sequenceNumber: (session?.questions?.length || 0) + 1,
              timestamp: Date.now()
            });
            await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: TurnState.ASKING_QUESTION,
              timestamp: Date.now()
            });
          },
          abortSignal: abortController.signal
        });

        abortController = null;

        if (processOutput && !processOutput.success) {
            if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Answer processing rejected/aborted.`);
            await startCandidateListeningTurn();
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
            state: TurnState.ASKING_QUESTION
          });

          await this._ttsQueue.waitForDrain();
          await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

          await startCandidateListeningTurn();
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
              if (nextQuestion.id !== activeQuestion.id) {
                if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] AI response: "${nextQuestion.text}"`);
              }
              // Wait for TTS audio to drain completely, then notify frontend to listen
              await this._ttsQueue.waitForDrain();
              await new Promise(r => setTimeout(r, env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200));

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
             if (currentAnswerBuffer.length > 0) {
                 if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] AI_SPEAKING: Cleared residual STT buffer to prevent echo bleed.`);
                 currentAnswerBuffer = [];
             }
             continue;
          }

          // 2. Processing Lock: Do not accept new audio into an answer undergoing evaluation
          if (isFinalizingTurn || 
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

          const activeQuestion = session.questions[session.questions.length - 1];
          if (!activeQuestion) {
             continue;
          }

          // Realtime Interim partial broadcast
          if (result.isInterim && result.text) {
             // Reset silence and no-response timers on interim speech
             if (silenceTimer) {
               clearTimeout(silenceTimer);
               silenceTimer = null;
             }
             if (noResponseTimer) {
               clearTimeout(noResponseTimer);
               noResponseTimer = null;
             }
             lastSpeechTimestamp = Date.now();

             const partial = [...currentAnswerBuffer, result.text].join(" ").trim();
             await this._audioTransport.publishDataMessage({
               type: 'TRANSCRIPT_PARTIAL',
               text: partial,
               turnId: activeTurnId
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
             lastSpeechTimestamp = Date.now();

             if (currentAnswerBuffer.length === 0) {
                 if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] CANDIDATE_SPEAKING: turn_started (turnId: ${activeTurnId})`);
             }
             if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Student transcript chunk: "${result.text}"`);
             currentAnswerBuffer.push(result.text.trim());

             // Broadcast updated confirmed partial transcript
             await this._audioTransport.publishDataMessage({
               type: 'TRANSCRIPT_PARTIAL',
               text: currentAnswerBuffer.join(" ").trim(),
               turnId: activeTurnId
             });
          }

          // STT Endpoint / Pause detected
          if (result.isEndpoint) {
             if (currentAnswerBuffer.length === 0) {
               continue; // Ignore silent endpoints
             }

             const elapsedListening = Date.now() - turnStartTime;
             const minListeningTime = env.INTERVIEW_MIN_LISTENING_TIME_MS || 1200;

             // If the candidate spoke too soon after question finish, ensure minimum listening time
             if (elapsedListening < minListeningTime) {
               if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Endpoint ignored: elapsed listening time (${elapsedListening}ms) < min listening time (${minListeningTime}ms)`);
               continue;
             }

             // Debounce pause before finalizing the turn (default 2500ms)
             const silenceWindowMs = env.INTERVIEW_SILENCE_WINDOW_MS || 2500;
             if (silenceTimer) {
               clearTimeout(silenceTimer);
             }

             const capturedTurnId = activeTurnId;
             silenceTimer = setTimeout(async () => {
               if (!isFinalizingTurn && currentAnswerBuffer.length > 0 && 
                   (currentTurnState === TurnState.WAITING_FOR_CANDIDATE || currentTurnState === TurnState.CANDIDATE_LISTENING)) {
                 if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Silence window of ${silenceWindowMs}ms elapsed. Finalizing turn ${capturedTurnId}`);
                 await processCandidateTurn(capturedTurnId);
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
              turnId: activeTurnId
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
