import { CanonicalSkillRepository } from '@infrastructure/repositories/CanonicalSkillRepository';
import { SearchSkillsUseCase } from '@application/usecases/skills/implementations/SearchSkills.usecase';
import { ResolveSkillUseCase } from '@application/usecases/skills/implementations/ResolveSkill.usecase';
import { SkillController } from '@presentation/express/controllers/skill.controller';

const repository = new CanonicalSkillRepository();

export const makeSearchSkillsUseCase = () => {
  return new SearchSkillsUseCase(repository);
};

export const makeResolveSkillUseCase = () => {
  return new ResolveSkillUseCase(repository);
};

export const makeSkillController = () => {
  return new SkillController(makeSearchSkillsUseCase(), makeResolveSkillUseCase());
};
