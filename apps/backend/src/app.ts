import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "@presentation/express/middlewares/error.middleware";
import routes from "@presentation/express/routes";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

// EMERGENCY TEST ROUTE
app.patch("/api/test-patch", (req, res) => {
  res.json({ success: true, message: "Backend is picking up changes!" });
});

app.use("/api", routes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

export default app;
