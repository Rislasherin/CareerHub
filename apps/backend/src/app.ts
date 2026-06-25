import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "@presentation/express/middlewares/error.middleware";
import routes from "@presentation/express/routes";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({ success: true, message: "Server is healthy" });
});


app.use("/api", routes);

app.use((_req: Request, res: Response) => {
  res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

export default app;
