import { IPracticeAudioTransport } from "../../../interfaces/ai-practice/IPracticeAudioTransport";
import { IPracticeSTTService } from "../../../interfaces/ai-practice/IPracticeSTTService";
import { IPracticeTTSService } from "../../../interfaces/ai-practice/IPracticeTTSService";
import { ProcessPracticeConversationTurnUseCase } from "./ProcessPracticeConversationTurn.usecase";
import { Logger, LogCategory } from "@infrastructure/logger/logger";
import { PracticeAction } from "../../../interfaces/ai-practice/IPracticeInterviewBrain";
import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { IPracticeQuestionGenerator } from "../../../interfaces/ai-practice/IPracticeQuestionGenerator";
import { PracticeInterviewStatus } from "@domain/enums/PracticeInterviewStatus.enum";
import { CompletePracticeInterviewUseCase } from "./CompletePracticeInterview.usecase";
import { GeneratePracticeFeedbackUseCase } from "./GeneratePracticeFeedback.usecase";

export enum SessionState {
  CANDIDATE_LISTENING,
  PROCESSING_CANDIDATE,
  AI_SPEAKING
}

export class PracticeWorkerOrchestratorUseCase {
  private _isStopping = false;
  private _sessionState = SessionState.AI_SPEAKING;
  private _expirationInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly _audioTransport: IPracticeAudioTransport,
    private readonly _sttService: IPracticeSTTService,
    private readonly _ttsService: IPracticeTTSService,
    private readonly _processTurnUseCase: ProcessPracticeConversationTurnUseCase,
    private readonly _repository: IAIPracticeInterviewRepository,
    private readonly _questionGenerator: IPracticeQuestionGenerator,
    private readonly _completeInterviewUseCase: CompletePracticeInterviewUseCase,
    private readonly _generateFeedbackUseCase: GeneratePracticeFeedbackUseCase
  ) {}

  async startWorker(livekitUrl: string, token: string, sessionId: string, studentId: string): Promise<void> {
    this._isStopping = false;
    Logger.info(LogCategory.SYSTEM_INFO, `[PracticeWorker] Starting worker for session ${sessionId}`);

    const onParticipantConnected = async () => {
      try {
        Logger.info(LogCategory.SYSTEM_INFO, `[Practice] participant connected`);
        
        const session = await this._repository.findByIdAndStudentId(sessionId, studentId);
        if (!session) {
          Logger.error(LogCategory.SYSTEM_ERROR, `[PRACTICE_WORKER] Session not found on connect`);
          return;
        }

        Logger.info(LogCategory.SYSTEM_INFO, `[Practice] locking candidate input`);
        // Mark AI as speaking BEFORE any LLM generation or TTS plays,
        // so STT does not process candidate background noise or echo.
        this._sessionState = SessionState.AI_SPEAKING;
        
        let introText = "Hi, welcome to your AI practice interview. I'll be conducting the interview today. I'll ask you questions based on your selected topics. Let's get started.";
        
        if (session.questions.length === 0) {
          Logger.info(LogCategory.SYSTEM_INFO, `[Practice] generating first question`);
          
          const firstTopic = session.topics[0] || "General";
          
          Logger.info(LogCategory.SYSTEM_INFO, `[Practice] first-question LLM started`);
          const firstQuestionText = await this._questionGenerator.generateQuestion({
            difficulty: session.difficulty,
            topics: session.topics,
            previousQuestions: [],
            previousAnswers: [],
            currentTopic: firstTopic
          });
          Logger.info(LogCategory.SYSTEM_INFO, `[Practice] first-question LLM completed`);
          Logger.info(LogCategory.SYSTEM_INFO, `[Practice] generated question text`, { textLength: firstQuestionText.length });
          
          const qId = Math.random().toString(36).substring(7);
          
          Logger.info(LogCategory.SYSTEM_INFO, `[Practice] saving first question`);
          session.addQuestion(qId, firstQuestionText, firstTopic, false);
          await this._repository.update(session.id!, session);
          Logger.info(LogCategory.SYSTEM_INFO, `[Practice] first question saved with ID`, { qId });
          
          introText += " " + firstQuestionText;
        } else {
          introText += " " + session.questions[0].text;
        }
        
        await this._audioTransport.publishDataMessage({ event: 'state_sync' });
        await this._audioTransport.publishDataMessage({ event: 'ai_speaking', text: introText });
        
        // Delay TTS slightly to allow frontend to disable the candidate microphone.
        // disabling the mic causes an SDP renegotiation which can drop/buffer real-time incoming AI audio.
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        Logger.info(LogCategory.SYSTEM_INFO, `[Practice] starting first-question TTS`);
        // Note: playText now internally awaits waitForPlayout
        await this.playText(introText);
        Logger.info(LogCategory.SYSTEM_INFO, `[Practice] first-question TTS completed`);
        Logger.info(LogCategory.SYSTEM_INFO, `[Practice] first-question playout completed`);
        
        Logger.info(LogCategory.SYSTEM_INFO, `[Practice] clearing STT buffer`);
        this._sttService.clearBuffer(); // Clear any stale STT data (echo/buffer) before listening
        this._sessionState = SessionState.CANDIDATE_LISTENING;
        
        Logger.info(LogCategory.SYSTEM_INFO, `[Practice] unlocking candidate input`);
        await this._audioTransport.publishDataMessage({ event: 'listening' });
      } catch (err) {
        Logger.error(LogCategory.SYSTEM_ERROR, `[Practice] onParticipantConnected initialization failed:`, err);
        // DO NOT set _isAISpeaking = false. Keep it locked so STT discards buffered audio.
        if (this._sttService) {
          this._sttService.clearBuffer();
        }
        await this.stopWorker();
      }
    };

    // IMPORTANT: Connect TTS BEFORE joining LiveKit.
    // If the candidate is already in the room, onParticipantConnected fires
    // synchronously inside audioTransport.connect(), calling playText().
    // Cartesia must be ready before that callback can execute.
    await this._ttsService.connect();
    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] TTS_CONNECTED`);

    await this._audioTransport.connect(livekitUrl, token, onParticipantConnected);

    // Start background expiration check
    this._expirationInterval = setInterval(async () => {
      if (this._isStopping) {
        if (this._expirationInterval) clearInterval(this._expirationInterval);
        return;
      }
      try {
        const s = await this._repository.findByIdAndStudentId(sessionId, studentId);
        if (s && s.isTimeExpired() && s.status === PracticeInterviewStatus.IN_PROGRESS) {
          Logger.info(LogCategory.SYSTEM_INFO, `[PracticeWorker] Time expired in background check. Forcefully finalizing session ${sessionId}.`);
          await this._completeInterviewUseCase.execute(sessionId, studentId);
          this._generateFeedbackUseCase.execute(sessionId, studentId).catch(err => {
            Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Background feedback generation failed:`, err);
          });
          // Notify frontend that state has changed
          await this._audioTransport.publishDataMessage({ event: 'state_sync' });
          await this.stopWorker();
        }
      } catch (err) {
        Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Background expiration check error:`, err);
      }
    }, 5000);

    // Start STT pipeline
    const audioStream = this._audioTransport.getIncomingAudioStream();
    const sttStream = this._sttService.transcribeStream(audioStream);

    try {
      for await (const result of sttStream) {
        if (this._isStopping) break;

        if (result.isEndpoint && result.text.trim().length > 0) {
          // â”€â”€ CANDIDATE TURN FINALIZED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

          // Gate: if the AI is currently speaking (TTS active) OR we are already processing a turn,
          // discard the endpoint and wait for the next genuine student utterance.
          if (this._sessionState !== SessionState.CANDIDATE_LISTENING) {
            Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] STT_ENDPOINT_DISCARDED_LOCKED`, {
              sessionId,
              state: this._sessionState,
              text: result.text.substring(0, 80),
            });
            this._sttService.clearBuffer(); // discard stale accumulations
            continue;
          }

          this._sessionState = SessionState.PROCESSING_CANDIDATE;

          // DO NOT AWAIT _handleTurn. This is a fire-and-forget call so the STT loop
          // can continue draining (and discarding) STT events while we process the turn.
          this._handleTurn(sessionId, studentId, result.text).catch(err => {
             Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Unhandled error in _handleTurn:`, err);
             this._sessionState = SessionState.CANDIDATE_LISTENING;
          });
          
        } else if (result.isInterim && result.text.trim().length > 0) {
          if (this._sessionState === SessionState.CANDIDATE_LISTENING) {
            // Interim result from Deepgram â€” forward to frontend for live display only
            Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] DEEPGRAM_INTERIM`, { text: result.text });
            await this._audioTransport.publishDataMessage({ event: 'interim_transcript', text: result.text });
          }
        } else if (!result.isEndpoint && !result.isInterim && result.text.trim().length > 0) {
          if (this._sessionState === SessionState.CANDIDATE_LISTENING) {
            // Non-endpoint final segment (is_final=true, speech_final=false) â€” logged for tracing
            Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] DEEPGRAM_FINAL_SEGMENT_PASSTHROUGH`, { text: result.text });
            await this._audioTransport.publishDataMessage({ event: 'interim_transcript', text: result.text });
          }
        }
      }
    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Error in STT loop:`, err);
    }
  }

  private async _handleTurn(sessionId: string, studentId: string, candidateText: string): Promise<void> {
    try {
      const t0 = performance.now();
      const traceId = `${sessionId.slice(-6)}-${Date.now().toString(36)}`;

      Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] STT_FINAL`, {
        traceId, sessionId, textLen: candidateText.trim().length,
      });

      const sessionSnapshot = await this._repository.findByIdAndStudentId(sessionId, studentId);
      const questionIndex = sessionSnapshot ? sessionSnapshot.questions.length : 0;

      if (sessionSnapshot && sessionSnapshot.isTimeExpired()) {
        Logger.info(LogCategory.SYSTEM_INFO, `[PracticeWorker] Time expired before processing turn for session ${sessionId}. Finalizing and ending.`);
        await this._completeInterviewUseCase.execute(sessionId, studentId);
        this._generateFeedbackUseCase.execute(sessionId, studentId).catch(err => {
          Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Background feedback generation failed:`, err);
        });
        await this._audioTransport.publishDataMessage({ event: 'state_sync' });
        await this.stopWorker();
        return;
      }

      if (sessionSnapshot && sessionSnapshot.questions.length === 0) {
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] STT_ENDPOINT_DISCARDED_NO_QUESTION`, {
          sessionId,
          text: candidateText.substring(0, 80),
        });
        this._sttService.clearBuffer();
        this._sessionState = SessionState.CANDIDATE_LISTENING;
        return;
      }

      Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] ANSWER_SUBMISSION_START`, {
        sessionId, questionIndex, transcriptLength: candidateText.trim().length,
      });

      const t_turn = performance.now();
      Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] TURN_FINALIZED`, {
        traceId, durationMs: Math.round(t_turn - t0),
      });

      await this._audioTransport.publishDataMessage({ event: 'processing_answer' });

      const t_submit = performance.now();
      Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] ANSWER_SUBMIT_STARTED`, {
        traceId, sinceStartMs: Math.round(t_submit - t0),
      });
      Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] EVALUATION_START`, { sessionId, questionIndex });
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] PRACTICE_BRAIN_START`);

      const decision = await this._processTurnUseCase.execute(sessionId, studentId, candidateText);

      const t_brain_done = performance.now();
      Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] EVALUATION_COMPLETED`, {
        traceId, durationMs: Math.round(t_brain_done - t_submit), sinceStartMs: Math.round(t_brain_done - t0),
      });
      Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] ANSWER_SUBMISSION_COMPLETE`, {
        sessionId, questionIndex, action: decision.action,
      });
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] PRACTICE_BRAIN_RESPONSE`, { decision: decision.action });

      this._sessionState = SessionState.AI_SPEAKING;
      
      if (decision.action === PracticeAction.ERROR) {
        Logger.info(LogCategory.SYSTEM_INFO, `[PracticeWorker] Generator failed. Ending session gracefully.`);
        const fallbackText = "I'm sorry, I'm having trouble connecting to my question generator. Let's wrap up our practice session here.";
        await this._audioTransport.publishDataMessage({ event: 'ai_speaking', text: fallbackText });
        await new Promise((resolve) => setTimeout(resolve, 500));
        await this.playText(fallbackText, traceId, t0);
        
        await this._completeInterviewUseCase.execute(sessionId, studentId);
        this._generateFeedbackUseCase.execute(sessionId, studentId).catch(err => {
          Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Background feedback generation failed:`, err);
        });
        await this.stopWorker();
        return;
      }

      await this._audioTransport.publishDataMessage({ event: 'ai_speaking', text: decision.responseText });

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (decision.action === PracticeAction.END_INTERVIEW) {
        Logger.info(LogCategory.SYSTEM_INFO, `[PracticeWorker] AI decided to END_INTERVIEW. Session ${sessionId} complete.`);
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] TTS_RESPONSE_START`);
        await this.playText(decision.responseText);
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] TTS_RESPONSE_AUDIO_PUBLISHED`);
        
        await this._completeInterviewUseCase.execute(sessionId, studentId);
        this._generateFeedbackUseCase.execute(sessionId, studentId).catch(err => {
          Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Background feedback generation failed:`, err);
        });
        await this.stopWorker();
        return;
      }

      const t_next_q = performance.now();
      Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] NEXT_QUESTION_STARTED`, {
        traceId, sinceStartMs: Math.round(t_next_q - t0),
      });
      Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] NEXT_QUESTION_START`, {
        sessionId, questionIndex: questionIndex + 1, action: decision.action,
      });

      const t_q_ready = performance.now();
      Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] NEXT_QUESTION_COMPLETED`, {
        traceId, durationMs: Math.round(t_q_ready - t_next_q), sinceStartMs: Math.round(t_q_ready - t0),
        responseTextLen: decision.responseText.length,
      });
      Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] NEXT_QUESTION_GENERATED`, {
        sessionId, responseTextLength: decision.responseText.length,
      });

      const t_tts_start = performance.now();
      Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] TTS_STARTED`, {
        traceId, sinceStartMs: Math.round(t_tts_start - t0),
      });
      Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] NEXT_QUESTION_TTS_START`, { sessionId });
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] TTS_RESPONSE_START`);

      await this.playText(decision.responseText, traceId, t0);

      const t_played = performance.now();
      Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] QUESTION_PLAYED`, {
        traceId, durationMs: Math.round(t_played - t_tts_start), totalMs: Math.round(t_played - t0),
      });
      Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] NEXT_QUESTION_AUDIO_PUBLISHED`, { sessionId });
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] TTS_RESPONSE_AUDIO_PUBLISHED`);

    } catch (err: unknown) {
      const e = err as Error;
      Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Error processing turn:`, err);
      
      if (
        e.message &&
        (e.message.includes("already answered") ||
         e.message.includes("already processed") ||
         e.message.includes("already been recorded") ||
         e.message.includes("already submitted"))
      ) {
        Logger.info(LogCategory.SYSTEM_INFO, `[PracticeWorker] Duplicate endpoint detected and discarded for session ${sessionId}.`);
      }
    } finally {
      if (!this._isStopping && this._sessionState !== SessionState.CANDIDATE_LISTENING) {
        // TTS complete or errored — clear buffer BEFORE sending 'listening' signal
        this._sttService.clearBuffer();
        this._sessionState = SessionState.CANDIDATE_LISTENING;
        
        // Notify frontend of state update (new question or returned to listening)
        this._audioTransport.publishDataMessage({ event: 'state_sync' }).catch(console.error);
        this._audioTransport.publishDataMessage({ event: 'listening' }).catch(console.error);
      }
    }
  }

  private async playText(text: string, traceId?: string, t0?: number): Promise<void> {
    Logger.info(LogCategory.SYSTEM_INFO, `[PracticeWorker] TTS synthesize: ${text}`);
    try {
      const audioChunks = this._ttsService.generateAudioStream(text);
      let isFirstChunk = true;
      for await (const chunk of audioChunks) {
        if (this._isStopping) break;
        if (isFirstChunk && traceId && t0 !== undefined) {
          isFirstChunk = false;
          Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] TTS_FIRST_AUDIO`, {
            traceId, sinceStartMs: Math.round(performance.now() - t0),
          });
        }
        await this._audioTransport.publishAudioChunk(chunk);
      }
      Logger.info(LogCategory.SYSTEM_INFO, `[Practice] waiting for playout`);
      await this._audioTransport.waitForPlayout();
    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Error generating/playing TTS:`, err);
    }
  }

  async stopWorker(): Promise<void> {
    this._isStopping = true;
    if (this._expirationInterval) {
      clearInterval(this._expirationInterval);
      this._expirationInterval = null;
    }
    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_LIFECYCLE] Stopping worker`);
    this._sttService.stopReconnecting();
    await this._ttsService.disconnect();
    await this._audioTransport.disconnect();
  }
}
