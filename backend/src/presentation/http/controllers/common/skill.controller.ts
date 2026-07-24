import { Request, Response } from 'express';
import { ISearchSkillsUseCase } from '@application/usecases/skills/interfaces/ISearchSkills.usecase';
import { IResolveSkillUseCase } from '@application/usecases/skills/interfaces/IResolveSkill.usecase';
import { sendSuccess } from '@shared/utils/response.util';
import { asyncHandler } from '@shared/utils/asyncHandler.util';
import { MESSAGES } from '@shared/constants/messages.constants';
import { AppError } from '@application/errors/AppError';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { ErrorCode } from '@domain/enums/ErrorCodes.enum';

export class SkillController {
  constructor(
    private readonly _searchSkillsUseCase: ISearchSkillsUseCase,
    private readonly _resolveSkillUseCase: IResolveSkillUseCase
  ) {}

  public searchSkills = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 10;

    const skills = await this._searchSkillsUseCase.execute(query, limit);

    sendSuccess(res, skills, MESSAGES.SUCCESS.SKILLS_RETRIEVED);
  });

  public resolveSkill = asyncHandler(async (req: Request, res: Response) => {
    const { skillName } = req.body;
    if (!skillName) {
      throw new AppError('Skill name is required', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const skill = await this._resolveSkillUseCase.execute(skillName);

    sendSuccess(res, skill, MESSAGES.SUCCESS.SKILL_RESOLVED);
  });
}
