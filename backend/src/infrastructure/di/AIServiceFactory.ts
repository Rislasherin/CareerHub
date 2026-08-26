import { IAIService } from "@application/interfaces/IAIService";
import { GeminiService } from "@infrastructure/services/Resume/Gemini.service";
import { OpenAIService } from "@infrastructure/services/Resume/OpenAI.service";
import { GroqService } from "@infrastructure/services/Resume/Groq.service";
import { FallbackAIService } from "@infrastructure/services/Resume/FallbackAI.service";

export class AIServiceFactory {
    static createdService(): IAIService {
        const provider = process.env.AI_PROVIDER || 'GEMINI';

        const openAIService = new OpenAIService();
        const geminiService = new GeminiService();
        const groqService = new GroqService();

        // High-capacity multi-provider chain
        const secondary = process.env.GROQ_API_KEY ? new FallbackAIService(openAIService, groqService) : openAIService;

        switch(provider.toUpperCase()) {
            case 'GROQ':
                return new FallbackAIService(groqService, geminiService);
            case 'GEMINI':
                return new FallbackAIService(geminiService, secondary);
            case 'OPENAI':
            default:
                return new FallbackAIService(openAIService, geminiService);    
        }
    }
}