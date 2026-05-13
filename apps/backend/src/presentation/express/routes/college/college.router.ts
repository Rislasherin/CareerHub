import { Router } from "express";
import { makeStudentManagementController } from "@infrastructure/di/college.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { validateDto } from "@presentation/express/middlewares/validateDto";
import { InviteStudentsDto } from "@application/dtos/auth/student/Request/InviteStudents.dto";

const router = Router();
const studentManagementController = makeStudentManagementController();

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

export default router;
