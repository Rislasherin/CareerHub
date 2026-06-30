import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IGetStudentJobsUseCase } from "../interfaces/IGetStudentJobs.usecase";

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

    // Gather student skills
    const studentSkillSet = new Set<string>();
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
      const branchEligible = eligibleBranches.length === 0 || eligibleBranches.includes('Any IT Branch') ||
        eligibleBranches.some(b => {
          const hrBranch = b.toLowerCase().trim();
          const studBranch = studentBranch.toLowerCase().trim();
          return hrBranch.includes(studBranch) || studBranch.includes(hrBranch);
        });

      const requiredDegree = job.eligibility?.degreeType || '';
      const degreeEligible = !requiredDegree || requiredDegree === 'Any Degree' || 
        (student.degree && student.degree.toLowerCase().trim() === requiredDegree.toLowerCase().trim());

      const cgpaScore = cgpaEligible ? 15 : 0;
      const backlogsScore = backlogsEligible ? 15 : 0;

      const matchScore = Math.round(skillMatchScore + cgpaScore + backlogsScore);
      const isEligible = cgpaEligible && backlogsEligible && branchEligible && !!degreeEligible;

      return {
        ...job.toJSON(),
        companyName,
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

