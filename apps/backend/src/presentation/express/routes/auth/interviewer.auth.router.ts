import { Router } from "express";
import { makeInterviewerAuthController } from "@infrastructure/di/interviewer.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";

const router = Router();
const interviewerAuthController = makeInterviewerAuthController();

router.post("/activate", authMiddleware.protect, interviewerAuthController.activate);

export default router;
