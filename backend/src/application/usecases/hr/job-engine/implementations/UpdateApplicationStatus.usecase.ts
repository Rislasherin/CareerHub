import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";
import { IUpdateApplicationStatusUseCase } from "../interfaces/IUpdateApplicationStatus.usecase";
import { JobApplication } from "@domain/entities/JobApplication";

export class UpdateApplicationStatusUseCase implements IUpdateApplicationStatusUseCase {
  constructor(private readonly _jobApplicationRepository: IJobApplicationRepository) {}

  async execute(applicationId: string, companyId: string, status: JobApplicationStatus): Promise<void> {
    const application = await this._jobApplicationRepository.findById(applicationId);
    
    if (!application || application.companyId !== companyId) {
      throw new AppError("Application not found or unauthorized", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const updatedApplication = JobApplication.create({
      ...application.toJSON(),
      status,
      updatedAt: new Date()
    });

    await this._jobApplicationRepository.update(applicationId, updatedApplication);
  }
}
