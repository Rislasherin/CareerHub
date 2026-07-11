import { ICanonicalSkillRepository } from '@domain/repositories/ICanonicalSkillRepository';
import { CanonicalSkill } from '@domain/entities/CanonicalSkill';
import { NormalizationUtil } from '@shared/utils/normalization.util';

import { ISearchSkillsUseCase } from '../interfaces/ISearchSkills.usecase';

export class SearchSkillsUseCase implements ISearchSkillsUseCase {
  constructor(private readonly _skillRepository: ICanonicalSkillRepository) {}

  public async execute(query: string, limit: number = 10): Promise<CanonicalSkill[]> {
    const normalizedQuery = NormalizationUtil.normalize(query);
    if (!normalizedQuery) {
      return [];
    }
    return await this._skillRepository.search(normalizedQuery, limit);
  }
}
