import { ICanonicalSkillRepository } from '@domain/repositories/ICanonicalSkillRepository';
import { CanonicalSkill } from '@domain/entities/CanonicalSkill';
import { NormalizationUtil } from '@shared/utils/normalization.util';

import { IResolveSkillUseCase } from '../interfaces/IResolveSkill.usecase';

export class ResolveSkillUseCase implements IResolveSkillUseCase {
  constructor(private readonly _skillRepository: ICanonicalSkillRepository) {}

  public async execute(rawInput: string): Promise<CanonicalSkill> {
    const normalizedInput = NormalizationUtil.normalize(rawInput);
    if (!normalizedInput) {
      throw new Error("Invalid skill input");
    }
    const exactMatch = await this._skillRepository.findByNormalizedName(normalizedInput);
    if (exactMatch) return exactMatch;
    const aliasMatch = await this._skillRepository.findByAlias(normalizedInput);
    if (aliasMatch) return aliasMatch;
    // Uses UPSERT to prevent race conditions
    return await this._skillRepository.upsert(rawInput.trim(), normalizedInput);
  }
}
