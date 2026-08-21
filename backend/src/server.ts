import "reflect-metadata";
import app from "./app";
import { connectDB } from "@infrastructure/database/mongoose/connect";
import { env } from "@infrastructure/config/env.validator";
import { Logger } from "@infrastructure/logger/logger";

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(env.PORT, () => {
    Logger.info(`Server running on http://localhost:${env.PORT}`);
  });
};

startServer();
