import { Router } from "express";
import { makeInterviewerManagementController, makeHRDashboardController, makeHRJobController } from "@infrastructure/di/hr.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";

import { validateDto } from "@presentation/express/middlewares/validateDto";
import { AddInterviewerDto } from "@application/dtos/hr/AddInterviewer.dto";
import { UpdateInterviewerDto } from "@application/dtos/hr/UpdateInterviewer.dto";
import { PostJobDto } from "@application/dtos/hr/PostJob.dto";

const router = Router();
const interviewerManagementController = makeInterviewerManagementController();
const hrDashboardController = makeHRDashboardController();
const hrJobController = makeHRJobController();

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

router.post("/jobs", validateDto(PostJobDto), hrJobController.postJob);
router.get("/jobs", hrJobController.getJobs);
router.put("/jobs/:jobId", validateDto(PostJobDto), hrJobController.updateJob);
router.patch("/jobs/:jobId/close", hrJobController.closeJob);
router.delete("/jobs/:jobId", hrJobController.deleteJob);
router.get("/candidates", hrJobController.getCandidates);

export default router;



