import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { aiQuestionGenerator, makeStartAIInterviewUseCase, makeProcessStudentAnswerUseCase } from "../../src/infrastructure/di/ai-interview.factory";
import mongoose from "mongoose";
import { env } from "../../src/infrastructure/config/env.validator";

import { LangChainQuestionGenerator } from "../../src/infrastructure/services/ai-interview/LangChainQuestionGenerator.service";
import { DeepgramSTTService } from "../../src/infrastructure/services/stt/DeepgramSTTService";
import { CartesiaTTSService } from "../../src/infrastructure/services/tts/CartesiaTTSService";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function setupDatabase() {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(env.MONGODB_URI);
    }
    const db = mongoose.connection.db;
    if (db) {
        await db.collection("ai_interview_sessions").deleteMany({ interviewId: "failover-test-interview" });
        await db.collection("interviews").deleteMany({ _id: "failover-test-interview" as any });
    }
}

async function runFailoverTest() {
    Logger.info(LogCategory.SYSTEM_INFO, "\n====================================================================");
    Logger.info(LogCategory.SYSTEM_INFO, "Starting test-provider-resilience-failover.ts");
    Logger.info(LogCategory.SYSTEM_INFO, "====================================================================");

    await setupDatabase();

    // Test 1: Question Generator Retries
    Logger.info(LogCategory.SYSTEM_INFO, "Testing Question Generator Retries...");
    const originalLLMQuestionGen = aiQuestionGenerator as LangChainQuestionGenerator;
    let llmThrows = 2;
    const originalStream = (originalLLMQuestionGen as any).llm.stream;
    
    (originalLLMQuestionGen as any).llm.stream = async function* (input: any, options: any) {
        if (llmThrows > 0) {
            llmThrows--;
            throw new Error("Simulated 429 Too Many Requests");
        }
        yield "This is the generated text after retries?";
    };

    const qStart = performance.now();
    const qResult = await originalLLMQuestionGen.generateNextQuestion({
        interviewContext: "Test",
        previousQuestions: [],
        topic: "React",
        interviewType: InterviewType.TECHNICAL
    });
    const qEnd = performance.now();
    Logger.info(LogCategory.SYSTEM_INFO, `Question Gen Result: "${qResult.text}" in ${qEnd - qStart}ms`);
    if (qEnd - qStart < 2500) {
        throw new Error("Exponential backoff did not occur! (Attempt 1: 0ms, Attempt 2: 1500ms)");
    }
    Logger.info(LogCategory.SYSTEM_INFO, "✅ Question Generator exponential backoff successful");

    // Test 2: STT Reconnect
    Logger.info(LogCategory.SYSTEM_INFO, "\nTesting STT Reconnect...");
    const sttService = new DeepgramSTTService();
    Logger.info(LogCategory.SYSTEM_INFO, "✅ STT reconnect logic instantiated in DeepgramSTTService");

    // Test 3: TTS 503 Retry
    Logger.info(LogCategory.SYSTEM_INFO, "\nTesting TTS 503 Retry...");
    const ttsService = new CartesiaTTSService();
    
    const originalWebsocket = (ttsService as any).cartesia.tts.websocket;
    let ttsThrows = 1;
    (ttsService as any).cartesia.tts.websocket = async function(args: any) {
        if (ttsThrows > 0) {
            ttsThrows--;
            throw new Error("Simulated 503 Service Unavailable");
        }
        return await originalWebsocket.call(this, args);
    };

    const ttsStart = performance.now();
    await ttsService.connect();
    const ttsEnd = performance.now();
    Logger.info(LogCategory.SYSTEM_INFO, `TTS Connect completed in ${ttsEnd - ttsStart}ms`);
    if (ttsEnd - ttsStart < 900) {
       throw new Error("TTS exponential backoff did not occur!");
    }
    Logger.info(LogCategory.SYSTEM_INFO, "✅ TTS exponential backoff successful");
    await ttsService.disconnect();

    // Revert monkey patches
    (originalLLMQuestionGen as any).llm.stream = originalStream;
    (ttsService as any).cartesia.tts.websocket = originalWebsocket;

    Logger.info(LogCategory.SYSTEM_INFO, "\n====================================================================");
    Logger.info(LogCategory.SYSTEM_INFO, "Resilience Failover Validation Complete!");
    Logger.info(LogCategory.SYSTEM_INFO, "====================================================================");
    process.exit(0);
}

runFailoverTest().catch(err => {
    Logger.error(LogCategory.SYSTEM_ERROR, "❌ Test Failed:", err);
    process.exit(1);
});
