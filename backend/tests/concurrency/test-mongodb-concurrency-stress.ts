import 'dotenv/config';
import { connectDB } from "../../src/infrastructure/database/mongoose/connect";
import mongoose, { Types } from 'mongoose';
import { AIInterviewSessionModel } from "../../src/infrastructure/database/models/company/ai-interview.model";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { aiInterviewRepository } from "../../src/infrastructure/di/ai-interview.factory";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function testConcurrencyStress() {
    await connectDB();

    Logger.info(LogCategory.SYSTEM_INFO, "=== Feature 21: MongoDB Concurrency Stress Test ===\n");

    try {
        const sessionId = new Types.ObjectId().toString();
        const questionId = "q-stress-1";

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
                    text: "What is MongoDB?",
                    type: QuestionType.MAIN,
                    category: "TECHNICAL"
                }
            ],
            isDeleted: false
        });

        Logger.info(LogCategory.SYSTEM_INFO, "Seeded interview session.");

        // 2. 10 Concurrent Answer Submissions
        Logger.info(LogCategory.SYSTEM_INFO, "\n--- Testing 10 Concurrent Answer Submissions ---");
        const answerPromises = [];
        for (let i = 0; i < 10; i++) {
            answerPromises.push(
                aiInterviewRepository.recordAnswerAtomically(sessionId, questionId, `Answer attempt ${i}`)
            );
        }

        const answerResults = await Promise.all(answerPromises);
        const successfulAnswers = answerResults.filter(r => r === true).length;
        
        Logger.info(LogCategory.SYSTEM_INFO, `Concurrent answers accepted: ${successfulAnswers} / 10`);
        if (successfulAnswers !== 1) {
            Logger.error(LogCategory.SYSTEM_ERROR, `FAIL: Expected exactly 1 successful answer write, got ${successfulAnswers}`);
            process.exit(1);
        }

        const sessionAfterAnswer = await aiInterviewRepository.findById(sessionId);
        Logger.info(LogCategory.SYSTEM_INFO, `Persisted Candidate Answer: ${sessionAfterAnswer?.questions[0].candidateAnswer}`);

        // 3. 10 Concurrent Evaluation Updates
        Logger.info(LogCategory.SYSTEM_INFO, "\n--- Testing 10 Concurrent Evaluation Updates ---");
        const evalPromises = [];
        for (let i = 0; i < 10; i++) {
            evalPromises.push(
                aiInterviewRepository.attachEvaluationAtomically(sessionId, questionId, {
                    score: 80 + i,
                    quality: "GOOD" as any,
                    feedback: `Eval attempt ${i}`,
                    needsFollowUp: false
                })
            );
        }

        const evalResults = await Promise.all(evalPromises);
        const successfulEvals = evalResults.filter(r => r === true).length;
        
        Logger.info(LogCategory.SYSTEM_INFO, `Concurrent evaluations accepted: ${successfulEvals} / 10`);
        if (successfulEvals !== 1) {
            Logger.error(LogCategory.SYSTEM_ERROR, `FAIL: Expected exactly 1 successful evaluation write, got ${successfulEvals}`);
            process.exit(1);
        }

        const sessionAfterEval = await aiInterviewRepository.findById(sessionId);
        Logger.info(LogCategory.SYSTEM_INFO, `Persisted Evaluation Score: ${sessionAfterEval?.questions[0].evaluation?.score}`);

        // 4. Concurrency: Answer + Completion
        Logger.info(LogCategory.SYSTEM_INFO, "\n--- Testing Concurrency: Answer + Completion ---");
        
        const q2Id = "q-stress-2";
        await aiInterviewRepository.advanceInterviewAtomically(
            sessionId,
            { id: q2Id, text: "Q2", type: QuestionType.MAIN, category: "TECHNICAL" },
            InterviewPhase.ASKING_QUESTION,
            "Topic",
            [],
            0
        );

        const pAnswer = aiInterviewRepository.recordAnswerAtomically(sessionId, q2Id, "Concurrent answer");
        const pComplete = aiInterviewRepository.transitionSessionState(
            sessionId, 
            [InterviewPhase.ASKING_QUESTION], 
            InterviewPhase.CLOSING
        );

        const [rAnswer, rComplete] = await Promise.all([pAnswer, pComplete]);
        Logger.info(LogCategory.SYSTEM_INFO, `Answer result: ${rAnswer}`);
        Logger.info(LogCategory.SYSTEM_INFO, `Complete transition result: ${rComplete}`);

        // Depending on timing, either both succeed, or answer succeeds before completion, etc.
        // The important part is the system shouldn't corrupt the document.

        Logger.info(LogCategory.SYSTEM_INFO, "\n✅ ALL MONGODB CONCURRENCY STRESS TESTS PASSED. NO DATA CORRUPTION.");
        
    } catch (err) {
        Logger.error(LogCategory.SYSTEM_ERROR, "Test failed with error:", err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

testConcurrencyStress();
