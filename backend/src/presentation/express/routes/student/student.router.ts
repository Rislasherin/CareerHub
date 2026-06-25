import { Router } from "express";
import { makeStudentController } from "@infrastructure/di/student.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { validateDto } from "@presentation/express/middlewares/validateDto";
import { UpdateStudentProfileDto } from "@application/dtos/student/UpdateStudentProfile.dto";
import multer from "multer";

const router = Router();
const studentController = makeStudentController();
const upload = multer({ storage: multer.memoryStorage() });

// Use authMiddleware.protect for all routes in this router
router.use(authMiddleware.protect);

router.get("/me", studentController.getMe);
router.post("/verify", upload.single('file'), studentController.uploadVerification);

router.get("/profile", studentController.getProfile);
router.put("/profile", validateDto(UpdateStudentProfileDto), studentController.updateProfile);

router.get("/jobs", studentController.getJobs);
router.post("/jobs/:id/apply", studentController.applyJob);

router.get("/notices",studentController.getNotices.bind(studentController));
export default router;
