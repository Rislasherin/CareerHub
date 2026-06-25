import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    if (!db) {
      console.error("DB connection failed");
      return;
    }

    console.log("Attempting to drop index 'name_1' from 'companies' collection...");
    await db.collection("companies").dropIndex("name_1");
    console.log("Successfully dropped index 'name_1'!");
  } catch (err) {
    if (err instanceof Error && (err as any).codeName === "IndexNotFound") {
      console.log("Index 'name_1' not found. It may have already been dropped.");
    } else {
      console.error("Error dropping index:", err);
    }
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

run();
