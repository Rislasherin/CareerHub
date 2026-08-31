import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { AIPracticeInterview } from "@domain/entities/ai-practice/AIPracticeInterview";
import { IPracticeQuestionGenerator } from "../../../interfaces/ai-practice/IPracticeQuestionGenerator";
import { IPracticeAnswerEvaluator } from "../../../interfaces/ai-practice/IPracticeAnswerEvaluator";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class SubmitPracticeAnswerUseCase {
  constructor(
    private readonly _practiceRepository: IAIPracticeInterviewRepository,
    private readonly _questionGenerator: IPracticeQuestionGenerator,
    private readonly _answerEvaluator: IPracticeAnswerEvaluator
  ) {}

  async execute(input: {
    studentId: string;
    sessionId: string;
    questionId: string;
    answer: string;
  }): Promise<AIPracticeInterview> {
    const { studentId, sessionId, questionId, answer } = input;

    // 1. Ownership & State validation
    const session = await this._practiceRepository.findByIdAndStudentId(sessionId, studentId);
    if (!session) {
      throw new AppError("Practice interview not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (session.status !== "IN_PROGRESS") {
      throw new AppError("Practice session is not active", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const question = session.questions.find(q => q.id === questionId);
    if (!question) {
      throw new AppError("Question not found in this session", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (question.candidateAnswer) {
      throw new AppError("Answer has already been submitted for this question", HttpStatus.CONFLICT, ErrorCode.RESOURCE_EXISTS);
    }

    // 2. Concurrency Lock: Atomic execution via MongoDB updateOne filters
    const repositoryImpl = this._practiceRepository as any;
    if (repositoryImpl && typeof repositoryImpl.recordAnswerAtomically === "function") {
      const success = await repositoryImpl.recordAnswerAtomically(sessionId, questionId, answer);
      if (!success) {
        throw new AppError("Answer submission conflict: duplicate request detected", HttpStatus.CONFLICT, ErrorCode.RESOURCE_EXISTS);
      }
    } else {
      session.recordAnswer(questionId, answer);
      await this._practiceRepository.update(sessionId, session);
    }

    // 3. Load latest state
    const updatedSession = await this._practiceRepository.findByIdAndStudentId(sessionId, studentId);
    if (!updatedSession) {
      throw new AppError("Failed to load session state", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    // 4. Call Answer Evaluation (Shared AI LLM)
    let evaluation;
    try {
      evaluation = await this._answerEvaluator.evaluateAnswer({
        difficulty: updatedSession.difficulty,
        question: question.text,
        answer,
        topic: question.topic
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      throw new AppError(`Answer recorded but evaluation failed: ${errorMsg}`, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    updatedSession.attachEvaluation(questionId, evaluation.score, evaluation.feedback);

    // 5. Complete session or select next topic & generate next question
    if (updatedSession.isTimeExpired()) {
      updatedSession.complete();
    } else {
      // Pick next topic cycling
      const nextTopicIndex = updatedSession.questions.length % updatedSession.topics.length;
      const nextTopic = updatedSession.topics[nextTopicIndex];

      const previousQuestions = updatedSession.questions.map(q => q.text);
      const previousAnswers = updatedSession.questions.map(q => q.candidateAnswer || "");

      let nextQuestionText: string;
      try {
        nextQuestionText = await this._questionGenerator.generateQuestion({
          difficulty: updatedSession.difficulty,
          topics: updatedSession.topics,
          previousQuestions,
          previousAnswers,
          currentTopic: nextTopic
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        // Safe Recovery Fallback: save answer/evaluation & exit
        await this._practiceRepository.update(sessionId, updatedSession);
        throw new AppError(`Answer evaluated but next question generation failed: ${errorMsg}`, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
      }

      const nextQuestionId = Math.random().toString(36).substring(7);
      updatedSession.addQuestion(nextQuestionId, nextQuestionText, nextTopic);
    }

    return await this._practiceRepository.update(sessionId, updatedSession);
  }
}
