import { PostJobUseCase } from "../../src/application/usecases/hr/job-engine/implementations/PostJob.usecase";
import { ApproveJobUseCase } from "../../src/application/usecases/college/job-approvals/implementations/ApproveJob.usecase";
import { GetStudentJobsUseCase } from "../../src/application/usecases/student/implementations/GetStudentJobs.usecase";
import { ApplyToJobUseCase } from "../../src/application/usecases/student/implementations/ApplyToJob.usecase";
import { Job } from "../../src/domain/entities/Job";
import { Student } from "../../src/domain/entities/student";
import { JobStatus } from "../../src/domain/enums/JobStatus.enum";
import { HttpStatus } from "../../src/domain/enums/HttpStatus.enum";
import { AppError } from "../../src/application/errors/AppError";
import { BranchMatcher } from "../../src/shared/utils/branchMatcher.util";

async function runRegressionTests() {
  console.log("==========================================================");
  console.log("   JOB WORKFLOW REGRESSION TEST SUITE (BUGS 1, 2 & 3)    ");
  console.log("==========================================================");

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

  // -------------------------------------------------------------------------
  // BUG 1: Duplicate Submission / Listing Prevention
  // -------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 1: Duplicate Job Submission Prevention ---");

  const jobStore: Job[] = [];
  const mockJobRepo: any = {
    create: async (job: Job) => {
      const created = Job.create({ ...job.toJSON(), id: `job_${Date.now()}_${Math.random()}`, createdAt: new Date() });
      jobStore.push(created);
      return created;
    },
    findByCompanyId: async (companyId: string) => {
      return jobStore.filter(j => j.companyId === companyId);
    },
    findById: async (id: string) => {
      return jobStore.find(j => j.id === id) || null;
    },
    update: async (id: string, updated: Job) => {
      const idx = jobStore.findIndex(j => j.id === id);
      if (idx !== -1) jobStore[idx] = updated;
      return updated;
    }
  };

  const postJobUseCase = new PostJobUseCase(mockJobRepo);

  const sampleDto: any = {
    title: "Full Stack Engineer",
    category: "Engineering",
    collegeId: "ALL",
    openings: 2,
    deadline: "2026-10-23",
    type: "full_time",
    eligibility: { minCGPA: 7, allowedBacklogs: 0, eligibleBranches: ["Computer Science"], passingYear: 2025, degreeType: "Any Degree" },
    noticePeriod: "Immediate",
    experienceLevel: "Fresher",
    workMode: "hybrid",
    location: "Bangalore",
    salaryType: "per_year",
    minSalary: 600000,
    maxSalary: 900000,
    interviewMode: "online",
    description: "Build robust full-stack solutions",
    requiredSkills: ["React", "Node.js"],
    preferredSkills: ["TypeScript"],
    rounds: [{ roundNumber: 1, name: "Technical", type: "TECHNICAL", description: "Coding test" }]
  };

  // Test 1.1: First post succeeds and creates record
  const job1 = await postJobUseCase.execute("company_abc", sampleDto);
  assert(job1 && job1.id !== undefined, "1.1: First submission creates job successfully");
  assert(jobStore.length === 1, "1.1b: Exactly one job stored in repository");

  // Test 1.2: Immediate duplicate submission returns existing job without creating duplicate
  const job2 = await postJobUseCase.execute("company_abc", sampleDto);
  assert(job2.id === job1.id, "1.2: Rapid duplicate submission returns canonical job ID");
  assert(jobStore.length === 1, "1.2b: Repository still contains exactly 1 job (deduplicated)");

  // Test 1.3: Different job title is not blocked
  const diffDto = { ...sampleDto, title: "DevOps Engineer" };
  const job3 = await postJobUseCase.execute("company_abc", diffDto);
  assert(job3.id !== job1.id, "1.3: Distinct job posting is allowed through");
  assert(jobStore.length === 2, "1.3b: Repository now contains 2 distinct jobs");

  // -------------------------------------------------------------------------
  // BUG 2: Authorized vs Unauthorized Approval & Status Propagation
  // -------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 2: College Approval Workflow & Status Lifecycle ---");

  const approveJobUseCase = new ApproveJobUseCase(mockJobRepo);

  // Setup a global job (collegeId: ALL)
  const globalJob = Job.create({
    id: "job_global_1",
    companyId: "company_abc",
    collegeId: "ALL",
    title: "MERN STACK DEVELOPER",
    category: "Engineering",
    openings: 5,
    deadline: new Date("2026-10-23T00:00:00.000Z"),
    type: "full_time",
    eligibility: { minCGPA: 7, allowedBacklogs: 0, eligibleBranches: ["Computer Science"], passingYear: 2025, degreeType: "Any Degree" },
    noticePeriod: "Immediate",
    experienceLevel: "Fresher",
    workMode: "hybrid",
    location: "Bangalore",
    salaryType: "per_year",
    minSalary: 600000,
    maxSalary: 900000,
    interviewMode: "online",
    description: "MERN developer role",
    requiredSkills: ["MongoDB", "Express", "React", "Node"],
    preferredSkills: [],
    rounds: [],
    status: JobStatus.PENDING_REVIEW,
    approvedColleges: [],
    rejectedColleges: [],
    isDeleted: false,
    createdAt: new Date()
  });
  jobStore.push(globalJob);

  // Test 2.1: College 1 approves the global job
  const approvedGlobal = await approveJobUseCase.execute("college_1", "job_global_1");
  assert(approvedGlobal.approvedColleges.includes("college_1"), "2.1a: College 1 is in approvedColleges");
  assert(approvedGlobal.status === JobStatus.APPROVED, "2.1b: Job status correctly transitions to APPROVED");

  // Test 2.2: College 1 re-approving is rejected with validation error
  let reapproveError: any = null;
  try {
    await approveJobUseCase.execute("college_1", "job_global_1");
  } catch (err: any) {
    reapproveError = err;
  }
  assert(reapproveError instanceof AppError && reapproveError.statusCode === HttpStatus.BAD_REQUEST, "2.2: Re-approving already approved job by same college is rejected");

  // Test 2.3: College 2 can also approve the same global job
  const approvedGlobalBy2 = await approveJobUseCase.execute("college_2", "job_global_1");
  assert(approvedGlobalBy2.approvedColleges.includes("college_2") && approvedGlobalBy2.approvedColleges.includes("college_1"), "2.3: College 2 can independently approve global job");

  // Test 2.4: Targeted job (collegeId: college_1) cannot be approved by college_2
  const targetedJob = Job.create({
    id: "job_targeted_1",
    companyId: "company_abc",
    collegeId: "college_1",
    title: "Campus Exclusive Role",
    category: "Engineering",
    openings: 1,
    deadline: new Date("2026-10-23"),
    type: "full_time",
    eligibility: { minCGPA: 6, allowedBacklogs: 0, eligibleBranches: [], passingYear: 2025, degreeType: "Any Degree" },
    noticePeriod: "Immediate",
    experienceLevel: "Fresher",
    workMode: "on-site",
    location: "Bangalore",
    salaryType: "per_year",
    minSalary: 500000,
    maxSalary: 700000,
    interviewMode: "offline",
    description: "Exclusive drive",
    requiredSkills: [],
    preferredSkills: [],
    rounds: [],
    status: JobStatus.PENDING_REVIEW,
    approvedColleges: [],
    rejectedColleges: [],
    isDeleted: false,
    createdAt: new Date()
  });
  jobStore.push(targetedJob);

  let unauthorizedErr: any = null;
  try {
    await approveJobUseCase.execute("college_unauthorized", "job_targeted_1");
  } catch (err: any) {
    unauthorizedErr = err;
  }
  assert(unauthorizedErr instanceof AppError && unauthorizedErr.statusCode === HttpStatus.FORBIDDEN, "2.4: Unauthorized college cannot approve another college's targeted job");

  // Test 2.5: Closed job cannot be approved
  const closedJob = Job.create({
    id: "job_closed_1",
    companyId: "company_abc",
    collegeId: "college_1",
    title: "Closed Role",
    category: "Engineering",
    openings: 1,
    deadline: new Date("2026-10-23"),
    type: "full_time",
    eligibility: { minCGPA: 6, allowedBacklogs: 0, eligibleBranches: [], passingYear: 2025, degreeType: "Any Degree" },
    noticePeriod: "Immediate",
    experienceLevel: "Fresher",
    workMode: "on-site",
    location: "Bangalore",
    salaryType: "per_year",
    minSalary: 500000,
    maxSalary: 700000,
    interviewMode: "offline",
    description: "Closed",
    requiredSkills: [],
    preferredSkills: [],
    rounds: [],
    status: JobStatus.CLOSED,
    approvedColleges: [],
    rejectedColleges: [],
    isDeleted: false,
    createdAt: new Date()
  });
  jobStore.push(closedJob);

  let closedErr: any = null;
  try {
    await approveJobUseCase.execute("college_1", "job_closed_1");
  } catch (err: any) {
    closedErr = err;
  }
  assert(closedErr instanceof AppError && closedErr.statusCode === HttpStatus.BAD_REQUEST, "2.5: Closed job cannot be approved");

  // -------------------------------------------------------------------------
  // BUG 3: Future/Past Deadlines, Inclusive Checks, & Student Eligibility
  // -------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 3: Deadlines & Student Eligibility Evaluation ---");

  // Student Mock
  const mockStudents: any[] = [
    {
      id: "student_sara",
      firstName: "Sara",
      lastName: "Thomas",
      collegeId: "college_1",
      cgpa: undefined, // Missing CGPA in DB
      activeBacklogs: 0,
      degree: "BCA",
      branch: "Software Engineering",
      graduationYear: undefined,
      skills: { languages: ["JavaScript", "TypeScript"], frameworks: ["React", "NodeJs"] }
    },
    {
      id: "student_eligible",
      firstName: "Alex",
      lastName: "Kumar",
      collegeId: "college_1",
      cgpa: 8.5,
      activeBacklogs: 0,
      degree: "B.Tech",
      branch: "Computer Science",
      graduationYear: 2025,
      skills: { languages: ["JavaScript", "TypeScript"], frameworks: ["React", "NodeJs"] }
    },
    {
      id: "student_ineligible_backlogs",
      firstName: "Bob",
      lastName: "Smith",
      collegeId: "college_1",
      cgpa: 8.0,
      activeBacklogs: 2, // Exceeds 0
      degree: "B.Tech",
      branch: "Computer Science",
      graduationYear: 2025,
      skills: { languages: ["JavaScript"] }
    }
  ];

  const mockStudentRepo: any = {
    findById: async (id: string) => {
      const s = mockStudents.find(m => m.id === id);
      if (!s) return null;
      return new Student(s);
    },
    update: async () => {}
  };

  const mockCompanyRepo: any = {
    findById: async () => ({ id: "company_abc", name: "TechCorp Global" })
  };

  // Student discovery repo returns approved jobs for college
  const studentJobRepo: any = {
    findByCollegeIdAndStatus: async (collegeId: string, status: JobStatus) => {
      if (status === JobStatus.APPROVED) {
        return jobStore.filter(j =>
          !j.isDeleted &&
          j.status !== JobStatus.CLOSED &&
          (j.collegeId === collegeId || (j.collegeId === "ALL" && j.approvedColleges.includes(collegeId)))
        );
      }
      return [];
    },
    findById: async (id: string) => mockJobRepo.findById(id)
  };

  const getStudentJobsUseCase = new GetStudentJobsUseCase(mockStudentRepo, studentJobRepo, mockCompanyRepo);

  // Test 3.1: BranchMatcher recognizes "Software Engineering" matches "Computer Science"
  const branchMatch = BranchMatcher.isBranchMatch("Computer Science", "Software Engineering");
  assert(branchMatch === true, "3.1: BranchMatcher correctly matches 'Computer Science' with 'Software Engineering'");

  // Test 3.2: Future deadline (2026-10-23) is NOT marked closed on 2026-10-09
  const jobsForAlex = await getStudentJobsUseCase.execute("student_eligible");
  const alexJob = jobsForAlex.find((j: any) => j.id === "job_global_1");
  assert(alexJob !== undefined, "3.2a: Approved global job is discovered by eligible student");
  assert(alexJob.isExpired === false, "3.2b: Future deadline (2026-10-23) is NOT marked expired");
  assert(alexJob.isClosed === false, "3.2c: Job is NOT marked closed");
  assert(alexJob.isEligible === true, "3.2d: Fully qualifying student (Alex) is marked isEligible: true");

  // Test 3.3: Sara Thomas with missing CGPA is marked ineligible when minCGPA > 0
  const jobsForSara = await getStudentJobsUseCase.execute("student_sara");
  const saraJob = jobsForSara.find((j: any) => j.id === "job_global_1");
  assert(saraJob !== undefined, "3.3a: Sara discovers the job");
  assert(saraJob.isEligible === false, "3.3b: Sara is correctly marked ineligible due to unset CGPA (actual criteria check)");
  assert(saraJob.isClosed === false, "3.3c: Sara's view correctly reflects the job is open (not closed by deadline)");

  // Test 3.4: Student with backlogs is correctly marked ineligible
  const jobsForBob = await getStudentJobsUseCase.execute("student_ineligible_backlogs");
  const bobJob = jobsForBob.find((j: any) => j.id === "job_global_1");
  assert(bobJob.isEligible === false, "3.4: Student exceeding allowed backlogs is marked ineligible");

  // Test 3.5: ApplyToJobUseCase guards against closed job and expired deadline
  const mockAppRepo: any = {
    findByJobAndStudent: async () => null,
    countByStudentIdSince: async () => 0,
    create: async () => {}
  };
  const mockNotifyUseCase: any = { execute: async () => {} };

  const applyToJobUseCase = new ApplyToJobUseCase(
    mockStudentRepo,
    mockJobRepo,
    mockAppRepo,
    mockNotifyUseCase
  );

  // Attempt apply to closed job
  let applyClosedErr: any = null;
  try {
    await applyToJobUseCase.execute("student_eligible", "job_closed_1");
  } catch (err: any) {
    applyClosedErr = err;
  }
  assert(applyClosedErr instanceof AppError && applyClosedErr.message.includes("closed"), "3.5: Application to closed job is blocked");

  // Create an expired job (deadline in 2024)
  const expiredJob = Job.create({
    id: "job_expired_1",
    companyId: "company_abc",
    collegeId: "ALL",
    title: "Expired Job",
    category: "Engineering",
    openings: 1,
    deadline: new Date("2024-01-01T00:00:00.000Z"),
    type: "full_time",
    eligibility: { minCGPA: 6, allowedBacklogs: 0, eligibleBranches: [], passingYear: 2024, degreeType: "Any Degree" },
    noticePeriod: "Immediate",
    experienceLevel: "Fresher",
    workMode: "remote",
    location: "Bangalore",
    salaryType: "per_year",
    minSalary: 500000,
    maxSalary: 700000,
    interviewMode: "online",
    description: "Old job",
    requiredSkills: [],
    preferredSkills: [],
    rounds: [],
    status: JobStatus.APPROVED,
    approvedColleges: ["college_1"],
    rejectedColleges: [],
    isDeleted: false,
    createdAt: new Date("2024-01-01")
  });
  jobStore.push(expiredJob);

  let applyExpiredErr: any = null;
  try {
    await applyToJobUseCase.execute("student_eligible", "job_expired_1");
  } catch (err: any) {
    applyExpiredErr = err;
  }
  assert(applyExpiredErr instanceof AppError && applyExpiredErr.message.includes("passed"), "3.6: Application to expired job is blocked");

  // Attempt apply to unapproved college job
  let unapprovedCollegeErr: any = null;
  try {
    await applyToJobUseCase.execute("student_eligible", "job_targeted_1"); // targeted to college_1, wait: student_eligible is college_1
    // let's test student from college_unapproved
    mockStudents.push({ id: "student_other_college", collegeId: "college_other", activeBacklogs: 0 });
    await applyToJobUseCase.execute("student_other_college", "job_targeted_1");
  } catch (err: any) {
    unapprovedCollegeErr = err;
  }
  assert(unapprovedCollegeErr instanceof AppError && unapprovedCollegeErr.statusCode === HttpStatus.FORBIDDEN, "3.7: Student from unapproved college is blocked from applying");

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n==========================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
