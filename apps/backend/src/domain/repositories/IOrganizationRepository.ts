import { IBaseRepository } from "./IBaseRepository";
import { Organization } from "@domain/entities/Organization";

export interface IOrganizationRepository extends IBaseRepository<Organization> {
    findByName(name:string) :Promise<Organization | null>
    searchOrganizations(query: string, page: number, limit: number, status?: string): Promise<{ organizations: Organization[], total: number }>;
    updateStatus(id: string, status: string, blockedBy?: string): Promise<void>;
}