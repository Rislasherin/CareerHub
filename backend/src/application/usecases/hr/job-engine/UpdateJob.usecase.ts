import { Job } from "@domain/entities/Job";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { PostJobDto } from "@application/dtos/hr/PostJob.dto";

export interface IUpdateJobUseCase {
  execute(jobId: string, companyId: string, dto: PostJobDto): Promise<Job>;
}

export class UpdateJobUseCase implements IUpdateJobUseCase {
  constructor(private readonly _jobRepository: IJobRepository) { }

  async execute(jobId: string, companyId: string, dto: PostJobDto): Promise<Job> {
    const existingJob = await this._jobRepository.findById(jobId);
    if (!existingJob) throw new Error("Job not found");
    if (existingJob.companyId !== companyId) throw new Error("Unauthorized to update this job");

    const updatedJob = Job.create({
      ...existingJob.toJSON(),
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
      rounds: dto.rounds.map((round) => ({
        roundNumber: round.roundNumber,
        name: round.name,
        type: round.type,
        description: round.description
      }))
    });

    const result = await this._jobRepository.update(jobId, updatedJob as any);
    if (!result) throw new Error("Failed to update job");
    return result;
  }
}
