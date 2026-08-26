import { CandidateAnswerQuality, AdaptiveInterviewDifficulty } from "../../application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { Logger, LogCategory } from "../../infrastructure/logger/logger";

export function computeAdaptiveDifficulty(recentQualities: CandidateAnswerQuality[]): AdaptiveInterviewDifficulty {
	try {
		if (!recentQualities || recentQualities.length < 2) {
			return AdaptiveInterviewDifficulty.STANDARD;
		}

		const window = recentQualities.slice(-5);
		const strongCount = window.filter(q => q === CandidateAnswerQuality.STRONG).length;
		const weakOrUnclearCount = window.filter(q => q === CandidateAnswerQuality.WEAK || q === CandidateAnswerQuality.UNCLEAR).length;
		const total = window.length;

		const lastTwo = window.slice(-2);
		const lastTwoStrong = lastTwo.length === 2 && lastTwo.every(q => q === CandidateAnswerQuality.STRONG);
		const lastTwoWeak = lastTwo.length === 2 && lastTwo.every(q => q === CandidateAnswerQuality.WEAK || q === CandidateAnswerQuality.UNCLEAR);

		// 1. Sustained Strong Performance -> CHALLENGING
		if (lastTwoStrong && (strongCount / total) >= 0.6 && weakOrUnclearCount === 0) {
			return AdaptiveInterviewDifficulty.CHALLENGING;
		}

		// 2. Sustained Weak/Struggling Performance -> SUPPORTIVE
		if (lastTwoWeak && (weakOrUnclearCount / total) >= 0.6 && strongCount === 0) {
			return AdaptiveInterviewDifficulty.SUPPORTIVE;
		}

		// 3. Mixed / Balanced / Transitions -> STANDARD
		return AdaptiveInterviewDifficulty.STANDARD;
	} catch (err) {
		Logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] Error in computeAdaptiveDifficulty, defaulting to STANDARD:`, err);
		return AdaptiveInterviewDifficulty.STANDARD;
	}
}

export function assessCandidateAnswerQuality(questionText: string, candidateAnswer: string): CandidateAnswerQuality {
	try {
		const cleanAnswer = (candidateAnswer || "").trim().toLowerCase().replace(/[^\w\s']/g, '').replace(/\s+/g, ' ');
		const words = cleanAnswer.split(' ').filter(Boolean);
		const wordCount = words.length;
		const cleanQuestion = (questionText || "").trim().toLowerCase();

		// 1. Unclear / Incoherent / Filler-only detection
		if (wordCount === 0 || cleanAnswer.length < 2) {
			return CandidateAnswerQuality.UNCLEAR;
		}

		const fillerWords = new Set(['uh', 'um', 'hmm', 'ah', 'dunno', 'idk', 'asdf', 'whatever', 'thing', 'things', 'stuff', 'maybe', 'kinda', 'sorta', 'like']);
		const isAllFiller = words.length > 0 && words.every(w => fillerWords.has(w));
		const isPureFiller = /^(uh|um|hmm|ah|dunno|idk|asdf|whatever|something like that|not sure really|i guess so)$/i.test(cleanAnswer);
		if (isAllFiller || isPureFiller) {
			return CandidateAnswerQuality.UNCLEAR;
		}

		// 2. Direct Identification / Factoid Questions (e.g. "Which library...", "What caching database...")
		const isDirectIdentificationQuestion = /^(which|what\s+([a-z]+\s+)?(tool|library|framework|database|cache|caching|tech stack|stack|orm|language|method|protocol)|have you used|did you use|do you use|name a|name the)\b/i.test(cleanQuestion);
		
		// Common concise valid technical keywords/phrases
		const isKnownTechnicalKeyword = /^(jwt|json web token|redis|mongodb|postgres|postgresql|mysql|sqlite|docker|kubernetes|node|nodejs|react|redux|zustand|express|fastify|nestjs|graphql|rest|grpc|kafka|rabbitmq|git|aws|gcp|azure|typescript|javascript|python|go|java|c\+\+|html|css|tailwind|yes|no|none|true|false)\b/i.test(cleanAnswer);

		if (isDirectIdentificationQuestion) {
			if (isKnownTechnicalKeyword || wordCount >= 1) {
				return CandidateAnswerQuality.STRONG;
			}
		}

		// 3. Open-Ended Explanation / Deep-Dive Questions (e.g. "Explain how...", "How does...", "Walk me through...")
		const isExplanationQuestion = /^(explain|how does|how would you|describe|walk me through|what is the difference|compare|deep dive|what are the trade-offs|can you (explain|describe|walk me through|tell me)|could you (explain|describe|walk me through))/i.test(cleanQuestion);

		if (isExplanationQuestion) {
			if (wordCount < 4) {
				return CandidateAnswerQuality.WEAK;
			}
			if (wordCount < 14) {
				return CandidateAnswerQuality.PARTIAL;
			}
			return CandidateAnswerQuality.STRONG;
		}

		// 4. General Questions
		if (wordCount < 4) {
			return isKnownTechnicalKeyword ? CandidateAnswerQuality.PARTIAL : CandidateAnswerQuality.WEAK;
		}
		if (wordCount < 12) {
			return CandidateAnswerQuality.PARTIAL;
		}
		return CandidateAnswerQuality.STRONG;
	} catch (err) {
		Logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] Error in assessCandidateAnswerQuality, falling back to STRONG:`, err);
		return CandidateAnswerQuality.STRONG;
	}
}
