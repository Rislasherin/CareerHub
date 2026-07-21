import { IAIService } from "@application/interfaces/IAIService";
import { GeminiService } from "@infrastructure/services/AI/Gemini.service";
import { OpenAIService } from "@infrastructure/services/AI/OpenAI.service";

export class AIServiceFactory {
    static createdService(): IAIService {
        const provider = process.env.AI_PROVIDER || 'OPENAI'

        switch(provider) {
            case 'GEMINI':
                return new GeminiService();
            case 'OPENAI':
            default:
                return new OpenAIService();    
        }
    }
}