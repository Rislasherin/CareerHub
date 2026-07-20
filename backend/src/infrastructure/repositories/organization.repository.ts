import { Organization } from "@domain/entities/Organization";
import { BaseRepository } from "./BaseRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { toOrganizationEntity,toOrganizationPersistence } from "@application/mappers/organization.mapper";
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
    const doc = await this.model.findOne({ name, isDeleted: { $ne: true } });
    return doc ? this.toEntity(doc as OrganizationDocument) : null;
  }

  async searchOrganizations(query: string, page: number, limit: number, status?: string): Promise<{ organizations: Organization[], total: number }> {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {
        name: { $regex: query, $options: "i" },
        isDeleted: { $ne: true }
    };
    if (status) {
      filter.status = { $regex: `^${status}$`, $options: 'i' };
    }

    const [docs, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.model.countDocuments(filter),
    ]);

    return {
      organizations: docs.map((doc) => this.toEntity(doc as OrganizationDocument)),
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
    // Set trial start when admin approves a PENDING org
    if (status?.toUpperCase() === 'ACTIVE') {
      const existing = await this.model.findById(id).select('trialEndsAt');
      if (existing && !existing.trialEndsAt) {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        update.trialEndsAt = trialEnd;
      }
    }
    await this.model.updateOne({ _id: id }, { $set: update });
  }

  async extendTrial(orgId: string, days: number): Promise<void> {
    const org = await this.model.findById(orgId).select('trialEndsAt');
    const base = org?.trialEndsAt && new Date(org.trialEndsAt) > new Date()
      ? new Date(org.trialEndsAt)
      : new Date();
    base.setDate(base.getDate() + days);
    await this.model.updateOne({ _id: orgId }, { $set: { trialEndsAt: base } });
  }

}