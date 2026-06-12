import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface IGetCollegeDashboardStatsUseCase {
  execute(orgId: string): Promise<any>;
}

export class GetCollegeDashboardStatsUseCase implements IGetCollegeDashboardStatsUseCase {
  constructor(private readonly studentRepository: IStudentRepository) { }

  async execute(orgId: string): Promise<any> {
    const [totalStudents, placedStudents, inProcessStudents] = await Promise.all([
      this.studentRepository.count({ collegeId: orgId }),
      this.studentRepository.count({ collegeId: orgId, status: UserStatus.PLACED }),
      this.studentRepository.count({ collegeId: orgId, status: UserStatus.IN_PROCESS }),
    ]);

    // Dummy values for others as requested
    return {
      totalStudents,
      placedStudents,
      inProcessStudents,
      highestPackage: "₹24L", // Static as per request
      recentPlacements: [], // Can be filled if needed
      stats: {
        placementRate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0,
      }
    };
  }
}
