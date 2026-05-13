import { Router } from "express";
import { makeStudentAuthController } from "@infrastructure/di/auth.factory";
import { StudentLoginRequestDto } from "@application/dtos/auth/student/Request/login.student.request.dto";
import { RequestAccessDto } from "@application/dtos/auth/student/Request/RequestAccess.dto";
import { SetupPasswordDto } from "@application/dtos/auth/student/Request/SetupPassword.dto";
import { validateDto } from "@presentation/express/middlewares/validateDto";

import { authMiddleware } from "@infrastructure/di/infra.container";

const router = Router();
const studentAuthController = makeStudentAuthController();

router.post("/login", validateDto(StudentLoginRequestDto), studentAuthController.login);
router.post("/request-access", validateDto(RequestAccessDto), studentAuthController.requestAccess);
router.post("/setup-password", validateDto(SetupPasswordDto), studentAuthController.setupPassword);
router.get("/verify-token/:token", studentAuthController.verifyInvitationToken);
router.get("/me", authMiddleware.protect, studentAuthController.getMe);

export default router;
