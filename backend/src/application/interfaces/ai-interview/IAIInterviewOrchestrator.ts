import { AnswerQuality } from "@domain/enums/AnswerQuality.enum";
import { QuestionType } from "@domain/enums/QuestionType.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";
import { InterviewDifficulty } from "@domain/enums/InterviewDifficulty.enum";
import { InterviewPlan } from "@domain/value-objects/InterviewPlan";

export interface IAnswerEvaluationResult {
  score: number;
  quality: AnswerQuality;
  feedback: string;
  needsFollowUp: boolean;
}

export interface IGeneratedQuestionResult {
  text: string;
  type: QuestionType;
  context?: string;
  category?: InterviewType;
}

export interface IInterviewAIOrchestrationInput {
  sessionId: string;
  candidateAnswer: string;
  currentQuestion: {
    id: string;
    text: string;
    type: QuestionType;
    context?: string;
  };
  interviewContext: string; // The job description, difficulty, required skills, and instructions
  onSentenceGenerated?: (sentence: string) => void;
  currentTopic?: string;
  availableTopics?: string[];
  coveredTopics: string[];
  followUpCount: number;
  recentQuestions: string[];
  recentAnswers?: { question: string; answer: string }[];
  recentAnswerQualities?: CandidateAnswerQuality[];
  mentionedTechnologies?: string[];
  adaptiveDifficulty?: AdaptiveInterviewDifficulty;
  interviewPlan?: InterviewPlan;
  interviewType?: InterviewType;
  difficulty?: InterviewDifficulty;
  customInstructions?: string[];
  prohibitedTopics?: string[];
  timeRemainingMs?: number;
  abortSignal?: AbortSignal;
}

export enum AIOrchestrationAction {
  ASK_FOLLOW_UP = 'ASK_FOLLOW_UP',
  ASK_NEXT_QUESTION = 'ASK_NEXT_QUESTION',
  COMPLETE_INTERVIEW = 'COMPLETE_INTERVIEW'
}

export enum CandidateAnswerQuality {
  STRONG = 'STRONG',
  PARTIAL = 'PARTIAL',
  WEAK = 'WEAK',
  UNCLEAR = 'UNCLEAR'
}

export enum AdaptiveInterviewDifficulty {
  SUPPORTIVE = 'SUPPORTIVE',
  STANDARD = 'STANDARD',
  CHALLENGING = 'CHALLENGING'
}

export interface IInterviewAIOrchestrationResult {
  action: AIOrchestrationAction;
  answerQuality?: CandidateAnswerQuality;
  adaptiveDifficulty?: AdaptiveInterviewDifficulty;
  evaluation?: IAnswerEvaluationResult | null;
  evaluationPromise?: Promise<IAnswerEvaluationResult | null>;
  nextQuestion?: IGeneratedQuestionResult;
  nextCategory?: InterviewType;
  nextTopic?: string;
}

export interface IAnswerEvaluator {
  evaluateAnswer(input: {
    questionText: string;
    candidateAnswer: string;
    interviewContext: string;
    interviewType?: InterviewType;
    difficulty?: InterviewDifficulty;
    abortSignal?: AbortSignal;
  }): Promise<IAnswerEvaluationResult>;
}

export interface IQuestionGenerator {
  generateNextQuestion(input: {
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
  }): Promise<IGeneratedQuestionResult>;

  generateFollowUp(input: {
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
  }): Promise<IGeneratedQuestionResult>;
}

export interface IInterviewAIOrchestrator {
  processAnswer(input: IInterviewAIOrchestrationInput): Promise<IInterviewAIOrchestrationResult>;
}

