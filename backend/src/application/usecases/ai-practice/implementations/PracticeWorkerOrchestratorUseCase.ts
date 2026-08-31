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

export class PracticeWorkerOrchestratorUseCase {
  private _isStopping = false;
  // Prevents STT endpoint results from triggering answer submission while AI is speaking.
  // Set true immediately before TTS starts, cleared after TTS finishes and listening resumes.
  private _isAISpeaking = false;
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
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Participant connected. Starting interview`);
      
      const session = await this._repository.findByIdAndStudentId(sessionId, studentId);
      if (!session) {
        Logger.error(LogCategory.SYSTEM_ERROR, `[PRACTICE_WORKER] Session not found on connect`);
        return;
      }
      
      let introText = "Hi, welcome to your AI practice interview. I'll be conducting the interview today. I'll ask you questions based on your selected topics. Let's get started.";
      
      if (session.questions.length === 0) {
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] FIRST_QUESTION_START`);
        
        const firstTopic = session.topics[0] || "General";
        
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] FIRST_QUESTION_LLM_REQUEST`);
        const firstQuestionText = await this._questionGenerator.generateQuestion({
          difficulty: session.difficulty,
          topics: session.topics,
          previousQuestions: [],
          previousAnswers: [],
          currentTopic: firstTopic
        });
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] FIRST_QUESTION_LLM_RESPONSE`);
        
        const qId = Math.random().toString(36).substring(7);
        session.addQuestion(qId, firstQuestionText, firstTopic, false);
        await this._repository.update(session.id!, session);
        
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] FIRST_QUESTION_STATE_UPDATED`);
        introText += " " + firstQuestionText;
      } else {
        introText += " " + session.questions[0].text;
      }
      
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] AI_INTRO_START`);
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] FIRST_QUESTION_GENERATED`);
      
      await this._audioTransport.publishDataMessage({ event: 'state_sync' });
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] FIRST_QUESTION_PUBLISHED`);
      
      await this._audioTransport.publishDataMessage({ event: 'ai_speaking', text: introText });
      
      // Delay TTS slightly to allow frontend to disable the candidate microphone.
      // disabling the mic causes an SDP renegotiation which can drop/buffer real-time incoming AI audio.
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] AI_INTRO_TTS_START`);
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] FIRST_QUESTION_TTS_START`);
      await this.playText(introText);
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] FIRST_QUESTION_TTS_COMPLETE`);
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] AI_INTRO_AUDIO_PUBLISHED`);
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] FIRST_QUESTION_AUDIO_PUBLISHED`);
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] FIRST_QUESTION_COMPLETE`);
      
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] LISTENING_FOR_CANDIDATE`);
      await this._audioTransport.publishDataMessage({ event: 'listening' });
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

    let questionIndex = 0;

    try {
      for await (const result of sttStream) {
        if (this._isStopping) break;

        if (result.isEndpoint && result.text.trim().length > 0) {
          // â”€â”€ CANDIDATE TURN FINALIZED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

          // Gate: if the AI is currently speaking (TTS active), this endpoint was
          // almost certainly caused by echo from the speakers or buffered mic frames.
          // Discard it and wait for the next genuine student utterance.
          if (this._isAISpeaking) {
            Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] STT_ENDPOINT_DISCARDED_AI_SPEAKING`, {
              sessionId,
              text: result.text.substring(0, 80),
            });
            continue;
          }

          // â”€â”€ Latency trace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          const t0 = performance.now();
          const traceId = `${sessionId.slice(-6)}-${Date.now().toString(36)}`;

          Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] STT_FINAL`, {
            traceId, sessionId, textLen: result.text.trim().length, reason: result.reason,
          });

          const sessionSnapshot = await this._repository.findByIdAndStudentId(sessionId, studentId);
          questionIndex = sessionSnapshot ? sessionSnapshot.questions.length : questionIndex;

          if (sessionSnapshot && sessionSnapshot.isTimeExpired()) {
            Logger.info(LogCategory.SYSTEM_INFO, `[PracticeWorker] Time expired before processing turn for session ${sessionId}. Finalizing and ending.`);
            await this._completeInterviewUseCase.execute(sessionId, studentId);
            // Async trigger feedback generation
            this._generateFeedbackUseCase.execute(sessionId, studentId).catch(err => {
              Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Background feedback generation failed:`, err);
            });
            await this._audioTransport.publishDataMessage({ event: 'state_sync' });
            await this.stopWorker();
            break;
          }

          Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] ANSWER_SUBMISSION_START`, {
            sessionId, questionIndex, transcriptLength: result.text.trim().length, reason: result.reason,
          });

          const t_turn = performance.now();
          Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] TURN_FINALIZED`, {
            traceId, durationMs: Math.round(t_turn - t0),
          });

          await this._audioTransport.publishDataMessage({ event: 'processing_answer' });

          try {
            const t_submit = performance.now();
            Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] ANSWER_SUBMIT_STARTED`, {
              traceId, sinceStartMs: Math.round(t_submit - t0),
            });
            Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] EVALUATION_START`, { sessionId, questionIndex });
            Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] PRACTICE_BRAIN_START`);

            // NOTE: ProcessPracticeConversationTurnUseCase does NOT run a separate evaluator.
            // The single brain LLM call (withStructuredOutput) decides action + responseText + nextQuestion.
            // There is no async evaluation step in the realtime worker pipeline.
            const decision = await this._processTurnUseCase.execute(sessionId, studentId, result.text);

            const t_brain_done = performance.now();
            Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] EVALUATION_COMPLETED`, {
              traceId, durationMs: Math.round(t_brain_done - t_submit), sinceStartMs: Math.round(t_brain_done - t0),
            });
            Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] ANSWER_SUBMISSION_COMPLETE`, {
              sessionId, questionIndex, action: decision.action,
            });
            Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] PRACTICE_BRAIN_RESPONSE`, { decision: decision.action });

            // Mark AI as speaking BEFORE starting TTS so that any STT endpoint
            // events fired during playback (echo, buffered frames) are discarded above.
            this._isAISpeaking = true;
            await this._audioTransport.publishDataMessage({ event: 'ai_speaking', text: decision.responseText });

            // Delay TTS slightly to allow frontend to disable the candidate microphone.
            // disabling the mic causes an SDP renegotiation which can drop/buffer real-time incoming AI audio.
            await new Promise((resolve) => setTimeout(resolve, 500));

            if (decision.action === PracticeAction.END_INTERVIEW) {
              Logger.info(LogCategory.SYSTEM_INFO, `[PracticeWorker] AI decided to END_INTERVIEW. Session ${sessionId} complete.`);
              Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] TTS_RESPONSE_START`);
              await this.playText(decision.responseText);
              Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] TTS_RESPONSE_AUDIO_PUBLISHED`);
              this._isAISpeaking = false;
              
              await this._completeInterviewUseCase.execute(sessionId, studentId);
              this._generateFeedbackUseCase.execute(sessionId, studentId).catch(err => {
                Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Background feedback generation failed:`, err);
              });
              await this.stopWorker();
              break;
            }

            const t_next_q = performance.now();
            Logger.info(LogCategory.SYSTEM_INFO, `[QUESTION_LATENCY] NEXT_QUESTION_STARTED`, {
              traceId, sinceStartMs: Math.round(t_next_q - t0),
            });
            Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] NEXT_QUESTION_START`, {
              sessionId, questionIndex: questionIndex + 1, action: decision.action,
            });

            // The next question text is already in decision.responseText / decision.nextQuestion.
            // No additional LLM call is needed here (brain already generated it above).
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

            // TTS complete â€” clear AI speaking flag BEFORE sending 'listening' signal
            // so that any genuine student speech immediately after is accepted.
            this._isAISpeaking = false;

            // Notify frontend of state update (new question)
            await this._audioTransport.publishDataMessage({ event: 'state_sync' });
            await this._audioTransport.publishDataMessage({ event: 'listening' });
          } catch (err: unknown) {
            const e = err as Error;
            Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Error processing turn:`, err);
            this._isAISpeaking = false; // Always clear flag on error path
            // "Turn already processed" / "Answer has already been recorded" â€” duplicate endpoint event.
            // This can happen if both speech_final and utterance_end fire for the same utterance,
            // or if echo caused a second endpoint during TTS. Log and continue.
            if (
              e.message &&
              (e.message.includes("already answered") ||
               e.message.includes("already processed") ||
               e.message.includes("already been recorded") ||
               e.message.includes("already submitted"))
            ) {
              Logger.info(LogCategory.SYSTEM_INFO, `[PracticeWorker] Duplicate endpoint detected and discarded for session ${sessionId}.`);
            }
          }
        } else if (result.isInterim && result.text.trim().length > 0) {
          // Interim result from Deepgram â€” forward to frontend for live display only
          Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] DEEPGRAM_INTERIM`, { text: result.text });
          await this._audioTransport.publishDataMessage({ event: 'interim_transcript', text: result.text });
        } else if (!result.isEndpoint && !result.isInterim && result.text.trim().length > 0) {
          // Non-endpoint final segment (is_final=true, speech_final=false) â€” logged for tracing
          Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] DEEPGRAM_FINAL_SEGMENT_PASSTHROUGH`, { text: result.text });
          await this._audioTransport.publishDataMessage({ event: 'interim_transcript', text: result.text });
        }
      }
    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[PracticeWorker] Error in STT loop:`, err);
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
