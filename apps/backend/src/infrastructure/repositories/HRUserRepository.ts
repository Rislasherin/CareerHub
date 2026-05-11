import { HRUser } from "@domain/entities/HRUser";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { HRUserDocument, HRUserModel } from "@infrastructure/database/models/company/hr-user.model";
import { toHRUserEntity, toHRUserPersistence } from "@infrastructure/mappers/hr-user.mapper";
import { BaseRepository } from "./BaseRepository";

export class HRUserRepository
  extends BaseRepository<HRUser, HRUserDocument>
  implements IHRUserRepository
{
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
}
