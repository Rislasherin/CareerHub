import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Student } from "@domain/entities/student";

export interface IApplyToJobUseCase {
  execute(studentId: string, jobId: string): Promise<void>;
}

export class ApplyToJobUseCase implements IApplyToJobUseCase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _jobRepository: IJobRepository
  ) {}

  async execute(studentId: string, jobId: string): Promise<void> {
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const job = await this._jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }


    

    const appliedJobsList = student.appliedJobs;
    if (appliedJobsList.includes(jobId)) {
      throw new AppError("Already applied to this job", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    if((student.appliedJobs?.length) >= 3){
      throw new AppError(
        'Maximum applications reached',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      )
    }

    



    




    const updatedApplied = [...appliedJobsList, jobId];
    const updatedStudent = Student.create({
      ...student.toJSON(),
      appliedJobs: updatedApplied
    });

    await this._studentRepository.update(studentId, updatedStudent);
  }
}
