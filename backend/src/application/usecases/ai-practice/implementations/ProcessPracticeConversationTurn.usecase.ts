import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { IPracticeInterviewBrain, IPracticeBrainDecision, PracticeAction } from "../../../interfaces/ai-practice/IPracticeInterviewBrain";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { PracticeInterviewStatus } from "@domain/enums/PracticeInterviewStatus.enum";
import { Logger, LogCategory } from "@infrastructure/logger/logger";

export class ProcessPracticeConversationTurnUseCase {
  constructor(
    private readonly _practiceRepository: IAIPracticeInterviewRepository,
    private readonly _brain: IPracticeInterviewBrain
  ) {}

  async execute(sessionId: string, studentId: string, candidateTranscript: string): Promise<IPracticeBrainDecision> {
    const session = await this._practiceRepository.findByIdAndStudentId(sessionId, studentId);
    if (!session) {
      throw new AppError("Practice interview not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (session.status !== PracticeInterviewStatus.IN_PROGRESS) {
      throw new AppError(`Cannot process turn in state: ${session.status}`, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const questions = session.questions;
    if (questions.length === 0) {
      throw new AppError("Participant ID does not match", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Identify the current question (the last one)
    const currentQuestion = questions[questions.length - 1];

    // Only record if not already answered
    if (!currentQuestion.candidateAnswer) {
      session.recordAnswer(currentQuestion.id, candidateTranscript);
    } else {
      // It's possible the transcript is just extra STT coming late, but we treat it as an error or just ignore.
      Logger.warn(LogCategory.SYSTEM_INFO, `[ProcessPracticeTurn] Question ${currentQuestion.id} already answered. Replacing answer for session ${sessionId}.`);
      // Since domain entity doesn't allow overwriting answers easily without throwing, we might just use the transcript directly for the brain.
      // But wait, our domain throws on `recordAnswer` if `candidateAnswer !== undefined`.
      // Let's just catch it or ignore. We want to prevent duplicate turns.
      throw new AppError(`Turn already processed for question ${currentQuestion.id}`, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Count follow ups for the current parent question
    const followUpCount = questions.filter(q => q.parentQuestionId === (currentQuestion.parentQuestionId || currentQuestion.id) && q.id !== (currentQuestion.parentQuestionId || currentQuestion.id)).length;
    
    // Construct context
    const decision = await this._brain.processTurn({
      difficulty: session.difficulty,
      selectedTopics: session.topics,
      interviewDurationMinutes: session.durationMinutes || 15,
      timeRemainingMs: session.getTimeRemainingMs(),
      currentQuestion: currentQuestion.text,
      candidateAnswer: candidateTranscript,
      previousQuestions: questions.slice(0, -1).map(q => q.text),
      previousAnswers: questions.slice(0, -1).map(q => q.candidateAnswer || ""),
      currentTopic: currentQuestion.topic,
      followUpCount
    });

    if (decision.action === PracticeAction.FOLLOW_UP || decision.action === PracticeAction.CLARIFICATION) {
      const nextQId = Math.random().toString(36).substring(7);
      session.addQuestion(
        nextQId, 
        decision.nextQuestion || decision.responseText, 
        decision.topic || currentQuestion.topic, 
        true, 
        currentQuestion.parentQuestionId || currentQuestion.id
      );
    } else if (decision.action === PracticeAction.NEXT_QUESTION) {
      const nextQId = Math.random().toString(36).substring(7);
      session.addQuestion(
        nextQId, 
        decision.nextQuestion || decision.responseText, 
        decision.topic || session.topics[0], 
        false
      );
    } else if (decision.action === PracticeAction.END_INTERVIEW) {
      // The orchestrator is now the single authority for session completion.
      // We do nothing here; the orchestrator will complete the session.
    }

    await this._practiceRepository.update(session.id!, session);

    return decision;
  }
}
