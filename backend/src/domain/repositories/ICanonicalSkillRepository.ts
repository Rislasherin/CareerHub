import { CanonicalSkill } from '../entities/CanonicalSkill';

export interface ICanonicalSkillRepository {
  /**
   * Find a canonical skill by its exact normalized name
   */
  findByNormalizedName(normalizedName: string): Promise<CanonicalSkill | null>;

  /**
   * Find a canonical skill that has the given string in its aliases array
   */
  findByAlias(normalizedAlias: string): Promise<CanonicalSkill | null>;

  /**
   * Search for skills matching the query (useful for autocomplete)
   */
  search(query: string, limit?: number): Promise<CanonicalSkill[]>;

  /**
   * Insert a new unverified skill, or update the timestamp if it exists (Upsert)
   */
  upsert(canonicalName: string, normalizedName: string): Promise<CanonicalSkill>;

  /**
   * Merge an alias into an existing canonical skill
   */
  addAlias(canonicalSkillId: string, normalizedAlias: string): Promise<void>;
}
