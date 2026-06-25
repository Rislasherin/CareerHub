import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { organizationRepository } from "@infrastructure/di/infra.container";

export interface IGetHRCandidatesUseCase {
  execute(companyId: string): Promise<any[]>;
}

export class GetHRCandidatesUseCase implements IGetHRCandidatesUseCase {
  constructor(
    private readonly _jobRepository: IJobRepository,
    private readonly _studentRepository: IStudentRepository
  ) { }

  async execute(companyId: string): Promise<any[]> {
    // 1. Fetch all company jobs
    const jobs = await this._jobRepository.findByCompanyId(companyId);
    if (jobs.length === 0) {
      return [];
    }

    // 2. Fetch all students
    const { students } = await this._studentRepository.searchAllStudents("", 1, 1000);

    const candidatesList: any[] = [];
    const collegeCache = new Map<string, string>();

    // 3. For each student, check their match against each company job
    for (const student of students) {
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

      // Find the job with the highest match score for this student
      let bestJob: any = null;
      let highestScore = -1;

      for (const job of jobs) {
        // Skill Match (70%)
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

        // Academic Matching (30% weight: 15% CGPA, 15% Backlogs)
        const minCGPA = job.eligibility?.minCGPA || 0;
        const allowedBacklogs = job.eligibility?.allowedBacklogs !== undefined ? job.eligibility.allowedBacklogs : 0;

        const studentCGPA = student.cgpa || 0;
        const studentBacklogs = student.activeBacklogs || 0;

        const cgpaEligible = studentCGPA >= minCGPA;
        const backlogsEligible = studentBacklogs <= allowedBacklogs;

        const cgpaScore = cgpaEligible ? 15 : 0;
        const backlogsScore = backlogsEligible ? 15 : 0;

        const score = Math.round(skillMatchScore + cgpaScore + backlogsScore);

        if (score > highestScore) {
          highestScore = score;
          bestJob = job;
        }
      }

      if (bestJob && highestScore >= 0) {
        let collegeName = "Campus Institute";
        if (student.collegeId) {
          if (collegeCache.has(student.collegeId)) {
            collegeName = collegeCache.get(student.collegeId)!;
          } else {
            try {
              const college = await organizationRepository.findById(student.collegeId);
              if (college) {
                collegeName = college.name;
                collegeCache.set(student.collegeId, college.name);
              }
            } catch (e) { }
          }
        }

        // Compile skills list for display
        const allSkills: string[] = [];
        if (student.skills) {
          const sObj = student.skills;
          (sObj.languages || []).forEach(s => allSkills.push(s));
          (sObj.frameworks || []).forEach(s => allSkills.push(s));
          (sObj.databases || []).forEach(s => allSkills.push(s));
        }

        candidatesList.push({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          collegeId: student.collegeId,
          collegeName,
          degree: student.degree || "B.Tech",
          branch: student.branch || student.department || "CSE",
          graduationYear: student.graduationYear || 2025,
          cgpa: student.cgpa || 8.0,
          skills: allSkills.slice(0, 3),
          extraSkillsCount: Math.max(0, allSkills.length - 3),
          matchScore: highestScore,
          resumeScore: Math.min(100, Math.round(highestScore * 0.85 + 10)),
          jobTitle: bestJob.title,
          jobId: bestJob.id,
          dateApplied: student.createdAt || new Date(),
          hasApplied: (student.appliedJobs || []).includes(bestJob.id)
        });
      }
    }

    // Sort by matchScore descending (Applied candidates with top score first)
    candidatesList.sort((a, b) => b.matchScore - a.matchScore);

    return candidatesList;
  }
}
