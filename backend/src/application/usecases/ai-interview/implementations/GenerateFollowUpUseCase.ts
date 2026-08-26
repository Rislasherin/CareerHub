import { IAIInterviewRepository } from "@domain/repositories/ai-interview/IAIInterviewRepository";
import { IGenerateFollowUpUseCase, GenerateFollowUpOutput } from "../interfaces/IGenerateFollowUpUseCase";
import { GenerateFollowUpInputDTO } from "@application/dtos/ai-interview/GenerateFollowUp.dto";
import { InterviewQuestion } from "@domain/entities/ai-interview/InterviewQuestion";
import { QuestionType } from "@domain/enums/QuestionType.enum";

export class GenerateFollowUpUseCase implements IGenerateFollowUpUseCase{
	constructor(
		private readonly _repository: IAIInterviewRepository
	){}

	async execute(input: GenerateFollowUpInputDTO): Promise<GenerateFollowUpOutput> {
		const session = await this._repository.findById(input.sessionId);
		if(!session) {
			throw new Error(`AI Interview session with ID ${input.sessionId} not found`);
		}

		const followUpQuestion = new InterviewQuestion({
			id: input.followUpQuestionId,
			text: input.followUpText,
			type: QuestionType.FOLLOW_UP,
			context: input.context
		});


		session.requestFollowUp(followUpQuestion)
		await this._repository.update(session.id, session);

		return {success: true}
	}
}