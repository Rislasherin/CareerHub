import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IGetCollegeDashboardStatsUseCase } from "../interfaces/IGetCollegeDashboardStats.usecase";

export class GetCollegeDashboardStatsUseCase implements IGetCollegeDashboardStatsUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly jobRepository: IJobRepository
  ) { }

  async execute(orgId: string): Promise<any> {
    const [totalRegistered, pendingVerification, activeDrives] = await Promise.all([
      this.studentRepository.count({ collegeId: orgId }),
      this.studentRepository.count({ collegeId: orgId, status: UserStatus.PENDING }),
      this.jobRepository.count({ approvedColleges: orgId, status: JobStatus.ACTIVE }),
    ]);

    return {
      totalRegistered,
      pendingVerification,
      activeDrives
    };
  }
}

