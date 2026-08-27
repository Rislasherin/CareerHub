import { Router } from "express";
import { makeHRDashboardController, makeHRJobController, makeHROfferController, makeHRInterviewController } from "@infrastructure/di/hr.factory";
import { notificationController } from "@infrastructure/di/notification.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { validateDto } from "@presentation/express/middlewares/validateDto";
import { PostJobDto } from "@application/dtos/hr/Request/PostJob.dto";
import { RecordHRDecisionDto } from "@application/dtos/ai-interview/RecordHRDecision.dto";

const router = Router();
const hrDashboardController = makeHRDashboardController();
const hrJobController = makeHRJobController();
const hrOfferController = makeHROfferController();
const hrInterviewController = makeHRInterviewController();

// Protect all HR routes
router.use(authMiddleware.protect);

router.get("/dashboard/stats", hrDashboardController.getDashboardStats);


router.post("/jobs", validateDto(PostJobDto), hrJobController.postJob);
router.get("/jobs", hrJobController.getJobs);
router.put("/jobs/:jobId", validateDto(PostJobDto), hrJobController.updateJob);
router.patch("/jobs/:jobId/close", hrJobController.closeJob);
router.delete("/jobs/:jobId", hrJobController.deleteJob);
router.get("/candidates", hrJobController.getCandidates);
router.get("/candidates/:id", hrJobController.getCandidateProfile);
router.get("/jobs/:jobId/applications", hrJobController.getJobApplications);
router.get("/hire-requests", hrJobController.getHireRequests);
router.patch("/applications/:id/status", hrJobController.updateApplicationStatus);

router.post("/offers", hrOfferController.generateOffer);
router.get("/offers", hrOfferController.getHROffers);
router.post("/offers/:id/resend", hrOfferController.resendOfferEmail);
router.get("/offers/:id/pdf", hrOfferController.downloadOfferPdf);

router.post("/interviews", hrInterviewController.scheduleInterview);
router.get("/interviews", hrInterviewController.getInterviews);
router.get("/interviews/:interviewId/evaluation", hrInterviewController.getInterviewEvaluation);
router.post("/interviews/:interviewId/evaluation/decision", validateDto(RecordHRDecisionDto), hrInterviewController.recordHRDecision);
router.post("/interviews/:interviewId/evaluation/regenerate", hrInterviewController.regenerateInterviewEvaluation);

router.get("/notifications", notificationController.getMyNotifications);
router.patch("/notifications/mark-all-read", notificationController.markAllAsRead);
router.patch("/notifications/:id/read", notificationController.markAsRead);

export default router;
