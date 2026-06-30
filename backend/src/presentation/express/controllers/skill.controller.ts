import { Request, Response } from 'express';
import { SearchSkillsUseCase } from '@application/usecases/skills/implementations/SearchSkills.usecase';
import { ResolveSkillUseCase } from '@application/usecases/skills/implementations/ResolveSkill.usecase';
import { sendSuccess } from '@shared/utils/response.util';
import { asyncHandler } from '@shared/utils/asyncHandler.util';

export class SkillController {
  constructor(
    private readonly searchSkillsUseCase: SearchSkillsUseCase,
    private readonly resolveSkillUseCase: ResolveSkillUseCase
  ) {}

  public searchSkills = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string || '';
    const limit = parseInt(req.query.limit as string) || 10;
    
    const skills = await this.searchSkillsUseCase.execute(query, limit);
    
    sendSuccess(res, skills, 'Skills retrieved successfully');
  });

  public resolveSkill = asyncHandler(async (req: Request, res: Response) => {
    const { skillName } = req.body;
    if (!skillName) {
      res.status(400).json({ success: false, message: 'Skill name is required' });
      return;
    }
    
    const skill = await this.resolveSkillUseCase.execute(skillName);
    
    sendSuccess(res, skill, 'Skill resolved successfully');
  });
}
