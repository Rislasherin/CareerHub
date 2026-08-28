import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IGetCollegeInterviewsUseCase {
  execute(collegeId: string): Promise<Record<string, unknown>[]>;
}

export class GetCollegeInterviewsUseCase implements IGetCollegeInterviewsUseCase {
  constructor(private readonly _interviewRepository: IInterviewRepository) {}

  async execute(collegeId: string): Promise<Record<string, unknown>[]> {
    if (!collegeId) {
      throw new AppError("College ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const interviews = await this._interviewRepository.getPopulatedCollegeInterviews(collegeId);
    
    // Map _id to id if necessary, format data
    return interviews.map((doc: any) => ({
      ...doc,
      id: doc._id?.toString() || doc.id,
      student: doc.student ? {
        ...doc.student,
        id: doc.student._id?.toString() || doc.student.id
      } : null,
      job: doc.job ? {
        ...doc.job,
        id: doc.job._id?.toString() || doc.job.id
      } : null,
      company: doc.company ? {
        ...doc.company,
        id: doc.company._id?.toString() || doc.company.id
      } : null
    }));
  }
}
