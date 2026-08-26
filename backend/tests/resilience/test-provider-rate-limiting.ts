import mongoose from "mongoose";
import "dotenv/config";
import { ProviderRateLimiter } from "../../src/infrastructure/services/ai-interview/ProviderRateLimiter";

import { Logger, LogCategory } from "../../src/infrastructure/logger/logger";

async function run() {
  Logger.info(LogCategory.SYSTEM_INFO, "=== Rate Limiting Stress Test ===");
  
  const startTime = Date.now();
  const tasks = [];
  
  // Launch 50 concurrent requests for QUESTION_LLM
  for (let i = 0; i < 50; i++) {
    tasks.push((async () => {
      const release = await ProviderRateLimiter.acquire("QUESTION_LLM", 5); // Max 5 concurrent
      try {
        Logger.info(LogCategory.SYSTEM_INFO, `[Req ${i}] Acquired lock at +${Date.now() - startTime}ms`);
        // Simulate LLM processing time
        await new Promise(r => setTimeout(r, 1000));
      } finally {
        Logger.info(LogCategory.SYSTEM_INFO, `[Req ${i}] Released lock at +${Date.now() - startTime}ms`);
        release();
      }
    })());
  }

  await Promise.all(tasks);
  Logger.info(LogCategory.SYSTEM_INFO, `=== Done in ${Date.now() - startTime}ms ===`);
  Logger.info(LogCategory.SYSTEM_INFO, "Expected time: ~10 seconds (50 reqs / 5 concurrent = 10 batches of 1s)");
}

run().catch(err => Logger.error(LogCategory.SYSTEM_ERROR, "Error", err));
