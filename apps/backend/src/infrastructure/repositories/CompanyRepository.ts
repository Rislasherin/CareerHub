import { Company } from "@domain/entities/Company";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { CompanyDocument, CompanyModel } from "@infrastructure/database/models/company/company.model";
import { toCompanyEntity, toCompanyPersistence } from "@infrastructure/mappers/company.mapper";
import { BaseRepository } from "./BaseRepository";

export class CompanyRepository
  extends BaseRepository<Company, CompanyDocument>
  implements ICompanyRepository
{
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
    const doc = await this.model.findOne({ name });
    return doc ? this.toEntity(doc as CompanyDocument) : null;
  }

  async update(entity: Company): Promise<Company> {
    const props = this.toPersistence(entity);
    const updated = await this.model.findByIdAndUpdate(entity.id, props, { new: true });
    return this.toEntity(updated as CompanyDocument);
  }

  async searchCompanies(query: string, page: number, limit: number): Promise<{ companies: Company[], total: number }> {
    const skip = (page - 1) * limit;
    const filter = {
        name: { $regex: query, $options: "i" }
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
}
