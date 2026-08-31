import { AIPracticeInterviewRepository } from "@infrastructure/repositories/ai-practice/AIPracticeInterview.repository";
import { CreateAIPracticeInterviewUseCase } from "@application/usecases/ai-practice/implementations/CreateAIPracticeInterview.usecase";
import { GetAIPracticeInterviewUseCase } from "@application/usecases/ai-practice/implementations/GetAIPracticeInterview.usecase";
import { StartPracticeSessionUseCase } from "@application/usecases/ai-practice/implementations/StartPracticeSession.usecase";
import { SubmitPracticeAnswerUseCase } from "@application/usecases/ai-practice/implementations/SubmitPracticeAnswer.usecase";
import { GetPracticeRoomTokenUseCase } from "@application/usecases/ai-practice/implementations/GetPracticeRoomToken.usecase";
import { AIPracticeController } from "@presentation/http/controllers/student/ai-practice.controller";
import { LLMProviderFactory } from "@infrastructure/services/ai-interview/LLMProvider.factory";
import { LangChainPracticeQuestionGenerator } from "@infrastructure/services/ai-practice/LangChainPracticeQuestionGenerator";
import { LangChainPracticeAnswerEvaluator } from "@infrastructure/services/ai-practice/LangChainPracticeAnswerEvaluator";
import { LiveKitPracticeRoomTokenService } from "@infrastructure/services/ai-practice/LiveKitPracticeRoomTokenService";
import { PracticeDeepgramAdapter } from "@infrastructure/services/ai-practice/PracticeDeepgramAdapter";
import { PracticeCartesiaAdapter } from "@infrastructure/services/ai-practice/PracticeCartesiaAdapter";
import { PracticeLiveKitAdapter } from "@infrastructure/services/ai-practice/PracticeLiveKitAdapter";
import { LangChainPracticeInterviewBrain } from "@infrastructure/services/ai-practice/LangChainPracticeInterviewBrain";
import { LangChainPracticeInterviewFeedbackGenerator } from "@infrastructure/services/ai-practice/LangChainPracticeInterviewFeedbackGenerator";
import { ProcessPracticeConversationTurnUseCase } from "@application/usecases/ai-practice/implementations/ProcessPracticeConversationTurn.usecase";
import { CompletePracticeInterviewUseCase } from "@application/usecases/ai-practice/implementations/CompletePracticeInterview.usecase";
import { GeneratePracticeFeedbackUseCase } from "@application/usecases/ai-practice/implementations/GeneratePracticeFeedback.usecase";

// Singleton repository
export const aiPracticeInterviewRepository = new AIPracticeInterviewRepository();

// Reuse shared LLM infrastructure — question and evaluation models
// These are the same provider instances used by the HR side;
// Student AI Practice depends only on the shared infrastructure abstraction,
// NOT on any HR interview business logic.
const practiceQuestionLLM = LLMProviderFactory.createQuestionLLM();
const practiceEvaluationLLM = LLMProviderFactory.createEvaluationLLM();

export const practiceQuestionGenerator = new LangChainPracticeQuestionGenerator(practiceQuestionLLM);
export const practiceAnswerEvaluator = new LangChainPracticeAnswerEvaluator(practiceEvaluationLLM);
export const practiceRoomTokenService = new LiveKitPracticeRoomTokenService();
export const practiceSTTService = new PracticeDeepgramAdapter();
export const practiceTTSService = new PracticeCartesiaAdapter();
// The brain LLM needs structured output with a complete JSON response (~300+ tokens).
// It CANNOT share the question LLM (AI_QUESTION_MAX_TOKENS=48 would truncate the JSON).
// We use the evaluation provider as the base but create a fresh instance with
// a higher token budget so withStructuredOutput always receives a complete JSON object.
export const practiceBrainLLM = LLMProviderFactory.createBrainLLM();
// Brain requires the question generator for Stage-2 question generation.
// This removes the 50s latency caused by the old monolithic structured output.
export const practiceInterviewBrain = new LangChainPracticeInterviewBrain(
  practiceBrainLLM,
  practiceQuestionGenerator
);
export const practiceFeedbackGenerator = new LangChainPracticeInterviewFeedbackGenerator(LLMProviderFactory);

import { PracticeWorkerOrchestratorUseCase } from "@application/usecases/ai-practice/implementations/PracticeWorkerOrchestratorUseCase";

export const makeProcessPracticeConversationTurnUseCase = () => {
  return new ProcessPracticeConversationTurnUseCase(aiPracticeInterviewRepository, practiceInterviewBrain);
};

export const makePracticeWorkerOrchestrator = () => {
  return new PracticeWorkerOrchestratorUseCase(
    new PracticeLiveKitAdapter(),
    new PracticeDeepgramAdapter(),
    new PracticeCartesiaAdapter(),
    makeProcessPracticeConversationTurnUseCase(),
    aiPracticeInterviewRepository,
    practiceQuestionGenerator,
    makeCompletePracticeInterviewUseCase(),
    makeGeneratePracticeFeedbackUseCase()
  );
};


export const makeCreateAIPracticeInterviewUseCase = () => {
  return new CreateAIPracticeInterviewUseCase(aiPracticeInterviewRepository);
};

export const makeGetAIPracticeInterviewUseCase = () => {
  return new GetAIPracticeInterviewUseCase(aiPracticeInterviewRepository);
};

export const makeStartPracticeSessionUseCase = () => {
  return new StartPracticeSessionUseCase(aiPracticeInterviewRepository, practiceQuestionGenerator);
};

export const makeSubmitPracticeAnswerUseCase = () => {
  return new SubmitPracticeAnswerUseCase(
    aiPracticeInterviewRepository,
    practiceQuestionGenerator,
    practiceAnswerEvaluator
  );
};

export const makeGetPracticeRoomTokenUseCase = () => {
  return new GetPracticeRoomTokenUseCase(
    aiPracticeInterviewRepository,
    practiceRoomTokenService
  );
};

export const makeCompletePracticeInterviewUseCase = () => {
  return new CompletePracticeInterviewUseCase(aiPracticeInterviewRepository);
};

export const makeGeneratePracticeFeedbackUseCase = () => {
  return new GeneratePracticeFeedbackUseCase(aiPracticeInterviewRepository, practiceFeedbackGenerator);
};

export const makeAIPracticeController = () => {
  return new AIPracticeController(
    makeCreateAIPracticeInterviewUseCase(),
    makeGetAIPracticeInterviewUseCase(),
    makeStartPracticeSessionUseCase(),
    makeSubmitPracticeAnswerUseCase(),
    makeGetPracticeRoomTokenUseCase(),
    aiPracticeInterviewRepository,
    makeGeneratePracticeFeedbackUseCase()
  );
};
