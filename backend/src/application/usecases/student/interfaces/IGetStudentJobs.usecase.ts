import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IGetStudentJobsUseCase {
  execute(studentId: string): Promise<any[]>;
}
