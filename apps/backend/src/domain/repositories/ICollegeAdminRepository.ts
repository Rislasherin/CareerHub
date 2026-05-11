import { IBaseRepository } from "./IBaseRepository";
import { CollegeAdmin } from "@domain/entities/CollegeAdmin";

export interface ICollegeAdminRepository extends IBaseRepository<CollegeAdmin> {
  findByEmail(email: string): Promise<CollegeAdmin | null>;
}
