import mongoose from "mongoose";
import { env } from "@infrastructure/config/env.validator";

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI);
  try {
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections({ name: "students" }).toArray();
      if (collections.length > 0) {
        const studentCollection = db.collection("students");
        const indexes = await studentCollection.indexes();
        const hasOldIndex = indexes.some(idx => idx.name === "rollNumber_1_orgId_1");
        if (hasOldIndex) {
          await studentCollection.dropIndex("rollNumber_1_orgId_1");
          console.log("Successfully dropped legacy index rollNumber_1_orgId_1 from students collection");
        }
      }
    }
  } catch (error) {
    console.error("Error checking/dropping legacy students index:", error);
  }
};
