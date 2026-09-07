import { Model } from "mongoose";
import { Plan } from "@domain/entities/Plan";
import { IPlanRepository } from "@domain/repositories/IPlanRepository";
import { PlanDocument } from "../database/models/organizer/plan.model";

export class PlanRepository implements IPlanRepository {
  constructor(private readonly model: Model<PlanDocument>) {}

  private toEntity(doc: PlanDocument): Plan {
    return new Plan({
      id: doc.id,
      name: doc.name,
      code: doc.code,
      price: doc.price,
      currency: doc.currency,
      billingInterval: doc.billingInterval,
      maxStudents: doc.maxStudents,
      aiCredits: doc.aiCredits,
      storageLimit: doc.storageLimit,
      features: doc.features,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<Plan | null> {
    const doc = await this.model.findOne({ id });
    return doc ? this.toEntity(doc) : null;
  }

  async findByCode(code: string): Promise<Plan | null> {
    const doc = await this.model.findOne({ code });
    return doc ? this.toEntity(doc) : null;
  }

  async findActivePlans(): Promise<Plan[]> {
    const docs = await this.model.find({ isActive: true });
    return docs.map((doc) => this.toEntity(doc));
  }

  async save(entity: Plan): Promise<void> {
    await this.model.findOneAndUpdate(
      { id: entity.id },
      { $set: entity.toJSON() },
      { upsert: true, new: true }
    );
  }

  async create(entity: Plan): Promise<Plan> {
    const doc = new this.model(entity.toJSON());
    await doc.save();
    return this.toEntity(doc);
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async update(id: string, entity: Plan): Promise<Plan> {
    const doc = await this.model.findOneAndUpdate(
      { id },
      { $set: entity.toJSON() },
      { new: true }
    );
    if (!doc) throw new Error("Plan not found");
    return this.toEntity(doc);
  }

  async delete(id: string): Promise<void> {
    await this.model.findOneAndDelete({ id });
  }

  async findAll(): Promise<{ data: Plan[]; total: number; }> {
    const [docs, total] = await Promise.all([
      this.model.find(),
      this.model.countDocuments()
    ]);
    return { data: docs.map(d => this.toEntity(d)), total };
  }
}
