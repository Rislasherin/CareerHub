import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IGetAllStudentsUseCase } from "../interfaces/IGetAllStudents.usecase";

export class GetAllStudentsUseCase implements IGetAllStudentsUseCase {
  constructor(private readonly studentRepository: IStudentRepository) { }

  async execute(orgId: string, query: string = "", page: number = 1, limit: number = 10): Promise<any> {
    const result = await this.studentRepository.searchAllStudents(query, page, limit, orgId);
    return result;
  }
}

