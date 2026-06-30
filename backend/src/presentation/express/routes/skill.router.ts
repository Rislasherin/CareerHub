import { Router } from 'express';
import { CanonicalSkillRepository } from '@infrastructure/repositories/CanonicalSkillRepository';
import { SearchSkillsUseCase } from '@application/usecases/skills/implementations/SearchSkills.usecase';
import { ResolveSkillUseCase } from '@application/usecases/skills/implementations/ResolveSkill.usecase';
import { SkillController } from '../controllers/skill.controller';

const router = Router();

// DI Setup
const repository = new CanonicalSkillRepository();
const searchUseCase = new SearchSkillsUseCase(repository);
const resolveUseCase = new ResolveSkillUseCase(repository);
const controller = new SkillController(searchUseCase, resolveUseCase);

router.get('/search', controller.searchSkills);
router.post('/resolve', controller.resolveSkill);

export default router;
