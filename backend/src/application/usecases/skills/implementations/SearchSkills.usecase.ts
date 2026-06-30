import { ICanonicalSkillRepository } from '@domain/repositories/ICanonicalSkillRepository';
import { CanonicalSkill } from '@domain/entities/CanonicalSkill';
import { NormalizationUtil } from '@shared/utils/normalization.util';

export class SearchSkillsUseCase {
  constructor(private readonly skillRepository: ICanonicalSkillRepository) {}

  public async execute(query: string, limit: number = 10): Promise<CanonicalSkill[]> {
    const normalizedQuery = NormalizationUtil.normalize(query);
    if (!normalizedQuery) {
      return [];
    }
    return await this.skillRepository.search(normalizedQuery, limit);
  }
}
