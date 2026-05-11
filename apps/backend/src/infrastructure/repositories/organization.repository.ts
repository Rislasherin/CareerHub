import { Organization } from "@domain/entities/Organization";
import { BaseRepository } from "./BaseRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { toOrganizationEntity,toOrganizationPersistence } from "@infrastructure/mappers/organization.mapper";
import { OrganizationDocument, OrganizationModel } from "@infrastructure/database/models/organizer/organization.model";


export class OrganizationRepository extends BaseRepository
<Organization,OrganizationDocument> implements IOrganizationRepository {

    constructor(){
        super(OrganizationModel)
    }

    protected toEntity(doc: OrganizationDocument): Organization {
        return toOrganizationEntity(doc)
    }

    protected toPersistence(entity: Organization): Record<string, unknown> {
        return toOrganizationPersistence(entity)
    }

    async findByName(name: string): Promise<Organization | null> {
    const doc = await this.model.findOne({ name });
    return doc ? this.toEntity(doc as any) : null;
  }

  async searchOrganizations(query: string, page: number, limit: number): Promise<{ organizations: Organization[], total: number }> {
    const skip = (page - 1) * limit;
    const filter = {
        name: { $regex: query, $options: "i" }
    };

    const [docs, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.model.countDocuments(filter),
    ]);

    return {
      organizations: docs.map((doc) => this.toEntity(doc as any)),
      total,
    };
  }

}