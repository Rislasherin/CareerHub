import { authMiddleware } from "@infrastructure/di/infra.container";
import { makeInterviewerController } from "@infrastructure/di/interviewer.factory";
import { Router } from "express";

const router = Router()
const controller = makeInterviewerController();

router.use(authMiddleware.protect);

router.get("/dashboard",controller.getDashboard);
router.post("/interviews/:id/reschedule", controller.requestReschedule);

export default router