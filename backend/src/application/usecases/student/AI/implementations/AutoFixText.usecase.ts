import { IAIService } from "@application/interfaces/IAIService";
import { IAutoFixTextUseCase } from "../interfaces/IAutoFixText.usecase";

export class AutoFixTextUseCase implements IAutoFixTextUseCase {
    constructor(private readonly _aiService: IAIService) {}

    async execute(text: string, targetRole: string): Promise<string> {
        const instructions = `You are an expert ATS resume writer. Rewrite the provided bullet point to be more impactful using the STAR method for a ${targetRole} role. DO NOT hallucinate metrics, companies, or skills not present in the prompt. Return ONLY the rewritten text, without any introductory phrases or markdown.`;
        return await this._aiService.autoFixText(text, instructions);
    }
}
