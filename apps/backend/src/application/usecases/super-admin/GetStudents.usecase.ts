import { IStudentRepository } from "@domain/repositories/IStudentRepository";

export interface IGetStudentsUseCase {
  execute(query: string, page: number, limit: number): Promise<any>;
}

export class GetStudentsUseCase implements IGetStudentsUseCase {
  constructor(private readonly _studentRepository: IStudentRepository) {}

  async execute(query: string, page: number, limit: number) {
    const { students, total } = await this._studentRepository.searchAllStudents(query, page, limit);
    return {
      students: students.map(s => {
          const json = s.toJSON();
          return {
              id: json.id,
              firstName: json.firstName,
              lastName: json.lastName,
              email: json.email,
              status: json.status,
              collegeId: json.collegeId,
              createdAt: json.createdAt
          };
      }),
      total,
      page,
      limit
    };
  }
}
