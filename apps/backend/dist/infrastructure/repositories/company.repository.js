"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRepository = void 0;
const company_entity_1 = require("@domain/entities/company.entity");
const company_model_1 = require("@infrastructure/database/models/company.model");
class CompanyRepository {
    async create(company) {
        const created = await company_model_1.CompanyModel.create({
            name: company.getName(),
            size: company.getSize(),
            industry: company.getIndustry(),
            primaryContactName: company.getPrimaryContactName(),
            primaryContactEmail: company.getPrimaryContactEmail(),
            primaryContactPhone: company.getPrimaryContactPhone(),
        });
        return company_entity_1.CompanyEntity.create({
            id: created._id.toString(),
            name: created.name,
            size: created.size,
            industry: created.industry,
            primaryContactName: created.primaryContactName,
            primaryContactEmail: created.primaryContactEmail,
            primaryContactPhone: created.primaryContactPhone,
        });
    }
    async findByName(name) {
        const document = await company_model_1.CompanyModel.findOne({ name }).exec();
        if (!document) {
            return null;
        }
        return company_entity_1.CompanyEntity.create({
            id: document._id.toString(),
            name: document.name,
            size: document.size,
            industry: document.industry,
            primaryContactName: document.primaryContactName,
            primaryContactEmail: document.primaryContactEmail,
            primaryContactPhone: document.primaryContactPhone,
        });
    }
}
exports.CompanyRepository = CompanyRepository;
