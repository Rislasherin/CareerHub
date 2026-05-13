import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";

export interface IGetStudentsUseCase {
  execute(query: string, page: number, limit: number): Promise<any>;
}

export class GetStudentsUseCase implements IGetStudentsUseCase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _orgRepository: IOrganizationRepository
  ) {}

  async execute(query: string, page: number, limit: number) {
    const { students, total } = await this._studentRepository.searchAllStudents(query, page, limit);
    
    const enrichedStudents = await Promise.all(students.map(async (s) => {
      const json = s.toJSON();
      const college = await this._orgRepository.findById(json.collegeId);
      
      return {
        id: json.id,
        firstName: json.firstName,
        lastName: json.lastName,
        email: json.email,
        status: json.status,
        collegeId: json.collegeId,
        collegeName: college?.name || 'N/A',
        branch: json.department || 'N/A',
        department: json.department || 'N/A',
        createdAt: json.createdAt
      };
    }));

    return {
      students: enrichedStudents,
      total,
      page,
      limit
    };
  }
}
