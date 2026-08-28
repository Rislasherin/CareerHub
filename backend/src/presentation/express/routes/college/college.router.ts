import { Router } from "express";
import { makeStudentManagementController, makeCollegeJobApprovalController, makeNoticeController, makeCollegePlacementController, makeCollegeReportsController, makeCollegeSettingsController } from "@infrastructure/di/college.factory";
import { notificationController } from "@infrastructure/di/notification.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { validateDto } from "@presentation/express/middlewares/validateDto";
import { InviteStudentsDto } from "@application/dtos/auth/student/Request/InviteStudents.dto";
import { UpdateCollegeProfileRequestDto } from "@application/dtos/college/settings/college-settings.dto";
import { ChangePasswordRequestDto, RequestEmailChangeDto, VerifyEmailChangeDto } from "@application/dtos/hr/settings/hr-settings.dto";

const router = Router();
const studentManagementController = makeStudentManagementController();
const collegeJobApprovalController = makeCollegeJobApprovalController();
const noticeController = makeNoticeController();
const collegePlacementController = makeCollegePlacementController();
const collegeReportsController = makeCollegeReportsController();
const collegeSettingsController = makeCollegeSettingsController();

router.get("/test", (req, res) => res.json({ success: true, message: "College router is active" }));

// Use authMiddleware.protect for all routes in this router
router.use(authMiddleware.protect);

router.patch("/status-toggle/:studentId", studentManagementController.toggleStatus);
router.get("/students/pending", studentManagementController.getPendingStudents);
router.post("/students/bulk-invite", validateDto(InviteStudentsDto), studentManagementController.bulkInvite);
router.patch("/students/:studentId/approve", studentManagementController.approveStudent);
router.patch("/students/:studentId/reject", studentManagementController.rejectStudent);
router.patch("/students/:studentId/approve-access", studentManagementController.approveAccessRequest);
router.get("/dashboard/stats", studentManagementController.getDashboardStats);
router.get("/students", studentManagementController.getAllStudents);

router.get("/interviews", collegePlacementController.getInterviews.bind(collegePlacementController));
router.get("/offers", collegePlacementController.getOffers.bind(collegePlacementController));
router.get("/reports/insights", collegeReportsController.getAnalytics.bind(collegeReportsController));
router.get("/reports/insights/export", collegeReportsController.exportAnalytics.bind(collegeReportsController));

router.get("/settings/profile", collegeSettingsController.getProfile.bind(collegeSettingsController));
router.patch("/settings/profile", validateDto(UpdateCollegeProfileRequestDto), collegeSettingsController.updateProfile.bind(collegeSettingsController));
router.patch("/settings/password", validateDto(ChangePasswordRequestDto), collegeSettingsController.changePassword.bind(collegeSettingsController));
router.post("/settings/email/request", validateDto(RequestEmailChangeDto), collegeSettingsController.requestEmailChange.bind(collegeSettingsController));
router.post("/settings/email/verify", validateDto(VerifyEmailChangeDto), collegeSettingsController.verifyEmailChange.bind(collegeSettingsController));

router.get("/jobs/pending", collegeJobApprovalController.getPendingJobs);
router.patch("/jobs/:jobId/approve", collegeJobApprovalController.approveJob);
router.patch("/jobs/:jobId/reject", collegeJobApprovalController.rejectJob);

router.post("/notices", noticeController.createNotice);
router.get("/notices", noticeController.getNotices);
router.patch("/notices/:id", noticeController.updateNotice.bind(noticeController));
router.delete("/notices/:id", noticeController.deleteNotice.bind(noticeController));

router.get("/notifications", notificationController.getMyNotifications);
router.patch("/notifications/mark-all-read", notificationController.markAllAsRead);
router.patch("/notifications/:id/read", notificationController.markAsRead);

export default router;
