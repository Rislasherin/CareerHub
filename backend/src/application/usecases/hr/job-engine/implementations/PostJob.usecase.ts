import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { PostJobDto, InterviewRoundConfigDto } from "@application/dtos/hr/Request/PostJob.dto";
import { IPostJobUseCase } from "../interfaces/IPostJob.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class PostJobUseCase implements IPostJobUseCase {
  constructor(private readonly _jobRepository: IJobRepository) { }

  async execute(companyId: string, dto: PostJobDto): Promise<Job> {
    const publishOption = dto.publishOption || "publish_now";

    if (publishOption === "draft") {
      if (!dto.title || !dto.title.trim()) {
        throw new AppError("Job title is required to save a draft", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }

      const draftJob = Job.create({
        companyId,
        collegeId: dto.collegeId || "ALL",
        title: dto.title.trim(),
        category: dto.category || "General",
        openings: dto.openings ?? 1,
        deadline: dto.deadline ? new Date(dto.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: dto.type || ("full-time" as any),
        eligibility: {
          minCGPA: dto.eligibility?.minCGPA ?? 0,
          allowedBacklogs: dto.eligibility?.allowedBacklogs ?? 0,
          eligibleBranches: dto.eligibility?.eligibleBranches ?? [],
          passingYear: dto.eligibility?.passingYear ?? 0,
          degreeType: dto.eligibility?.degreeType ?? ""
        },
        noticePeriod: dto.noticePeriod || "",
        experienceLevel: dto.experienceLevel || "",
        workMode: dto.workMode || "on-site",
        location: dto.location || "",
        salaryType: dto.salaryType || "per_month",
        minSalary: dto.minSalary ?? 0,
        maxSalary: dto.maxSalary ?? 0,
        interviewMode: dto.interviewMode || "online",
        description: dto.description || "",
        requiredSkills: dto.requiredSkills || [],
        preferredSkills: dto.preferredSkills || [],
        rounds: (dto.rounds || []).map((round: InterviewRoundConfigDto) => ({
          roundNumber: round.roundNumber,
          name: round.name,
          type: round.type,
          description: round.description
        })),
        status: JobStatus.DRAFT,
        publishOption: "draft",
        isDeleted: false
      });

      return await this._jobRepository.create(draftJob);
    }

    // For schedule and publish_now, validate all required publication fields
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

    let status = JobStatus.PENDING_REVIEW;
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
    }

    // Idempotency check: prevent duplicate submissions from rapid duplicate clicks or retries
    const existingJobs = await this._jobRepository.findByCompanyId(companyId);
    const recentWindow = new Date(Date.now() - 15 * 1000);
    const duplicate = existingJobs.find(j =>
      j.title.trim().toLowerCase() === dto.title.trim().toLowerCase() &&
      j.collegeId === (dto.collegeId || "ALL") &&
      j.category?.trim().toLowerCase() === dto.category!.trim().toLowerCase() &&
      j.status === status &&
      j.createdAt && new Date(j.createdAt).getTime() > recentWindow.getTime() &&
      !j.isDeleted
    );
    if (duplicate) {
      return duplicate;
    }

    const job = Job.create({
      companyId,
      collegeId: dto.collegeId || "ALL",
      title: dto.title.trim(),
      category: dto.category.trim(),
      openings: dto.openings,
      deadline: deadlineDate,
      type: dto.type || ("full-time" as any),
      eligibility: {
        minCGPA: dto.eligibility?.minCGPA ?? 0,
        allowedBacklogs: dto.eligibility?.allowedBacklogs ?? 0,
        eligibleBranches: dto.eligibility?.eligibleBranches ?? [],
        passingYear: dto.eligibility?.passingYear ?? 0,
        degreeType: dto.eligibility?.degreeType ?? ""
      },
      noticePeriod: dto.noticePeriod || "",
      experienceLevel: dto.experienceLevel || "",
      workMode: dto.workMode || "on-site",
      location: dto.location || "",
      salaryType: dto.salaryType || "per_month",
      minSalary: dto.minSalary,
      maxSalary: dto.maxSalary,
      interviewMode: dto.interviewMode || "online",
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
      scheduledTimezone: dto.scheduledTimezone,
      isDeleted: false
    });

    return await this._jobRepository.create(job);
  }
}

