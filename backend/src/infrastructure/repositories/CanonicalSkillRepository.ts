import { ICanonicalSkillRepository } from '@domain/repositories/ICanonicalSkillRepository';
import { CanonicalSkill } from '@domain/entities/CanonicalSkill';
import { CanonicalSkillModel } from '../database/schema/skills/canonical-skill.schema';

export class CanonicalSkillRepository implements ICanonicalSkillRepository {
  async findByNormalizedName(normalizedName: string): Promise<CanonicalSkill | null> {
    const doc = await CanonicalSkillModel.findOne({ normalizedName }).lean();
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  async findByAlias(normalizedAlias: string): Promise<CanonicalSkill | null> {
    const doc = await CanonicalSkillModel.findOne({ aliases: normalizedAlias }).lean();
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  async search(query: string, limit: number = 10): Promise<CanonicalSkill[]> {
    // Basic regex search for autocomplete. In a larger system, use Atlas Search or ElasticSearch
    const regex = new RegExp(`^${query}`, 'i'); 
    const docs = await CanonicalSkillModel.find({
      $or: [
        { normalizedName: { $regex: regex } },
        { aliases: { $regex: regex } }
      ]
    })
    .limit(limit)
    .lean();

    return docs.map(this.mapToEntity);
  }

  async upsert(canonicalName: string, normalizedName: string): Promise<CanonicalSkill> {
    const doc = await CanonicalSkillModel.findOneAndUpdate(
      { normalizedName },
      {
        $setOnInsert: {
          canonicalName,
          normalizedName,
          isVerified: false,
          aliases: []
        }
      },
      { upsert: true, new: true, lean: true }
    );
    return this.mapToEntity(doc);
  }

  async addAlias(canonicalSkillId: string, normalizedAlias: string): Promise<void> {
    await CanonicalSkillModel.findByIdAndUpdate(canonicalSkillId, {
      $addToSet: { aliases: normalizedAlias }
    });
  }

  private mapToEntity(doc: any): CanonicalSkill {
    return CanonicalSkill.create({
      id: doc._id.toString(),
      canonicalName: doc.canonicalName,
      normalizedName: doc.normalizedName,
      isVerified: doc.isVerified,
      aliases: doc.aliases,
      category: doc.category
    });
  }
}
