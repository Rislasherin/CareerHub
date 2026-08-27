import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { 
	IQuestionGenerator, 
	IGeneratedQuestionResult, 
	AdaptiveInterviewDifficulty 
} from "@application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { NEXT_QUESTION_PROMPT, FOLLOW_UP_PROMPT } from "./prompts";
import { QuestionType } from "@domain/enums/QuestionType.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";
import { InterviewDifficulty } from "@domain/enums/InterviewDifficulty.enum";
import { LLMProviderFactory } from "./LLMProvider.factory";
import { Metrics } from "../../observability/Metrics";
import { ProviderRateLimiter } from "./ProviderRateLimiter";
import { OllamaPriorityQueue } from "./OllamaPriorityQueue";
import { Logger, LogCategory } from '../../logger/logger';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class LangChainQuestionGenerator implements IQuestionGenerator {
	private llm: BaseChatModel;

	constructor(llm: BaseChatModel) {
		this.llm = llm;
	}

	private sanitizeQuestion(raw: string): string {
		let text = raw.trim();
		// Strip markdown quotes, numbering prefixes, bullet points, or labels
		text = text.replace(/^(\d+[\.\)]|\*|-|question:|spoken question:|spoken follow-up:|follow-up:|interviewer:)\s*/i, '');
		text = text.replace(/^["'`]+|["'`]+$/g, '');
		text = text.trim();
		// Ensure it ends with a question mark
		if (text.length > 0 && !text.endsWith('?')) {
			text = text.replace(/[.!;,]+$/, '') + '?';
		}
		return text;
	}

	public isValidQuestion(text: string, topic?: string): boolean {
		const clean = text.trim();
		if (!clean || !clean.endsWith('?')) return false;

		const words = clean.replace(/[?.,!;:"'`]/g, '').trim().split(/\s+/).filter(Boolean);
		if (words.length < 5 || words.length > 35) return false;

		// Must start with valid interview question / conversational imperative prefix
		const startsWithValidPrefix = /^(how|what|why|when|where|which|who|can you|could you|would you|have you|tell me|explain|describe|walk me through|discuss|in what|under what|share an instance|give an example)\b/i.test(clean);
		if (!startsWithValidPrefix) return false;

		// Reject dangling end words before '?'
		const hasDanglingEnding = /\b(a|an|the|of|in|on|at|to|for|by|and|or|specific|certain|such as|about|with|from)\s*\?$/i.test(clean);
		if (hasDanglingEnding) return false;

		// Reject corrupt technology noun phrasing where tech is treated as a generic single noun
		// e.g., "a Node?", "a specific Node?", "a React?", "a Mongo?", "walk me through a Node?"
		const corruptedTechNoun = /\b(a|an|one|every|specific|another)\s+(node|react|mongodb|postgresql|docker|kubernetes|typescript|javascript|express|redux|html|css)\s*\?/i.test(clean);
		if (corruptedTechNoun) return false;

		// Reject truncated 4-word fragments like "walk me through a Node?" or "explain a specific Node?"
		if (/^(can you\s+)?(walk me through|explain|describe)\s+(a|an)\s+[a-z0-9_.-]+\s*\?$/i.test(clean)) {
			return false;
		}

		return true;
	}

	public isCategoryConsistent(text: string, category?: InterviewType): boolean {
		if (!category) return true;
		const clean = text.toLowerCase().trim();

		if (category === InterviewType.BEHAVIORAL) {
			// Reject questions that are purely code syntax trivia or direct definition queries
			const hasSyntaxTrivia = /^(what is the syntax|write a function|what is the return type|what does typeof|what is the output of|define the keyword)\b/i.test(clean);
			if (hasSyntaxTrivia) return false;
			return true;
		}

		if (category === InterviewType.HR) {
			// Reject questions demanding deep low-level code implementation
			const hasDeepCodeDemand = /^(write a function|implement a binary|code a solution|what is the time complexity of)\b/i.test(clean);
			if (hasDeepCodeDemand) return false;
			return true;
		}

		if (category === InterviewType.TECHNICAL) {
			// Technical questions should focus on technical implementation/mechanisms
			return true;
		}

		return true;
	}

	public isDuplicate(newSentence: string, previousQuestions: string[], isFollowUp: boolean = false): boolean {
		if (!previousQuestions || previousQuestions.length === 0) return false;

		const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
		const stem = (w: string) => {
			if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
			if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
			if (w.endsWith('es') && w.length > 4) return w.slice(0, -1); // handles -> handle, manages -> manage
			if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1); // operations -> operation
			return w;
		};
		const normNew = normalize(newSentence);
		if (normNew.length < 5) return false;

		const stopWords = new Set(['can', 'you', 'explain', 'how', 'does', 'what', 'which', 'and', 'the', 'for', 'with', 'in', 'your']);
		const newWords = normNew.split(' ').filter(w => w.length > 2 && !stopWords.has(w)).map(stem);
		const newWordSet = new Set(newWords);

		const similarityThreshold = isFollowUp ? 0.85 : 0.60;

		return previousQuestions.some(q => {
			const normPrev = normalize(q);
			if (!normPrev) return false;
			if (normPrev === normNew) return true;
			if (normPrev.includes(normNew) && normNew.length > 20) return true;
			if (normNew.includes(normPrev) && normPrev.length > 20) return true;

			// Word overlap check on stemmed keywords
			const prevWords = normPrev.split(' ').filter(w => w.length > 2 && !stopWords.has(w)).map(stem);
			const prevWordSet = new Set(prevWords);
			let intersection = 0;
			newWordSet.forEach(w => {
				if (prevWordSet.has(w)) intersection++;
			});
			const totalUnique = new Set([...newWords, ...prevWords]).size;
			const similarity = totalUnique > 0 ? intersection / totalUnique : 0;
			return similarity >= similarityThreshold;
		});
	}

	private getSafeFallbackQuestion(
		category: InterviewType = InterviewType.TECHNICAL,
		topic: string = "Software Engineering",
		difficulty: InterviewDifficulty = InterviewDifficulty.MID,
		previousQuestions: string[] = []
	): IGeneratedQuestionResult {
		const cleanTopic = topic.trim();
		const isGenericTopic = cleanTopic.toLowerCase() === "all skills welcome";
		const displayTopic = isGenericTopic ? "your core technical skills" : cleanTopic;
		
		let fallbackCandidates: string[] = [];

		if (category === InterviewType.BEHAVIORAL) {
			fallbackCandidates = [
				`Can you describe a challenging project situation involving ${displayTopic} and how you resolved it?`,
				`How do you typically collaborate with team members when working on complex ${displayTopic} tasks?`,
				`Can you share an experience where you had to quickly adapt to changes while working with ${displayTopic}?`
			];
		} else if (category === InterviewType.HR) {
			fallbackCandidates = [
				`What inspired you to pursue your current career path and work with ${displayTopic}?`,
				`How do your career goals align with the responsibilities of this role?`,
				`What environment or team culture helps you do your best work when building systems?`
			];
		} else {
			// Technical or Custom
			const topicLower = cleanTopic.toLowerCase();
			if (topicLower.includes("node")) {
				fallbackCandidates = [
					"How does Node.js handle asynchronous operations and manage the event loop under heavy load?",
					"Can you explain how you handle error management and uncaught exceptions in a Node.js backend?",
					"How do streams and buffers work in Node.js, and in what scenarios would you use them?"
				];
			} else if (topicLower.includes("react")) {
				fallbackCandidates = [
					"How does React manage component state, and what strategies do you use to optimize rendering performance?",
					"Can you explain the difference between controlled and uncontrolled components in React?",
					"How do you handle side effects and asynchronous data fetching in modern React applications?"
				];
			} else if (topicLower.includes("postgres") || topicLower.includes("mongo") || topicLower.includes("database")) {
				fallbackCandidates = [
					`How do you design database schemas and optimize query performance when working with ${displayTopic}?`,
					`How do you handle database transactions and data consistency in high-traffic applications?`
				];
			} else {
				fallbackCandidates = [
					`How do you approach designing and implementing scalable solutions using ${displayTopic}?`,
					`What are some common performance bottlenecks in ${displayTopic}, and how do you resolve them?`,
					`Can you walk me through the key architectural considerations when building with ${displayTopic}?`
				];
			}
		}

		for (const candidate of fallbackCandidates) {
			if (!this.isDuplicate(candidate, previousQuestions) && this.isValidQuestion(candidate, cleanTopic) && this.isCategoryConsistent(candidate, category)) {
				return {
					text: candidate,
					type: QuestionType.MAIN,
					context: cleanTopic,
					category
				};
			}
		}

		return {
			text: fallbackCandidates[0],
			type: QuestionType.MAIN,
			context: cleanTopic,
			category
		};
	}

	async generateNextQuestion(input: {
		interviewContext: string;
		previousQuestions: string[];
		topic: string;
		interviewType?: InterviewType;
		difficulty?: InterviewDifficulty;
		adaptiveDifficulty?: AdaptiveInterviewDifficulty;
		customInstructions?: string[];
		prohibitedTopics?: string[];
		mentionedTechnologies?: string[];
		onSentenceGenerated?: (sentence: string) => void;
		abortSignal?: AbortSignal;
	}): Promise<IGeneratedQuestionResult> {
		const t_start = performance.now();
		const config = LLMProviderFactory.getQuestionConfig();
		Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] llm_request_start (Next Question) [Provider: ${config.provider}, Model: ${config.model}, Category: "${input.interviewType || 'TECHNICAL'}", Topic: "${input.topic}", Adaptive: ${input.adaptiveDifficulty || AdaptiveInterviewDifficulty.STANDARD}]`);

		const textChain = NEXT_QUESTION_PROMPT.pipe(this.llm).pipe(new StringOutputParser());
		const previousList = [...(input.previousQuestions || [])];

		const maxAttempts = 3;
		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			const streamAbortController = new AbortController();
			const timeoutSignal = AbortSignal.timeout(config.timeoutMs);
			const signals = [timeoutSignal, streamAbortController.signal];
			if (input.abortSignal) signals.push(input.abortSignal);
			const effectiveSignal = AbortSignal.any(signals);

			let validSentence = "";
			let isFirstToken = true;
			const t_request_start = performance.now();

			try {
				const recentPrev = previousList.slice(-5).map(q => `- ${q}`).join("\n") || "None";
				const customInstStr = (input.customInstructions && input.customInstructions.length > 0)
					? input.customInstructions.join("; ")
					: "Follow standard professional interview best practices.";
				const prohibitedStr = (input.prohibitedTopics && input.prohibitedTopics.length > 0)
					? input.prohibitedTopics.join(", ")
					: "None";
				const mentionedTechStr = (input.mentionedTechnologies && input.mentionedTechnologies.length > 0)
					? input.mentionedTechnologies.join(", ")
					: "None mentioned yet";

				let release: () => void;
				if (config.provider === 'OLLAMA') {
					release = await OllamaPriorityQueue.acquire('HIGH');
				} else {
					release = await ProviderRateLimiter.acquire("QUESTION_LLM", 10);
				}
				let stream;
				try {
					stream = await textChain.stream({
						interviewContext: input.interviewContext,
						previousQuestions: recentPrev,
						topic: input.topic || "General Technical",
						interviewType: input.interviewType || "TECHNICAL",
						difficulty: input.difficulty || "MID",
						adaptiveDifficulty: input.adaptiveDifficulty || AdaptiveInterviewDifficulty.STANDARD,
						customInstructions: customInstStr,
						prohibitedTopics: prohibitedStr,
						mentionedTechnologies: mentionedTechStr,
					}, { signal: effectiveSignal });

					let fullText = "";

					for await (const chunk of stream) {
						if (isFirstToken) {
							const firstTokenTime = performance.now() - t_request_start;
							Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] LATENCY llm_time_to_first_token: ${firstTokenTime.toFixed(2)}ms`);
							isFirstToken = false;
						}
						fullText += chunk;

						// Detect the first sentence boundary
						const match = fullText.match(/^(.*?[.?!])(\s+|$)/);
						if (match) {
							const candidateSentence = this.sanitizeQuestion(match[1]);
							const isDuplicateQ = this.isDuplicate(candidateSentence, previousList, false);
							const isSemanticValid = this.isValidQuestion(candidateSentence, input.topic);
							const isCategoryOk = this.isCategoryConsistent(candidateSentence, input.interviewType);

							if (isDuplicateQ) {
								Logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] LLM produced duplicate question (attempt ${attempt}/${maxAttempts}): "${candidateSentence}". Retrying...`);
								break;
							}

							if (!isSemanticValid || !isCategoryOk) {
								Logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] LLM produced off-topic/invalid question (attempt ${attempt}/${maxAttempts}): "${candidateSentence}". Retrying...`);
								break;
							}

							validSentence = candidateSentence;
							streamAbortController.abort();
							break;
						}
					}

					if (!validSentence && fullText.trim().length > 0) {
						const sanitized = this.sanitizeQuestion(fullText.trim());
						const isDuplicateQ = this.isDuplicate(sanitized, previousList, false);
						const isSemanticValid = this.isValidQuestion(sanitized, input.topic);
						const isCategoryOk = this.isCategoryConsistent(sanitized, input.interviewType);

						if (!isDuplicateQ && isSemanticValid && isCategoryOk) {
							validSentence = sanitized;
						}
					}
				} finally {
					release(); // release after stream generation and processing is complete
				}

				if (validSentence) {
					if (input.onSentenceGenerated) {
						input.onSentenceGenerated(validSentence);
					}
					Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] llm_request_end (Next Question) [Duration: ${(performance.now() - t_request_start).toFixed(2)}ms]`);
					return {
						text: validSentence,
						type: QuestionType.MAIN,
						context: input.topic,
						category: input.interviewType || InterviewType.TECHNICAL
					};
				}
			} catch (err: unknown) {
				const error = err as { response?: { headers?: Record<string, string> } };
				streamAbortController.abort();
				Logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] Error during next question generation attempt ${attempt}/${maxAttempts}:`, err);
				
				if (error?.response?.headers && error.response.headers['retry-after']) {
					const retryAfterSec = parseInt(error.response.headers['retry-after'], 10);
					if (!isNaN(retryAfterSec)) ProviderRateLimiter.applyProviderPause("QUESTION_LLM", retryAfterSec);
				}

				if (attempt < maxAttempts) {
					const backoffMs = attempt * 1500;
					Metrics.recordEvent('llm_question_retry', 'FAILURE', { attempt, type: 'next_question' });
					await delay(backoffMs);
				}
			}
		}

		Logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] All LLM next question attempts failed. Falling back to validated topic question.`);
		const fallbackQuestion = this.getSafeFallbackQuestion(
			input.interviewType,
			input.topic,
			input.difficulty,
			previousList
		);

		if (input.onSentenceGenerated) {
			input.onSentenceGenerated(fallbackQuestion.text);
		}
		Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] llm_request_end (Fallback Next Question) [Duration: ${(performance.now() - t_start).toFixed(2)}ms]`);
		return fallbackQuestion;
	}

	async generateFollowUp(input: {
		interviewContext: string;
		lastQuestion: string;
		lastAnswer: string;
		topic: string;
		interviewType?: InterviewType;
		difficulty?: InterviewDifficulty;
		adaptiveDifficulty?: AdaptiveInterviewDifficulty;
		customInstructions?: string[];
		prohibitedTopics?: string[];
		mentionedTechnologies?: string[];
		onSentenceGenerated?: (sentence: string) => void;
		abortSignal?: AbortSignal;
	}): Promise<IGeneratedQuestionResult> {
		const t_start = performance.now();
		const config = LLMProviderFactory.getQuestionConfig();
		Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] llm_request_start (Follow-Up) [Provider: ${config.provider}, Model: ${config.model}, Category: "${input.interviewType || 'TECHNICAL'}", Topic: "${input.topic}", Adaptive: ${input.adaptiveDifficulty || AdaptiveInterviewDifficulty.STANDARD}]`);

		const textChain = FOLLOW_UP_PROMPT.pipe(this.llm).pipe(new StringOutputParser());
		const previousList = [input.lastQuestion];

		const maxAttempts = 3;
		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			const streamAbortController = new AbortController();
			const timeoutSignal = AbortSignal.timeout(config.timeoutMs);
			const signals = [timeoutSignal, streamAbortController.signal];
			if (input.abortSignal) signals.push(input.abortSignal);
			const effectiveSignal = AbortSignal.any(signals);

			let validSentence = "";
			let isFirstToken = true;
			const t_request_start = performance.now();

			try {
				const customInstStr = (input.customInstructions && input.customInstructions.length > 0)
					? input.customInstructions.join("; ")
					: "Follow standard professional interview best practices.";
				const prohibitedStr = (input.prohibitedTopics && input.prohibitedTopics.length > 0)
					? input.prohibitedTopics.join(", ")
					: "None";
				const mentionedTechStr = (input.mentionedTechnologies && input.mentionedTechnologies.length > 0)
					? input.mentionedTechnologies.join(", ")
					: "None mentioned yet";

				let release: () => void;
				if (config.provider === 'OLLAMA') {
					release = await OllamaPriorityQueue.acquire('HIGH');
				} else {
					release = await ProviderRateLimiter.acquire("QUESTION_LLM", 10);
				}
				let stream;
				try {
					stream = await textChain.stream({
						interviewContext: input.interviewContext,
						lastQuestion: input.lastQuestion,
						lastAnswer: input.lastAnswer,
						topic: input.topic || "General Technical",
						interviewType: input.interviewType || "TECHNICAL",
						difficulty: input.difficulty || "MID",
						adaptiveDifficulty: input.adaptiveDifficulty || AdaptiveInterviewDifficulty.STANDARD,
						customInstructions: customInstStr,
						prohibitedTopics: prohibitedStr,
						mentionedTechnologies: mentionedTechStr,
					}, { signal: effectiveSignal });

					let fullText = "";

					for await (const chunk of stream) {
						if (isFirstToken) {
							const firstTokenTime = performance.now() - t_request_start;
							Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] LATENCY llm_time_to_first_token: ${firstTokenTime.toFixed(2)}ms`);
							isFirstToken = false;
						}
						fullText += chunk;

						const match = fullText.match(/^(.*?[.?!])(\s+|$)/);
						if (match) {
							const candidateSentence = this.sanitizeQuestion(match[1]);
							const boundaryTime = performance.now() - t_request_start;
							Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] LATENCY llm_time_to_first_valid_boundary: ${boundaryTime.toFixed(2)}ms -> Candidate: "${candidateSentence}"`);

							if (input.abortSignal?.aborted || timeoutSignal.aborted) {
								Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Follow-up generation aborted due to timeout.`);
								throw new Error("Aborted");
							}

							if (!this.isValidQuestion(candidateSentence, input.topic) || !this.isCategoryConsistent(candidateSentence, input.interviewType)) {
								Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Follow-up candidate rejected by semantic validator: "${candidateSentence}"`);
								continue;
							}

							if (this.isDuplicate(candidateSentence, previousList)) {
								Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Follow-up candidate duplicate detected and rejected: "${candidateSentence}"`);
								previousList.push(candidateSentence);
								continue;
							}

							validSentence = candidateSentence;
							Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Follow-up accepted: "${validSentence}"`);
							if (input.onSentenceGenerated) {
								input.onSentenceGenerated(validSentence);
							}
							streamAbortController.abort();
							Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] llm_stream_aborted (Stream cancelled cleanly after follow-up acceptance)`);
							break;
						}
					}

					if (!validSentence && fullText.trim().length > 0) {
						const candidateFull = this.sanitizeQuestion(fullText);
						if (this.isValidQuestion(candidateFull, input.topic) && this.isCategoryConsistent(candidateFull, input.interviewType) && !this.isDuplicate(candidateFull, previousList)) {
							validSentence = candidateFull;
							Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Full text follow-up accepted: "${validSentence}"`);
							if (input.onSentenceGenerated) {
								input.onSentenceGenerated(validSentence);
							}
						} else {
							Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Full text follow-up rejected (invalid or duplicate): "${candidateFull}"`);
							previousList.push(candidateFull);
						}
					}
				} finally {
					release();
				}

			} catch (err: unknown) {
				const error = err as { response?: { headers?: Record<string, string> } };
				if (!validSentence) {
					if (timeoutSignal.aborted || input.abortSignal?.aborted) {
						Logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Follow-up generation timed out after ${config.timeoutMs}ms`);
					} else {
						Logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Follow-up Generation Error (Attempt ${attempt}):`, err);
					}
					
					if (error?.response?.headers && error.response.headers['retry-after']) {
						const retryAfterSec = parseInt(error.response.headers['retry-after'], 10);
						if (!isNaN(retryAfterSec)) ProviderRateLimiter.applyProviderPause("QUESTION_LLM", retryAfterSec);
					}

					if (attempt < maxAttempts && !input.abortSignal?.aborted) {
						const backoffMs = attempt * 1500;
						Metrics.recordEvent('llm_question_retry', 'FAILURE', { attempt, type: 'follow_up' });
						await delay(backoffMs);
					}
				}
			}

			if (validSentence) {
				const t_end = performance.now();
				Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] LATENCY llm_generation_duration: ${(t_end - t_request_start).toFixed(2)}ms`);
				Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] LATENCY question_generation_total_duration: ${(t_end - t_start).toFixed(2)}ms`);
				return {
					text: validSentence,
					type: QuestionType.FOLLOW_UP,
					context: input.topic,
					category: input.interviewType || InterviewType.TECHNICAL
				};
			}
		}

		Logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] All LLM follow-up attempts failed. Skipping follow-up.`);
		Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] LATENCY question_generation_total_duration (Failed): ${(performance.now() - t_start).toFixed(2)}ms`);

		const isGenericTopic = input.topic.toLowerCase() === "all skills welcome";
		const displayTopic = isGenericTopic ? "your core technical skills" : input.topic;

		// Safe fallback follow-up
		let fallbackText = `Can you expand on the architectural trade-offs and error handling strategies you used with ${displayTopic}?`;
		if (input.interviewType === InterviewType.BEHAVIORAL) {
			fallbackText = `Can you share more details about your specific actions during that situation with ${displayTopic} and what the outcome was?`;
		} else if (input.interviewType === InterviewType.HR) {
			fallbackText = `How has your experience with ${displayTopic} influenced your long-term career goals and role expectations?`;
		}
		Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Using safe fallback follow-up: "${fallbackText}"`);
		if (input.onSentenceGenerated) {
			input.onSentenceGenerated(fallbackText);
		}

		return {
			text: fallbackText,
			type: QuestionType.FOLLOW_UP,
			context: input.topic,
			category: input.interviewType
		};
	}
}
