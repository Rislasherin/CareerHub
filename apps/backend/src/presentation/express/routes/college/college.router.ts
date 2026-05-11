import { Router } from "express";
import { makeStudentManagementController } from "@infrastructure/di/college.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";

const router = Router();
const studentManagementController = makeStudentManagementController();

// Use authMiddleware.protect for all routes in this router
router.use(authMiddleware.protect);

router.get("/students/pending", studentManagementController.getPendingStudents);
router.patch("/students/:studentId/approve", studentManagementController.approveStudent);
router.patch("/students/:studentId/reject", studentManagementController.rejectStudent);

export default router;
