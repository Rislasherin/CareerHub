import { CloseJobUseCase } from "../../src/application/usecases/hr/job-engine/implementations/CloseJob.usecase";
import { ReopenJobUseCase } from "../../src/application/usecases/hr/job-engine/implementations/ReopenJob.usecase";
import { ApproveJobUseCase } from "../../src/application/usecases/college/job-approvals/implementations/ApproveJob.usecase";
import { RejectJobUseCase } from "../../src/application/usecases/college/job-approvals/implementations/RejectJob.usecase";
import { ApplyToJobUseCase } from "../../src/application/usecases/student/implementations/ApplyToJob.usecase";
import { GetStudentJobsUseCase } from "../../src/application/usecases/student/implementations/GetStudentJobs.usecase";
import { Job } from "../../src/domain/entities/Job";
import { Student } from "../../src/domain/entities/student";
import { JobStatus } from "../../src/domain/enums/JobStatus.enum";
import { JobType } from "../../src/domain/enums/JobType.enum";
import { JobApplication } from "../../src/domain/entities/JobApplication";
import { JobApplicationStatus } from "../../src/domain/enums/JobApplicationStatus.enum";
import { AppError } from "../../src/application/errors/AppError";

async function runClosedJobWorkflowTests() {
  console.log("==========================================================");
  console.log("   SAFE CLOSED-JOB HANDLING & LIFECYCLE TEST SUITE       ");
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

  // In-memory Job store
  const jobsDb = new Map<string, Job>();
  const mockJobRepo: any = {
    create: async (job: Job) => {
      const id = job.id || `job_${Date.now()}_${Math.random()}`;
      const created = Job.create({ ...job.toJSON(), id, createdAt: new Date() });
      jobsDb.set(id, created);
      return created;
    },
    findById: async (id: string) => {
      const job = jobsDb.get(id);
      return job ? Job.create(job.toJSON()) : null;
    },
    update: async (id: string, updated: Job) => {
      jobsDb.set(id, Job.create(updated.toJSON()));
      return jobsDb.get(id)!;
    },
    findByCompanyId: async (companyId: string) => {
      return Array.from(jobsDb.values()).filter(j => j.companyId === companyId && !j.isDeleted);
    },
    findByCollegeIdAndStatus: async (collegeId: string, status: JobStatus) => {
      return Array.from(jobsDb.values()).filter(j => {
        if (j.isDeleted) return false;
        if (status === JobStatus.CLOSED) {
          return (j.collegeId === collegeId && j.status === JobStatus.CLOSED) ||
                 (j.collegeId === "ALL" && (j.approvedColleges || []).includes(collegeId) && j.status === JobStatus.CLOSED);
        }
        if (status === JobStatus.APPROVED) {
          return (j.collegeId === collegeId && (j.status === JobStatus.APPROVED || j.status === JobStatus.ACTIVE)) ||
                 (j.collegeId === "ALL" && (j.approvedColleges || []).includes(collegeId) && (j.status === JobStatus.APPROVED || j.status === JobStatus.ACTIVE));
        }
        if (status === JobStatus.ACTIVE) {
          return (j.collegeId === collegeId && (j.status === JobStatus.ACTIVE || j.status === JobStatus.APPROVED)) ||
                 (j.collegeId === "ALL" && (j.approvedColleges || []).includes(collegeId) && (j.status === JobStatus.APPROVED || j.status === JobStatus.ACTIVE));
        }
        if (status === JobStatus.PENDING_REVIEW) {
          return (j.collegeId === collegeId && j.status === JobStatus.PENDING_REVIEW) ||
                 (j.collegeId === "ALL" && (j.status === JobStatus.PENDING_REVIEW || j.status === JobStatus.APPROVED) && !(j.approvedColleges || []).includes(collegeId) && !(j.rejectedColleges || []).includes(collegeId));
        }
        return j.status === status && (j.collegeId === collegeId || j.collegeId === "ALL");
      });
    },
    count: async (filter: any) => {
      return Array.from(jobsDb.values()).filter(j => {
        if (j.isDeleted) return false;
        if (filter.companyId && j.companyId !== filter.companyId) return false;
        if (filter.status && j.status !== filter.status) return false;
        return true;
      }).length;
    }
  };

  // In-memory Student store
  const studentsDb = new Map<string, Student>();
  const mockStudentRepo: any = {
    findById: async (id: string) => studentsDb.get(id) || null,
    update: async (id: string, s: Student) => {
      studentsDb.set(id, s);
      return s;
    }
  };

  // In-memory JobApplication store
  const applicationsDb = new Map<string, JobApplication>();
  const mockAppRepo: any = {
    create: async (app: JobApplication) => {
      const id = `app_${Date.now()}_${Math.random()}`;
      const created = JobApplication.create({ ...app.toJSON(), id });
      applicationsDb.set(id, created);
      return created;
    },
    findByJobAndStudent: async (jobId: string, studentId: string) => {
      return Array.from(applicationsDb.values()).find(a => a.jobId === jobId && a.studentId === studentId) || null;
    },
    findByJobId: async (jobId: string) => {
      return Array.from(applicationsDb.values()).filter(a => a.jobId === jobId);
    },
    countByStudentIdSince: async () => 0
  };

  const mockNotificationUseCase: any = {
    execute: async () => {}
  };

  const mockCompanyRepo: any = {
    findById: async (id: string) => ({ id, name: "Acme Corp" })
  };

  // Instantiate Use Cases
  const closeJobUseCase = new CloseJobUseCase(mockJobRepo);
  const reopenJobUseCase = new ReopenJobUseCase(mockJobRepo);
  const approveJobUseCase = new ApproveJobUseCase(mockJobRepo);
  const rejectJobUseCase = new RejectJobUseCase(mockJobRepo);
  const applyToJobUseCase = new ApplyToJobUseCase(mockStudentRepo, mockJobRepo, mockAppRepo, mockNotificationUseCase);
  const getStudentJobsUseCase = new GetStudentJobsUseCase(mockStudentRepo, mockJobRepo, mockCompanyRepo);

  // Seed sample student
  const sampleStudent = Student.create({
    id: "student_01",
    name: "Alex Doe",
    email: "alex@college.edu",
    collegeId: "college_A",
    branch: "Computer Science",
    degree: "B.Tech",
    cgpa: 8.5,
    graduationYear: 2026,
    activeBacklogs: 0,
    skills: {
      languages: ["TypeScript", "JavaScript"],
      frameworks: ["React", "Node.js"],
      databases: ["MongoDB"]
    }
  } as any);
  studentsDb.set("student_01", sampleStudent);

  // Helper to create active job
  const createActiveJob = async (props: any) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    return await mockJobRepo.create(Job.create({
      companyId: "company_1",
      collegeId: "college_A",
      title: "Software Engineer",
      category: "Engineering",
      openings: 5,
      deadline: futureDate,
      type: JobType.FULL_TIME,
      eligibility: {
        minCGPA: 7.0,
        allowedBacklogs: 0,
        eligibleBranches: ["Computer Science"],
        passingYear: 2026,
        degreeType: "B.Tech"
      },
      noticePeriod: "Immediate",
      experienceLevel: "Entry",
      workMode: "remote",
      location: "Bangalore",
      salaryType: "per_year",
      minSalary: 800000,
      maxSalary: 1200000,
      interviewMode: "online",
      description: "Exciting developer position",
      requiredSkills: ["TypeScript", "React"],
      rounds: [{ roundNumber: 1, name: "Technical", type: "TECHNICAL" }],
      status: JobStatus.APPROVED,
      ...props
    }));
  };

  // -------------------------------------------------------------------------
  // Case 1: Authorized company user can close an eligible job
  // -------------------------------------------------------------------------
  console.log("\n--- Case 1: Authorized company user can close an eligible job ---");
  const job1 = await createActiveJob({ companyId: "company_1" });
  const closedJob1 = await closeJobUseCase.execute("company_1", job1.id!, "Positions successfully filled");
  assert(closedJob1.status === JobStatus.CLOSED, "Job status transitioned to CLOSED");
  assert(closedJob1.closureReason === "Positions successfully filled", "Job closure reason was persisted");
  assert(closedJob1.closedAt instanceof Date, "Closure timestamp was recorded");

  // -------------------------------------------------------------------------
  // Case 2: Unauthorized company user cannot close another company's job
  // -------------------------------------------------------------------------
  console.log("\n--- Case 2: Unauthorized company user cannot close another company's job ---");
  const job2 = await createActiveJob({ companyId: "company_1" });
  let case2Blocked = false;
  try {
    await closeJobUseCase.execute("company_2", job2.id!);
  } catch (err: any) {
    if (err instanceof AppError && err.statusCode === 403) case2Blocked = true;
  }
  assert(case2Blocked, "Unauthorized company user blocked with 403 FORBIDDEN");

  // -------------------------------------------------------------------------
  // Case 3: A closed job remains closed after refreshing or fetching it again
  // -------------------------------------------------------------------------
  console.log("\n--- Case 3: Closed job persistence after fetching again ---");
  const fetchedJob1 = await mockJobRepo.findById(job1.id!);
  assert(fetchedJob1.status === JobStatus.CLOSED, "Persisted job remains CLOSED upon refetch");
  assert(fetchedJob1.closureReason === "Positions successfully filled", "Persisted closureReason intact upon refetch");

  // -------------------------------------------------------------------------
  // Case 4: A closed job cannot be applied to through frontend or backend API
  // -------------------------------------------------------------------------
  console.log("\n--- Case 4: Closed job rejects applications ---");
  let case4Blocked = false;
  try {
    await applyToJobUseCase.execute("student_01", job1.id!);
  } catch (err: any) {
    if (err instanceof AppError && err.message.includes("closed")) case4Blocked = true;
  }
  assert(case4Blocked, "Application to closed job rejected with error message stating job is closed");

  // -------------------------------------------------------------------------
  // Case 5: An open, approved, eligible job can still receive applications
  // -------------------------------------------------------------------------
  console.log("\n--- Case 5: Open, approved, eligible job receives application ---");
  const job5 = await createActiveJob({ companyId: "company_1", collegeId: "college_A" });
  await applyToJobUseCase.execute("student_01", job5.id!);
  const app5 = await mockAppRepo.findByJobAndStudent(job5.id!, "student_01");
  assert(app5 !== null, "Eligible student application submitted successfully to open job");
  assert(app5?.status === JobApplicationStatus.APPLIED, "Application saved with APPLIED status");

  // -------------------------------------------------------------------------
  // Case 6: An expired job rejects new applications
  // -------------------------------------------------------------------------
  console.log("\n--- Case 6: Expired job rejects new applications ---");
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 2);
  const job6 = await createActiveJob({ companyId: "company_1", collegeId: "college_A", deadline: pastDate });
  let case6Blocked = false;
  try {
    await applyToJobUseCase.execute("student_01", job6.id!);
  } catch (err: any) {
    if (err instanceof AppError && err.message.includes("deadline")) case6Blocked = true;
  }
  assert(case6Blocked, "Application to expired job rejected with deadline passed error");

  // -------------------------------------------------------------------------
  // Case 7: Future deadline does not incorrectly mark an open job as expired
  // -------------------------------------------------------------------------
  console.log("\n--- Case 7: Future deadline does not mark open job as expired ---");
  const studentJobs = await getStudentJobsUseCase.execute("student_01");
  const foundJob5 = studentJobs.find(j => j.id === job5.id);
  assert(foundJob5?.isExpired === false, "Job with future deadline has isExpired === false");
  assert(foundJob5?.isClosed === false, "Job with future deadline has isClosed === false");
  assert(foundJob5?.isEligible === true, "Job with future deadline remains isEligible === true");

  // -------------------------------------------------------------------------
  // Case 8: Manually closed job remains closed despite having a future deadline
  // -------------------------------------------------------------------------
  console.log("\n--- Case 8: Manually closed job remains closed despite future deadline ---");
  const job8 = await createActiveJob({ companyId: "company_1" });
  await closeJobUseCase.execute("company_1", job8.id!);
  const refetchedJob8 = await mockJobRepo.findById(job8.id!);
  assert(refetchedJob8.status === JobStatus.CLOSED, "Manually closed job remains CLOSED");
  let case8ApplyBlocked = false;
  try {
    await applyToJobUseCase.execute("student_01", job8.id!);
  } catch (err: any) {
    case8ApplyBlocked = true;
  }
  assert(case8ApplyBlocked, "Application blocked on manually closed job despite future deadline");

  // -------------------------------------------------------------------------
  // Case 9: College approval history is preserved after closure
  // -------------------------------------------------------------------------
  console.log("\n--- Case 9: College approval history preserved after closure ---");
  const job9 = await createActiveJob({
    companyId: "company_1",
    collegeId: "ALL",
    approvedColleges: ["college_A", "college_B"],
    rejectedColleges: ["college_C"]
  });
  await closeJobUseCase.execute("company_1", job9.id!);
  const refetchedJob9 = await mockJobRepo.findById(job9.id!);
  assert(refetchedJob9.approvedColleges.includes("college_A"), "College A approval record preserved");
  assert(refetchedJob9.approvedColleges.includes("college_B"), "College B approval record preserved");
  assert(refetchedJob9.rejectedColleges.includes("college_C"), "College C rejection record preserved");

  // -------------------------------------------------------------------------
  // Case 10: Global job approvals remain independent across colleges
  // -------------------------------------------------------------------------
  console.log("\n--- Case 10: Global job approvals independent across colleges ---");
  const job10 = await mockJobRepo.create(Job.create({
    companyId: "company_1",
    collegeId: "ALL",
    title: "Global Internship",
    category: "Engineering",
    openings: 10,
    deadline: new Date(Date.now() + 10000000),
    type: JobType.INTERNSHIP,
    eligibility: { minCGPA: 0, allowedBacklogs: 0, eligibleBranches: [], passingYear: 2026, degreeType: "" },
    noticePeriod: "Immediate",
    experienceLevel: "Fresher",
    workMode: "remote",
    location: "Global",
    salaryType: "per_month",
    minSalary: 20000,
    maxSalary: 30000,
    interviewMode: "online",
    description: "Global internship",
    requiredSkills: ["JavaScript"],
    rounds: [],
    status: JobStatus.PENDING_REVIEW,
    approvedColleges: [],
    rejectedColleges: []
  }));

  // College A approves
  await approveJobUseCase.execute("college_A", job10.id!);
  const afterCollegeA = await mockJobRepo.findById(job10.id!);
  assert(afterCollegeA.approvedColleges.includes("college_A"), "College A successfully approved");
  assert(!afterCollegeA.approvedColleges.includes("college_B"), "College B approval not implied");

  // College B rejects
  await rejectJobUseCase.execute("college_B", job10.id!, "Requirements too tight");
  const afterCollegeB = await mockJobRepo.findById(job10.id!);
  assert(afterCollegeB.rejectedColleges.includes("college_B"), "College B recorded in rejectedColleges");
  assert(afterCollegeB.approvedColleges.includes("college_A"), "College A approval retained despite College B rejection");

  // -------------------------------------------------------------------------
  // Case 11: Existing applications remain accessible after job closure
  // -------------------------------------------------------------------------
  console.log("\n--- Case 11: Existing applications accessible after job closure ---");
  const job11 = await createActiveJob({ companyId: "company_1" });
  await applyToJobUseCase.execute("student_01", job11.id!);
  await closeJobUseCase.execute("company_1", job11.id!);
  const appsAfterClose = await mockAppRepo.findByJobId(job11.id!);
  assert(appsAfterClose.length === 1, "Candidate application preserved intact after job closure");
  assert(appsAfterClose[0].studentId === "student_01", "Candidate application retains student reference");

  // -------------------------------------------------------------------------
  // Case 12: Repeated close requests handled safely
  // -------------------------------------------------------------------------
  console.log("\n--- Case 12: Repeated close requests handled safely ---");
  let repeatedCloseBlocked = false;
  try {
    await closeJobUseCase.execute("company_1", job11.id!);
  } catch (err: any) {
    if (err instanceof AppError && err.message.includes("already closed")) repeatedCloseBlocked = true;
  }
  assert(repeatedCloseBlocked, "Subsequent close attempt on already-closed job safely rejected with error");

  // Cannot approve or reject closed job
  let approveClosedBlocked = false;
  try {
    await approveJobUseCase.execute("college_A", job11.id!);
  } catch (err: any) {
    if (err instanceof AppError && err.message.includes("closed")) approveClosedBlocked = true;
  }
  assert(approveClosedBlocked, "College cannot approve an already closed job");

  let rejectClosedBlocked = false;
  try {
    await rejectJobUseCase.execute("college_A", job11.id!, "Late review");
  } catch (err: any) {
    if (err instanceof AppError && err.message.includes("closed")) rejectClosedBlocked = true;
  }
  assert(rejectClosedBlocked, "College cannot reject an already closed job");

  // -------------------------------------------------------------------------
  // Case 13: Reopening validation: authorization, deadline, and status rules
  // -------------------------------------------------------------------------
  console.log("\n--- Case 13: Reopening validation rules ---");
  // 13.1 Unauthorized company cannot reopen
  let case13Unauthorized = false;
  try {
    await reopenJobUseCase.execute("company_other", job11.id!);
  } catch (err: any) {
    if (err instanceof AppError && err.statusCode === 403) case13Unauthorized = true;
  }
  assert(case13Unauthorized, "Unauthorized company cannot reopen job (403 FORBIDDEN)");

  // 13.2 Cannot reopen if not closed
  const job13Open = await createActiveJob({ companyId: "company_1" });
  let case13NotClosed = false;
  try {
    await reopenJobUseCase.execute("company_1", job13Open.id!);
  } catch (err: any) {
    if (err instanceof AppError && err.message.includes("Only closed jobs")) case13NotClosed = true;
  }
  assert(case13NotClosed, "Cannot reopen a job that is not closed");

  // 13.3 Reopening expired job requires valid future deadline
  const expiredClosedJob = await createActiveJob({ companyId: "company_1", deadline: new Date(Date.now() - 500000) });
  await closeJobUseCase.execute("company_1", expiredClosedJob.id!);
  let case13PastDeadlineBlocked = false;
  try {
    await reopenJobUseCase.execute("company_1", expiredClosedJob.id!);
  } catch (err: any) {
    if (err instanceof AppError && err.message.includes("expired deadline")) case13PastDeadlineBlocked = true;
  }
  assert(case13PastDeadlineBlocked, "Reopening job with expired deadline blocked if new future deadline not provided");

  // 13.4 Reopening with valid new future deadline succeeds
  const futureNewDeadline = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const reopenedJob = await reopenJobUseCase.execute("company_1", expiredClosedJob.id!, futureNewDeadline);
  assert(reopenedJob.status === JobStatus.APPROVED, "Reopened job restored to APPROVED status");
  assert(reopenedJob.closureReason === undefined, "Closure reason cleared upon reopen");
  assert(reopenedJob.closedAt === undefined, "ClosedAt timestamp cleared upon reopen");

  // -------------------------------------------------------------------------
  // Case 14: Closed and soft-deleted jobs counted correctly in queries
  // -------------------------------------------------------------------------
  console.log("\n--- Case 14: Closed and soft-deleted queries isolation ---");
  const activeCountBefore = await mockJobRepo.count({ companyId: "company_1", status: JobStatus.ACTIVE });
  const closedJobForQuery = await createActiveJob({ companyId: "company_1", status: JobStatus.ACTIVE });
  await closeJobUseCase.execute("company_1", closedJobForQuery.id!);
  const activeCountAfter = await mockJobRepo.count({ companyId: "company_1", status: JobStatus.ACTIVE });
  assert(activeCountBefore === activeCountAfter, "Closed jobs are not counted in active jobs metrics");

  // College findByCollegeIdAndStatus for CLOSED jobs
  const closedCollegeJobs = await mockJobRepo.findByCollegeIdAndStatus("college_A", JobStatus.CLOSED);
  assert(closedCollegeJobs.some((j: Job) => j.id === job1.id), "findByCollegeIdAndStatus returns closed jobs under CLOSED status");
  const approvedCollegeJobs = await mockJobRepo.findByCollegeIdAndStatus("college_A", JobStatus.APPROVED);
  assert(!approvedCollegeJobs.some((j: Job) => j.id === job1.id), "Approved list excludes closed jobs");

  // -------------------------------------------------------------------------
  // Case 15: Clean architecture and data model integrity
  // -------------------------------------------------------------------------
  console.log("\n--- Case 15: Data model integrity ---");
  const sampleEntity = Job.create({
    companyId: "company_1",
    collegeId: "ALL",
    title: "Lead Architect",
    category: "Architecture",
    openings: 1,
    deadline: new Date(),
    type: JobType.FULL_TIME,
    eligibility: { minCGPA: 8, allowedBacklogs: 0, eligibleBranches: ["CS"], passingYear: 2026, degreeType: "B.Tech" },
    noticePeriod: "1 month",
    experienceLevel: "Senior",
    workMode: "remote",
    location: "Remote",
    salaryType: "per_year",
    minSalary: 2000000,
    maxSalary: 3000000,
    interviewMode: "online",
    description: "Lead architect role",
    requiredSkills: ["Architecture"],
    rounds: [],
    status: JobStatus.APPROVED
  });
  sampleEntity.close("Hiring freeze");
  const serialized = sampleEntity.toJSON();
  assert(serialized.status === JobStatus.CLOSED, "toJSON includes status CLOSED");
  assert(serialized.closureReason === "Hiring freeze", "toJSON includes closureReason");
  assert(serialized.closedAt instanceof Date, "toJSON includes closedAt");

  console.log("\n==========================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runClosedJobWorkflowTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
