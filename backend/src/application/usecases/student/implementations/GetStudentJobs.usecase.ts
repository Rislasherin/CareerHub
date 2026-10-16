import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IGetStudentJobsUseCase } from "../interfaces/IGetStudentJobs.usecase";
import { BranchMatcher } from "@shared/utils/branchMatcher.util";
import { SkillMatcher } from "@shared/utils/skillMatcher.util";

export class GetStudentJobsUseCase implements IGetStudentJobsUseCase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _jobRepository: IJobRepository,
    private readonly _companyRepository: ICompanyRepository
  ) { }

  async execute(studentId: string): Promise<any[]> {
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }


    // A student can see both APPROVED and ACTIVE jobs for their specific college or global ones
    const approvedJobs = await this._jobRepository.findByCollegeIdAndStatus(student.collegeId, JobStatus.APPROVED);
    const activeJobs = await this._jobRepository.findByCollegeIdAndStatus(student.collegeId, JobStatus.ACTIVE);

    // Merge and filter out duplicates
    const allJobs = [...approvedJobs, ...activeJobs];
    const uniqueJobsMap = new Map<string, Job>();
    allJobs.forEach(job => {
      if (job.id) uniqueJobsMap.set(job.id, job);
    });

    const jobs = Array.from(uniqueJobsMap.values());

    // Populate companyName and calculate matchScore for each job
    const companyCache = new Map<string, string>();
    const enrichedJobs = await Promise.all(jobs.map(async (job) => {
      let companyName = "Campus Recruiter";
      if (job.companyId) {
        if (companyCache.has(job.companyId)) {
          companyName = companyCache.get(job.companyId)!;
        } else {
          try {
            const company = await this._companyRepository.findById(job.companyId);
            if (company) {
              companyName = company.name;
              companyCache.set(job.companyId, company.name);
            }
          } catch (e) { }
        }
      }
      const requiredSkills = job.requiredSkills || [];
      const skillMatchResult = SkillMatcher.matchSkills(student.skills, requiredSkills);
      let skillMatchScore = 70;
      if (skillMatchResult.totalRequired > 0) {
        skillMatchScore = (skillMatchResult.matchedCount / skillMatchResult.totalRequired) * 70;
      }
      const minCGPA = job.eligibility?.minCGPA || 0;
      const allowedBacklogs = job.eligibility?.allowedBacklogs !== undefined ? job.eligibility.allowedBacklogs : 0;
      const eligibleBranches = job.eligibility?.eligibleBranches || [];

      const studentCGPA = student.cgpa;
      const studentBacklogs = student.activeBacklogs || 0;
      const studentBranch = student.branch || student.department || '';

      const cgpaEligible = minCGPA === 0 || (studentCGPA !== undefined && studentCGPA !== null && studentCGPA >= minCGPA);
      const backlogsEligible = studentBacklogs <= allowedBacklogs;
      const branchEligible = eligibleBranches.length === 0 ||
        eligibleBranches.some(b => BranchMatcher.isBranchMatch(b, studentBranch));

      const requiredDegreeStr = (job.eligibility?.degreeType || '').trim();
      const requiredDegrees = requiredDegreeStr.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
      const isAnyDegree = !requiredDegreeStr ||
        requiredDegreeStr.toLowerCase() === 'any degree' ||
        requiredDegreeStr.toLowerCase() === 'all' ||
        requiredDegrees.includes('any degree') ||
        requiredDegrees.includes('all');

      const degreeEligible = isAnyDegree || (
        student.degree ? requiredDegrees.some(rd => {
          const sd = student.degree!.toLowerCase().trim();
          return rd === sd || rd.includes(sd) || sd.includes(rd);
        }) : false
      );

      const requiredPassingYear = job.eligibility?.passingYear;
      const studentGradYear = student.graduationYear;
      const passingYearEligible = !requiredPassingYear || !studentGradYear || studentGradYear === requiredPassingYear;

      // Inclusive end-of-day deadline check
      let isExpired = false;
      if (job.deadline) {
        const d = new Date(job.deadline);
        const endOfDay = new Date(d);
        if (endOfDay.getUTCHours() === 0 && endOfDay.getUTCMinutes() === 0 && endOfDay.getUTCSeconds() === 0) {
          endOfDay.setUTCHours(23, 59, 59, 999);
        }
        isExpired = Date.now() > endOfDay.getTime();
      }
      const isClosed = job.status === JobStatus.CLOSED;

      const cgpaScore = cgpaEligible ? 15 : 0;
      const backlogsScore = backlogsEligible ? 15 : 0;

      const matchScore = Math.round(skillMatchScore + cgpaScore + backlogsScore);
      const isEligible = cgpaEligible && backlogsEligible && branchEligible && degreeEligible && passingYearEligible && !isClosed && !isExpired;

      const ineligibilityReasons: string[] = [];
      if (!cgpaEligible) {
        ineligibilityReasons.push(studentCGPA === undefined || studentCGPA === null ? `CGPA not provided (min required: ${minCGPA})` : `CGPA ${studentCGPA} is below required minimum ${minCGPA}`);
      }
      if (!backlogsEligible) {
        ineligibilityReasons.push(`Active backlogs (${studentBacklogs}) exceeds maximum allowed (${allowedBacklogs})`);
      }
      if (!branchEligible) {
        ineligibilityReasons.push(`Branch '${studentBranch || 'Not specified'}' is not in eligible branches (${eligibleBranches.join(', ')})`);
      }
      if (!degreeEligible) {
        ineligibilityReasons.push(`Degree '${student.degree || 'Not specified'}' does not match required degree (${requiredDegreeStr})`);
      }
      if (!passingYearEligible) {
        ineligibilityReasons.push(`Graduation year '${studentGradYear || 'Not specified'}' does not match required passing year (${requiredPassingYear})`);
      }
      if (isClosed) {
        ineligibilityReasons.push(`Job is closed and no longer accepting applications`);
      }
      if (isExpired) {
        ineligibilityReasons.push(`Application deadline has passed`);
      }

      return {
        ...job.toJSON(),
        companyName,
        matchScore,
        isEligible,
        isClosed,
        isExpired,
        skillMatchScore: Math.round(skillMatchScore),
        skillMatchCount: skillMatchResult.matchedCount,
        totalRequiredSkills: skillMatchResult.totalRequired,
        skillMatchPercentage: skillMatchResult.matchPercentage,
        matchedSkills: skillMatchResult.matchedSkills,
        missingSkills: skillMatchResult.missingSkills,
        ineligibilityReasons,
      };
    }));
    enrichedJobs.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateB === dateA) {
        return b.matchScore - a.matchScore
      }
      return dateB - dateA;
    });

    return enrichedJobs;
  }
}

