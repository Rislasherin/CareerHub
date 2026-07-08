import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";

export interface IUpdateApplicationStatusUseCase {
  execute(applicationId: string, companyId: string, status: JobApplicationStatus): Promise<void>;
}
