import { ICanonicalSkillRepository } from '@domain/repositories/ICanonicalSkillRepository';

export class MergeSkillUseCase {
  constructor(private readonly skillRepository: ICanonicalSkillRepository) {}

  public async execute(targetSkillId: string, sourceSkillNormalizedName: string): Promise<void> {
    await this.skillRepository.addAlias(targetSkillId, sourceSkillNormalizedName);

  }
}
