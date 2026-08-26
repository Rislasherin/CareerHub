import { AIInterviewSession } from "@domain/entities/ai-interview/AIInterviewSession";
import { InterviewQuestion } from "@domain/entities/ai-interview/InterviewQuestion";
import { InterviewPlan } from "@domain/value-objects/InterviewPlan";
import { AnswerEvaluation } from "@domain/value-objects/AnswerEvaluation";
import { InterviewPhase } from "@domain/enums/InterviewPhase.enum";
import { BaseRepository } from "./BaseRepository";
import { AIInterviewSessionDocument, AIInterviewSessionModel } from "@infrastructure/database/models/company/ai-interview.model";
import { IAIInterviewRepository } from "@domain/repositories/ai-interview/IAIInterviewRepository";
import { toAIInterviewSessionEntity, toAIInterviewSessionPersistence } from "@application/mappers/ai-interview.mapper";
import { Types } from "mongoose";
import { Logger, LogCategory } from '../logger/logger';

export class AIInterviewRepository extends BaseRepository<AIInterviewSession, AIInterviewSessionDocument>
	implements IAIInterviewRepository {
	constructor() {
		super(AIInterviewSessionModel)
	}

	protected toEntity(doc: AIInterviewSessionDocument): AIInterviewSession {
		return toAIInterviewSessionEntity(doc)
	}

	protected toPersistence(entity: AIInterviewSession): Record<string, unknown> {
		return toAIInterviewSessionPersistence(entity)
	}

	async findByInterviewId(interviewId: string): Promise<AIInterviewSession | null> {
		const doc = await this.model.findOne({ interviewId: new Types.ObjectId(interviewId), isDeleted: { $ne: true } }).exec();

		return doc ? this.toEntity(doc as AIInterviewSessionDocument) : null
	}

	private async withMongoRetry<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
		const MAX_RETRIES = 3;
		let attempt = 0;
		while (true) {
			attempt++;
			try {
				return await operation();
			} catch (error: unknown) {
				const err = error as Error;
				const isTransient = err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError' || err.message?.includes('timeout') || err.message?.includes('network');
				if (isTransient && attempt < MAX_RETRIES) {
					const delay = Math.pow(2, attempt) * 100;
					Logger.warn(LogCategory.SYSTEM_INFO, `[MongoRetry] ${operationName} failed (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay}ms...`, err.message);
					await new Promise(r => setTimeout(r, delay));
					continue;
				}
				Logger.error(LogCategory.SYSTEM_ERROR, `[MongoRetry] ${operationName} failed permanently after ${attempt} attempts:`, err.message);
				throw err;
			}
		}
	}

	async recordAnswerAtomically(
		sessionId: string,
		questionId: string,
		answer: string
	): Promise<boolean> {
		return this.withMongoRetry('recordAnswerAtomically', async () => {
			const result = await this.model.updateOne(
				{
					_id: sessionId,
					isDeleted: { $ne: true },
					phase: { $in: ['ASKING_QUESTION', 'ASKING_FOLLOW_UP'] },
					questions: {
						$elemMatch: {
							id: questionId,
							$or: [
								{ candidateAnswer: { $exists: false } },
								{ candidateAnswer: null },
								{ candidateAnswer: "" }
							]
						}
					}
				},
				{
					$set: { "questions.$.candidateAnswer": answer }
				}
			).exec();
			return result.modifiedCount > 0;
		});
	}

	async advanceInterviewAtomically(
		sessionId: string,
		nextQuestion: InterviewQuestion,
		newPhase: InterviewPhase,
		currentTopic: string,
		coveredTopics: string[],
		followUpCount: number,
		interviewPlan?: InterviewPlan
	): Promise<boolean> {
		return this.withMongoRetry('advanceInterviewAtomically', async () => {
			const questionDoc: Record<string, unknown> = {
				id: nextQuestion.id,
				text: nextQuestion.text,
				type: nextQuestion.type,
				context: nextQuestion.context,
				category: nextQuestion.category,
			};
			if (nextQuestion.candidateAnswer) {
				questionDoc.candidateAnswer = nextQuestion.candidateAnswer;
			}
			if (nextQuestion.evaluation) {
				questionDoc.evaluation = {
					score: nextQuestion.evaluation.score,
					quality: nextQuestion.evaluation.quality,
					feedback: nextQuestion.evaluation.feedback,
					needsFollowUp: nextQuestion.evaluation.needsFollowUp
				};
			}

			const updateDoc: Record<string, unknown> = {
				$push: { questions: questionDoc },
				$set: {
					phase: newPhase,
					currentTopic: currentTopic,
					coveredTopics: coveredTopics,
					followUpCount: followUpCount
				} as Record<string, unknown>
			};

			if (interviewPlan) {
				(updateDoc.$set as Record<string, unknown>).interviewPlan = {
					items: interviewPlan.items.map((i) => ({
						category: i.category,
						skillOrTopic: i.skillOrTopic,
						targetQuestions: i.targetQuestions,
						questionsAsked: i.questionsAsked
					}))
				};
			}

			const result = await this.model.updateOne(
				{
					_id: sessionId,
					isDeleted: { $ne: true },
					phase: { $in: ['ASKING_QUESTION', 'ASKING_FOLLOW_UP', 'EVALUATING'] }
				},
				updateDoc
			).exec();

			return result.modifiedCount > 0;
		});
	}

	async attachEvaluationAtomically(
		sessionId: string,
		questionId: string,
		evaluation: AnswerEvaluation
	): Promise<boolean> {
		return this.withMongoRetry('attachEvaluationAtomically', async () => {
			const result = await this.model.updateOne(
				{
					_id: sessionId,
					isDeleted: { $ne: true },
					questions: {
						$elemMatch: {
							id: questionId,
							$or: [
								{ evaluation: { $exists: false } },
								{ evaluation: null }
							]
						}
					}
				},
				{
					$set: {
						"questions.$.evaluation": {
							score: evaluation.score,
							quality: evaluation.quality,
							feedback: evaluation.feedback,
							needsFollowUp: evaluation.needsFollowUp
						}
					}
				}
			).exec();

			return result.modifiedCount > 0;
		});
	}

	async transitionSessionState(
		sessionId: string,
		fromPhases: string[],
		toPhase: string
	): Promise<boolean> {
		return this.withMongoRetry('transitionSessionState', async () => {
			const updateDoc: Record<string, unknown> = {
				$set: { phase: toPhase } as Record<string, unknown>
			};

			if (toPhase === 'COMPLETED') {
				(updateDoc.$set as Record<string, unknown>).completedAt = new Date();
			}

			const result = await this.model.updateOne(
				{
					_id: sessionId,
					isDeleted: { $ne: true },
					phase: { $in: fromPhases }
				},
				updateDoc
			).exec();

			return result.modifiedCount > 0;
		});
	}
}