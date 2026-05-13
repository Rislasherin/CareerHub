import { Router } from "express";
import { makeInterviewerAuthController } from "@infrastructure/di/interviewer.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { validateSchema } from "@presentation/express/middlewares/validateSchema";
import { loginSchema } from "@shared/validation";

const router = Router();
const interviewerAuthController = makeInterviewerAuthController();

router.post("/login", validateSchema(loginSchema), interviewerAuthController.login);
router.get("/verify-token/:token", interviewerAuthController.verifyToken);
router.post("/activate", authMiddleware.protect, interviewerAuthController.activate);

export default router;
