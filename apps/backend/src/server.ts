import "reflect-metadata";
import app from "./app";
import { connectDB } from "@infrastructure/database/mongoose/connect";
import { env } from "@infrastructure/config/env.validator";
import { logger } from "@infrastructure/logger/logger";

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
  });
};

startServer();
