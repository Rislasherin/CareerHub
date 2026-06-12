"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStudentJobsUseCase = void 0;
const JobStatus_enum_1 = require("@domain/enums/JobStatus.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class GetStudentJobsUseCase {
    constructor(_studentRepository, _jobRepository, _comptypeRepository) {
        this._studentRepository = _studentRepository;
        this._jobRepository = _jobRepository;
        this._comptypeRepository = _comptypeRepository;
    }
    async execute(studentId) {
        const student = await this._studentRepository.findById(studentId);
        if (!student) {
            throw new AppError_1.AppError("Student not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.NOT_FOUND);
        }
        // Gather student skills
        const studentSkillSet = new Set();
        if (student.skills) {
            const sObj = student.skills;
            (sObj.languages || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
            (sObj.frameworks || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
            (sObj.databases || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
            (sObj.cloudDevops || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
            (sObj.otherTools || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
            (sObj.aiMl || []).forEach(s => studentSkillSet.add(s.toLowerCase().trim()));
        }
        // A student can see both APPROVED and ACTIVE jobs for their specific college or global ones
        const approvedJobs = await this._jobRepository.findByCollegeIdAndStatus(student.collegeId, JobStatus_enum_1.JobStatus.APPROVED);
        const activeJobs = await this._jobRepository.findByCollegeIdAndStatus(student.collegeId, JobStatus_enum_1.JobStatus.ACTIVE);
        // Merge and filter out duplicates
        const allJobs = [...approvedJobs, ...activeJobs];
        const uniqueJobsMap = new Map();
        allJobs.forEach(job => {
            if (job.id)
                uniqueJobsMap.set(job.id, job);
        });
        const jobs = Array.from(uniqueJobsMap.values());
        // Populate comptypeName and calculate matchScore for each job
        const comptypeCache = new Map();
        const enrichedJobs = await Promise.all(jobs.map(async (job) => {
            let comptypeName = "Campus Recruiter";
            if (job.comptypeId) {
                if (comptypeCache.has(job.comptypeId)) {
                    comptypeName = comptypeCache.get(job.comptypeId);
                }
                else {
                    try {
                        const comptype = await this._comptypeRepository.findById(job.comptypeId);
                        if (comptype) {
                            comptypeName = comptype.name;
                            comptypeCache.set(job.comptypeId, comptype.name);
                        }
                    }
                    catch (e) { }
                }
            }
            // 1. Skill Match Percentage (70% weight)
            const requiredSkills = job.requiredSkills || [];
            let skillMatchScore = 70;
            if (requiredSkills.length > 0) {
                let matchedCount = 0;
                requiredSkills.forEach(reqSkill => {
                    if (studentSkillSet.has(reqSkill.toLowerCase().trim())) {
                        matchedCount++;
                    }
                });
                skillMatchScore = (matchedCount / requiredSkills.length) * 70;
            }
            // 2. Academic Matching (30% weight: 15% CGPA, 15% Backlogs)
            const minCGPA = job.eligibility?.minCGPA || 0;
            const allowedBacklogs = job.eligibility?.allowedBacklogs !== undefined ? job.eligibility.allowedBacklogs : 0;
            const eligibleBranches = job.eligibility?.eligibleBranches || [];
            const studentCGPA = student.cgpa || 0;
            const studentBacklogs = student.activeBacklogs || 0;
            const studentBranch = student.branch || student.department || '';
            const cgpaEligible = studentCGPA >= minCGPA;
            const backlogsEligible = studentBacklogs <= allowedBacklogs;
            const branchEligible = eligibleBranches.length === 0 ||
                eligibleBranches.some(b => b.toLowerCase().trim() === studentBranch.toLowerCase().trim());
            const cgpaScore = cgpaEligible ? 15 : 0;
            const backlogsScore = backlogsEligible ? 15 : 0;
            const matchScore = Math.round(skillMatchScore + cgpaScore + backlogsScore);
            const isEligible = cgpaEligible && backlogsEligible && branchEligible;
            return {
                ...job.toJSON(),
                comptypeName,
                matchScore,
                isEligible
            };
        }));
        // Sort by matchScore descending, then by createdAt descending
        enrichedJobs.sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
        return enrichedJobs;
    }
}
exports.GetStudentJobsUseCase = GetStudentJobsUseCase;
