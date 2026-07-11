import { CanonicalSkill } from "@domain/entities/CanonicalSkill";

export interface ISearchSkillsUseCase {
    execute(query: string, limit?: number): Promise<CanonicalSkill[]>;
}
