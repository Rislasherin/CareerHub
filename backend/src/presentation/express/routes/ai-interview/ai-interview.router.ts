import { Router }                   from 'express';
import { authMiddleware }            from '@infrastructure/di/infra.container';
import { makeAIInterviewController } from '@infrastructure/di/ai-interview.factory';

const router     = Router();
const controller = makeAIInterviewController();

router.use(authMiddleware.protect);


router.post('/:id/join', controller.join);

export default router;
