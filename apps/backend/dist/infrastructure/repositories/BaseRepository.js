"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async findById(id) {
        const doc = await this.model.findById(id);
        return doc ? this.toEntity(doc) : null;
    }
    async create(entity) {
        const created = await this.model.create(this.toPersistence(entity));
        return this.toEntity(created);
    }
}
exports.BaseRepository = BaseRepository;
