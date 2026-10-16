import { SkillMatcher } from "../../src/shared/utils/skillMatcher.util";
import { GetStudentJobsUseCase } from "../../src/application/usecases/student/implementations/GetStudentJobs.usecase";
import { ApplyToJobUseCase } from "../../src/application/usecases/student/implementations/ApplyToJob.usecase";
import { Job } from "../../src/domain/entities/Job";
import { Student } from "../../src/domain/entities/student";
import { JobStatus } from "../../src/domain/enums/JobStatus.enum";
import { JobType } from "../../src/domain/enums/JobType.enum";
import { AppError } from "../../src/application/errors/AppError";

async function runSkillEligibilityRegressionTests() {
  console.log("================================================================================");
  console.log("   STUDENT JOB ELIGIBILITY & CANONICAL SKILL MATCHING REGRESSION TEST SUITE     ");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // -----------------------------------------------------------------------------------------
  // Test 1: JavaScript in profile matching 'Java Script' in job requirements
  // -----------------------------------------------------------------------------------------
  console.log("\n--- Test 1: JavaScript in profile matching 'Java Script' in job requirements ---");
  {
    const studentSkills = {
      languages: ["JavaScript", "HTML5", "CSS3"],
    };
    const jobRequirements = ["Java Script", "HTML"];
    const match = SkillMatcher.matchSkills(studentSkills, jobRequirements);

    assert(match.isAllMatched === true, "JavaScript in profile matches 'Java Script' in job requirements");
    assert(match.matchedCount === 2, `Matched count should be 2, got ${match.matchedCount}`);
    assert(match.matchPercentage === 100, `Match percentage should be 100, got ${match.matchPercentage}%`);
    assert(match.matchedSkills.includes("Java Script"), "'Java Script' is recorded in matchedSkills");
    assert(match.missingSkills.length === 0, "No missing skills");
  }

  // -----------------------------------------------------------------------------------------
  // Test 2: Case and whitespace differences
  // -----------------------------------------------------------------------------------------
  console.log("\n--- Test 2: Case and whitespace differences ---");
  {
    const variations = [
      { profile: "JAVASCRIPT", req: "javascript" },
      { profile: "  Java Script  ", req: "JavaScript" },
      { profile: "Javascript", req: "  JAVA   SCRIPT  " },
      { profile: "react.js", req: "ReactJS" },
      { profile: "React", req: "REACT JS" },
      { profile: "c++", req: "  C++ " },
      { profile: "Node.js", req: "node js" },
      { profile: "PostgreSQL", req: "postgres" },
    ];

    for (const v of variations) {
      const isMatch = SkillMatcher.isSkillMatch(v.profile, v.req);
      assert(isMatch, `Skill '${v.profile}' successfully matches '${v.req}' canonically`);
    }

    // Negative distinction check (Ensure distinct technologies are NOT conflated)
    assert(!SkillMatcher.isSkillMatch("Java", "JavaScript"), "Java does NOT match JavaScript");
    assert(!SkillMatcher.isSkillMatch("C", "C++"), "C does NOT match C++");
    assert(!SkillMatcher.isSkillMatch("C#", "C++"), "C# does NOT match C++");
    assert(!SkillMatcher.isSkillMatch("TypeScript", "JavaScript"), "TypeScript does NOT match JavaScript");
  }

  // -----------------------------------------------------------------------------------------
  // Test 3: Skills stored in actual supported profile representations
  // -----------------------------------------------------------------------------------------
  console.log("\n--- Test 3: Skills stored in actual supported profile representations ---");
  {
    // Representation A: Categorized map of string arrays (standard CareerHub profile)
    const profileA = {
      skills: {
        languages: ["Javascript", "Python", "C++"],
        frameworks: ["React", "Express.js"],
        databases: ["MongoDB", "PostgreSQL"],
      }
    };

    // Representation B: Array of strings
    const profileB = {
      skills: ["JavaScript", "Python", "C++", "React"]
    };

    // Representation C: Array of skill objects with name / canonicalName
    const profileC = {
      skills: [
        { name: "Java Script", canonicalName: "javascript" },
        { skill: "Python" },
        { title: "React.js" }
      ]
    };

    const reqs = ["JavaScript", "React", "Python"];

    const matchA = SkillMatcher.matchSkills(profileA.skills, reqs);
    assert(matchA.isAllMatched, "Categorized map representation matches all required skills");
    assert(matchA.matchedCount === 3, "Categorized map has 3 matched skills");

    const matchB = SkillMatcher.matchSkills(profileB.skills, reqs);
    assert(matchB.isAllMatched, "Flat string array representation matches all required skills");

    const matchC = SkillMatcher.matchSkills(profileC.skills, reqs);
    assert(matchC.isAllMatched, "Object array with name/canonicalName matches all required skills");
  }

  // -----------------------------------------------------------------------------------------
  // Test 4: Truly missing mandatory skills
  // -----------------------------------------------------------------------------------------
  console.log("\n--- Test 4: Truly missing mandatory skills ---");
  {
    const studentSkills = {
      languages: ["JavaScript", "HTML", "CSS"],
      frameworks: ["React"]
    };
    const jobRequirements = ["JavaScript", "Rust", "Go", "Kubernetes"];

    const match = SkillMatcher.matchSkills(studentSkills, jobRequirements);
    assert(!match.isAllMatched, "Job with missing skills is correctly NOT all matched");
    assert(match.matchedCount === 1, `Matched count should be 1, got ${match.matchedCount}`);
    assert(match.missingSkills.length === 3, `Missing skills count should be 3, got ${match.missingSkills.length}`);
    assert(match.missingSkills.includes("Rust"), "Missing skills includes Rust");
    assert(match.missingSkills.includes("Go"), "Missing skills includes Go");
    assert(match.missingSkills.includes("Kubernetes"), "Missing skills includes Kubernetes");
  }

  // -----------------------------------------------------------------------------------------
  // Test 5: Multiple required skills and correct match percentages
  // -----------------------------------------------------------------------------------------
  console.log("\n--- Test 5: Multiple required skills and correct match percentages ---");
  {
    const studentSkills = ["JavaScript", "TypeScript", "React"];
    
    // 3 of 5 matched = 60%
    const req5 = ["JavaScript", "TypeScript", "React", "Docker", "AWS"];
    const match5 = SkillMatcher.matchSkills(studentSkills, req5);
    assert(match5.matchedCount === 3, `3 out of 5 matched, got ${match5.matchedCount}`);
    assert(match5.matchPercentage === 60, `Expected 60%, got ${match5.matchPercentage}%`);

    // 0 required skills = 100% match
    const req0: string[] = [];
    const match0 = SkillMatcher.matchSkills(studentSkills, req0);
    assert(match0.matchPercentage === 100, `0 required skills should give 100%, got ${match0.matchPercentage}%`);
    assert(match0.isAllMatched, "0 required skills is all matched");

    // 'All Skills Welcome' special placeholder = 100% match
    const reqWelcome = ["All Skills Welcome"];
    const matchWelcome = SkillMatcher.matchSkills(studentSkills, reqWelcome);
    assert(matchWelcome.isAllMatched, "'All Skills Welcome' treated as open requirement");
  }

  // -----------------------------------------------------------------------------------------
  // Mock DB Setup for End-to-End Use Case Tests (Tests 6 - 9)
  // -----------------------------------------------------------------------------------------
  const jobsDb = new Map<string, Job>();
  const studentsDb = new Map<string, Student>();
  const applicationsDb = new Map<string, any>();

  const mockJobRepo: any = {
    create: async (j: Job) => {
      const id = j.id || `job_${Date.now()}_${Math.random()}`;
      const created = Job.create({ ...j.toJSON(), id });
      jobsDb.set(id, created);
      return created;
    },
    findById: async (id: string) => {
      const j = jobsDb.get(id);
      return j ? Job.create(j.toJSON()) : null;
    },
    findByCollegeIdAndStatus: async (collegeId: string, status: JobStatus) => {
      return Array.from(jobsDb.values()).filter(j => {
        if (j.isDeleted) return false;
        if (j.status !== status) return false;
        const approved = j.approvedColleges || [];
        return j.collegeId === collegeId || approved.includes(collegeId) || approved.includes("ALL");
      });
    },
    update: async (id: string, j: Job) => {
      jobsDb.set(id, Job.create(j.toJSON()));
      return jobsDb.get(id)!;
    }
  };

  const mockStudentRepo: any = {
    findById: async (id: string) => {
      const s = studentsDb.get(id);
      return s || null;
    },
    update: async (id: string, s: Student) => {
      studentsDb.set(id, s);
      return s;
    }
  };

  const mockAppRepo: any = {
    findByJobAndStudent: async (jobId: string, studentId: string) => {
      const key = `${studentId}_${jobId}`;
      return applicationsDb.get(key) || null;
    },
    countByStudentIdSince: async () => 0,
    create: async (app: any) => {
      const key = `${app.studentId}_${app.jobId}`;
      applicationsDb.set(key, app);
      return app;
    }
  };

  const mockCompanyRepo: any = {
    findById: async () => ({ companyName: "Tech Corp" })
  };

  const mockNotificationUseCase: any = {
    execute: async () => {}
  };

  const getStudentJobsUseCase = new GetStudentJobsUseCase(mockStudentRepo, mockJobRepo, mockCompanyRepo);
  const applyToJobUseCase = new ApplyToJobUseCase(mockStudentRepo, mockJobRepo, mockAppRepo, mockNotificationUseCase);

  // -----------------------------------------------------------------------------------------
  // Test 6: A student who matches skills but fails the minimum CGPA
  // -----------------------------------------------------------------------------------------
  console.log("\n--- Test 6: Student matches skills but fails minimum CGPA ---");
  {
    const student = Student.create({
      id: "stud_cgpa_fail",
      userId: "u_cgpa_fail",
      collegeId: "col_1",
      cgpa: 6.8,
      department: "Computer Science and Engineering",
      branch: "CSE",
      degree: "B.Tech",
      graduationYear: 2025,
      activeBacklogs: 0,
      skills: {
        languages: ["Javascript", "Java", "Python"]
      }
    });
    studentsDb.set(student.id, student);

    const job = Job.create({
      id: "job_cgpa_req",
      companyId: "comp_1",
      collegeId: "col_1",
      title: "Senior Software Engineer",
      status: JobStatus.APPROVED,
      deadline: new Date(Date.now() + 86400000 * 10),
      requiredSkills: ["Java Script", "Java"],
      eligibility: {
        minCGPA: 7.5,
        allowedBacklogs: 0,
        eligibleBranches: ["CSE", "IT"],
        passingYear: 2025,
        degreeType: "B.Tech"
      }
    });
    jobsDb.set(job.id, job);

    const result = await getStudentJobsUseCase.execute(student.id);
    const evaluatedJob = result.find(j => j.id === job.id);

    assert(evaluatedJob !== undefined, "Job is returned in feed");
    assert(evaluatedJob.skillMatchPercentage === 100, `Skill match is 100%, got ${evaluatedJob.skillMatchPercentage}%`);
    assert(evaluatedJob.isEligible === false, "Student is marked INELIGIBLE due to CGPA failing criteria");
    assert(
      evaluatedJob.ineligibilityReasons.some((r: string) => r.includes("7.5")),
      `Ineligibility reason explains CGPA requirement: ${JSON.stringify(evaluatedJob.ineligibilityReasons)}`
    );
  }

  // -----------------------------------------------------------------------------------------
  // Test 7: Branch, degree, passing-year, backlog, and college-approval rules
  // -----------------------------------------------------------------------------------------
  console.log("\n--- Test 7: Branch, passing-year, backlog, and college-approval rules ---");
  {
    // 7a: Backlog failure
    const studentBacklogFail = Student.create({
      id: "stud_backlog_fail",
      userId: "u_backlog_fail",
      collegeId: "col_1",
      cgpa: 8.5,
      branch: "CSE",
      degree: "B.Tech",
      graduationYear: 2025,
      activeBacklogs: 2,
      skills: { languages: ["JavaScript"] }
    });
    studentsDb.set(studentBacklogFail.id, studentBacklogFail);

    const jobBacklog0 = Job.create({
      id: "job_backlog_0",
      companyId: "comp_1",
      collegeId: "col_1",
      title: "Zero Backlog Engineer",
      status: JobStatus.APPROVED,
      deadline: new Date(Date.now() + 86400000 * 5),
      requiredSkills: ["JavaScript"],
      eligibility: { minCGPA: 7.0, allowedBacklogs: 0, eligibleBranches: ["CSE"], passingYear: 2025, degreeType: "B.Tech" }
    });
    jobsDb.set(jobBacklog0.id, jobBacklog0);

    const resBacklog = await getStudentJobsUseCase.execute(studentBacklogFail.id);
    const evalBacklogJob = resBacklog.find(j => j.id === jobBacklog0.id);
    assert(evalBacklogJob.isEligible === false, "Student with 2 backlogs is ineligible for job allowing 0");
    assert(evalBacklogJob.ineligibilityReasons.some((r: string) => r.includes("backlogs")), "Reason mentions backlogs");

    // 7b: Branch mismatch
    const studentMech = Student.create({
      id: "stud_mech",
      userId: "u_mech",
      collegeId: "col_1",
      cgpa: 9.0,
      branch: "Mechanical Engineering",
      degree: "B.Tech",
      graduationYear: 2025,
      activeBacklogs: 0,
      skills: { languages: ["JavaScript"] }
    });
    studentsDb.set(studentMech.id, studentMech);

    const resBranch = await getStudentJobsUseCase.execute(studentMech.id);
    const evalBranchJob = resBranch.find(j => j.id === jobBacklog0.id);
    assert(evalBranchJob.isEligible === false, "Mechanical student is ineligible for CSE job");
    assert(evalBranchJob.ineligibilityReasons.some((r: string) => r.toLowerCase().includes("branch")), "Reason mentions branch");

    // 7c: Passing year mismatch
    const student2026 = Student.create({
      id: "stud_2026",
      userId: "u_2026",
      collegeId: "col_1",
      cgpa: 9.0,
      branch: "CSE",
      degree: "B.Tech",
      graduationYear: 2026,
      activeBacklogs: 0,
      skills: { languages: ["JavaScript"] }
    });
    studentsDb.set(student2026.id, student2026);

    const resYear = await getStudentJobsUseCase.execute(student2026.id);
    const evalYearJob = resYear.find(j => j.id === jobBacklog0.id);
    assert(evalYearJob.isEligible === false, "2026 graduate is ineligible for 2025 job");
    assert(evalYearJob.ineligibilityReasons.some((r: string) => r.toLowerCase().includes("graduation year")), "Reason mentions passing year");

    // 7d: Global job with approvedColleges: ["ALL"]
    const globalJob = Job.create({
      id: "job_global_all",
      companyId: "comp_1",
      collegeId: "ALL",
      approvedColleges: ["ALL"],
      title: "Global Enterprise Hire",
      status: JobStatus.APPROVED,
      deadline: new Date(Date.now() + 86400000 * 5),
      requiredSkills: ["JavaScript"],
      eligibility: { minCGPA: 6.0, allowedBacklogs: 1, eligibleBranches: [], passingYear: 2025, degreeType: "B.Tech" }
    });
    jobsDb.set(globalJob.id, globalJob);

    // Eligible student from col_1
    const eligibleStudent = Student.create({
      id: "stud_eligible",
      userId: "u_eligible",
      collegeId: "col_1",
      cgpa: 8.0,
      branch: "CSE",
      degree: "B.Tech",
      graduationYear: 2025,
      activeBacklogs: 0,
      skills: { languages: ["JavaScript"] }
    });
    studentsDb.set(eligibleStudent.id, eligibleStudent);

    const resGlobal = await getStudentJobsUseCase.execute(eligibleStudent.id);
    const evalGlobal = resGlobal.find(j => j.id === globalJob.id);
    assert(evalGlobal !== undefined, "Global job with approvedColleges: ['ALL'] is visible to student");
    assert(evalGlobal.isEligible === true, "Eligible student is marked ELIGIBLE for global job");

    // Student can successfully apply to global job approved for 'ALL'
    let applyError: any = null;
    try {
      await applyToJobUseCase.execute(eligibleStudent.id, globalJob.id);
    } catch (e) {
      applyError = e;
    }
    assert(applyError === null, "ApplyToJob succeeds for global job approved for 'ALL'");
  }

  // -----------------------------------------------------------------------------------------
  // Test 8: Closed and expired jobs remaining non-applicable
  // -----------------------------------------------------------------------------------------
  console.log("\n--- Test 8: Closed and expired jobs remaining non-applicable ---");
  {
    const student = studentsDb.get("stud_eligible")!;

    // 8a: Closed Job
    const closedJob = Job.create({
      id: "job_closed_test",
      companyId: "comp_1",
      collegeId: "col_1",
      title: "Closed SDE Position",
      status: JobStatus.CLOSED,
      isClosed: true,
      closureReason: "Role filled",
      deadline: new Date(Date.now() + 86400000 * 5),
      requiredSkills: ["JavaScript"],
      eligibility: { minCGPA: 6.0, allowedBacklogs: 0, eligibleBranches: ["CSE"], passingYear: 2025, degreeType: "B.Tech" }
    });
    jobsDb.set(closedJob.id, closedJob);

    let closedApplyErr: any = null;
    try {
      await applyToJobUseCase.execute(student.id, closedJob.id);
    } catch (e: any) {
      closedApplyErr = e;
    }
    assert(closedApplyErr !== null, "Applying to a closed job throws AppError");
    assert(closedApplyErr.message.includes("closed"), `Error message mentions closed status: ${closedApplyErr?.message}`);

    // 8b: Expired Job
    const expiredJob = Job.create({
      id: "job_expired_test",
      companyId: "comp_1",
      collegeId: "col_1",
      title: "Expired SDE Position",
      status: JobStatus.APPROVED,
      deadline: new Date(Date.now() - 86400000 * 2), // 2 days in the past
      requiredSkills: ["JavaScript"],
      eligibility: { minCGPA: 6.0, allowedBacklogs: 0, eligibleBranches: ["CSE"], passingYear: 2025, degreeType: "B.Tech" }
    });
    jobsDb.set(expiredJob.id, expiredJob);

    let expiredApplyErr: any = null;
    try {
      await applyToJobUseCase.execute(student.id, expiredJob.id);
    } catch (e: any) {
      expiredApplyErr = e;
    }
    assert(expiredApplyErr !== null, "Applying to an expired job throws AppError");
    assert(expiredApplyErr.message.includes("deadline"), `Error message mentions deadline: ${expiredApplyErr?.message}`);
  }

  // -----------------------------------------------------------------------------------------
  // Test 9: Consistency between backend result, card badge, and details checklist
  // -----------------------------------------------------------------------------------------
  console.log("\n--- Test 9: UI consistency verification ---");
  {
    // Risla Sherin's exact profile structure and the production job requirements:
    const rislaSkills = {
      languages: ["Javascript", "Java", "C++", "C", "Python"],
      frameworks: ["React", "Express.js", "Node.js"],
      databases: ["MongoDB"]
    };

    const jobRequiredSkills = ["Java", "C++", "Java Script", "C", "Python"];

    // Evaluate on backend:
    const backendMatch = SkillMatcher.matchSkills(rislaSkills, jobRequiredSkills);

    // Evaluate on frontend:
    const frontendKeys = SkillMatcher.extractStudentSkillKeys(rislaSkills);
    const frontendPillStatuses = jobRequiredSkills.map(skill => ({
      skill,
      isMatched: frontendKeys.has(SkillMatcher.toCanonicalKey(skill))
    }));

    // Verify 100% agreement:
    assert(backendMatch.isAllMatched === true, "Backend calculates 100% match for Risla Sherin");
    assert(backendMatch.matchedCount === 5, "All 5 skills matched on backend");

    const unmatchedPills = frontendPillStatuses.filter(p => !p.isMatched);
    assert(unmatchedPills.length === 0, "Zero unmatched skills in frontend UI pill rendering");

    const jsPill = frontendPillStatuses.find(p => p.skill === "Java Script");
    assert(jsPill !== undefined && jsPill.isMatched === true, "Frontend marks 'Java Script' as MATCHED (blue/green with checkmark)");

    assert(
      backendMatch.matchedSkills.length === frontendPillStatuses.filter(p => p.isMatched).length,
      "Backend matchedSkills count equals frontend pill matched count"
    );
  }

  console.log("\n================================================================================");
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSkillEligibilityRegressionTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
