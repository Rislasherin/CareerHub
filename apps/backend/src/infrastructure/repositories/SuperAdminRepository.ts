import { SuperAdmin } from "@domain/entities/SuperAdmin";
import { ISuperAdminRepository } from "@domain/repositories/ISuperAdminRepository";
import { SuperAdminDocument, SuperAdminModel } from "@infrastructure/database/models/superadmin/super-admin.model";
import { toSuperAdminEntity, toSuperAdminPersistence } from "@application/mappers/super-admin.mapper";
import { BaseRepository } from "./BaseRepository";

export class SuperAdminRepository
  extends BaseRepository<SuperAdmin, SuperAdminDocument>
  implements ISuperAdminRepository
{
  constructor() {
    super(SuperAdminModel);
  }

  protected toEntity(doc: SuperAdminDocument): SuperAdmin {
    return toSuperAdminEntity(doc);
  }

  protected toPersistence(entity: SuperAdmin): Record<string, unknown> {
    return toSuperAdminPersistence(entity);
  }

  async findByEmail(email: string): Promise<SuperAdmin | null> {
    const doc = await this.model.findOne({ email });
    return doc ? this.toEntity(doc as SuperAdminDocument) : null;
  }
}
