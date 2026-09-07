import { Model } from "mongoose";
import { AIUsageRecord } from "@domain/entities/AIUsageRecord";
import { IAIUsageRepository } from "@domain/repositories/IAIUsageRepository";
import { AIUsageRecordDocument } from "../database/models/ai/aiUsageRecord.model";

export class AIUsageRepository implements IAIUsageRepository {
  constructor(private readonly model: Model<AIUsageRecordDocument>) {}

  private toEntity(doc: AIUsageRecordDocument): AIUsageRecord {
    return new AIUsageRecord({
      id: doc.id,
      subscriptionId: doc.subscriptionId ?? undefined,
      collegeId: doc.collegeId,
      userId: doc.userId,
      feature: doc.feature,
      creditsConsumed: doc.creditsConsumed ?? undefined,
      reservedCredits: doc.reservedCredits ?? undefined,
      status: doc.status as any,
      provider: doc.provider ?? undefined,
      model: doc.model ?? undefined,
      tokens: doc.tokens ?? undefined,
      metadata: doc.metadata ?? undefined,
      committedAt: doc.committedAt ?? undefined,
      releasedAt: doc.releasedAt ?? undefined,
      expiresAt: doc.expiresAt ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<AIUsageRecord | null> {
    const doc = await this.model.findOne({ id });
    return doc ? this.toEntity(doc) : null;
  }

  async findByCollegeId(collegeId: string): Promise<AIUsageRecord[]> {
    const docs = await this.model.find({ collegeId }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  async getTotalCreditsConsumedByCollege(collegeId: string): Promise<number> {
    const result = await this.model.aggregate([
      { $match: { collegeId } },
      { $group: { _id: null, total: { $sum: "$creditsConsumed" } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  async getUsageStatsByCollege(): Promise<{ collegeId: string; totalConsumed: number }[]> {
    const result = await this.model.aggregate([
      { $group: { _id: "$collegeId", totalConsumed: { $sum: "$creditsConsumed" } } }
    ]);
    return result.map((r: any) => ({ collegeId: r._id, totalConsumed: r.totalConsumed }));
  }

  async save(entity: AIUsageRecord): Promise<void> {
    await this.model.findOneAndUpdate(
      { id: entity.id },
      { $set: entity.toJSON() },
      { upsert: true, new: true }
    );
  }

  async create(entity: AIUsageRecord): Promise<AIUsageRecord> {
    const doc = new this.model(entity.toJSON());
    await doc.save();
    return this.toEntity(doc);
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async update(id: string, entity: AIUsageRecord): Promise<AIUsageRecord> {
    const doc = await this.model.findOneAndUpdate(
      { id },
      { $set: entity.toJSON() },
      { new: true }
    );
    if (!doc) throw new Error("Not found");
    return this.toEntity(doc);
  }

  async delete(id: string): Promise<void> {
    await this.model.findOneAndDelete({ id });
  }

  async findAll(filters: any = {}): Promise<{ data: AIUsageRecord[]; total: number; }> {
    const query: any = {};
    if (filters.collegeId) query.collegeId = filters.collegeId;
    if (filters.feature) query.feature = filters.feature;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const [docs, total] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }),
      this.model.countDocuments(query)
    ]);
    return { data: docs.map(d => this.toEntity(d)), total };
  }
}
