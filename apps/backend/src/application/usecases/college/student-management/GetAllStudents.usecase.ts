import { IStudentRepository } from "@domain/repositories/IStudentRepository";

export interface IGetAllStudentsUseCase {
  execute(orgId: string, query?: string, page?: number, limit?: number): Promise<any>;
}

export class GetAllStudentsUseCase implements IGetAllStudentsUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(orgId: string, query: string = "", page: number = 1, limit: number = 10): Promise<any> {
    const result = await this.studentRepository.searchAllStudents(query, page, limit, orgId);
    return result;
  }
}
