import { CollegeAdmin } from "@domain/entities/CollegeAdmin";

export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  create(entity: T): Promise<T>;
}
