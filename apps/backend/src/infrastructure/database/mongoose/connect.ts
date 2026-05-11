import mongoose from "mongoose";
import { env } from "@infrastructure/config/env.validator";

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI);
};
