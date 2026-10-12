import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { PostJobDto, InterviewRoundConfigDto } from "@application/dtos/hr/Request/PostJob.dto";
import { IPostJobUseCase } from "../interfaces/IPostJob.usecase";

export class PostJobUseCase implements IPostJobUseCase {
  constructor(private readonly _jobRepository: IJobRepository) { }

  async execute(companyId: string, dto: PostJobDto): Promise<Job> {
    // Idempotency check: prevent duplicate submissions from rapid duplicate clicks or retries
    const existingJobs = await this._jobRepository.findByCompanyId(companyId);
    const recentWindow = new Date(Date.now() - 15 * 1000);
    const duplicate = existingJobs.find(j =>
      j.title.trim().toLowerCase() === dto.title.trim().toLowerCase() &&
      j.collegeId === dto.collegeId &&
      j.category.trim().toLowerCase() === dto.category.trim().toLowerCase() &&
      j.createdAt && new Date(j.createdAt).getTime() > recentWindow.getTime() &&
      !j.isDeleted
    );
    if (duplicate) {
      return duplicate;
    }

    const job = Job.create({
      companyId,
      
      collegeId: dto.collegeId,
      title: dto.title,
      category: dto.category,
      openings: dto.openings,
      deadline: new Date(dto.deadline),
      type: dto.type,
      eligibility: {
        minCGPA: dto.eligibility.minCGPA,
        allowedBacklogs: dto.eligibility.allowedBacklogs,
        eligibleBranches: dto.eligibility.eligibleBranches,
        passingYear: dto.eligibility.passingYear,
        degreeType: dto.eligibility.degreeType
      },
      noticePeriod: dto.noticePeriod,
      experienceLevel: dto.experienceLevel,
      workMode: dto.workMode,
      location: dto.location,
      salaryType: dto.salaryType,
      minSalary: dto.minSalary,
      maxSalary: dto.maxSalary,
      interviewMode: dto.interviewMode,
      description: dto.description,
      requiredSkills: dto.requiredSkills,
      preferredSkills: dto.preferredSkills || [],
      rounds: dto.rounds.map((round: InterviewRoundConfigDto) => ({
        roundNumber: round.roundNumber,
        name: round.name,
        type: round.type,
        description: round.description
      })),
      status: JobStatus.PENDING_REVIEW,
      isDeleted: false
    });

    return await this._jobRepository.create(job);
  }

}

