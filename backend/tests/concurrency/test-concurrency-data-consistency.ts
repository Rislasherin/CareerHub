import 'dotenv/config';
import { connectDB } from "../../src/infrastructure/database/mongoose/connect";
import mongoose, { Types } from 'mongoose';
import { AIInterviewSessionModel } from "../../src/infrastructure/database/models/company/ai-interview.model";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { aiInterviewRepository } from "../../src/infrastructure/di/ai-interview.factory";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function testConcurrency() {
    await connectDB();

    Logger.info(LogCategory.SYSTEM_INFO, "=== Testing Feature 19 Concurrency Hardening ===\n");

    try {
        const sessionId = new Types.ObjectId().toString();
        const questionId = "q123";

        // 1. Seed a session
        await AIInterviewSessionModel.create({
            _id: sessionId,
            interviewId: new Types.ObjectId(),
            studentId: new Types.ObjectId(),
            phase: InterviewPhase.ASKING_QUESTION,
            durationMinutes: 30,
            questions: [
                {
                    id: questionId,
                    text: "What is Node.js?",
                    type: QuestionType.MAIN,
                    category: "TECHNICAL"
                }
            ],
            isDeleted: false
        });

        Logger.info(LogCategory.SYSTEM_INFO, "Seeded interview session.");

        // 2. Test STT Double Submit (Race Condition)
        Logger.info(LogCategory.SYSTEM_INFO, "\n--- Testing STT Double Submit ---");
        const p1 = aiInterviewRepository.recordAnswerAtomically(sessionId, questionId, "Node is a runtime.");
        const p2 = aiInterviewRepository.recordAnswerAtomically(sessionId, questionId, "Node is a javascript runtime.");

        const [r1, r2] = await Promise.all([p1, p2]);
        Logger.info(LogCategory.SYSTEM_INFO, `Request 1 claimed lock: ${r1}`);
        Logger.info(LogCategory.SYSTEM_INFO, `Request 2 claimed lock: ${r2}`);

        if (r1 === r2) {
            Logger.error(LogCategory.SYSTEM_ERROR, "FAIL: Both requests successfully recorded the answer concurrently!");
            process.exit(1);
        }

        const sessionAfterAnswer = await aiInterviewRepository.findById(sessionId);
        Logger.info(LogCategory.SYSTEM_INFO, `Persisted Candidate Answer: ${sessionAfterAnswer?.questions[0].candidateAnswer}`);

        // 3. Test Evaluation Worker Race vs New Question Generation
        Logger.info(LogCategory.SYSTEM_INFO, "\n--- Testing Evaluation Worker vs Next Question Gen Race ---");
        
        // Simulating the worker evaluating Question 1
        const evalPromise = aiInterviewRepository.attachEvaluationAtomically(sessionId, questionId, {
            score: 85,
            quality: "GOOD",
            feedback: "Solid answer.",
            needsFollowUp: false
        });

        // Simulating the orchestrator appending Question 2 at the SAME time
        const nextQ = {
            id: "q456",
            text: "Explain the event loop.",
            type: QuestionType.MAIN,
            category: "TECHNICAL"
        };
        const advancePromise = aiInterviewRepository.advanceInterviewAtomically(
            sessionId,
            nextQ,
            InterviewPhase.ASKING_QUESTION,
            "Event Loop",
            ["Node.js Basic"],
            0
        );

        const [evalResult, advanceResult] = await Promise.all([evalPromise, advancePromise]);
        Logger.info(LogCategory.SYSTEM_INFO, `Evaluation attached: ${evalResult}`);
        Logger.info(LogCategory.SYSTEM_INFO, `Interview advanced: ${advanceResult}`);

        const finalSession = await aiInterviewRepository.findById(sessionId);
        
        Logger.info(LogCategory.SYSTEM_INFO, `\nFinal State Verification:`);
        Logger.info(LogCategory.SYSTEM_INFO, `Total questions: ${finalSession?.questions.length} (Expected: 2)`);
        Logger.info(LogCategory.SYSTEM_INFO, `Question 1 Evaluation Score: ${finalSession?.questions[0].evaluation?.score} (Expected: 85)`);
        
        if (finalSession?.questions.length !== 2) {
             Logger.error(LogCategory.SYSTEM_ERROR, "FAIL: Question array was overwritten! Data loss occurred.");
             process.exit(1);
        }

        if (!finalSession?.questions[0].evaluation) {
             Logger.error(LogCategory.SYSTEM_ERROR, "FAIL: Evaluation was lost due to full-document save race!");
             process.exit(1);
        }

        Logger.info(LogCategory.SYSTEM_INFO, "\n✅ ALL CONCURRENCY TESTS PASSED. NO DATA LOSS DETECTED.");
        
    } catch (err) {
        Logger.error(LogCategory.SYSTEM_ERROR, "Test failed with error:", err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

testConcurrency();
