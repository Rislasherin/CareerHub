import { HRUser } from "@domain/entities/HRUser";
import { IBaseRepository } from "./IBaseRepository";

export interface IHRUserRepository extends IBaseRepository<HRUser> {
  findByEmail(email: string): Promise<HRUser | null>;
  findByCompanyId(companyId: string): Promise<HRUser[]>;
  updateStatus(id: string, status: string, blockedBy?: string): Promise<void>;
}
