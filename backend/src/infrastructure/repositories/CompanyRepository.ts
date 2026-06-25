import { Company } from "@domain/entities/Company";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { CompanyDocument, CompanyModel } from "@infrastructure/database/models/company/company.model";
import { toCompanyPersistence, toCompanyEntity } from "@application/mappers/company.mapper";
import { BaseRepository } from "./BaseRepository";

export class CompanyRepository
  extends BaseRepository<Company, CompanyDocument>
  implements ICompanyRepository {
  constructor() {
    super(CompanyModel);
  }

  protected toEntity(doc: CompanyDocument): Company {
    return toCompanyEntity(doc);
  }

  protected toPersistence(entity: Company): Record<string, unknown> {
    return toCompanyPersistence(entity);
  }

  async findByName(name: string): Promise<Company | null> {
    const doc = await this.model.findOne({ name, isDeleted: { $ne: true } });
    return doc ? this.toEntity(doc as CompanyDocument) : null;
  }

  async searchCompanies(query: string, page: number, limit: number): Promise<{ companies: Company[], total: number }> {
    const skip = (page - 1) * limit;
    const filter = {
      name: { $regex: query, $options: "i" },
      isDeleted: { $ne: true }
    };

    const [docs, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.model.countDocuments(filter),
    ]);

    return {
      companies: docs.map((doc) => this.toEntity(doc as CompanyDocument)),
      total,
    };
  }

  async updateStatus(id: string, status: string, blockedBy?: string): Promise<void> {
    const update: Record<string, unknown> = { status };
    if (status?.toUpperCase() === 'BLOCKED' && blockedBy) {
      update.blockedBy = blockedBy;
    } else if (status?.toUpperCase() !== 'BLOCKED') {
      update.blockedBy = null;
    }
    await this.model.updateOne({ _id: id }, { $set: update });
  }
}

