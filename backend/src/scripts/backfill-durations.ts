import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../infrastructure/database/mongoose/connect';
import { InterviewModel } from '../infrastructure/database/models/company/interview.model';
import { AIInterviewSessionModel } from '../infrastructure/database/models/company/ai-interview.model';
import { Logger, LogCategory } from '../infrastructure/logger/logger';

async function backfill() {
  Logger.info(LogCategory.SYSTEM_INFO, '[Backfill] Connecting to database...');
  await connectDB();

  Logger.info(LogCategory.SYSTEM_INFO, '[Backfill] Backfilling Interviews without durationMinutes...');
  const interviewResult = await InterviewModel.updateMany(
    { durationMinutes: { $exists: false } },
    { $set: { durationMinutes: 15 } }
  );
  Logger.info(LogCategory.SYSTEM_INFO, `[Backfill] Updated ${interviewResult.modifiedCount} Interviews.`);

  Logger.info(LogCategory.SYSTEM_INFO, '[Backfill] Backfilling AIInterviewSessions without durationMinutes...');
  const aiSessionResult = await AIInterviewSessionModel.updateMany(
    { durationMinutes: { $exists: false } },
    { $set: { durationMinutes: 15 } }
  );
  Logger.info(LogCategory.SYSTEM_INFO, `[Backfill] Updated ${aiSessionResult.modifiedCount} AIInterviewSessions.`);

  Logger.info(LogCategory.SYSTEM_INFO, '[Backfill] Complete.');
  await mongoose.disconnect();
}

backfill().catch(async (err) => {
  Logger.error(LogCategory.SYSTEM_ERROR, '[Backfill] Error:', err);
  await mongoose.disconnect();
  process.exit(1);
});
