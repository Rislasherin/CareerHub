import { Router } from "express";
import { makeInterviewerManagementController } from "@infrastructure/di/hr.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";

import { validateDto } from "@presentation/express/middlewares/validateDto";
import { AddInterviewerDto } from "@application/dtos/hr/AddInterviewer.dto";

const router = Router();
const interviewerManagementController = makeInterviewerManagementController();

// Protect all HR routes
router.use(authMiddleware.protect);

router.post("/interviewers", validateDto(AddInterviewerDto), interviewerManagementController.addInterviewer);
router.get("/interviewers", interviewerManagementController.getInterviewers);
router.patch("/interviewers/:interviewerId/toggle-status", interviewerManagementController.toggleStatus);
router.post("/interviewers/:interviewerId/resend-invite", interviewerManagementController.resendInvite);

export default router;
