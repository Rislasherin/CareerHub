import 'dotenv/config';
import { connectDB } from "../../src/infrastructure/database/mongoose/connect";
import mongoose from 'mongoose';
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { InterviewStatus } from "../../src/domain/enums/InterviewStatus.enum";
import { StartAIInterviewUseCase } from "../../src/application/usecases/ai-interview/implementations/StartAIInterviewUseCase";
import { aiInterviewRepository, interviewRepository } from "../../src/infrastructure/di/ai-interview.factory";
import { InterviewConfiguration } from "../../src/domain/value-objects/InterviewConfiguration";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { InterviewDifficulty } from "../../src/domain/enums/InterviewDifficulty.enum";
import { Interview } from "../../src/domain/entities/Interview";
import { AnswerEvaluation } from "../../src/domain/value-objects/AnswerEvaluation";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

// Mocks
class MockMessageBroker {
  async publish(queue: string, message: any): Promise<void> {}
  async subscribe(queue: string, handler: any): Promise<void> {}
  async connect(): Promise<void> {}
  async close(): Promise<void> {}
}

class MockLiveKitService {
  async generateToken(sessionId: string, studentId: string, studentName: string): Promise<string> {
    return 'mock-token';
  }
  async generateWorkerToken(sessionId: string): Promise<string> {
    return 'mock-worker-token';
  }
}

class MockQuestionGenerator {
  async generateNextQuestion(context: any): Promise<{ text: string; type: string }> {
    return { text: 'Mock question 1', type: 'MAIN' };
  }
}

async function runTests() {
  Logger.info(LogCategory.SYSTEM_INFO, '==================================================================');
  Logger.info(LogCategory.SYSTEM_INFO, '  CAREERHUB AI INTERVIEW: LIFECYCLE & RECOVERY SUITE VERIFICATION');
  Logger.info(LogCategory.SYSTEM_INFO, '==================================================================\n');

  try {
    await connectDB();
  } catch (err) {
    Logger.error(LogCategory.SYSTEM_ERROR, 'Failed to connect to database', err);
    process.exit(1);
  }

  const broker = new MockMessageBroker();
  const liveKit = new MockLiveKitService();
  const qGen = new MockQuestionGenerator();
  const startUseCase = new StartAIInterviewUseCase(
    aiInterviewRepository,
    interviewRepository,
    qGen as any,
    liveKit,
    broker,
    { findById: async () => null } as any, // jobRepository
    { findById: async () => null } as any  // studentRepository
  );

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      Logger.info(LogCategory.SYSTEM_INFO, `[PASS] ${message}`);
      passed++;
    } else {
      Logger.error(LogCategory.SYSTEM_ERROR, `[FAIL] ${message}`);
      failed++;
    }
  };

  try {
    const studentId = new mongoose.Types.ObjectId().toString();
    const jobId = new mongoose.Types.ObjectId().toString();
    const interviewId = new mongoose.Types.ObjectId().toString();

    // Setup Parent Interview
    const config = new InterviewConfiguration({
      types: [InterviewType.TECHNICAL],
      difficulty: InterviewDifficulty.MID,
      durationMinutes: 5,
    });
    const interview = new Interview({
      id: interviewId,
      companyId: new mongoose.Types.ObjectId().toString(),
      type: InterviewType.TECHNICAL,
      studentId: studentId,
      jobId: jobId,
      scheduledAt: new Date(),
      createdAt: new Date(),
      status: InterviewStatus.SCHEDULED,
      configuration: config,
      durationMinutes: 5
    });
    let createdId = interviewId;
    try {
      const created = await interviewRepository.create(interview);
      createdId = created.id;
      Logger.info(LogCategory.SYSTEM_INFO, 'Created interview mock:', createdId);
    } catch (e) {
      Logger.error(LogCategory.SYSTEM_ERROR, 'Failed to create interview mock:', e);
      throw e;
    }

    Logger.info(LogCategory.SYSTEM_INFO, '--- TEST 1: Session Start Idempotency ---');
    // Call 1
    const res1 = await startUseCase.execute({ interviewId: createdId, studentId });
    assert(res1.success === true, 'First start succeeds');
    const sessionId = res1.sessionId;

    // Call 2
    const res2 = await startUseCase.execute({ interviewId: createdId, studentId });
    assert(res2.success === true, 'Second start succeeds');
    assert(res2.sessionId === sessionId, 'Does not create a duplicate session');
    
    const session = await aiInterviewRepository.findById(sessionId);
    assert(session!.questions.length === 1, 'Question 1 is not duplicated on rejoin');

    Logger.info(LogCategory.SYSTEM_INFO, '\n--- TEST 2: Completion Idempotency & Transition Guards ---');
    let errorThrown = false;
    try {
      session!.moveToQuestion(session!.questions[0] as any, "Test", InterviewType.TECHNICAL); // invalid from ASKING_QUESTION to ASKING_QUESTION without evaluation
    } catch (e: any) {
      errorThrown = true;
      assert(e.message.includes('Cannot move to question'), 'Prevents invalid ASKING_QUESTION -> ASKING_QUESTION transition');
    }
    if (!errorThrown) assert(false, 'Should have thrown on invalid transition');

    // Move to evaluation
    session!.startEvaluation();
    assert(session!.phase === InterviewPhase.EVALUATING, 'Moves to EVALUATING');

    session!.closeInterview();
    assert(session!.phase === InterviewPhase.CLOSING, 'Moves to CLOSING');

    session!.markAsCompleted();
    assert(session!.phase === InterviewPhase.COMPLETED, 'Moves to COMPLETED');

    // Duplicate markAsCompleted should be safe
    session!.markAsCompleted();
    assert(session!.phase === InterviewPhase.COMPLETED, 'Duplicate markAsCompleted is idempotent and harmless');

    Logger.info(LogCategory.SYSTEM_INFO, '\n--- TEST 3: Duplicate Answer Protection ---');
    const q1Id = session!.questions[0].id;
    // Inject answer manually for testing
    // Change phase temporarily to allow recording
    (session as any)._phase = InterviewPhase.ASKING_QUESTION;
    session!.recordAnswer(q1Id, "This is an answer.");
    assert(session!.questions[0].candidateAnswer === "This is an answer.", 'Answer recorded successfully');
    
    let duplicateError = false;
    try {
      session!.recordAnswer(q1Id, "Duplicate answer.");
    } catch (e: any) {
      duplicateError = true;
      assert(e.message.includes('Answer already recorded'), 'Prevents duplicate answer overwrites');
    }
    if (!duplicateError) assert(false, 'Should have thrown on duplicate answer');

    Logger.info(LogCategory.SYSTEM_INFO, '\n--- TEST 4: Late Evaluation Idempotency ---');
    (session as any)._phase = InterviewPhase.COMPLETED;
    
    const evalObj = new AnswerEvaluation({
      score: 80,
      quality: 'EXCELLENT' as any,
      feedback: 'Good answer',
      needsFollowUp: false
    });

    session!.evaluateQuestion(q1Id, evalObj);
    assert(session!.questions[0].evaluation !== undefined, 'Late evaluation attached successfully to completed session');

    // Duplicate evaluation
    const evalObj2 = new AnswerEvaluation({
      score: 50, // different score
      quality: 'POOR' as any,
      feedback: 'Bad answer',
      needsFollowUp: false
    });
    session!.evaluateQuestion(q1Id, evalObj2);
    assert(session!.questions[0].evaluation!.score === 80, 'Duplicate evaluation is safely ignored without overwriting');

    Logger.info(LogCategory.SYSTEM_INFO, '\n--- TEST 5: Start Rejoin on COMPLETED session ---');
    const updatedInterview = await interviewRepository.findById(createdId);
    if (updatedInterview) {
      updatedInterview.markAsCompleted();
      await interviewRepository.update(createdId, updatedInterview);
    }
    
    let completedStartError = false;
    try {
      await startUseCase.execute({ interviewId: createdId, studentId });
    } catch (e: any) {
      completedStartError = true;
      assert(e.message.includes('not in a joinable state'), 'Prevents starting a session if parent interview is COMPLETED');
    }
    if (!completedStartError) assert(false, 'Should have thrown when joining completed interview');


  } catch (err: any) {
    Logger.error(LogCategory.SYSTEM_ERROR, 'Test suite failed with unexpected error:', err);
    failed++;
  } finally {
    Logger.info(LogCategory.SYSTEM_INFO, '\n==================================================================');
    Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
    Logger.info(LogCategory.SYSTEM_INFO, '==================================================================\n');
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
