import { SubmitFeedbackDto } from "@application/dtos/interviewer/SubmitFeedback.dto";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { makeInterviewerController } from "@infrastructure/di/interviewer.factory";
import { validateDto } from "@presentation/express/middlewares/validateDto";
import { InterviewerController } from "@presentation/http/controllers/interviewer/interviewer.controller";
import { Router } from "express";

const router = Router()
const controller = makeInterviewerController();

router.use(authMiddleware.protect);

router.get("/dashboard",controller.getDashboard);
router.post("/interviews/:id/reschedule", controller.requestReschedule);
router.post('/interviews/:id/feedback', validateDto(SubmitFeedbackDto), controller.submitFeedback.bind(controller));

export default router 