import { Router } from "express";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { makeInterviewerController } from "@infrastructure/di/interviewer.factory";
import { notificationController } from "@infrastructure/di/notification.factory";
import { makeInterviewerAuthController } from "@infrastructure/di/interviewer.factory";
import { validateDto } from "@presentation/express/middlewares/validateDto";
import { SubmitFeedbackDto } from "@application/dtos/interviewer/SubmitFeedback.dto";

const router = Router();
const controller = makeInterviewerController();
const authController = makeInterviewerAuthController();

router.use(authMiddleware.protect);

router.get("/dashboard", controller.getDashboard);
router.post("/interviews/:id/reschedule", controller.requestReschedule);
router.post("/interviews/:id/cancel", controller.cancelInterview);
router.post("/interviews/:id/feedback", validateDto(SubmitFeedbackDto), controller.submitFeedback.bind(controller));

router.get("/notifications", notificationController.getMyNotifications);
router.patch("/notifications/mark-all-read", notificationController.markAllAsRead);
router.patch("/notifications/:id/read", notificationController.markAsRead);

export default router;