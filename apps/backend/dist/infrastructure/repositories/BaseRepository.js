"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async findById(id) {
        const doc = await this.model.findOne({ _id: id, isDeleted: { $ne: true } }).exec();
        return doc ? this.toEntity(doc) : null;
    }
    async create(entity) {
        const created = await this.model.create(this.toPersistence(entity));
        return this.toEntity(created);
    }
    async update(id, entity) {
        const updated = await this.model.findByIdAndUpdate(id, { $set: this.toPersistence(entity) }, { new: true });
        if (!updated) {
            throw new Error("Entity not found for update");
        }
        return this.toEntity(updated);
    }
    async delete(id) {
        const result = await this.model.findByIdAndUpdate(id, { isDeleted: true });
        if (!result) {
            throw new Error("Entity not found for deletion");
        }
    }
    async count(filter) {
        return this.model.countDocuments({ ...filter, isDeleted: { $ne: true } });
    }
}
exports.BaseRepository = BaseRepository;
