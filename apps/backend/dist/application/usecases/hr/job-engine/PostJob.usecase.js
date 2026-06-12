"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostJobUseCase = void 0;
const Job_1 = require("@domain/entities/Job");
const JobStatus_enum_1 = require("@domain/enums/JobStatus.enum");
class PostJobUseCase {
    constructor(_jobRepository) {
        this._jobRepository = _jobRepository;
    }
    async execute(comptypeId, dto) {
        const job = Job_1.Job.create({
            comptypeId,
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
            })),
            status: JobStatus_enum_1.JobStatus.PENDING_REVIEW,
            isDeleted: false
        });
        return await this._jobRepository.create(job);
    }
}
exports.PostJobUseCase = PostJobUseCase;
