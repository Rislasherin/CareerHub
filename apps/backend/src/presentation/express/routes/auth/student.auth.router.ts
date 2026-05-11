import { Router } from "express";
import { makeStudentAuthController } from "@infrastructure/di/auth.factory";
import { StudentLoginRequestDto } from "@application/dtos/auth/student/Request/login.student.request.dto";
import { RegisterStudentRequestDto } from "@application/dtos/auth/student/Request/register.student.request.dto";
import { validateDto } from "@presentation/express/middlewares/validateDto";

const router = Router();
const studentAuthController = makeStudentAuthController();

router.post("/login", validateDto(StudentLoginRequestDto), studentAuthController.login);
router.post("/register", validateDto(RegisterStudentRequestDto), studentAuthController.register);

export default router;
