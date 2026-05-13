import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface IGetPendingStudentsUseCase {
  execute(orgId: string, status?: UserStatus): Promise<any[]>;
}

export class GetPendingStudentsUseCase implements IGetPendingStudentsUseCase {
  constructor(private readonly _studentRepository: IStudentRepository) {}

  async execute(orgId: string, status?: UserStatus): Promise<any[]> {
    const queryStatus = status || UserStatus.PENDING_VERIFICATION;
    const students = await this._studentRepository.findByOrgIdAndStatus(orgId, queryStatus);
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
