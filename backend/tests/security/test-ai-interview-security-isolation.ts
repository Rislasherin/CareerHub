import 'dotenv/config';
import { Types } from 'mongoose';
import { connectDB } from "../../src/infrastructure/database/mongoose/connect";
import { InterviewStatus } from "../../src/domain/enums/InterviewStatus.enum";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { InterviewDifficulty } from "../../src/domain/enums/InterviewDifficulty.enum";
import { InterviewConfiguration } from "../../src/domain/value-objects/InterviewConfiguration";
import { IInterviewRepository } from "../../src/domain/repositories/IInterviewRepository";
import { StartAIInterviewUseCase } from "../../src/application/usecases/ai-interview/implementations/StartAIInterviewUseCase";
import { ProcessStudentAnswerUseCase } from "../../src/application/usecases/ai-interview/implementations/ProcessStudentAnswerUseCase";
import { StartAIInterviewInputDTO } from "../../src/application/dtos/ai-interview/StartAIInterview.dto";
import { ProcessStudentAnswerInputDTO } from "../../src/application/dtos/ai-interview/ProcessStudentAnswer.dto";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';
// Mocks
const mockLiveKitService = {
  generateToken: async (sessionId: string, studentId: string, studentName: string) => `mock_token_${studentId}`,
  generateWorkerToken: async (sessionId: string) => `mock_worker_token_${sessionId}`,
  createRoom: async () => {},
  deleteRoom: async () => {},
  getRoom: async () => ({})
};

const mockMessageBroker = {
  publish: async (queue: string, data: any) => { Logger.info(LogCategory.SYSTEM_INFO, `[Mock Broker] Published to ${queue}`, data); },
  subscribe: async () => {},
  connect: async () => {},
  close: async () => {}
};

const mockQuestionGenerator = {
  generateNextQuestion: async () => ({
    text: "MOCK_SECURITY_QUESTION",
    type: InterviewType.TECHNICAL
  })
};

const mockOrchestrator = {
  processAnswer: async () => ({
    action: 'ASK_NEXT_QUESTION',
    nextQuestion: { text: "MOCK_FOLLOWUP", type: InterviewType.TECHNICAL }
  }),
  startWorker: async () => {},
  stopWorker: async () => {}
};

class InMemoryInterviewRepository implements IInterviewRepository {
  private _store: Map<string, any> = new Map();

  async findById(id: string) { return this._store.get(id) || null; }
  async create(interview: any) { 
    const domain = this._mapToDomain(interview);
    this._store.set(domain.id, domain);
    return domain;
  }
  async update(id: string, interview: any) { this._store.set(id, interview); return interview; }
  async save(entity: any) { this._store.set(entity.id, entity); return entity; }
  async delete(id: string) { this._store.delete(id); }
  async count() { return this._store.size; }
  async findByCompanyId(companyId: string) { return Array.from(this._store.values()).filter(i => i.companyId === companyId); }
  async findByStudentId(studentId: string) { return Array.from(this._store.values()).filter(i => i.studentId === studentId); }
  async findByJobId(jobId: string) { return Array.from(this._store.values()).filter(i => i.jobId === jobId); }
  
  private _mapToDomain(doc: any): any {
    return {
      id: doc._id?.toString() || doc.id,
      jobId: doc.jobId?.toString(),
      studentId: doc.studentId?.toString(),
      companyId: doc.companyId?.toString(),
      status: doc.status,
      type: doc.type,
      scheduledAt: doc.scheduledAt,
      configuration: new InterviewConfiguration({
        durationMinutes: doc.configuration?.durationMinutes || 30,
        difficulty: doc.configuration?.difficulty || InterviewDifficulty.MID,
        prohibitedTopics: doc.configuration?.prohibitedTopics || [],
        customInstructions: doc.configuration?.customInstructions || [],
        totalQuestions: doc.configuration?.totalQuestions || 5,
        types: doc.configuration?.types || [doc.type || InterviewType.TECHNICAL]
      }),
      isJoinable: () => [InterviewStatus.SCHEDULED, InterviewStatus.WAITING, InterviewStatus.IN_PROGRESS].includes(doc.status),
      markAsInProgress: function() { this.status = InterviewStatus.IN_PROGRESS; },
      markAsWaiting: function() { this.status = InterviewStatus.WAITING; },
      markAsCompleted: function() { this.status = InterviewStatus.COMPLETED; },
      getDurationMinutes: () => doc.configuration?.durationMinutes || 30,
    };
  }
}

class InMemoryAIInterviewRepository {
  private _store: Map<string, any> = new Map();
  async findById(id: string) { return this._store.get(id) || null; }
  async findByInterviewId(id: string) { return Array.from(this._store.values()).find(s => s.interviewId === id) || null; }
  async create(session: any) { this._store.set(session.id, session); return session; }
  async update(id: string, session: any) { this._store.set(id, session); }
  
  async recordAnswerAtomically(sessionId: string, questionId: string, answer: string): Promise<boolean> {
    const session = this._store.get(sessionId);
    if (!session) return false;
    const q = session.questions.find((q: any) => q.id === questionId);
    if (!q || q.candidateAnswer) return false; // Simulates the DB atomic check
    // We DON'T mutate the in-memory session here because ProcessStudentAnswerUseCase.execute
    // will call session.recordAnswer() immediately after this succeeds.
    return true;
  }

  async advanceInterviewAtomically(sessionId: string, nextQuestion: any, newPhase: any, nextTopic: string, coveredTopics: string[], score: number): Promise<boolean> {
    const session = this._store.get(sessionId);
    if (!session) return false;
    try {
      session.addQuestion(nextQuestion);
      session._phase = newPhase; // bypass private for test mock if needed
      session._currentTopic = nextTopic;
      session._coveredTopics = coveredTopics;
      return true;
    } catch(e) { return false; }
  }
}

async function runSecurityTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "=== Feature 17 Security Isolation Tests ===\n");
  
  const interviewRepo = new InMemoryInterviewRepository();
  const aiInterviewRepository = new InMemoryAIInterviewRepository();
  
  const startUseCase = new StartAIInterviewUseCase(
    aiInterviewRepository as any,
    interviewRepo,
    mockQuestionGenerator as any,
    mockLiveKitService as any,
    mockMessageBroker as any
  );

  const processUseCase = new ProcessStudentAnswerUseCase(
    aiInterviewRepository as any,
    mockOrchestrator as any,
    mockMessageBroker as any
  );

  const studentAId = new Types.ObjectId().toString();
  const studentBId = new Types.ObjectId().toString(); // Malicious Actor
  const companyId = new Types.ObjectId().toString();
  const jobId = new Types.ObjectId().toString();

  // Create Parent Interview for Student A
  const interviewA = await interviewRepo.create({
    _id: new Types.ObjectId(),
    jobId,
    studentId: studentAId,
    companyId,
    status: InterviewStatus.SCHEDULED,
    type: InterviewType.TECHNICAL,
    scheduledAt: new Date(),
    configuration: { durationMinutes: 10 }
  });

  Logger.info(LogCategory.SYSTEM_INFO, "1. Starting Session for Student A...");
  const startInputA: StartAIInterviewInputDTO = {
    interviewId: interviewA.id,
    studentId: studentAId
  };
  const startResultA = await startUseCase.execute(startInputA);
  const sessionId = startResultA.sessionId;
  Logger.info(LogCategory.SYSTEM_INFO, `✅ Session A Created. ID: ${sessionId}`);

  // Test 1: Student B attempts to join Student A's interview
  Logger.info(LogCategory.SYSTEM_INFO, "\n2. [TEST] Student B attempts to join Student A's interview...");
  try {
    const startInputB: StartAIInterviewInputDTO = {
      interviewId: interviewA.id,
      studentId: studentBId // Mismatch!
    };
    await startUseCase.execute(startInputB);
    Logger.error(LogCategory.SYSTEM_ERROR, "❌ FAILED: Student B successfully joined Student A's interview!");
    process.exit(1);
  } catch (err: any) {
    if (err.message.includes('Unauthorized')) {
      Logger.info(LogCategory.SYSTEM_INFO, "✅ PASSED: Student B blocked from joining Student A's interview.");
    } else {
      Logger.error(LogCategory.SYSTEM_ERROR, "❌ FAILED WITH UNEXPECTED ERROR:", err);
      process.exit(1);
    }
  }

  // Test 2: Student B attempts to answer a question in Student A's session
  Logger.info(LogCategory.SYSTEM_INFO, "\n3. [TEST] Student B attempts to submit answer to Student A's session...");
  const sessionDoc = await aiInterviewRepository.findById(sessionId);
  if (!sessionDoc) throw new Error("Session not found");
  
  const activeQuestionId = sessionDoc.questions[0].id;

  try {
    const processInputB: ProcessStudentAnswerInputDTO = {
      sessionId: sessionId,
      questionId: activeQuestionId,
      answer: "I am a hacker!",
      studentId: studentBId // Mismatch!
    };
    await processUseCase.execute(processInputB);
    Logger.error(LogCategory.SYSTEM_ERROR, "❌ FAILED: Student B successfully submitted an answer!");
    process.exit(1);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      Logger.info(LogCategory.SYSTEM_INFO, "✅ PASSED: Student B blocked from submitting answer.");
    } else {
      Logger.error(LogCategory.SYSTEM_ERROR, "❌ FAILED WITH UNEXPECTED ERROR:", err);
      process.exit(1);
    }
  }

  // Test 3: Student A submits an answer successfully
  Logger.info(LogCategory.SYSTEM_INFO, "\n4. [TEST] Student A submits legitimate answer...");
  try {
    const processInputA: ProcessStudentAnswerInputDTO = {
      sessionId: sessionId,
      questionId: activeQuestionId,
      answer: "I am the legitimate student.",
      studentId: studentAId
    };
    const result = await processUseCase.execute(processInputA);
    if (result.success) {
      Logger.info(LogCategory.SYSTEM_INFO, "✅ PASSED: Student A successfully submitted answer.");
    } else {
      Logger.error(LogCategory.SYSTEM_ERROR, "❌ FAILED: Student A failed to submit answer.");
      process.exit(1);
    }
  } catch (err: any) {
    Logger.error(LogCategory.SYSTEM_ERROR, "❌ FAILED WITH UNEXPECTED ERROR:", err);
    process.exit(1);
  }

  Logger.info(LogCategory.SYSTEM_INFO, "\n🎉 ALL SECURITY ISOLATION TESTS PASSED!");
  process.exit(0);
}

runSecurityTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Fatal Test Error:", err);
  process.exit(1);
});
