import { IStudentRepository } from "@domain/repositories/IStudentRepository";

export interface IGetAllStudentsUseCase {
  execute(orgId: string, query?: string, page?: number, limit?: number): Promise<any>;
}
