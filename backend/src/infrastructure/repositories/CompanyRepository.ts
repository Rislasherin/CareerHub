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

  async searchCompanies(query: string, page: number, limit: number, status?: string): Promise<{ companies: Company[], total: number }> {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {
      name: { $regex: query, $options: "i" },
      isDeleted: { $ne: true }
    };

    if (status) {
      if (status.toUpperCase() === 'APPROVED') {
        filter.status = { $regex: '^(ACTIVE|APPROVED)$', $options: 'i' };
      } else if (status.toUpperCase() === 'ACTIVE') {
        filter.status = { $regex: '^(ACTIVE|APPROVED)$', $options: 'i' };
      } else {
        filter.status = { $regex: `^${status}$`, $options: 'i' };
      }
    }

    const [docs, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.model.countDocuments(filter),
    ]);

    return {
      companies: docs.map((doc) => this.toEntity(doc as CompanyDocument)),
      total,
    };
  }

  async updateStatus(id: string, status: string, blockedBy?: string, rejectionReason?: string, adminId?: string): Promise<void> {
    const update: Record<string, unknown> = { status };
    const historyEntry = {
      status,
      changedAt: new Date(),
      changedBy: adminId || blockedBy,
      reason: rejectionReason
    };

    if (status?.toUpperCase() === 'BLOCKED' && blockedBy) {
      update.blockedBy = blockedBy;
    } else if (status?.toUpperCase() !== 'BLOCKED') {
      update.blockedBy = null;
    }

    if (status?.toUpperCase() === 'REJECTED') {
      update.rejectionReason = rejectionReason;
      update.rejectedAt = new Date();
    } else if (status?.toUpperCase() === 'ACTIVE' || status?.toUpperCase() === 'APPROVED') {
      update.approvedAt = new Date();
      update.rejectionReason = null;
    } else if (status?.toUpperCase() === 'PENDING') {
      update.resubmittedAt = new Date();
    }

    await this.model.updateOne(
      { _id: id }, 
      { 
        $set: update,
        $push: { statusHistory: historyEntry }
      }
    );
  }
}

