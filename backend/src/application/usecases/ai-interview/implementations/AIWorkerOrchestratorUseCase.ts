import { IAudioTransport } from "@application/interfaces/ai-interview/IAudioTransport";
import { ITTSService } from "@application/interfaces/ai-interview/ITTSService";
import { ISTTService } from "@application/interfaces/ai-interview/ISTTService";
import { IQuestionGenerator } from "@application/interfaces/ai-interview/IAIInterviewOrchestrator";
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




export class AIWorkerOrchestratorUseCase implements IAIWorkerOrchestratorUseCase {
  private _sessionCompletionResolver: (() => void) | null = null;
  private _sessionCompletionPromise: Promise<void> | null = null;
  private _introStarted = false;
  private _isStopped = false;
  private _lastAcknowledgement: string | null = null;

  public getConversationalAcknowledgement(intent: CandidateUtteranceIntent, isShortAnswer: boolean = false): string | null {
    if (intent !== CandidateUtteranceIntent.NORMAL_ANSWER) {
      return null;
    }

    const standardAcks = [
      "Got it.",
      "Makes sense.",
      "Thanks for explaining that.",
      "Understood.",
      "Okay.",
      null,
      null
    ];

    const shortAcks = [
      "Got it.",
      "Understood.",
      "Okay.",
      null,
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
    private readonly _logger?: ILogger
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
          }
          await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: 'LISTENING',
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
      // Avoid redundant LLM call. The very first question is already generated 
      // and saved to the database by StartAIInterviewUseCase.
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

      // 3. Construct professional opening greeting (reusing Question 1 with zero extra LLM calls)
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
        state: 'AI_SPEAKING',
        timestamp: Date.now()
      });

      if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [13] TTS generation started`);
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
      
      if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [17] Transition to LISTENING`);
      await this._audioTransport.publishDataMessage({
        type: 'AI_STATE_CHANGED',
        state: 'LISTENING'
      });

      await this._repository.transitionSessionState(
        sessionId,
        [InterviewPhase.INTRO],
        InterviewPhase.ASKING_QUESTION
      );

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

      if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Student audio received`); 
      
      let currentAnswerBuffer: string[] = [];

      // Fetch session once to initialize memory state
      let session = await this._repository.findById(sessionId);
      if (!session) {
         if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Session ${sessionId} not found`);
         return;
      }

      let isFinalizingTurn = false;
      let completionHandled = false;
      let consecutiveOffTopicCount = 0;
      let abortController: AbortController | null = null;
      let timeoutInterval: NodeJS.Timeout;

      const triggerHardTimeout = async () => {
         if (!completionHandled) {
            completionHandled = true;
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
              state: 'AI_SPEAKING'
            });

            this._ttsQueue.enqueue(timeoutClosing);
            
            await this._ttsQueue.waitForDrain();
            await new Promise(r => setTimeout(r, 1500));

            await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: 'COMPLETED'
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

          // 1. Half-Duplex Protection: Ignore STT if AI is actively speaking
          if (this._ttsQueue.isSpeaking()) {
             // Clear any residual buffer from when the AI started speaking
             if (currentAnswerBuffer.length > 0) {
                 if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] AI_SPEAKING: Cleared residual STT buffer and interrupted TTS.`);
                 currentAnswerBuffer = [];
                 this._ttsQueue.clear?.();
             }
             continue;
          }

          // 2. Turn Lifecycle Protection: Prevent duplicate triggers for the same turn
          if (isFinalizingTurn) {
             if (result.isEndpoint) {
                 if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] duplicate_final_ignored`);
             }
             continue;
          }

          // Prevents processing self-TTS: AI only buffers transcripts during ASKING_QUESTION or ASKING_FOLLOW_UP
          if (session.phase !== InterviewPhase.ASKING_QUESTION && session.phase !== InterviewPhase.ASKING_FOLLOW_UP) {
             continue;
          }

          const activeQuestion = session.questions[session.questions.length - 1];
          if (!activeQuestion) {
             continue;
          }

          // Realtime Interim partial broadcast
          if (result.isInterim && result.text) {
             const partial = [...currentAnswerBuffer, result.text].join(" ").trim();
             await this._audioTransport.publishDataMessage({
               type: 'TRANSCRIPT_PARTIAL',
               text: partial
             });
             continue;
          }

          // Accumulate confirmed final phrases
          if (result.text) {
             if (currentAnswerBuffer.length === 0) {
                 if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] CANDIDATE_SPEAKING: turn_started`);
             }
             if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Student transcript chunk: "${result.text}"`);
             currentAnswerBuffer.push(result.text);

             // Broadcast updated confirmed partial transcript
             await this._audioTransport.publishDataMessage({
               type: 'TRANSCRIPT_PARTIAL',
               text: currentAnswerBuffer.join(" ").trim()
             });
          }

          // Turn completed -> Trigger LLM exactly once
          if (result.isEndpoint) {
             if (currentAnswerBuffer.length === 0) {
               continue; // Ignore silent endpoints
             }
             
             const t_endpoint = performance.now();
             const finalAnswer = currentAnswerBuffer.join(" ").trim();
             const reason = result.reason || "speech_final";
             if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] speech_final_received (reason: ${reason})`);
             if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] turn_finalized: "${finalAnswer}"`);
             currentAnswerBuffer = []; // Reset for the next turn
             isFinalizingTurn = true; // Lock the turn

             // --- NATURAL STUDENT RESPONSE HANDLING (HESITATION, UNCERTAINTY & CANDIDATE QUESTIONS) ---
             const classification = classifyCandidateUtterance(finalAnswer);

              if (classification.intent === CandidateUtteranceIntent.HESITATION) {
                if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] CANDIDATE_HESITATION detected: "${finalAnswer}" -> Responding patiently.`);
                this._ttsQueue.enqueue("Of course, take your time.");
                await this._audioTransport.publishDataMessage({
                  type: 'AI_STATE_CHANGED',
                  state: 'AI_SPEAKING'
                });
                
                await this._ttsQueue.waitForDrain();
                await new Promise(r => setTimeout(r, 600));

                isFinalizingTurn = false; // Unlock turn to continue listening for real answer
                await this._audioTransport.publishDataMessage({
                  type: 'AI_STATE_CHANGED',
                  state: 'LISTENING'
                });
                continue; // Skip ProcessStudentAnswerUseCase
              }

              if (classification.intent === CandidateUtteranceIntent.REPEAT_QUESTION) {
                if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] REPEAT_QUESTION detected -> Repeating active question: "${activeQuestion.text}"`);
                const repeatText = `Sure, let me repeat the question: ${activeQuestion.text}`;
                this._ttsQueue.enqueue(repeatText);
                await this._audioTransport.publishDataMessage({
                  type: 'AI_STATE_CHANGED',
                  state: 'AI_SPEAKING'
                });

                await this._ttsQueue.waitForDrain();
                await new Promise(r => setTimeout(r, 600));

                isFinalizingTurn = false;
                await this._audioTransport.publishDataMessage({
                  type: 'AI_STATE_CHANGED',
                  state: 'LISTENING'
                });
                continue; // Skip ProcessStudentAnswerUseCase, keep active question!
              }

              if (classification.intent === CandidateUtteranceIntent.PAUSE_REQUEST) {
                if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] PAUSE_REQUEST detected -> Acknowledging pause.`);
                const pauseAck = "Sure, we can pause for a moment. Whenever you're ready to resume, just let me know or continue with your answer.";
                this._ttsQueue.enqueue(pauseAck);
                await this._audioTransport.publishDataMessage({
                  type: 'AI_STATE_CHANGED',
                  state: 'AI_SPEAKING'
                });

                await this._ttsQueue.waitForDrain();
                await new Promise(r => setTimeout(r, 600));

                isFinalizingTurn = false;
                await this._audioTransport.publishDataMessage({
                  type: 'AI_STATE_CHANGED',
                  state: 'LISTENING'
                });
                continue; // Skip ProcessStudentAnswerUseCase, keep active question!
              }

              if (classification.intent === CandidateUtteranceIntent.CANDIDATE_QUESTION && classification.questionCategory) {
                consecutiveOffTopicCount++;
                const responseText = getCandidateQuestionResponse(
                  classification.questionCategory,
                  activeQuestion.text,
                  session.currentTopic,
                  consecutiveOffTopicCount
                );

                if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] CANDIDATE_QUESTION detected (category: ${classification.questionCategory}, count: ${consecutiveOffTopicCount}) -> Spoken redirect: "${responseText}"`);

                this._ttsQueue.enqueue(responseText);
                await this._audioTransport.publishDataMessage({
                  type: 'AI_STATE_CHANGED',
                  state: 'AI_SPEAKING'
                });

                await this._ttsQueue.waitForDrain();
                await new Promise(r => setTimeout(r, 600));

                isFinalizingTurn = false; // Reset turn lock to continue listening for real answer
                await this._audioTransport.publishDataMessage({
                  type: 'AI_STATE_CHANGED',
                  state: 'LISTENING'
                });
                continue; // Skip ProcessStudentAnswerUseCase, keep active question unchanged!
              }

             if (classification.intent === CandidateUtteranceIntent.EXPLICIT_DONT_KNOW) {
               if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] CANDIDATE_UNCERTAINTY detected: "${finalAnswer}" -> Enqueuing transition.`);
               this._ttsQueue.enqueue("No problem, let's move on.");
             }

             // Normal answer or explicit uncertainty -> Reset consecutive off-topic counter
             consecutiveOffTopicCount = 0;
             // -------------------------------------------------------------------

             // Broadcast final candidate transcript and set state to PROCESSING
             await this._audioTransport.publishDataMessage({
               type: 'TRANSCRIPT_FINAL',
               speaker: 'STUDENT',
               text: finalAnswer
             });
             await this._audioTransport.publishDataMessage({
               type: 'AI_STATE_CHANGED',
               state: 'PROCESSING'
             });

             if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] PROCESSING_ANSWER: Process student answer`);
             const t_process = performance.now();
             if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] LATENCY answer_end_to_process_start: ${(t_process - t_endpoint).toFixed(2)}ms`);
             if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Generating AI response`);

             abortController = new AbortController();

             const wordCount = finalAnswer.split(/\s+/).filter(Boolean).length;
             const ack = this.getConversationalAcknowledgement(classification.intent, wordCount < 5);
             let hasSpokenAcknowledgement = false;

             // Trigger existing Orchestrator
             const processOutput = await this._processAnswerUseCase.execute({
               sessionId,
               questionId: activeQuestion.id,
               studentId: session.studentId,
               answer: finalAnswer,
               onSentenceGenerated: async (sentence) => {
                 let spokenSentence = sentence;
                 if (!hasSpokenAcknowledgement && ack) {
                   spokenSentence = `${ack} ${sentence}`;
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
                   state: 'AI_SPEAKING',
                   timestamp: Date.now()
                 });
               },
               abortSignal: abortController.signal
             });

             abortController = null;

             if (processOutput && !processOutput.success) {
                 // Answer was rejected (e.g. duplicate or completed session)
                 if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Answer processing rejected/aborted.`);
                 isFinalizingTurn = false;
                 continue;
             }

             const updatedSession = await this._repository.findById(sessionId);
             if (updatedSession) {
                 session = updatedSession; // Refresh memory state
                  if (session.phase === InterviewPhase.CLOSING || session.phase === InterviewPhase.COMPLETED) {
                     if (!completionHandled) {
                       completionHandled = true;
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
                         state: 'AI_SPEAKING',
                         timestamp: Date.now()
                       });

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
                         state: 'COMPLETED',
                         timestamp: Date.now()
                       });
                       await this._audioTransport.publishDataMessage({
                         type: 'INTERVIEW_PHASE_CHANGED',
                         phase: 'COMPLETED',
                         timestamp: Date.now()
                       });
                       if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, "[AI_WORKER] Final TTS completed");
                       if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, "[AI_WORKER] Interview completed");
                       if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, "[AI_WORKER] Worker stopped");
                       await this.stopWorker();
                       break;
                     }
                  } else if (session.questions.length > 0) {
                    const nextQuestion = session.questions[session.questions.length - 1];
                    if (nextQuestion.id !== activeQuestion.id) {
                      if (this._logger) this._logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] AI response: "${nextQuestion.text}"`);
                    }
                    // Wait for TTS audio to drain completely, then notify frontend to listen
                    await this._ttsQueue.waitForDrain();
                    await new Promise(r => setTimeout(r, 800));
                    await this._audioTransport.publishDataMessage({
                      type: 'AI_STATE_CHANGED',
                      state: 'LISTENING'
                    });
                 }
             }

             // Unlock the turn
             isFinalizingTurn = false;
          }
        } catch (err) {
          if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] [TURN_EXECUTION_FAILURE] Error during turn execution for session ${sessionId}:`, err);
          isFinalizingTurn = false;
          try {
            await this._audioTransport.publishDataMessage({
              type: 'AI_STATE_CHANGED',
              state: 'LISTENING'
            });
          } catch {}
        }
      }
      if (timeoutInterval) clearInterval(timeoutInterval);
    } catch (err) {
      if (this._logger) this._logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] [STT_FAILURE] STT Stream encountered an error for session ${sessionId}:`, err);
      try {
        await this._audioTransport.publishDataMessage({
          type: 'AI_STATE_CHANGED',
          state: 'LISTENING'
        });
      } catch {}
      await this.stopWorker();
    }
  }

  async stopWorker(): Promise<void> {
    this.resolveSessionCompletion();
    if (this._isStopped) return;
    this._isStopped = true;
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
