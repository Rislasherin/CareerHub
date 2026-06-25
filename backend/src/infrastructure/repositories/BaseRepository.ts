import { Model } from "mongoose";
import { IBaseRepository } from "@domain/repositories/IBaseRepository";

export abstract class BaseRepository<TEntity, TDocument> implements IBaseRepository<TEntity> {
  constructor(protected readonly model: Model<TDocument>) {}

  protected abstract toEntity(doc: TDocument): TEntity;
  protected abstract toPersistence(entity: TEntity): Record<string, unknown>;

  async findById(id: string): Promise<TEntity | null> {
    const doc = await this.model.findOne({ _id: id, isDeleted: { $ne: true } }).exec();
    return doc ? this.toEntity(doc as TDocument) : null;
  }

  async create(entity: TEntity): Promise<TEntity> {
    const created = await this.model.create(this.toPersistence(entity));
    return this.toEntity(created as TDocument);
  }

  async update(id: string, entity: TEntity): Promise<TEntity> {
    const updated = await this.model.findByIdAndUpdate(
      id,
      { $set: this.toPersistence(entity) },
      { new: true }
    );
    
    if (!updated) {
      throw new Error("Entity not found for update");
    }
    
    return this.toEntity(updated as TDocument);
  }

  async delete(id: string): Promise<void> {
    const result = await this.model.findByIdAndUpdate(id, { isDeleted: true });
    if (!result) {
      throw new Error("Entity not found for deletion");
    }
  }

  async count(filter: Record<string, unknown>): Promise<number> {
    return this.model.countDocuments({ ...filter, isDeleted: { $ne: true } });
  }
}
