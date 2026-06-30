import { ICanonicalSkillRepository } from '@domain/repositories/ICanonicalSkillRepository';
import { CanonicalSkill } from '@domain/entities/CanonicalSkill';
import { NormalizationUtil } from '@shared/utils/normalization.util';

export class ResolveSkillUseCase {
  constructor(private readonly skillRepository: ICanonicalSkillRepository) {}

  public async execute(rawInput: string): Promise<CanonicalSkill> {
    const normalizedInput = NormalizationUtil.normalize(rawInput);
    if (!normalizedInput) {
      throw new Error("Invalid skill input");
    }

    // 1. Try Exact Match on Canonical Name
    const exactMatch = await this.skillRepository.findByNormalizedName(normalizedInput);
    if (exactMatch) return exactMatch;

    // 2. Try Exact Match on Aliases
    const aliasMatch = await this.skillRepository.findByAlias(normalizedInput);
    if (aliasMatch) return aliasMatch;

    // 3. No match found, create a new UNVERIFIED canonical entity
    // Uses UPSERT to prevent race conditions
    return await this.skillRepository.upsert(rawInput.trim(), normalizedInput);
  }
}
