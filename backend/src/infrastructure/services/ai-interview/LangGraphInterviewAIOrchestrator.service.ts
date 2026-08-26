import { StateGraph, START, END } from "@langchain/langgraph";
import { Metrics } from "../../observability/Metrics";
import {
	IInterviewAIOrchestrator,
	IInterviewAIOrchestrationInput,
	IInterviewAIOrchestrationResult,
	IAnswerEvaluator,
	IQuestionGenerator,
	AIOrchestrationAction,
	CandidateAnswerQuality,
	AdaptiveInterviewDifficulty,
	IAnswerEvaluationResult,
	IGeneratedQuestionResult,
} from "@application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { assessCandidateAnswerQuality, computeAdaptiveDifficulty } from "../../../shared/utils/answerQuality.util";
import { AnswerQuality } from "@domain/enums/AnswerQuality.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";
import { InterviewDifficulty } from "@domain/enums/InterviewDifficulty.enum";
import { QuestionType } from "@domain/enums/QuestionType.enum";
import { Logger, LogCategory } from '../../logger/logger';

export interface InterviewGraphState {
	input: IInterviewAIOrchestrationInput;
	action?: AIOrchestrationAction;
	answerQuality?: CandidateAnswerQuality;
	adaptiveDifficulty?: AdaptiveInterviewDifficulty;
	nextTopic?: string;
	nextCategory?: InterviewType;
	nextQuestion?: IGeneratedQuestionResult;
	evaluation?: IAnswerEvaluationResult | null;
}

export class LangGraphInterviewAIOrchestrator implements IInterviewAIOrchestrator {
	private graph: ReturnType<StateGraph<InterviewGraphState>['compile']>;

	constructor(
		private readonly answerEvaluator: IAnswerEvaluator,
		private readonly questionGenerator: IQuestionGenerator
	) {
		this.buildGraph();
	}

	private buildGraph() {
		const decideAction = (state: InterviewGraphState) => {
			const t_start = performance.now();
			const { input } = state;
			const answerQuality = assessCandidateAnswerQuality(input.currentQuestion?.text || "", input.candidateAnswer || "");

			// Adaptive difficulty calculation with bounded hysteresis
			const history = [...(input.recentAnswerQualities || []), answerQuality];
			const adaptiveDifficulty = input.adaptiveDifficulty || computeAdaptiveDifficulty(history);

			// Plan completion check: When all planned questions are asked & answered, complete interview
			if (input.interviewPlan && input.interviewPlan.isComplete()) {
				Metrics.recordLatency('langgraph_node_decide_action', performance.now() - t_start, 'local', { action: AIOrchestrationAction.COMPLETE_INTERVIEW });
				return { 
					action: AIOrchestrationAction.COMPLETE_INTERVIEW, 
					answerQuality,
					adaptiveDifficulty,
					nextTopic: "Completed", 
					nextCategory: input.interviewType || InterviewType.TECHNICAL 
				};
			}

			// Smart answer understanding action decision:
			let action = AIOrchestrationAction.ASK_NEXT_QUESTION;
			if (answerQuality === CandidateAnswerQuality.STRONG) {
				action = AIOrchestrationAction.ASK_NEXT_QUESTION;
			} else if (answerQuality === CandidateAnswerQuality.PARTIAL || answerQuality === CandidateAnswerQuality.WEAK || answerQuality === CandidateAnswerQuality.UNCLEAR) {
				// Bounded follow-up: only ask follow-up if within follow-up limit (< 1)
				if (input.followUpCount < 1) {
					action = AIOrchestrationAction.ASK_FOLLOW_UP;
				} else {
					action = AIOrchestrationAction.ASK_NEXT_QUESTION;
				}
			}

			let nextTopic = "General";
			let nextCategory = input.interviewType || InterviewType.TECHNICAL;

			if (action === AIOrchestrationAction.ASK_FOLLOW_UP) {
				nextTopic = input.currentTopic && input.currentTopic !== "None" && input.currentTopic !== "Introductions"
					? input.currentTopic 
					: "General";
				nextCategory = input.interviewType || InterviewType.TECHNICAL;
			} else if (input.interviewPlan) {
				// Plan-driven category & skill progression
				const nextPlanItem = input.interviewPlan.getNextItem();
				if (nextPlanItem) {
					nextTopic = nextPlanItem.skillOrTopic;
					nextCategory = nextPlanItem.category;
				} else {
					nextTopic = input.currentTopic || "Core Competencies";
					nextCategory = input.interviewType || InterviewType.TECHNICAL;
				}
			} else {
				// Fallback topic selection
				const availableTopics = input.availableTopics || [
					'JavaScript Core & Async',
					'React & State Management',
					'Node.js & Backend Architecture',
					'Databases & MongoDB',
					'System Design & REST APIs',
					'TypeScript & Type Safety'
				];
				const uncovered = availableTopics.filter(t => !input.coveredTopics.includes(t));
				
				if (uncovered.length > 0) {
					nextTopic = uncovered[0];
				} else {
					const differentTopics = availableTopics.filter(t => t !== input.currentTopic);
					nextTopic = differentTopics.length > 0 ? differentTopics[0] : availableTopics[0];
				}
			}

			Metrics.recordLatency('langgraph_node_decide_action', performance.now() - t_start, 'local', { action, nextTopic, nextCategory, answerQuality });
			return { action, answerQuality, adaptiveDifficulty, nextTopic, nextCategory };
		};

		const generateFollowUp = async (state: InterviewGraphState) => {
			const t_start = performance.now();
			const { input } = state;
			const nextQuestion = await this.questionGenerator.generateFollowUp({
				interviewContext: input.interviewContext,
				lastQuestion: input.currentQuestion.text,
				lastAnswer: input.candidateAnswer,
				topic: state.nextTopic!,
				interviewType: state.nextCategory || input.interviewType,
				difficulty: input.difficulty,
				adaptiveDifficulty: state.adaptiveDifficulty || AdaptiveInterviewDifficulty.STANDARD,
				customInstructions: input.customInstructions,
				prohibitedTopics: input.prohibitedTopics,
				mentionedTechnologies: input.mentionedTechnologies,
				onSentenceGenerated: input.onSentenceGenerated,
				abortSignal: input.abortSignal
			});
			Metrics.recordLatency('langgraph_node_generate_follow_up', performance.now() - t_start, 'llm');
			return { nextQuestion };
		};

		const generateNextQuestion = async (state: InterviewGraphState) => {
			const t_start = performance.now();
			const { input } = state;
			const nextQuestion = await this.questionGenerator.generateNextQuestion({
				interviewContext: input.interviewContext,
				previousQuestions: input.recentQuestions || [input.currentQuestion.text],
				topic: state.nextTopic!,
				interviewType: state.nextCategory || input.interviewType,
				difficulty: input.difficulty,
				adaptiveDifficulty: state.adaptiveDifficulty || AdaptiveInterviewDifficulty.STANDARD,
				customInstructions: input.customInstructions,
				prohibitedTopics: input.prohibitedTopics,
				mentionedTechnologies: input.mentionedTechnologies,
				onSentenceGenerated: input.onSentenceGenerated,
				abortSignal: input.abortSignal
			});
			Metrics.recordLatency('langgraph_node_generate_next_question', performance.now() - t_start, 'llm');
			return { nextQuestion };
		};

		const routeGeneration = (state: InterviewGraphState) => {
			if (state.action === AIOrchestrationAction.COMPLETE_INTERVIEW) {
				return END;
			}
			return state.action === AIOrchestrationAction.ASK_FOLLOW_UP ? "generate_follow_up" : "generate_next_question";
		};

		const workflow = new StateGraph<InterviewGraphState>({
			channels: {
				input: { value: (left, right) => right || left },
				action: { value: (left, right) => right || left },
				answerQuality: { value: (left, right) => right || left },
				adaptiveDifficulty: { value: (left, right) => right || left },
				nextTopic: { value: (left, right) => right || left },
				nextCategory: { value: (left, right) => right || left },
				nextQuestion: { value: (left, right) => right || left },
			}
		});

		// Add nodes
		workflow.addNode("decide_action", decideAction);
		workflow.addNode("generate_follow_up", generateFollowUp);
		workflow.addNode("generate_next_question", generateNextQuestion);

		// Define edges
		const wf = workflow as unknown as { addEdge: (...args: unknown[]) => unknown, addConditionalEdges: (...args: unknown[]) => unknown, compile: (...args: unknown[]) => unknown };
		wf.addEdge(START, "decide_action");
		wf.addConditionalEdges("decide_action", routeGeneration);
		wf.addEdge("generate_follow_up", END);
		wf.addEdge("generate_next_question", END);

		this.graph = wf.compile() as ReturnType<StateGraph<InterviewGraphState>['compile']>;
	}

	async processAnswer(
		input: IInterviewAIOrchestrationInput
	): Promise<IInterviewAIOrchestrationResult> {
		const t_langgraph = performance.now();

		let resultState: Partial<InterviewGraphState> = {};
		let attempt = 0;
		const MAX_RETRIES = 2;
		
		while (true) {
			attempt++;
			try {
				resultState = await this.graph.invoke({ input });
				break;
			} catch (err: unknown) {
				const error = err as Error;
				if (input.abortSignal?.aborted || error.message === 'Aborted' || error.name === 'AbortError') {
					return { action: AIOrchestrationAction.ASK_NEXT_QUESTION };
				}
				
				const isTransient = error.message?.includes('429') || error.message?.includes('timeout') || error.message?.includes('500') || error.message?.includes('ECONNRESET');
				if (isTransient && attempt <= MAX_RETRIES) {
					Logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] LangGraph LLM failure (attempt ${attempt}/${MAX_RETRIES + 1}): ${error.message}. Retrying...`);
					await new Promise(resolve => setTimeout(resolve, attempt * 1000));
					continue;
				}
				
				Metrics.recordEvent('langgraph_llm_failure', 'FAILURE', { error: error.message, attempts: attempt });
				
				// Deterministic safe fallback
				Metrics.recordCount('langgraph_deterministic_fallback');
				return {
					action: AIOrchestrationAction.ASK_NEXT_QUESTION,
					answerQuality: CandidateAnswerQuality.PARTIAL,
					adaptiveDifficulty: AdaptiveInterviewDifficulty.STANDARD,
					nextTopic: "General",
					nextCategory: input.interviewType || InterviewType.TECHNICAL,
					nextQuestion: {
						text: "I appreciate that. Let's move on. Could you share your thoughts on testing and code quality?",
						type: QuestionType.MAIN,
						category: input.interviewType || InterviewType.TECHNICAL
					}
				};
			}
		}

		Metrics.recordLatency('langgraph_realtime_duration', performance.now() - t_langgraph, 'orchestrator');

		return {
			action: resultState.action || AIOrchestrationAction.ASK_NEXT_QUESTION,
			answerQuality: resultState.answerQuality,
			adaptiveDifficulty: resultState.adaptiveDifficulty || AdaptiveInterviewDifficulty.STANDARD,
			nextQuestion: resultState.nextQuestion,
			nextTopic: resultState.nextTopic,
			nextCategory: resultState.nextCategory
		};
	}
}