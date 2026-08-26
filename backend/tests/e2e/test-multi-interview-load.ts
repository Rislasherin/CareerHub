import 'dotenv/config';
import { connectDB } from "../../src/infrastructure/database/mongoose/connect";
import mongoose, { Types } from 'mongoose';
import { AIInterviewSessionModel } from "../../src/infrastructure/database/models/company/ai-interview.model";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { aiInterviewRepository } from "../../src/infrastructure/di/ai-interview.factory";
import { CompleteAIInterviewUseCase } from "../../src/application/usecases/ai-interview/implementations/CompleteAIInterviewUseCase";
import { interviewRepository } from "../../src/infrastructure/di/ai-interview.factory";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function simulateInterview(index: number, totalQuestions: number): Promise<{ latency: number, success: boolean }> {
    const startTime = Date.now();
    try {
        const sessionId = new Types.ObjectId().toString();
        
        // 1. Start Interview
        await AIInterviewSessionModel.create({
            _id: sessionId,
            interviewId: new Types.ObjectId(),
            studentId: new Types.ObjectId(),
            phase: InterviewPhase.ASKING_QUESTION,
            durationMinutes: 30,
            questions: [
                {
                    id: new Types.ObjectId().toString(),
                    text: "What is your background?",
                    type: QuestionType.MAIN,
                    category: "GENERAL"
                }
            ],
            isDeleted: false
        });

        // 2. Loop questions
        for (let q = 1; q <= totalQuestions; q++) {
            const currentSession = await aiInterviewRepository.findById(sessionId);
            if (!currentSession) throw new Error("Session lost");
            const currentQuestionId = currentSession.questions[currentSession.questions.length - 1].id;

            // Submit Answer
            await aiInterviewRepository.recordAnswerAtomically(sessionId, currentQuestionId, `Answer to question ${q}`);

            // Simulate Evaluation Worker Delay + Submission
            await aiInterviewRepository.attachEvaluationAtomically(sessionId, currentQuestionId, {
                score: 85,
                quality: "GOOD" as any,
                feedback: `Evaluation ${q}`,
                needsFollowUp: false
            });

            // Advance to next question (if not the last)
            if (q < totalQuestions) {
                await aiInterviewRepository.advanceInterviewAtomically(
                    sessionId,
                    {
                        id: new Types.ObjectId().toString(),
                        text: `Question ${q + 1}`,
                        type: QuestionType.MAIN,
                        category: "TECHNICAL"
                    },
                    InterviewPhase.ASKING_QUESTION,
                    "Topic",
                    [],
                    0
                );
            }
        }

        // 3. Complete Interview
        await (aiInterviewRepository as any).model.updateOne({ _id: sessionId }, { $set: { phase: InterviewPhase.CLOSING } });
        
        const mockLiveKitService = { deleteRoom: async () => {} } as any;
        const completeUseCase = new CompleteAIInterviewUseCase(aiInterviewRepository, interviewRepository, mockLiveKitService);
        await completeUseCase.execute({ sessionId });

        return { latency: Date.now() - startTime, success: true };
    } catch (err) {
        Logger.error(LogCategory.SYSTEM_ERROR, `Interview ${index} failed:`, err);
        return { latency: Date.now() - startTime, success: false };
    }
}

async function runLoadTest(concurrency: number, questionsPerInterview: number) {
    Logger.info(LogCategory.SYSTEM_INFO, `\n--- Starting Load Test: ${concurrency} Concurrent Interviews (${questionsPerInterview} questions each) ---`);
    const promises = [];
    for (let i = 0; i < concurrency; i++) {
        promises.push(simulateInterview(i, questionsPerInterview));
    }

    const results = await Promise.all(promises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const latencies = successful.map(r => r.latency).sort((a, b) => a - b);
    
    let p50 = 0, p95 = 0, p99 = 0;
    if (latencies.length > 0) {
        p50 = latencies[Math.floor(latencies.length * 0.5)];
        p95 = latencies[Math.floor(latencies.length * 0.95)];
        p99 = latencies[Math.floor(latencies.length * 0.99)];
    }

    Logger.info(LogCategory.SYSTEM_INFO, `Total Completed: ${successful.length} / ${concurrency}`);
    Logger.info(LogCategory.SYSTEM_INFO, `Failed: ${failed.length}`);
    Logger.info(LogCategory.SYSTEM_INFO, `Latencies: P50=${p50}ms, P95=${p95}ms, P99=${p99}ms`);
}

async function testMultiInterviewLoad() {
    await connectDB();
    Logger.info(LogCategory.SYSTEM_INFO, "=== Feature 21: Multi-Interview Load Test ===\n");
    
    try {
        await runLoadTest(10, 3);
        // Wait briefly to allow connections to settle
        await new Promise(r => setTimeout(r, 2000));
        await runLoadTest(25, 3);
    } catch (err) {
        Logger.error(LogCategory.SYSTEM_ERROR, "Load test crashed", err);
    } finally {
        await mongoose.disconnect();
    }
}

testMultiInterviewLoad();
