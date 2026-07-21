import { IAutoFixResumeUseCase } from "../interfaces/IAutoFixResume.usecase";
import { IAIService } from "../../../../interfaces/IAIService";

export class AutoFixResumeUseCase implements IAutoFixResumeUseCase {
    constructor(private readonly _aiService: IAIService) {}

    async execute(text: string, targetRole: string): Promise<string> {
        if (!text || text.trim().length === 0) {
            throw new Error("Text cannot be empty.");
        }

        const instructions = `You are an expert resume writer. Rewrite the following resume bullet point for a ${targetRole} role. Make it professional, include action verbs, quantify metrics if possible, and keep it under 20 words. DO NOT include any introductory text, just return the fixed bullet point.`;

        const fixedText = await this._aiService.autoFixText(text, instructions);
        
        return fixedText;
    }
}
