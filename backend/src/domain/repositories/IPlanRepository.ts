import { Plan } from "@domain/entities/Plan";
import { IBaseRepository } from "./IBaseRepository";

export interface IPlanRepository extends IBaseRepository<Plan> {
  findByCode(code: string): Promise<Plan | null>;
  findActivePlans(): Promise<Plan[]>;
}
