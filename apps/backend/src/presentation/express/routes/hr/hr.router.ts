import { Router } from "express";
import { makeInterviewerManagementController } from "@infrastructure/di/hr.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";

const router = Router();
const interviewerManagementController = makeInterviewerManagementController();

// Protect all HR routes
router.use(authMiddleware.protect);

router.post("/interviewers", interviewerManagementController.addInterviewer);
router.get("/interviewers", interviewerManagementController.getInterviewers);

export default router;
