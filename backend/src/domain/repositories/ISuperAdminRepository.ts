import { SuperAdmin } from "@domain/entities/SuperAdmin";
import { IBaseRepository } from "./IBaseRepository";

export interface ISuperAdminRepository extends IBaseRepository<SuperAdmin> {
  findByEmail(email: string): Promise<SuperAdmin | null>;
}
