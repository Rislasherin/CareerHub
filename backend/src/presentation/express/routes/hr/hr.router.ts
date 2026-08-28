import { Router } from "express";
import { makeHRDashboardController, makeHRAnalyticsController, makeHRJobController, makeHROfferController, makeHRInterviewController, makeHRSettingsController } from "@infrastructure/di/hr.factory";
import { notificationController } from "@infrastructure/di/notification.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { validateDto } from "@presentation/express/middlewares/validateDto";
import { PostJobDto } from "@application/dtos/hr/Request/PostJob.dto";
import { RecordHRDecisionDto } from "@application/dtos/ai-interview/RecordHRDecision.dto";
import { ChangePasswordRequestDto, RequestEmailChangeDto, VerifyEmailChangeDto } from "@application/dtos/hr/settings/hr-settings.dto";

const router = Router();
const hrDashboardController = makeHRDashboardController();
const hrAnalyticsController = makeHRAnalyticsController();
const hrJobController = makeHRJobController();
const hrOfferController = makeHROfferController();
const hrInterviewController = makeHRInterviewController();
const hrSettingsController = makeHRSettingsController();

// Protect all HR routes
router.use(authMiddleware.protect);

router.get("/dashboard/stats", hrDashboardController.getDashboardStats);
router.get("/insights", hrAnalyticsController.getAnalytics);
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

router.get("/settings/account", hrSettingsController.getProfile);
router.patch("/settings/account", hrSettingsController.updateProfile);
router.patch("/settings/account/password", validateDto(ChangePasswordRequestDto), hrSettingsController.changePassword);
router.post("/settings/account/email/request", validateDto(RequestEmailChangeDto), hrSettingsController.requestEmailChange);
router.post("/settings/account/email/verify", validateDto(VerifyEmailChangeDto), hrSettingsController.verifyEmailChange);
router.get("/settings/company", hrSettingsController.getCompanyProfile);
router.patch("/settings/company", hrSettingsController.updateCompanyProfile);

export default router;
