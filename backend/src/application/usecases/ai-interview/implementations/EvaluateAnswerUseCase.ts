import { IAIInterviewRepository } from "@domain/repositories/ai-interview/IAIInterviewRepository";
import { IEvaluateAnswerUseCase, EvaluateAnswerOutput } from "../interfaces/IEvaluateAnswerUseCase";
import { EvaluateAnswerInputDTO } from "@application/dtos/ai-interview/EvaluateAnswer.dto";
import { AnswerEvaluation } from "@domain/value-objects/AnswerEvaluation";

export class EvaluateAnswerUseCase implements IEvaluateAnswerUseCase {
	constructor(
		private readonly _repository: IAIInterviewRepository
	){}

	async execute(input: EvaluateAnswerInputDTO): Promise<EvaluateAnswerOutput> {
		const session = await this._repository.findById(input.sessionId);
		if(!session) {
			throw new Error(`AI Interview session with ID ${input.sessionId} not found`);
		}

		session.startEvaluation()

		const evaluation = new AnswerEvaluation({
			score: input.score,
			quality: input.quality,
			feedback: input.feedback,
			needsFollowUp: input.needsFollowUp
		});

		session.evaluateQuestion(input.questionId,evaluation);
		await this._repository.update(session.id, session)

		return {success: true}
	}
}