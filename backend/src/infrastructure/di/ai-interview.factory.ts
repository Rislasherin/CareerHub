import { aiInterviewRepository, interviewRepository, jobRepository, studentRepository } from "./infra.container";
import { StartAIInterviewUseCase } from "@application/usecases/ai-interview/implementations/StartAIInterviewUseCase";
import { ProcessStudentAnswerUseCase } from "@application/usecases/ai-interview/implementations/ProcessStudentAnswerUseCase";
import { EvaluateAnswerUseCase } from "@application/usecases/ai-interview/implementations/EvaluateAnswerUseCase";
import { GenerateFollowUpUseCase } from "@application/usecases/ai-interview/implementations/GenerateFollowUpUseCase";
import { CompleteAIInterviewUseCase } from "@application/usecases/ai-interview/implementations/CompleteAIInterviewUseCase";

import { DistributedLockService } from "@infrastructure/distributed/DistributedLockService";

import { LangChainAnswerEvaluator } from "@infrastructure/services/ai-interview/LangChainAnswerEvaluator.service";
import { LangChainQuestionGenerator } from "@infrastructure/services/ai-interview/LangChainQuestionGenerator.service";
import { LangGraphInterviewAIOrchestrator } from "@infrastructure/services/ai-interview/LangGraphInterviewAIOrchestrator.service";
import { AIInterviewController } from "@presentation/http/controllers/student/ai-interview.controller";

import { LiveKitService } from "@infrastructure/services/livekit/LiveKit.service";
import { env } from "@infrastructure/config/env.validator";
import { LLMProviderFactory } from "@infrastructure/services/ai-interview/LLMProvider.factory";
import { RabbitMQBroker } from "@infrastructure/messaging/RabbitMQBroker";

// 1. Instantiate the concrete infrastructure AI services via LLMProviderFactory
const questionLLM = LLMProviderFactory.createQuestionLLM();
const evaluationLLM = LLMProviderFactory.createEvaluationLLM();

export const aiAnswerEvaluator = new LangChainAnswerEvaluator(evaluationLLM);
export const aiQuestionGenerator = new LangChainQuestionGenerator(questionLLM);
export const aiOrchestrator = new LangGraphInterviewAIOrchestrator(aiAnswerEvaluator, aiQuestionGenerator);
export const liveKitService = new LiveKitService();
export const rabbitMQBroker = new RabbitMQBroker();

// 2. Inject them into the Application Use Cases
import { logger } from "@infrastructure/logger/logger";

export const makeStartAIInterviewUseCase = () => {
  return new StartAIInterviewUseCase(
    aiInterviewRepository, 
    interviewRepository, 
    aiQuestionGenerator, 
    liveKitService, 
    rabbitMQBroker, 
    jobRepository, 
    studentRepository,
    logger,
    env.LIVEKIT_URL
  );
};

export const makeProcessStudentAnswerUseCase = () => {
  return new ProcessStudentAnswerUseCase(
    aiInterviewRepository, 
    aiOrchestrator, 
    rabbitMQBroker, 
    new DistributedLockService(),
    logger
  );
};

export const makeEvaluateAnswerUseCase = () => {
  return new EvaluateAnswerUseCase(aiInterviewRepository);
};

export const makeGenerateFollowUpUseCase = () => {
  return new GenerateFollowUpUseCase(aiInterviewRepository);
};

export const makeCompleteAIInterviewUseCase = () => {
  return new CompleteAIInterviewUseCase(
    aiInterviewRepository, 
    interviewRepository, 
    liveKitService,
    logger
  );
};

import { AIWorkerOrchestratorUseCase } from "@application/usecases/ai-interview/implementations/AIWorkerOrchestratorUseCase";
import { IAIWorkerOrchestratorUseCase } from "@application/usecases/ai-interview/interfaces/IAIWorkerOrchestratorUseCase";
import { AIInterviewerAgent } from "@infrastructure/services/livekit/AIInterviewerAgent";
import { CartesiaTTSService } from "@infrastructure/services/tts/CartesiaTTSService";
import { TTSQueueService } from "@infrastructure/services/ai-interview/TTSQueue.service";

import { DeepgramSTTService } from "@infrastructure/services/stt/DeepgramSTTService";

export const makeAIWorkerOrchestrator = (): IAIWorkerOrchestratorUseCase => {
  const audioTransport = new AIInterviewerAgent();
  const ttsService = new CartesiaTTSService();
  const sttService = new DeepgramSTTService();
  const ttsQueue = new TTSQueueService(ttsService, audioTransport);
  return new AIWorkerOrchestratorUseCase(
    audioTransport, 
    ttsService, 
    sttService, 
    ttsQueue, 
    aiQuestionGenerator, 
    makeProcessStudentAnswerUseCase(), 
    aiInterviewRepository,
    interviewRepository,
    studentRepository,
    jobRepository,
    logger
  );
};

export const makeAIInterviewController = () => {
  return new AIInterviewController(
    makeStartAIInterviewUseCase(),
    makeProcessStudentAnswerUseCase(),
    liveKitService,
    aiInterviewRepository
  );
}

export { aiInterviewRepository, interviewRepository };
