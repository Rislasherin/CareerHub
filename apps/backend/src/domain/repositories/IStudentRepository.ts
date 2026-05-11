import { IBaseRepository } from "@domain/repositories/IBaseRepository";
import { Student } from "@domain/entities/student";

export interface IStudentRepository extends IBaseRepository<Student> {
  findByEmail(email: string): Promise<Student | null>;
  existsByEmail(email: string): Promise<boolean>;
  findByOrgIdAndStatus(orgId: string, status: string): Promise<Student[]>;
  updateStatus(id: string, status: string): Promise<void>;
  searchAllStudents(query: string, page: number, limit: number): Promise<{ students: Student[], total: number }>;
}
