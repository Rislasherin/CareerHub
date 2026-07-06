import { Router } from 'express';
import { makeSkillController } from '@infrastructure/di/skill.factory';

const router = Router();

// DI Setup
const controller = makeSkillController();

router.get('/search', controller.searchSkills);
router.post('/resolve', controller.resolveSkill);

export default router;
