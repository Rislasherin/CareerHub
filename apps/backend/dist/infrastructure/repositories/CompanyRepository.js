"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRepository = void 0;
const company_model_1 = require("@infrastructure/database/models/company/company.model");
const company_mapper_1 = require("@infrastructure/mappers/company.mapper");
const BaseRepository_1 = require("./BaseRepository");
class CompanyRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(company_model_1.CompanyModel);
    }
    toEntity(doc) {
        return (0, company_mapper_1.toCompanyEntity)(doc);
    }
    toPersistence(entity) {
        return (0, company_mapper_1.toCompanyPersistence)(entity);
    }
    async findByName(name) {
        const doc = await this.model.findOne({ name });
        return doc ? this.toEntity(doc) : null;
    }
    async searchCompanies(query, page, limit) {
        const skip = (page - 1) * limit;
        const filter = {
            name: { $regex: query, $options: "i" }
        };
        const [docs, total] = await Promise.all([
            this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.model.countDocuments(filter),
        ]);
        return {
            companies: docs.map((doc) => this.toEntity(doc)),
            total,
        };
    }
    async updateStatus(id, status) {
        await this.model.findByIdAndUpdate(id, { status });
    }
}
exports.CompanyRepository = CompanyRepository;
