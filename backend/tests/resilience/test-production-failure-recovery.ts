import 'dotenv/config';
import { connectDB } from "../../src/infrastructure/database/mongoose/connect";
import mongoose from 'mongoose';
import { aiInterviewRepository, interviewRepository } from "../../src/infrastructure/di/ai-interview.factory";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { InterviewStatus } from "../../src/domain/enums/InterviewStatus.enum";
import { AIInterviewSession } from "../../src/domain/entities/ai-interview/AIInterviewSession";
import { InterviewQuestion } from "../../src/domain/entities/ai-interview/InterviewQuestion";
import { CompleteAIInterviewUseCase } from "../../src/application/usecases/ai-interview/implementations/CompleteAIInterviewUseCase";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

// Note: These tests demonstrate the failure recovery behavior
// integrated in Feature 20. Some scenarios require full mock wrappers to assert in an isolated script,
// but the core MongoDB, Room Cleanup, and idempotency logic can be tested against the DB.

async function main() {
    await connectDB();
    Logger.info(LogCategory.SYSTEM_INFO, "Connected to DB for Failure Recovery Tests\n");
    let passedCount = 0;
    let failedCount = 0;

    const assertSuccess = (testName: string, passed: boolean, details?: string) => {
        if (passed) {
            Logger.info(LogCategory.SYSTEM_INFO, `✅ ${testName}${details ? ' - ' + details : ''}`);
            passedCount++;
        } else {
            Logger.error(LogCategory.SYSTEM_ERROR, `❌ ${testName}${details ? ' - ' + details : ''}`);
            failedCount++;
        }
    };

    // Prepare a mock session
    const mockSession = new AIInterviewSession({
        id: new mongoose.Types.ObjectId().toHexString(),
        interviewId: new mongoose.Types.ObjectId().toHexString(),
        durationMinutes: 30,
        jobId: new mongoose.Types.ObjectId().toHexString(),
        studentId: new mongoose.Types.ObjectId().toHexString()
    });

    mockSession.startIntro();
    mockSession.moveToQuestion(new InterviewQuestion({
        id: new mongoose.Types.ObjectId().toHexString(),
        text: "Tell me about your experience with React.",
        type: "MAIN" as any,
        category: "TECHNICAL" as any,
        context: "React"
    }));

    const mockDoc = (aiInterviewRepository as any).toPersistence(mockSession);
    const resultDoc = await (aiInterviewRepository as any).model.create(mockDoc);
    const sessionId = resultDoc._id.toString();
    const questionId = mockSession.questions[0].id;

    Logger.info(LogCategory.SYSTEM_INFO, `[Setup] Created mock session ${sessionId}`);

    // Test 1: MongoDB Idempotency / Duplicate Eval (RabbitMQ duplicate delivery)
    try {
        const attached1 = await aiInterviewRepository.attachEvaluationAtomically(sessionId, questionId, {
            score: 85,
            quality: 'EXCELLENT' as any,
            feedback: 'Good answer',
            needsFollowUp: false
        });
        const attached2 = await aiInterviewRepository.attachEvaluationAtomically(sessionId, questionId, {
            score: 90,
            quality: 'EXCELLENT' as any,
            feedback: 'Duplicate answer',
            needsFollowUp: false
        });

        assertSuccess("TEST 3 & 14: RabbitMQ duplicate evaluation delivery", attached1 === true && attached2 === false, "Second attempt safely ignored");
    } catch (e: any) {
        assertSuccess("TEST 3", false, e.message);
    }

    // Test 15: Duplicate LiveKit room cleanup (idempotency)
    try {
        let cleanupCalls = 0;
        const mockLiveKitService = {
            deleteRoom: async (id: string) => {
                cleanupCalls++;
                if (cleanupCalls > 1) {
                    throw new Error("Room not found (already deleted)");
                }
            }
        } as any;

        const completeUseCase = new CompleteAIInterviewUseCase(
            aiInterviewRepository,
            interviewRepository,
            mockLiveKitService
        );

        // Transition session back to CLOSING to test completion race
        await (aiInterviewRepository as any).model.updateOne({ _id: sessionId }, { $set: { phase: InterviewPhase.CLOSING } });

        // Race condition / Duplicate call
        await Promise.allSettled([
            completeUseCase.execute({ sessionId }),
            completeUseCase.execute({ sessionId })
        ]);

        const updated = await aiInterviewRepository.findById(sessionId);
        Logger.info(LogCategory.SYSTEM_INFO, `Debug TEST 15 & 16 -> updated phase: ${updated?.phase}, cleanupCalls: ${cleanupCalls}`);
        assertSuccess("TEST 15 & 16: Duplicate LiveKit room cleanup & race", 
            updated?.phase === InterviewPhase.COMPLETED && cleanupCalls === 1, 
            "Completion is authoritative even if room cleanup fails on duplicate");

    } catch (e: any) {
        assertSuccess("TEST 15 & 16", false, e.message);
    }

    Logger.info(LogCategory.SYSTEM_INFO, `\nFailure Recovery Tests Complete. Passed: ${passedCount}, Failed: ${failedCount}`);
    
    // Clean up
    await (aiInterviewRepository as any).model.deleteOne({ _id: sessionId });
    await mongoose.disconnect();
    process.exit(failedCount > 0 ? 1 : 0);
}

main().catch(e => {
    Logger.error(LogCategory.SYSTEM_ERROR, e);
    process.exit(1);
});
