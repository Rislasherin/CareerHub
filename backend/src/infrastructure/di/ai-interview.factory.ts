import { JoinInterviewUseCase }  from '@application/usecases/ai-interview/implementations/JoinInterview.usecase';
import { AIInterviewController } from '@presentation/http/controllers/ai-interview/interview.controller';
import {
  interviewRepository,
  liveKitMediaServer,
  rabbitMQBroker,
} from '@infrastructure/di/infra.container';

// ─── Use Cases ────────────────────────────────────────────────────────────────

export const makeJoinInterviewUseCase = () => {
  return new JoinInterviewUseCase(
    interviewRepository,
    liveKitMediaServer,
    rabbitMQBroker,
    process.env.LIVEKIT_URL!
  );
};

// ─── Controllers ──────────────────────────────────────────────────────────────

export const makeAIInterviewController = () => {
  return new AIInterviewController(
    makeJoinInterviewUseCase()
  );
};
