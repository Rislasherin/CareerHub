import { CanonicalSkill } from "@domain/entities/CanonicalSkill";

export interface IResolveSkillUseCase {
    execute(rawInput: string): Promise<CanonicalSkill>;
}
