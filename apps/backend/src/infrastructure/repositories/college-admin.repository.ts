import { CollegeAdmin } from "@domain/entities/CollegeAdmin";
import { BaseRepository } from "./BaseRepository";
import { CollegeAdminDocument } from "@infrastructure/database/models/organizer/college-admin.model";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { CollegeAdminModel } from "@infrastructure/database/models/organizer/college-admin.model";
import { toCollegeAdminEntity, toCollegeAdminPersistence } from "@infrastructure/mappers/college-admin.mapper";

export class CollegeAdminRepository
  extends BaseRepository<CollegeAdmin, CollegeAdminDocument>
  implements ICollegeAdminRepository {

    constructor(){
        super(CollegeAdminModel)
    }

    protected toEntity(doc: CollegeAdminDocument): CollegeAdmin {
        return toCollegeAdminEntity(doc)
    }

    protected toPersistence(entity: CollegeAdmin): Record<string, unknown> {
        return toCollegeAdminPersistence(entity)
    }

    async findByEmail(email: string): Promise<CollegeAdmin | null> {
        const doc = await this.model.findOne({ email, isDeleted: { $ne: true } })
        return doc ? this.toEntity(doc as CollegeAdminDocument) : null
    }

    async findByOrgId(orgId: string): Promise<CollegeAdmin | null> {
        const doc = await this.model.findOne({ orgId, isDeleted: { $ne: true } })
        return doc ? this.toEntity(doc as CollegeAdminDocument) : null
    }

    async updateStatus(id: string, status: string, blockedBy?: string): Promise<void> {
      const update: any = { status };
      if (status?.toUpperCase() === 'BLOCKED' && blockedBy) {
        update.blockedBy = blockedBy;
      } else if (status?.toUpperCase() !== 'BLOCKED') {
        update.blockedBy = null;
      }
      await this.model.updateOne({ _id: id }, { $set: update });
    }
  }
