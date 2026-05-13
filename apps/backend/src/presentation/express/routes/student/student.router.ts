import { Router } from "express";
import { makeStudentController } from "@infrastructure/di/student.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";

import multer from "multer";

const router = Router();
const studentController = makeStudentController();
const upload = multer({ storage: multer.memoryStorage() });

// Use authMiddleware.protect for all routes in this router
router.use(authMiddleware.protect);

router.get("/me", studentController.getMe);
router.post("/verify", upload.single('file'), studentController.uploadVerification);

export default router;
