import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "@presentation/express/middlewares/error.middleware";
import routes from "@presentation/express/routes";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

const app: Application = express();

import { tracingMiddleware } from "@presentation/express/middlewares/tracing.middleware";
import rateLimit from "express-rate-limit";

// Configure rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" },
});

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(limiter); // Apply rate limiter
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(tracingMiddleware);

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({ success: true, message: "Server is healthy" });
});

app.use("/api", routes);

app.use((_req: Request, res: Response) => {
  res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

export default app;
