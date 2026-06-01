import { Router } from "express";
import { makeInterviewerManagementController, makeHRDashboardController } from "@infrastructure/di/hr.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";

import { validateDto } from "@presentation/express/middlewares/validateDto";
import { AddInterviewerDto } from "@application/dtos/hr/AddInterviewer.dto";
import { UpdateInterviewerDto } from "@application/dtos/hr/UpdateInterviewer.dto";

const router = Router();
const interviewerManagementController = makeInterviewerManagementController();
const hrDashboardController = makeHRDashboardController();

// Protect all HR routes
router.use(authMiddleware.protect);

router.get("/dashboard/stats", hrDashboardController.getDashboardStats);

router.post("/interviewers", validateDto(AddInterviewerDto), interviewerManagementController.addInterviewer);
router.get("/interviewers", interviewerManagementController.getInterviewers);
router.put("/interviewers/:interviewerId", validateDto(UpdateInterviewerDto), interviewerManagementController.updateInterviewer);
router.delete("/interviewers/:interviewerId", interviewerManagementController.deleteInterviewer);
router.post("/interviewers/:interviewerId/restore", interviewerManagementController.restoreInterviewer);
router.patch("/interviewers/:interviewerId/toggle-status", interviewerManagementController.toggleStatus);
router.post("/interviewers/:interviewerId/resend-invite", interviewerManagementController.resendInvite);

export default router;


