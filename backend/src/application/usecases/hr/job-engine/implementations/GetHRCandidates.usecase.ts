import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { organizationRepository } from "@infrastructure/di/infra.container";
import { IGetHRCandidatesUseCase, CandidateListItem } from "../interfaces/IGetHRCandidates.usecase";

export class GetHRCandidatesUseCase implements IGetHRCandidatesUseCase {
  constructor(
    private readonly _jobRepository: IJobRepository,
    private readonly _studentRepository: IStudentRepository
  ) { }

  async execute(companyId: string): Promise<CandidateListItem[]> {
    // 1. Fetch all company jobs
    const jobs = await this._jobRepository.findByCompanyId(companyId);
    if (jobs.length === 0) {
      return [];
    }

    // 2. Fetch all students
    const { students } = await this._studentRepository.searchAllStudents("", 1, 1000);

    const candidatesList: CandidateListItem[] = [];
    const collegeCache = new Map<string, string>();

    const companyJobIds = jobs.map(j => String(j.id));

    // 3. For each student, check their match against each company job
    for (const student of students) {
      const studentAppliedJobs = (student.appliedJobs || []).map(id => String(id));
      const hasAppliedToCompany = studentAppliedJobs.some(id => companyJobIds.includes(id));

      if (!hasAppliedToCompany) {
        continue;
      }

      // Gather student skills
      const studentSkillSet = new Set<string>();
      if (student.skills) {
        const sObj = student.skills;
        (Array.isArray(sObj.languages) ? sObj.languages : []).forEach(s => { if (typeof s === 'string') studentSkillSet.add(s.toLowerCase().trim()) });
        (Array.isArray(sObj.frameworks) ? sObj.frameworks : []).forEach(s => { if (typeof s === 'string') studentSkillSet.add(s.toLowerCase().trim()) });
        (Array.isArray(sObj.databases) ? sObj.databases : []).forEach(s => { if (typeof s === 'string') studentSkillSet.add(s.toLowerCase().trim()) });
        (Array.isArray(sObj.cloudDevops) ? sObj.cloudDevops : []).forEach(s => { if (typeof s === 'string') studentSkillSet.add(s.toLowerCase().trim()) });
        (Array.isArray(sObj.otherTools) ? sObj.otherTools : []).forEach(s => { if (typeof s === 'string') studentSkillSet.add(s.toLowerCase().trim()) });
        (Array.isArray(sObj.aiMl) ? sObj.aiMl : []).forEach(s => { if (typeof s === 'string') studentSkillSet.add(s.toLowerCase().trim()) });
      }

      // Find the job with the highest match score for this student
      let bestJob: typeof jobs[0] | null = null;
      let highestScore = -1;

      for (const job of jobs) {
        if (!job.id || !studentAppliedJobs.includes(String(job.id))) {
          continue;
        }

        // Skill Match (70%)
        const requiredSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
        let skillMatchScore = 70;
        if (requiredSkills.length > 0) {
          let matchedCount = 0;
          requiredSkills.forEach(reqSkill => {
            if (typeof reqSkill === 'string' && studentSkillSet.has(reqSkill.toLowerCase().trim())) {
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
          (Array.isArray(sObj.languages) ? sObj.languages : []).forEach(s => { if (typeof s === 'string') allSkills.push(s) });
          (Array.isArray(sObj.frameworks) ? sObj.frameworks : []).forEach(s => { if (typeof s === 'string') allSkills.push(s) });
          (Array.isArray(sObj.databases) ? sObj.databases : []).forEach(s => { if (typeof s === 'string') allSkills.push(s) });
        }

        candidatesList.push({
          id: student.id || "",
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
          jobTitle: String(bestJob.title || ''),
          jobId: String(bestJob.id || ''),
          dateApplied: student.createdAt || new Date(),
          hasApplied: (student.appliedJobs || []).map(id => String(id)).includes(String(bestJob.id)),
          status: 'NEW'
        });
      }
    }

    // Sort by matchScore descending (Applied candidates with top score first)
    candidatesList.sort((a, b) => b.matchScore - a.matchScore);

    return candidatesList;
  }
}
