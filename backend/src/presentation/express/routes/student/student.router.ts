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
const aiInterviewController = makeAIInterviewController();
const aiPracticeController = makeAIPracticeController()

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


import { validateSchema } from "@presentation/express/middlewares/validateSchema";
import {
  SyncProfileSchema,
  UpdateSettingsSchema,
  AutoFixSchema,
  RewriteAllSchema,
  CreateResumeSchema,
  MatchJobSchema,
  CoachSectionSchema,
  AnalyzeSchema
} from "@application/dtos/student/resume.dto";
import { makeAIInterviewController } from "@infrastructure/di/ai-interview.factory";
import { makeAIPracticeController } from "@infrastructure/di/ai-practice.factory";
import { CreateAIPracticeInterviewRequestDto } from "@application/dtos/ai-practice/CreateAIPracticeInterviewRequest";
import { SubmitAnswerRequestDto } from "@application/dtos/ai-practice/SubmitAnswerRequest.dto";

router.get("/notifications", notificationController.getMyNotifications);
router.patch("/notifications/mark-all-read", notificationController.markAllAsRead);
router.patch("/notifications/:id/read", notificationController.markAsRead);

router.post('/resume/analyze', validateSchema(AnalyzeSchema), resumeController.analyze);
router.post('/resume/sync', validateSchema(SyncProfileSchema), resumeController.syncProfile);
router.patch('/resume/settings', validateSchema(UpdateSettingsSchema), resumeController.updateSettings);
router.get('/resume/export', resumeController.exportPdf);
router.get('/resume/preview', resumeController.previewHtml);
router.post('/resume/autofix', validateSchema(AutoFixSchema), resumeController.autoFix);
router.post('/resume/rewrite-all', validateSchema(RewriteAllSchema), resumeController.rewriteAll);
router.get('/resumes', resumeController.getAll);
router.post('/resumes', validateSchema(CreateResumeSchema), resumeController.create);
router.post('/resume/match-job', validateSchema(MatchJobSchema), resumeController.matchJob);
router.post('/resume/coach-section', validateSchema(CoachSectionSchema), resumeController.coachSection);



//ai-interview 
router.post("/interviews/:interviewId/start", aiInterviewController.startInterview);
router.get("/interviews/session/:sessionId/token", aiInterviewController.getLiveKitToken);
router.get("/interviews/session/:sessionId/status", aiInterviewController.getSessionStatus);
router.post("/interviews/:sessionId/questions/:questionId/answer", aiInterviewController.processAnswer);
router.post("/interviews/session/:sessionId/integrity-event", aiInterviewController.recordIntegrityEvent);


//ai-practice
router.get("/ai-practice/user/latest-completed", aiPracticeController.getLatestCompletedPractice);
router.post("/ai-practice", validateDto(CreateAIPracticeInterviewRequestDto), aiPracticeController.createPracticeInterview);
router.get("/ai-practice/:id", aiPracticeController.getPracticeInterview);
router.post("/ai-practice/:id/start", aiPracticeController.startPracticeInterview);
router.get("/ai-practice/:id/room-token", aiPracticeController.getPracticeRoomToken);
router.post("/ai-practice/:id/answer", validateDto(SubmitAnswerRequestDto), aiPracticeController.submitPracticeAnswer);


export default router;

