import { ICanonicalSkillRepository } from '@domain/repositories/ICanonicalSkillRepository';
import { CanonicalSkill } from '@domain/entities/CanonicalSkill';
import { CanonicalSkillModel } from '../database/schema/skills/canonical-skill.schema';

/** Shape of a raw lean Mongoose result for a canonical skill document */
interface ICanonicalSkillLean {
  _id: unknown;
  canonicalName: string;
  normalizedName: string;
  isVerified: boolean;
  aliases: string[];
  category?: string;
}

export class CanonicalSkillRepository implements ICanonicalSkillRepository {
  async findByNormalizedName(normalizedName: string): Promise<CanonicalSkill | null> {
    const doc = await CanonicalSkillModel.findOne({ normalizedName }).lean<ICanonicalSkillLean>();
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  async findByAlias(normalizedAlias: string): Promise<CanonicalSkill | null> {
    const doc = await CanonicalSkillModel.findOne({ aliases: normalizedAlias }).lean<ICanonicalSkillLean>();
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  async search(query: string, limit: number = 10): Promise<CanonicalSkill[]> {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedQuery}`, 'i');
    const docs = await CanonicalSkillModel.find({
      $or: [
        { normalizedName: { $regex: regex } },
        { aliases: { $regex: regex } }
      ]
    })
    .limit(limit)
    .lean<ICanonicalSkillLean[]>();

    return docs.map(doc => this.mapToEntity(doc));
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
    ).lean<ICanonicalSkillLean>();
    return this.mapToEntity(doc!);
  }

  async addAlias(canonicalSkillId: string, normalizedAlias: string): Promise<void> {
    await CanonicalSkillModel.findByIdAndUpdate(canonicalSkillId, {
      $addToSet: { aliases: normalizedAlias }
    });
  }

  private mapToEntity(doc: ICanonicalSkillLean): CanonicalSkill {
    return CanonicalSkill.create({
      id: String(doc._id),
      canonicalName: doc.canonicalName,
      normalizedName: doc.normalizedName,
      isVerified: doc.isVerified,
      aliases: doc.aliases,
      category: doc.category
    });
  }
}
