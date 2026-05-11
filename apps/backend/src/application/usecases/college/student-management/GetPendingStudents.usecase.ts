import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface IGetPendingStudentsUseCase {
  execute(orgId: string): Promise<any[]>;
}

export class GetPendingStudentsUseCase implements IGetPendingStudentsUseCase {
  constructor(private readonly _studentRepository: IStudentRepository) {}

  async execute(orgId: string): Promise<any[]> {
    const students = await this._studentRepository.findByOrgIdAndStatus(orgId, UserStatus.PENDING);
    return students.map((student) => {
        const json = student.toJSON();
        return {
            id: json.id,
            firstName: json.firstName,
            lastName: json.lastName,
            email: json.email,
            proofUrl: json.proofUrl,
            status: json.status,
            createdAt: json.createdAt
        };
    });
  }
}
