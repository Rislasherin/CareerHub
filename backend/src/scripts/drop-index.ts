import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import { Logger, LogCategory } from '../infrastructure/logger/logger';

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    Logger.error(LogCategory.SYSTEM_ERROR, "No MONGODB_URI found");
    return;
  }

  try {
    Logger.info(LogCategory.SYSTEM_INFO, "Connecting to MongoDB...");
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    if (!db) {
      Logger.error(LogCategory.SYSTEM_ERROR, "DB connection failed");
      return;
    }

    Logger.info(LogCategory.SYSTEM_INFO, "Attempting to drop index 'name_1' from 'companies' collection...");
    await db.collection("companies").dropIndex("name_1");
    Logger.info(LogCategory.SYSTEM_INFO, "Successfully dropped index 'name_1'!");
  } catch (err) {
    if (err instanceof Error && (err as any).codeName === "IndexNotFound") {
      Logger.info(LogCategory.SYSTEM_INFO, "Index 'name_1' not found. It may have already been dropped.");
    } else {
      Logger.error(LogCategory.SYSTEM_ERROR, "Error dropping index:", err);
    }
  } finally {
    await mongoose.disconnect();
    Logger.info(LogCategory.SYSTEM_INFO, "Disconnected from MongoDB.");
  }
};

run();
