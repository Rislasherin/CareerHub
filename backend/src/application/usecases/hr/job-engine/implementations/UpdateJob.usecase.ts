import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { PostJobDto, InterviewRoundConfigDto } from "@application/dtos/hr/Request/PostJob.dto";
import { IUpdateJobUseCase } from "../interfaces/IUpdateJob.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class UpdateJobUseCase implements IUpdateJobUseCase {
  constructor(private readonly _jobRepository: IJobRepository) { }

  async execute(jobId: string, companyId: string, dto: PostJobDto): Promise<Job> {
    const existingJob = await this._jobRepository.findById(jobId);
    if (!existingJob) {
      throw new AppError("Job not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    if (existingJob.companyId !== companyId) {
      throw new AppError("Unauthorized to update this job", HttpStatus.FORBIDDEN, ErrorCode.UNAUTHORIZED);
    }

    if (existingJob.status === JobStatus.CLOSED) {
      throw new AppError("Cannot edit a closed job", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const publishOption = dto.publishOption || (existingJob.status === JobStatus.DRAFT ? "draft" : existingJob.status === JobStatus.SCHEDULED ? "schedule" : "publish_now");

    if (publishOption === "draft") {
      if (!dto.title || !dto.title.trim()) {
        throw new AppError("Job title is required to save a draft", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }

      const updatedJob = Job.create({
        ...existingJob.toJSON(),
        collegeId: dto.collegeId || existingJob.collegeId,
        title: dto.title.trim(),
        category: dto.category || existingJob.category,
        openings: dto.openings ?? existingJob.openings,
        deadline: dto.deadline ? new Date(dto.deadline) : existingJob.deadline,
        type: dto.type || existingJob.type,
        eligibility: {
          minCGPA: dto.eligibility?.minCGPA ?? existingJob.eligibility.minCGPA,
          allowedBacklogs: dto.eligibility?.allowedBacklogs ?? existingJob.eligibility.allowedBacklogs,
          eligibleBranches: dto.eligibility?.eligibleBranches ?? existingJob.eligibility.eligibleBranches,
          passingYear: dto.eligibility?.passingYear ?? existingJob.eligibility.passingYear,
          degreeType: dto.eligibility?.degreeType ?? existingJob.eligibility.degreeType
        },
        noticePeriod: dto.noticePeriod ?? existingJob.noticePeriod,
        experienceLevel: dto.experienceLevel ?? existingJob.experienceLevel,
        workMode: dto.workMode ?? existingJob.workMode,
        location: dto.location ?? existingJob.location,
        salaryType: dto.salaryType ?? existingJob.salaryType,
        minSalary: dto.minSalary ?? existingJob.minSalary,
        maxSalary: dto.maxSalary ?? existingJob.maxSalary,
        interviewMode: dto.interviewMode ?? existingJob.interviewMode,
        description: dto.description ?? existingJob.description,
        requiredSkills: dto.requiredSkills ?? existingJob.requiredSkills,
        preferredSkills: dto.preferredSkills ?? existingJob.preferredSkills,
        rounds: dto.rounds ? dto.rounds.map((round: InterviewRoundConfigDto) => ({
          roundNumber: round.roundNumber,
          name: round.name,
          type: round.type,
          description: round.description
        })) : existingJob.rounds,
        status: JobStatus.DRAFT,
        publishOption: "draft",
        scheduledPublishAt: undefined,
        scheduledTimezone: undefined
      });

      const result = await this._jobRepository.update(jobId, updatedJob);
      if (!result) throw new AppError("Failed to update job", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
      return result;
    }

    // Required fields for schedule and publish_now
    if (!dto.title || !dto.title.trim()) {
      throw new AppError("Job title is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (!dto.category || !dto.category.trim()) {
      throw new AppError("Job category is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (!dto.deadline) {
      throw new AppError("Application deadline is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (!dto.openings || dto.openings < 1) {
      throw new AppError("Number of openings must be at least 1", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (dto.minSalary === undefined || dto.maxSalary === undefined) {
      throw new AppError("Salary range is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (Number(dto.maxSalary) < Number(dto.minSalary)) {
      throw new AppError("Maximum salary cannot be less than minimum salary", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const deadlineDate = new Date(dto.deadline);
    if (isNaN(deadlineDate.getTime())) {
      throw new AppError("Invalid application deadline date", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    let status = existingJob.status;
    let scheduledDate: Date | undefined;

    if (publishOption === "schedule") {
      if (!dto.scheduledPublishAt) {
        throw new AppError("Scheduled publication date and time is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      scheduledDate = new Date(dto.scheduledPublishAt);
      if (isNaN(scheduledDate.getTime())) {
        throw new AppError("Invalid scheduled publication date and time", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      if (scheduledDate.getTime() <= Date.now()) {
        throw new AppError("Scheduled publication date must be in the future", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      if (deadlineDate.getTime() <= scheduledDate.getTime()) {
        throw new AppError("Application deadline must be after the scheduled publication date", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      status = JobStatus.SCHEDULED;
    } else {
      // publish_now
      if (deadlineDate.getTime() <= Date.now()) {
        throw new AppError("Application deadline must be in the future", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      if (existingJob.status === JobStatus.DRAFT || existingJob.status === JobStatus.SCHEDULED) {
        status = JobStatus.PENDING_REVIEW;
      }
    }

    const updatedJob = Job.create({
      ...existingJob.toJSON(),
      collegeId: dto.collegeId || existingJob.collegeId,
      title: dto.title.trim(),
      category: dto.category.trim(),
      openings: dto.openings,
      deadline: deadlineDate,
      type: dto.type || existingJob.type,
      eligibility: {
        minCGPA: dto.eligibility?.minCGPA ?? 0,
        allowedBacklogs: dto.eligibility?.allowedBacklogs ?? 0,
        eligibleBranches: dto.eligibility?.eligibleBranches ?? [],
        passingYear: dto.eligibility?.passingYear ?? 0,
        degreeType: dto.eligibility?.degreeType ?? ""
      },
      noticePeriod: dto.noticePeriod || "",
      experienceLevel: dto.experienceLevel || "",
      workMode: dto.workMode || existingJob.workMode,
      location: dto.location || "",
      salaryType: dto.salaryType || existingJob.salaryType,
      minSalary: dto.minSalary,
      maxSalary: dto.maxSalary,
      interviewMode: dto.interviewMode || existingJob.interviewMode,
      description: dto.description || "",
      requiredSkills: dto.requiredSkills || [],
      preferredSkills: dto.preferredSkills || [],
      rounds: (dto.rounds || []).map((round: InterviewRoundConfigDto) => ({
        roundNumber: round.roundNumber,
        name: round.name,
        type: round.type,
        description: round.description
      })),
      status,
      publishOption,
      scheduledPublishAt: scheduledDate,
      scheduledTimezone: dto.scheduledTimezone
    });

    const result = await this._jobRepository.update(jobId, updatedJob);
    if (!result) throw new AppError("Failed to update job", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    return result;
  }
}
