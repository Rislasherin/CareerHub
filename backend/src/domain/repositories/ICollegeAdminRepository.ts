import { IBaseRepository } from "./IBaseRepository";
import { CollegeAdmin } from "@domain/entities/CollegeAdmin";

export interface ICollegeAdminRepository extends IBaseRepository<CollegeAdmin> {
  findByEmail(email: string): Promise<CollegeAdmin | null>;
  findByOrgId(orgId: string): Promise<CollegeAdmin | null>;
  updateStatus(id: string, status: string, blockedBy?: string): Promise<void>;
}
