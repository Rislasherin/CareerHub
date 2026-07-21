import { Router } from "express";
import { makeStudentController } from "@infrastructure/di/student.factory";
import { notificationController } from "@infrastructure/di/notification.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { validateDto } from "@presentation/express/middlewares/validateDto";
import { UpdateStudentProfileDto } from "@application/dtos/student/UpdateStudentProfile.dto";
import multer from "multer";
import { ResumeFactory } from "@infrastructure/di/resume.factory";

const router = Router();
const studentController = makeStudentController();
const upload = multer({ storage: multer.memoryStorage() });
const resumeController = ResumeFactory.createResumeController();

// Use authMiddleware.protect for all routes in this router
router.use(authMiddleware.protect);

router.get("/me", studentController.getMe);
router.post("/verify", upload.single('file'), studentController.uploadVerification);

router.get("/profile", studentController.getProfile);
router.put("/profile", validateDto(UpdateStudentProfileDto), studentController.updateProfile);
router.post("/profile/generate-summary", studentController.generateProfessionalSummary.bind(studentController));

router.get("/jobs", studentController.getJobs);
router.post("/jobs/:id/apply", studentController.applyJob);

router.get("/applications", studentController.getApplications.bind(studentController));
router.get("/offers", studentController.getOffers.bind(studentController));
router.patch("/offers/:id/respond", studentController.respondToOffer.bind(studentController));
router.get("/offers/:id/pdf", studentController.downloadOfferPdf.bind(studentController));

router.get("/notices", studentController.getNotices.bind(studentController));

router.post('/profile/resume', upload.single('resume'), studentController.uploadResume.bind(studentController));
router.delete('/profile/resume', studentController.deleteResume.bind(studentController));

router.get("/interviews", studentController.getInterviews.bind(studentController));

router.get("/notifications", notificationController.getMyNotifications);
router.patch("/notifications/mark-all-read", notificationController.markAllAsRead);
router.patch("/notifications/:id/read", notificationController.markAsRead);

router.post('/resume/analyze', resumeController.analyze);
router.post('/resume/sync', resumeController.syncProfile);
router.patch('/resume/settings', resumeController.updateSettings);
router.get('/resume/export', resumeController.exportPdf);
router.get('/resume/preview', resumeController.previewHtml);
router.post('/resume/autofix', resumeController.autoFix);
router.post('/resume/rewrite-all', resumeController.rewriteAll);

router.get('/resumes', resumeController.getAll);
router.post('/resumes', resumeController.create);
router.post('/resume/match-job', resumeController.matchJob);
router.post('/resume/coach-section', resumeController.coachSection);

export default router;
