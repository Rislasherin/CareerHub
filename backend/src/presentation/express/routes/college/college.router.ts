import { Router } from "express";
import { makeStudentManagementController, makeCollegeJobApprovalController, makeNoticeController } from "@infrastructure/di/college.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { validateDto } from "@presentation/express/middlewares/validateDto";
import { InviteStudentsDto } from "@application/dtos/auth/student/Request/InviteStudents.dto";

const router = Router();
const studentManagementController = makeStudentManagementController();
const collegeJobApprovalController = makeCollegeJobApprovalController();
const noticeController = makeNoticeController();

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

router.get("/jobs/pending", collegeJobApprovalController.getPendingJobs);
router.patch("/jobs/:jobId/approve", collegeJobApprovalController.approveJob);
router.patch("/jobs/:jobId/reject", collegeJobApprovalController.rejectJob);

router.post("/notices", noticeController.createNotice);
router.get("/notices", noticeController.getNotices);
router.patch("/notices/:id",noticeController.updateNotice.bind(noticeController));
router.delete("/notices/:id",noticeController.deleteNotice.bind(noticeController));

export default router;
