import { Model } from "mongoose";
import { IBaseRepository } from "@domain/repositories/IBaseRepository";

export abstract class BaseRepository<TEntity, TDocument> implements IBaseRepository<TEntity> {
  constructor(protected readonly model: Model<TDocument>) {}

  protected abstract toEntity(doc: TDocument): TEntity;
  protected abstract toPersistence(entity: TEntity): Record<string, unknown>;

  async findById(id: string): Promise<TEntity | null> {
    const doc = await this.model.findById(id);
    return doc ? this.toEntity(doc as TDocument) : null;
  }

  async create(entity: TEntity): Promise<TEntity> {
    const created = await this.model.create(this.toPersistence(entity));
    return this.toEntity(created as TDocument);
  }
}
