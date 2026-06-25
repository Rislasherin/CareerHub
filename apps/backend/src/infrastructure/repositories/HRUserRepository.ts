import { HRUser } from "@domain/entities/HRUser";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { HRUserDocument, HRUserModel } from "@infrastructure/database/models/company/hr-user.model";
import { toHRUserEntity, toHRUserPersistence } from "@application/mappers/hr-user.mapper";
import { BaseRepository } from "./BaseRepository";

export class HRUserRepository
  extends BaseRepository<HRUser, HRUserDocument>
  implements IHRUserRepository {
  constructor() {
    super(HRUserModel);
  }

  protected toEntity(doc: HRUserDocument): HRUser {
    return toHRUserEntity(doc);
  }

  protected toPersistence(entity: HRUser): Record<string, unknown> {
    return toHRUserPersistence(entity);
  }

  async findByEmail(email: string): Promise<HRUser | null> {
    const doc = await this.model.findOne({ email });
    return doc ? this.toEntity(doc as HRUserDocument) : null;
  }

  async findByCompanyId(companyId: string): Promise<HRUser[]> {
    const docs = await this.model.find({ companyId });
    return docs.map((doc) => this.toEntity(doc as HRUserDocument));
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

  async searchHRUsers(query: string, page: number, limit: number): Promise<{ hrUsers: HRUser[], total: number }> {
    const skip = (page - 1) * limit;
    const filter = {
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ],
      isDeleted: { $ne: true }
    };

    const [docs, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.model.countDocuments(filter),
    ]);

    return {
      hrUsers: docs.map((doc) => this.toEntity(doc as HRUserDocument)),
      total,
    };
  }
}
